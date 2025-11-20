// app/api/prescriptions/route.ts
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

    let prescriptions: any[] = []

    if (session.user.role === 'PATIENT') {
      const patient = await prisma.patient.findUnique({
        where: { userId: session.user.id }
      })

      if (patient) {
        prescriptions = await prisma.prescription.findMany({
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
      }
    }

    const formattedPrescriptions = prescriptions.map(pres => ({
      id: pres.id,
      medication: pres.medication,
      dosage: pres.dosage,
      frequency: pres.frequency,
      duration: pres.duration,
      instructions: pres.instructions,
      prescribedAt: pres.prescribedAt.toISOString(),
      doctor: {
        name: pres.professional.user.name,
        specialty: pres.professional.specialty
      }
    }))

    return NextResponse.json({ prescriptions: formattedPrescriptions })
  } catch (error) {
    console.error('Erreur chargement prescriptions:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}