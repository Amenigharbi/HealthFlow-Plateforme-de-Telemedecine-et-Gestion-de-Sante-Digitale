import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const appointmentId = params.id

    let appointment: any

    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id }
      })

      if (!patient) {
        return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 })
      }

      appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          patientId: patient.id
        }
      })
    } else if (session.user.role === 'DOCTOR') {
      const professional = await prisma.professional.findUnique({
        where: { userId: session.user.id }
      })

      if (!professional) {
        return NextResponse.json({ error: 'Médecin non trouvé' }, { status: 404 })
      }

      appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          professionalId: professional.id
        }
      })
    }

    if (!appointment) {
      return NextResponse.json({ error: 'Rendez-vous non trouvé' }, { status: 404 })
    }

    await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' }
    })

    return NextResponse.json({ success: true, message: 'Rendez-vous annulé' })
  } catch (error) {
    console.error('Erreur annulation rendez-vous:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}