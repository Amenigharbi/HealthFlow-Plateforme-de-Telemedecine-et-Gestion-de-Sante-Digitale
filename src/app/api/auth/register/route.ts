// app/api/auth/register/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { registerSchema } from '@/lib/validations/auth'  // ← IMPORT CORRECT

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, role } = registerSchema.parse(body)

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 400 }
      )
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    // Créer le profil selon le rôle
    if (role === 'PATIENT') {
      await prisma.patient.create({
        data: {
          userId: user.id,
        },
      })
    } else if (role === 'DOCTOR') {
      await prisma.professional.create({
        data: {
          userId: user.id,
          specialty: 'Médecine générale',
        },
      })
    }

    return NextResponse.json(
      { message: 'Compte créé avec succès' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du compte' },
      { status: 500 }
    )
  }
}