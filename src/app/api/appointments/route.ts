import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { doctorId, date, reason, type } = body

    console.log('📝 Création rendez-vous:', { 
      patientId: session.user.id, 
      doctorId, 
      date, 
      reason 
    })

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    })

    if (!patient) {
      console.log('❌ Patient non trouvé pour userId:', session.user.id)
      return NextResponse.json({ error: 'Profil patient non trouvé' }, { status: 404 })
    }
    const professional = await prisma.professional.findUnique({
      where: { id: doctorId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!professional) {
      console.log('❌ Médecin non trouvé avec ID:', doctorId)
      return NextResponse.json({ error: 'Médecin non trouvé' }, { status: 404 })
    }


    const appointmentDate = new Date(date)
    const appointmentEnd = new Date(appointmentDate)
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + 30)

    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        professionalId: doctorId,
        date: {
          lt: appointmentEnd,
        },
        status: {
          in: ['SCHEDULED', 'CONFIRMED']
        }
      }
    })

    if (conflictingAppointment) {
      return NextResponse.json(
        { error: 'Ce créneau n\'est plus disponible' },
        { status: 409 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        professionalId: doctorId,
        date: appointmentDate,
        duration: 30,
        reason,
        status: 'SCHEDULED'
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })


    return NextResponse.json({ 
      success: true,
      appointment: {
        id: appointment.id,
        patientId: appointment.patientId,
        doctorId: appointment.professionalId,
        appointmentDate: appointment.date,
        duration: appointment.duration,
        status: appointment.status,
        type: 'consultation',
        reason: appointment.reason,
        notes: appointment.notes,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
        doctor: {
          name: appointment.professional.user.name,
          specialty: appointment.professional.specialty,
          email: appointment.professional.user.email
        }
      },
      message: 'Rendez-vous confirmé avec succès'
    })
  } catch (error) {
    console.error('❌ Erreur création rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    console.log('🔍 Récupération rendez-vous pour user:', session.user.id)

    let appointments: any[] = []

    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id }
      })

      if (patient) {
        appointments = await prisma.appointment.findMany({
          where: { patientId: patient.id },
          include: {
            professional: {
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
          orderBy: { date: 'desc' }
        })
      }
    } else if (session.user.role === 'DOCTOR') {
      const professional = await prisma.professional.findUnique({
        where: { userId: session.user.id }
      })

      if (professional) {
        appointments = await prisma.appointment.findMany({
          where: { professionalId: professional.id },
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
          orderBy: { date: 'desc' }
        })
      }
    }

    const formattedAppointments = appointments.map(apt => ({
      id: apt.id,
      date: apt.date.toISOString(),
      status: apt.status,
      reason: apt.reason || '',
      duration: apt.duration,
      doctor: session.user.role === 'PATIENT' ? {
        name: apt.professional.user.name,
        specialty: apt.professional.specialty
      } : {
        name: apt.patient.user.name,
        specialty: 'Patient'
      }
    }))


    return NextResponse.json({ appointments: formattedAppointments })
  } catch (error) {
    console.error('❌ Erreur chargement rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}