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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        image: true,
        patient: {
          select: {
            birthDate: true,
            gender: true
          }
        },
        professional: {
          select: {
            phone: true,
            specialty: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const profile = {
      name: user.name,
      email: user.email,
      phone: user.professional?.phone || '',
      birthDate: user.patient?.birthDate?.toISOString().split('T')[0] || '',
      gender: user.patient?.gender || '',
      specialty: user.professional?.specialty || '',
      avatar: user.image || ''
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Erreur chargement profil:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, phone, birthDate, address, emergencyContact } = body

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email
      }
    })

    if (session.user.role === 'PATIENT') {
      await prisma.patient.update({
        where: { userId: session.user.id },
        data: {
          birthDate: birthDate ? new Date(birthDate) : null
        }
      })
    } else if (session.user.role === 'DOCTOR') {
      await prisma.professional.update({
        where: { userId: session.user.id },
        data: {
          phone: phone || null
        }
      })
    }

    return NextResponse.json({ success: true, message: 'Profil mis à jour' })
  } catch (error) {
    console.error('Erreur mise à jour profil:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}