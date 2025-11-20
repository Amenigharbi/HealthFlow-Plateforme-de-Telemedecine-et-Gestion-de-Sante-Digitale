import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const specialty = searchParams.get('specialty')
    const search = searchParams.get('search')

    let whereClause: any = {
      user: {
        role: 'DOCTOR'
      }
    }

    if (specialty) {
      whereClause.specialty = { contains: specialty, mode: 'insensitive' }
    }

    if (search) {
      whereClause.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { specialty: { contains: search, mode: 'insensitive' } }
      ]
    }

    const professionals = await prisma.professional.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      },
      orderBy: { user: { name: 'asc' } }
    })

    // Transformer les données pour correspondre à l'interface Doctor
    const doctors = professionals.map(prof => ({
      id: prof.id,
      name: prof.user.name,
      specialty: prof.specialty,
      email: prof.user.email,
      phone: prof.phone || undefined,
      avatar: prof.user.image || undefined,
      availability: [] // À implémenter avec un nouveau modèle Availability
    }))

    return NextResponse.json(doctors)
  } catch (error) {
    console.error('Erreur lors de la récupération des médecins:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}