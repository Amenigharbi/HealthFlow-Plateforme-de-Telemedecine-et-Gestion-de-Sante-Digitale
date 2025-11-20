// app/api/doctors/[id]/slots/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const professionalId = params.id
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date requise' }, { status: 400 })
    }

    const selectedDate = new Date(date)

    // Récupérer les rendez-vous existants pour cette date
    const startOfDay = new Date(selectedDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(selectedDate)
    endOfDay.setHours(23, 59, 59, 999)

    const existingAppointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      }
    })

    // Générer les créneaux disponibles (9h-17h par défaut)
    const slots = generateTimeSlots(selectedDate, existingAppointments)

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Erreur lors de la récupération des créneaux:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

function generateTimeSlots(date: Date, existingAppointments: any[]) {
  const slots = []
  const slotDuration = 30 // minutes
  
  // Heures de travail par défaut : 9h-12h et 14h-17h
  const morningStart = new Date(date)
  morningStart.setHours(9, 0, 0, 0)
  
  const morningEnd = new Date(date)
  morningEnd.setHours(12, 0, 0, 0)
  
  const afternoonStart = new Date(date)
  afternoonStart.setHours(14, 0, 0, 0)
  
  const afternoonEnd = new Date(date)
  afternoonEnd.setHours(17, 0, 0, 0)

  // Générer les créneaux du matin
  let currentTime = new Date(morningStart)
  while (currentTime < morningEnd) {
    const slotEnd = new Date(currentTime)
    slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)

    const isBooked = existingAppointments.some(appointment => {
      const appointmentStart = new Date(appointment.date)
      const appointmentEnd = new Date(appointmentStart)
      appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointment.duration)

      return currentTime < appointmentEnd && slotEnd > appointmentStart
    })

    if (!isBooked && slotEnd <= morningEnd) {
      slots.push({
        start: new Date(currentTime),
        end: new Date(slotEnd),
        available: true
      })
    }

    currentTime.setMinutes(currentTime.getMinutes() + slotDuration)
  }

  // Générer les créneaux de l'après-midi
  currentTime = new Date(afternoonStart)
  while (currentTime < afternoonEnd) {
    const slotEnd = new Date(currentTime)
    slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)

    const isBooked = existingAppointments.some(appointment => {
      const appointmentStart = new Date(appointment.date)
      const appointmentEnd = new Date(appointmentStart)
      appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointment.duration)

      return currentTime < appointmentEnd && slotEnd > appointmentStart
    })

    if (!isBooked && slotEnd <= afternoonEnd) {
      slots.push({
        start: new Date(currentTime),
        end: new Date(slotEnd),
        available: true
      })
    }

    currentTime.setMinutes(currentTime.getMinutes() + slotDuration)
  }

  return slots
}