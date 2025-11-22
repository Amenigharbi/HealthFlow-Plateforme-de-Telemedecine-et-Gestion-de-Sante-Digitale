import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    // Récupérer le professionnel connecté
    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    // Récupérer les patients ayant des rendez-vous avec ce professionnel
    const appointments = await prisma.appointment.findMany({
      where: {
        professionalId: professional.id
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Grouper par patient et calculer les statistiques
    const patientMap = new Map()
    
    appointments.forEach(apt => {
      if (!patientMap.has(apt.patientId)) {
        patientMap.set(apt.patientId, {
          id: apt.patientId,
          name: apt.patient.user.name,
          email: apt.patient.user.email,
          phone: apt.patient.phone,
          birthDate: apt.patient.dateOfBirth,
          gender: apt.patient.gender,
          appointments: [],
          lastAppointment: apt.date,
          nextAppointment: null
        })
      }
      
      const patient = patientMap.get(apt.patientId)
      patient.appointments.push(apt)
      
      // Mettre à jour le dernier rendez-vous
      if (new Date(apt.date) > new Date(patient.lastAppointment)) {
        patient.lastAppointment = apt.date
      }
      
      // Trouver le prochain rendez-vous à venir
      if ((apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED') && 
          new Date(apt.date) > new Date()) {
        if (!patient.nextAppointment || new Date(apt.date) < new Date(patient.nextAppointment)) {
          patient.nextAppointment = apt.date
        }
      }
    })

    // Formater la réponse
    const patients = Array.from(patientMap.values()).map(patient => ({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      phone: patient.phone,
      birthDate: patient.birthDate,
      gender: patient.gender,
      lastAppointment: patient.lastAppointment,
      nextAppointment: patient.nextAppointment,
      appointmentCount: patient.appointments.length
    }))

    return NextResponse.json({ 
      success: true, 
      patients 
    })

  } catch (error) {
    console.error('Erreur récupération patients:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}