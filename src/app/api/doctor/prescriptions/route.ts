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

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    const prescriptions = await prisma.prescription.findMany({
      where: {
        professionalId: professional.id
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        prescribedAt: 'desc'
      }
    })

    const formattedPrescriptions = prescriptions.map(prescription => ({
      id: prescription.id,
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      duration: prescription.duration,
      instructions: prescription.instructions,
      patientName: prescription.patient.user.name,
      patientId: prescription.patientId,
      prescribedAt: prescription.prescribedAt,
      status: prescription.status 
    }))

    return NextResponse.json({ 
      success: true, 
      prescriptions: formattedPrescriptions 
    })

  } catch (error) {
    console.error('Erreur récupération prescriptions:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    const body = await request.json()
    const {
      patientId,
      medication,
      dosage,
      frequency,
      duration,
      instructions
    } = body

    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        professionalId: professional.id
      }
    })

    if (!appointment) {
      return NextResponse.json({ 
        error: 'Aucun rendez-vous trouvé avec ce patient' 
      }, { status: 400 })
    }

    const prescription = await prisma.prescription.create({
      data: {
        patientId,
        professionalId: professional.id,
        medication,
        dosage,
        frequency,
        duration,
        instructions,
        status: 'ACTIVE' 
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      prescription: {
        id: prescription.id,
        medication: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        duration: prescription.duration,
        instructions: prescription.instructions,
        status: prescription.status, 
        patientName: prescription.patient.user.name,
        prescribedAt: prescription.prescribedAt
      }
    })

  } catch (error) {
    console.error('Erreur création prescription:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}