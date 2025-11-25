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

    if (session.user.role !== 'PATIENT') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 })
    }

    const doctorGroups = await prisma.appointment.groupBy({
      by: ['professionalId'],
      where: {
        patientId: patient.id,
        status: {
          in: ['SCHEDULED', 'CONFIRMED', 'COMPLETED']
        }
      },
      _count: {
        professionalId: true
      }
    })

    const doctorCount = doctorGroups.length

    return NextResponse.json({ count: doctorCount })
  } catch (error) {
    console.error('Erreur comptage médecins:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}