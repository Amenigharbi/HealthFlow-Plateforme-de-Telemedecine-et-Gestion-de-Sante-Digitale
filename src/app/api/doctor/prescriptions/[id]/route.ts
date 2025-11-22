import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { id: prescriptionId } = await params
    const body = await request.json()
    const { status } = body

    const validStatuses = ['ACTIVE', 'COMPLETED', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    const prescription = await prisma.prescription.findFirst({
      where: {
        id: prescriptionId,
        professionalId: professional.id
      }
    })

    if (!prescription) {
      return NextResponse.json({ error: 'Prescription non trouvée' }, { status: 404 })
    }

    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data: { 
        status: status as 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
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
        id: updatedPrescription.id,
        medication: updatedPrescription.medication,
        status: updatedPrescription.status,
        patientName: updatedPrescription.patient.user.name
      }
    })

  } catch (error) {
    console.error('Erreur mise à jour prescription:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}