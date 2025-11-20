// app/api/doctor/availability-item/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const availabilityId = searchParams.get('id')
    
    if (!availabilityId) {
      return NextResponse.json({ error: 'ID de disponibilité manquant' }, { status: 400 })
    }

    const body = await request.json()
    const { startTime, endTime, isActive } = body

    console.log('🔄 Mise à jour disponibilité:', { availabilityId, startTime, endTime, isActive })

    const professional = await prisma.professional.findUnique({
      where: { 
        userId: session.user.id 
      }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    const availability = await prisma.availability.findFirst({
      where: {
        id: availabilityId,
        professionalId: professional.id 
      }
    })

    if (!availability) {
      return NextResponse.json({ error: 'Disponibilité non trouvée' }, { status: 404 })
    }

    const updatedAvailability = await prisma.availability.update({
      where: { id: availabilityId },
      data: {
        startTime,
        endTime,
        isActive
      },
      include: {
        breaks: true
      }
    })

    console.log('✅ Disponibilité mise à jour')

    return NextResponse.json({ 
      success: true, 
      availability: updatedAvailability 
    })
  } catch (error) {
    console.error('❌ Erreur mise à jour disponibilité:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}