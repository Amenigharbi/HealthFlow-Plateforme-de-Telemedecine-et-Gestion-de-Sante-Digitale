// app/api/appointments/route.ts
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

    // Validation des données
    if (!doctorId || !date || !reason) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier que le patient existe
    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Profil patient non trouvé' }, { status: 404 })
    }

    // Vérifier que le professionnel existe
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
      return NextResponse.json({ error: 'Médecin non trouvé' }, { status: 404 })
    }

    // Vérifier que le créneau est disponible
    const appointmentDate = new Date(date)
    const appointmentEnd = new Date(appointmentDate)
    appointmentEnd.setMinutes(appointmentEnd.getMinutes() + 30) // Durée par défaut

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

    // Créer le rendez-vous
    const appointment = await prisma.appointment.create({
      data: {
        patientId: patient.id,
        professionalId: doctorId,
        date: appointmentDate,
        duration: 30, // 30 minutes par défaut
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

    // Transformer les données pour correspondre à l'interface
    const appointmentResponse = {
      id: appointment.id,
      patientId: appointment.patientId,
      doctorId: appointment.professionalId,
      appointmentDate: appointment.date,
      duration: appointment.duration,
      status: appointment.status.toLowerCase() as 'scheduled' | 'confirmed' | 'cancelled' | 'completed',
      type: 'consultation' as 'consultation' | 'followup' | 'emergency',
      reason: appointment.reason || '',
      notes: appointment.notes || undefined,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      doctor: {
        name: appointment.professional.user.name,
        specialty: appointment.professional.specialty,
        email: appointment.professional.user.email
      }
    }

    return NextResponse.json({ 
      success: true,
      appointment: appointmentResponse,
      message: 'Rendez-vous confirmé avec succès'
    })
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}