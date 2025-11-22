import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { id: patientId } = await params

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        medicalRecord: true,
        appointments: {
          where: {
            professionalId: professional.id
          },
          orderBy: {
            date: 'desc'
          },
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
          }
        }
      }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 })
    }

    if (patient.appointments.length === 0) {
      return NextResponse.json({ error: 'Aucun rendez-vous avec ce patient' }, { status: 403 })
    }

    const stats = {
      totalAppointments: patient.appointments.length,
      completedAppointments: patient.appointments.filter(a => a.status === 'COMPLETED').length,
      upcomingAppointments: patient.appointments.filter(a => 
        a.status === 'SCHEDULED' || a.status === 'CONFIRMED'
      ).length,
      averageDuration: 30 
    }

    const formattedPatient = {
      id: patient.id,
      name: patient.user.name,
      email: patient.user.email,
      phone: patient.phone,
      birthDate: patient.dateOfBirth,
      gender: patient.gender,
      medicalRecord: patient.medicalRecord ? {
        bloodType: patient.medicalRecord.bloodType,
        height: patient.medicalRecord.height,
        weight: patient.medicalRecord.weight,
        allergies: patient.medicalRecord.allergies,
        medications: patient.medicalRecord.medications,
        conditions: patient.medicalRecord.conditions,
        emergencyContact: patient.medicalRecord.emergencyContact
      } : null,
      appointments: patient.appointments.map(apt => ({
        id: apt.id,
        date: apt.date,
        reason: apt.reason,
        status: apt.status,
        diagnosis: apt.diagnosis,
        treatment: apt.treatment,
        notes: apt.notes,
        professional: apt.professional.user.name
      })),
      stats
    }

    return NextResponse.json({ 
      success: true, 
      patient: formattedPatient 
    })

  } catch (error) {
    console.error('Erreur récupération patient:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}