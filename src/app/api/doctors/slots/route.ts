// app/api/doctors/slots/route.ts
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
    const date = searchParams.get('date')

    if (!professionalId || !date) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const selectedDate = new Date(date)

    // Récupérer les disponibilités du médecin
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        availabilities: {
          include: { breaks: true }
        }
      }
    })

    if (!professional) {
      return NextResponse.json({ slots: [] })
    }

    // Récupérer les rendez-vous existants
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

    const slots = generateTimeSlots(professional.availabilities, selectedDate, existingAppointments)

    return NextResponse.json({ slots })
  } catch (error) {
    console.error('Erreur récupération créneaux:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

function generateTimeSlots(availabilities: any[], date: Date, existingAppointments: any[]) {
  const slots: { start: string; end: string; available: boolean }[] = [] // Utiliser strings au lieu de Date
  const slotDuration = 30
  const dayOfWeek = date.getDay()
  
  const dayAvailability = availabilities.find(a => a.dayOfWeek === dayOfWeek && a.isActive)
  
  if (!dayAvailability) {
    return slots
  }

  const startTime = new Date(date)
  const [startHours, startMinutes] = dayAvailability.startTime.split(':').map(Number)
  startTime.setHours(startHours, startMinutes, 0, 0)

  const endTime = new Date(date)
  const [endHours, endMinutes] = dayAvailability.endTime.split(':').map(Number)
  endTime.setHours(endHours, endMinutes, 0, 0)

  let currentTime = new Date(startTime)

  while (currentTime < endTime) {
    const slotEnd = new Date(currentTime)
    slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration)

    const isDuringBreak = dayAvailability.breaks.some((breakSlot: any) => {
      const breakStart = new Date(date)
      const [breakStartHours, breakStartMinutes] = breakSlot.startTime.split(':').map(Number)
      breakStart.setHours(breakStartHours, breakStartMinutes, 0, 0)

      const breakEnd = new Date(date)
      const [breakEndHours, breakEndMinutes] = breakSlot.endTime.split(':').map(Number)
      breakEnd.setHours(breakEndHours, breakEndMinutes, 0, 0)

      return currentTime < breakEnd && slotEnd > breakStart
    })

    const isBooked = existingAppointments.some(appointment => {
      const appointmentStart = new Date(appointment.date)
      const appointmentEnd = new Date(appointmentStart)
      appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointment.duration)

      return currentTime < appointmentEnd && slotEnd > appointmentStart
    })

    if (!isDuringBreak && !isBooked && slotEnd <= endTime) {
      slots.push({
        start: currentTime.toISOString(),
        end: slotEnd.toISOString(), 
        available: true
      })
    }

    currentTime.setMinutes(currentTime.getMinutes() + slotDuration)
  }

  return slots
}