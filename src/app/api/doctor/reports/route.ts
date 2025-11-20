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

    const medicalRecords = await prisma.medicalRecord.findMany({
      where: {
        createdBy: professional.id
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
      orderBy: { createdAt: 'desc' }
    })

    const reports = medicalRecords.map(record => ({
      id: record.id,
      title: record.title,
      patientName: record.patient.user.name,
      recordType: record.recordType,
      date: record.date.toISOString(),
      severity: record.severity,
      description: record.description
    }))

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Erreur chargement rapports médecin:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}