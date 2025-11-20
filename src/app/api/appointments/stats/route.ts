// app/api/appointments/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (session.user.role === 'DOCTOR') {
      // Statistiques pour le médecin
      const professional = await prisma.professional.findUnique({
        where: { userId: session.user.id }
      })

      if (!professional) {
        return NextResponse.json({ 
          total: 0, 
          today: 0, 
          upcoming: 0 
        })
      }

      const [todayAppointments, totalAppointments, upcomingAppointments] = await Promise.all([
        // RDV aujourd'hui
        prisma.appointment.count({
          where: {
            professionalId: professional.id,
            date: {
              gte: today,
              lt: tomorrow
            },
            status: {
              in: ['SCHEDULED', 'CONFIRMED']
            }
          }
        }),
        
        // Total des patients distincts
        prisma.appointment.groupBy({
          by: ['patientId'],
          where: {
            professionalId: professional.id
          }
        }).then(results => results.length),

        // RDV à venir
        prisma.appointment.count({
          where: {
            professionalId: professional.id,
            date: {
              gte: today
            },
            status: {
              in: ['SCHEDULED', 'CONFIRMED']
            }
          }
        })
      ])

      return NextResponse.json({
        total: totalAppointments,
        today: todayAppointments,
        upcoming: upcomingAppointments
      })

    } else {
      // Statistiques pour le patient
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id }
      })

      if (!patient) {
        return NextResponse.json({ 
          total: 0, 
          today: 0, 
          upcoming: 0 
        })
      }

      const [totalAppointments, upcomingAppointments] = await Promise.all([
        // Total des RDV
        prisma.appointment.count({
          where: {
            patientId: patient.id
          }
        }),

        // RDV à venir
        prisma.appointment.count({
          where: {
            patientId: patient.id,
            date: {
              gte: today
            },
            status: {
              in: ['SCHEDULED', 'CONFIRMED']
            }
          }
        })
      ])

      return NextResponse.json({
        total: totalAppointments,
        today: 0, // Non utilisé pour les patients
        upcoming: upcomingAppointments
      })
    }

  } catch (error) {
    console.error('Erreur lors du chargement des statistiques:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}