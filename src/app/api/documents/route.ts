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
      include: {
        medicalReports: {
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
          orderBy: { createdAt: 'desc' }
        },
        prescriptions: {
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
          orderBy: { prescribedAt: 'desc' }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 })
    }

    const reportDocuments = patient.medicalReports.map(report => ({
      id: `report_${report.id}`, 
      title: report.title,
      type: report.recordType.toLowerCase(),
      date: report.createdAt.toISOString(),
      doctor: report.professional.user.name,
      description: report.diagnosis || report.content?.substring(0, 100) + '...' || '',
      category: 'medical_report',
      severity: report.severity
    }))

    const prescriptionDocuments = patient.prescriptions.map(prescription => ({
      id: `prescription_${prescription.id}`, 
      title: `Ordonnance - ${prescription.medication}`,
      type: 'prescription',
      date: prescription.prescribedAt.toISOString(),
      doctor: prescription.professional.user.name,
      description: `${prescription.dosage || ''}, ${prescription.frequency || ''}, ${prescription.duration || ''}`,
      category: 'prescription',
      status: prescription.status
    }))

    const documents = [...reportDocuments, ...prescriptionDocuments]

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Erreur chargement documents:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}