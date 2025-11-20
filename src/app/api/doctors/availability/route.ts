// app/api/doctors/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professionalId')
    
    if (!professionalId) {
      return NextResponse.json({ error: 'ID du professionnel manquant' }, { status: 400 })
    }

    console.log('🔍 Professional ID reçu:', professionalId)

    // Vérifier que le professionnel existe
    const professional = await prisma.professional.findUnique({
      where: { 
        id: professionalId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        availabilities: {
          include: {
            breaks: true
          }
        }
      }
    })

    if (!professional) {
      console.log('❌ Professional non trouvé avec ID:', professionalId)
      return NextResponse.json({ error: 'Médecin non trouvé' }, { status: 404 })
    }

    console.log('✅ Professional trouvé:', professional.user.name)

    let availabilities = professional.availabilities
    
    // Si pas de disponibilités, créer des disponibilités par défaut
    if (availabilities.length === 0) {
      console.log('🔄 Création des disponibilités par défaut pour:', professional.user.name)
      
      const defaultAvailabilities = []
      
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5 // Lundi à Vendredi
        
        const availability = await prisma.availability.create({
          data: {
            professionalId: professional.id,
            dayOfWeek,
            startTime: isWeekday ? '09:00' : '00:00',
            endTime: isWeekday ? '17:00' : '00:00',
            isActive: isWeekday
          }
        })
        
        defaultAvailabilities.push(availability)
        
        // Ajouter une pause déjeuner pour les jours ouvrés
        if (isWeekday) {
          await prisma.break.create({
            data: {
              availabilityId: availability.id,
              startTime: '12:00',
              endTime: '13:30'
            }
          })
        }
      }
      
      // Recharger les disponibilités avec les breaks
      const updatedAvailabilities = await prisma.availability.findMany({
        where: { professionalId: professional.id },
        include: {
          breaks: true
        }
      })
      
      availabilities = updatedAvailabilities
    }

    console.log('📅 Disponibilités chargées:', availabilities.length)

    // Formater les données
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    
    // Calculer les dates disponibles pour les 30 prochains jours
    const availableDates = calculateAvailableDates(availabilities)
    
    const formattedAvailabilities = availabilities.map(avail => ({
      id: avail.id,
      dayOfWeek: avail.dayOfWeek,
      dayName: daysOfWeek[avail.dayOfWeek],
      startTime: avail.startTime,
      endTime: avail.endTime,
      isActive: avail.isActive,
      breaks: avail.breaks.map(breakSlot => ({
        id: breakSlot.id,
        startTime: breakSlot.startTime,
        endTime: breakSlot.endTime
      }))
    }))

    console.log('✅ Dates disponibles:', availableDates.length)

    return NextResponse.json({ 
      availableDates,
      availabilities: formattedAvailabilities 
    })
  } catch (error) {
    console.error('❌ Erreur détaillée chargement disponibilités:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

function calculateAvailableDates(availabilities: any[]): Date[] {
  const availableDates: Date[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Commencer à minuit
  
  const endDate = new Date()
  endDate.setDate(today.getDate() + 30) // 30 jours dans le futur
  endDate.setHours(23, 59, 59, 999)

  console.log('📆 Calcul des dates du:', today, 'au:', endDate)

  // Parcourir chaque jour
  for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay() // 0=dimanche, 1=lundi, etc.
    
    // Vérifier si ce jour est disponible selon les disponibilités du médecin
    const dayAvailability = availabilities.find(a => a.dayOfWeek === dayOfWeek && a.isActive)
    
    if (dayAvailability) {
      availableDates.push(new Date(date))
    }
  }

  console.log('📋 Jours disponibles trouvés:', availableDates.length)
  return availableDates
}