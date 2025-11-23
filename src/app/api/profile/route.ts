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
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        patient: {
          select: {
            id: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
            address: true,
            medicalRecord: {
              select: {
                emergencyContact: true
              }
            }
          }
        },
        professional: {
          select: {
            phone: true,
            specialty: true,
            address: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const isPatient = user.role === 'PATIENT'

    const profile = {
      name: user.name || '',
      email: user.email || '',
      phone: isPatient ? user.patient?.phone || '' : user.professional?.phone || '',
      birthDate: user.patient?.dateOfBirth?.toISOString().split('T')[0] || '',
      address: isPatient ? user.patient?.address || '' : user.professional?.address || '',
      emergencyContact: user.patient?.medicalRecord?.emergencyContact || '',
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
    const { name, email, phone, birthDate, address, emergencyContact, specialty } = body


    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        role: true,
        patient: {
          select: {
            id: true
          }
        },
        professional: {
          select: {
            id: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }


    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        email
      }
    })

    if (user.role === 'PATIENT') {
      console.log('🔵 Mise à jour patient...')
      
      const patientData: any = {
        dateOfBirth: birthDate ? new Date(birthDate) : null,
        phone: phone || null,
        address: address || null,
      }

      await prisma.patient.update({
        where: { userId: session.user.id },
        data: patientData
      })


      if (user.patient?.id) {
        
        const existingMedicalRecord = await prisma.medicalRecord.findUnique({
          where: { patientId: user.patient.id }
        })

        if (existingMedicalRecord) {
          await prisma.medicalRecord.update({
            where: { patientId: user.patient.id },
            data: {
              emergencyContact: emergencyContact || null
            }
          })
        } else {
          await prisma.medicalRecord.create({
            data: {
              patientId: user.patient.id,
              emergencyContact: emergencyContact || null,
              allergies: [],
              medications: [],
              conditions: []
            }
          })
        }
      }
    } else if (user.role === 'DOCTOR') {
      console.log('🔵 Mise à jour professionnel...')
      
      const professionalData: any = {
        phone: phone || null,
        address: address || null,
      }

      if (specialty !== undefined) {
        professionalData.specialty = specialty || null
      }

      await prisma.professional.update({
        where: { userId: session.user.id },
        data: professionalData
      })
      
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        patient: {
          select: {
            id: true,
            dateOfBirth: true,
            gender: true,
            phone: true,
            address: true,
            medicalRecord: {
              select: {
                emergencyContact: true
              }
            }
          }
        },
        professional: {
          select: {
            phone: true,
            specialty: true,
            address: true
          }
        }
      }
    })

    if (!updatedUser) {
      console.error('Erreur lors du rechargement des données')
      return NextResponse.json({ error: 'Erreur lors du rechargement des données' }, { status: 500 })
    }

    const isPatient = updatedUser.role === 'PATIENT'

    const updatedProfile = {
      name: updatedUser.name || '',
      email: updatedUser.email || '',
      phone: isPatient ? updatedUser.patient?.phone || '' : updatedUser.professional?.phone || '',
      birthDate: updatedUser.patient?.dateOfBirth?.toISOString().split('T')[0] || '',
      address: isPatient ? updatedUser.patient?.address || '' : updatedUser.professional?.address || '',
      emergencyContact: updatedUser.patient?.medicalRecord?.emergencyContact || '',
      gender: updatedUser.patient?.gender || '',
      specialty: updatedUser.professional?.specialty || '',
      avatar: updatedUser.image || ''
    }


    return NextResponse.json({ 
      success: true, 
      message: 'Profil mis à jour',
      profile: updatedProfile 
    })

  } catch (error) {
    console.error('🔴 Erreur mise à jour profil:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}