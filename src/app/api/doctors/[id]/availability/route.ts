// app/api/doctors/[id]/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const professionalId = params.id

    // Vérifier que le professionnel existe
    const professional = await prisma.professional.findUnique({
      where: { id: professionalId },
      include: {
        user: true
      }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Médecin non trouvé' }, { status: 404 })
    }

    // Pour l'instant, on retourne des dates simulées
    // Vous devrez créer un modèle Availability dans Prisma pour gérer cela
    const availableDates = calculateAvailableDates([])

    return NextResponse.json({ availableDates })
  } catch (error) {
    console.error('Erreur lors de la récupération des disponibilités:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

function calculateAvailableDates(availability: any[]): Date[] {
  const availableDates: Date[] = []
  const today = new Date()
  const endDate = new Date()
  endDate.setDate(today.getDate() + 30) // 30 jours dans le futur

  // Pour l'instant, on considère que tous les jours de semaine sont disponibles
  for (let date = new Date(today); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dayOfWeek = date.getDay()
    // Lundi à Vendredi (1-5) sont disponibles
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      availableDates.push(new Date(date))
    }
  }

  return availableDates
}