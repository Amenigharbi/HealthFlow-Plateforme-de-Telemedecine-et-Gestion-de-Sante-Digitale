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

    if (session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 })
    }

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Professionnel non trouvé' }, { status: 404 })
    }

    const medicalReports = await prisma.medicalReport.findMany({
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
      orderBy: { createdAt: 'desc' }
    })

    const prescriptions = await prisma.prescription.findMany({
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
      orderBy: { prescribedAt: 'desc' }
    })

    const reportDocuments = medicalReports.map(report => ({
      id: report.id,
      title: report.title,
      type: report.recordType.toLowerCase(),
      date: report.createdAt.toISOString(),
      patientName: report.patient.user.name,
      patientId: report.patientId,
      description: report.diagnosis || report.content.substring(0, 100) + '...',
      category: 'medical_report',
      severity: report.severity
    }))

    const prescriptionDocuments = prescriptions.map(prescription => ({
      id: prescription.id,
      title: `Ordonnance - ${prescription.medication}`,
      type: 'prescription',
      date: prescription.prescribedAt.toISOString(),
      patientName: prescription.patient.user.name,
      patientId: prescription.patientId,
      description: `${prescription.dosage}, ${prescription.frequency}, ${prescription.duration}`,
      category: 'prescription',
      status: prescription.status
    }))

    const documents = [...reportDocuments, ...prescriptionDocuments]

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Erreur chargement documents docteur:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}