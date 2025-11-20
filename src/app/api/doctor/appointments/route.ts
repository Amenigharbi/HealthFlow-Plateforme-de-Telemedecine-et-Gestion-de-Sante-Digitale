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

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const view = searchParams.get('view') || 'day'

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    let startDate: Date
    let endDate: Date

    if (date) {
      const selectedDate = new Date(date)
      if (view === 'day') {
        startDate = new Date(selectedDate)
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(selectedDate)
        endDate.setHours(23, 59, 59, 999)
      } else {
        // Vue semaine
        const dayOfWeek = selectedDate.getDay()
        const diff = selectedDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        startDate = new Date(selectedDate.setDate(diff))
        startDate.setHours(0, 0, 0, 0)
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 6)
        endDate.setHours(23, 59, 59, 999)
      }
    } else {
      // Aujourd'hui par défaut
      startDate = new Date()
      startDate.setHours(0, 0, 0, 0)
      endDate = new Date()
      endDate.setHours(23, 59, 59, 999)
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: professional.id,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { date: 'asc' }
    })

    // Transformer les données
    const formattedAppointments = appointments.map(apt => ({
      id: apt.id,
      date: apt.date.toISOString(),
      duration: apt.duration,
      reason: apt.reason,
      status: apt.status,
      patient: {
        name: apt.patient.user.name,
        email: apt.patient.user.email
      }
    }))

    return NextResponse.json({ appointments: formattedAppointments })
  } catch (error) {
    console.error('Erreur chargement agenda médecin:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}