import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { availabilityId, startTime, endTime } = body

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    // Vérifier que la disponibilité appartient à ce médecin
    const availability = await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        professionalId: professional.id
      }
    })

    if (!availability) {
      return NextResponse.json({ error: 'Disponibilité non trouvée' }, { status: 404 })
    }

    // Créer la pause
    const breakSlot = await prisma.break.create({
      data: {
        availabilityId,
        startTime,
        endTime
      }
    })

    return NextResponse.json({ 
      success: true, 
      break: breakSlot 
    })
  } catch (error) {
    console.error('Erreur création pause:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}