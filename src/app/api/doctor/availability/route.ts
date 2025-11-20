// app/api/doctor/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    console.log('🔍 Session user ID:', session.user.id)

    // Trouver le professionnel par userId
    const professional = await prisma.professional.findUnique({
      where: { 
        userId: session.user.id
      },
      include: {
        availabilities: {
          include: {
            breaks: true
          }
        }
      }
    })

    if (!professional) {
      console.log('❌ Professional non trouvé pour userId:', session.user.id)
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    console.log('✅ Professional trouvé:', professional.id)

    let availabilities = professional.availabilities
    
    // Si pas de disponibilités, créer des entrées par défaut
    if (availabilities.length === 0) {
      console.log('🔄 Création disponibilités par défaut...')
      
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5
        
        const availability = await prisma.availability.create({
          data: {
            professionalId: professional.id,
            dayOfWeek,
            startTime: isWeekday ? '09:00' : '00:00',
            endTime: isWeekday ? '17:00' : '00:00',
            isActive: isWeekday
          }
        })
        
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
      
      // Recharger les disponibilités
      const updatedProfessional = await prisma.professional.findUnique({
        where: { userId: session.user.id },
        include: {
          availabilities: {
            include: { breaks: true }
          }
        }
      })
      
      availabilities = updatedProfessional?.availabilities || []
    }

    console.log('📅 Disponibilités chargées:', availabilities.length)

    // Formater les données
    const daysOfWeek = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
    
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

    return NextResponse.json({ 
      availabilities: formattedAvailabilities 
    })
  } catch (error) {
    console.error('❌ Erreur détaillée chargement disponibilités médecin:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}