import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { id: patientId } = await params

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        professionalId: professional.id
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        medicalRecord: true
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        name: patient.user.name,
        email: patient.user.email,
        phone: patient.phone,
        birthDate: patient.dateOfBirth,
        gender: patient.gender
      },
      medicalRecord: patient.medicalRecord ? {
        bloodType: patient.medicalRecord.bloodType,
        height: patient.medicalRecord.height,
        weight: patient.medicalRecord.weight,
        allergies: patient.medicalRecord.allergies,
        medications: patient.medicalRecord.medications,
        conditions: patient.medicalRecord.conditions,
        emergencyContact: patient.medicalRecord.emergencyContact
      } : null
    })

  } catch (error) {
    console.error('Erreur récupération fiche médicale:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { id: patientId } = await params
    const body = await request.json()

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        professionalId: professional.id
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 })
    }

    const medicalRecord = await prisma.medicalRecord.upsert({
      where: { patientId },
      update: {
        bloodType: body.bloodType,
        height: body.height,
        weight: body.weight,
        allergies: body.allergies,
        medications: body.medications,
        conditions: body.conditions,
        emergencyContact: body.emergencyContact
      },
      create: {
        patientId,
        bloodType: body.bloodType,
        height: body.height,
        weight: body.weight,
        allergies: body.allergies,
        medications: body.medications,
        conditions: body.conditions,
        emergencyContact: body.emergencyContact
      }
    })

    return NextResponse.json({
      success: true,
      medicalRecord
    })

  } catch (error) {
    console.error('Erreur mise à jour fiche médicale:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}