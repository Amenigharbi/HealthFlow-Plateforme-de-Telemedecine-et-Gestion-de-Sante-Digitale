import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const appointmentId = params.id
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Statut manquant' }, { status: 400 })
    }

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        professionalId: professional.id
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Rendez-vous non trouvé' }, { status: 404 })
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status },
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
      }
    })

    return NextResponse.json({ 
      success: true, 
      appointment: {
        id: updatedAppointment.id,
        status: updatedAppointment.status,
        patient: updatedAppointment.patient.user.name
      }
    })
  } catch (error) {
    console.error('Erreur mise à jour statut RDV:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}