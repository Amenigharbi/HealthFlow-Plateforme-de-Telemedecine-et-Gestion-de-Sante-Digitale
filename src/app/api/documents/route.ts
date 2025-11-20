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

    let documents: any[] = []

    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id }
      })

      if (patient) {
        const medicalRecords = await prisma.medicalRecord.findMany({
          where: { patientId: patient.id },
          orderBy: { createdAt: 'desc' }
        })

        const professionalIds = [...new Set(medicalRecords.map(record => record.createdBy))]
        const professionals = await prisma.professional.findMany({
          where: { id: { in: professionalIds } },
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        })

        const professionalMap = new Map(
          professionals.map(prof => [prof.id, prof.user.name])
        )

        const medicalRecordDocs = medicalRecords.map(record => ({
          id: record.id,
          title: record.title,
          type: record.recordType.toLowerCase(),
          date: record.date.toISOString(),
          doctor: professionalMap.get(record.createdBy) || 'Médecin',
          description: record.description,
          category: 'medical_record'
        }))

        const prescriptions = await prisma.prescription.findMany({
          where: { patientId: patient.id },
          include: {
            professional: {
              include: {
                user: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: { prescribedAt: 'desc' }
        })

        const prescriptionDocs = prescriptions.map(pres => ({
          id: pres.id,
          title: `Ordonnance - ${pres.medication}`,
          type: 'prescription',
          date: pres.prescribedAt.toISOString(),
          doctor: pres.professional.user.name,
          description: `${pres.dosage}, ${pres.frequency}, ${pres.duration}`,
          category: 'prescription'
        }))

        documents = [...medicalRecordDocs, ...prescriptionDocs]
      }
    }

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Erreur chargement documents:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}