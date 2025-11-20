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

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    const patientAppointments = await prisma.appointment.findMany({
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
      orderBy: { date: 'desc' }
    })

    const patientMap = new Map()

    patientAppointments.forEach(apt => {
      const patientId = apt.patient.id
      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          id: patientId,
          name: apt.patient.user.name,
          email: apt.patient.user.email,
          appointments: [],
          appointmentCount: 0,
          lastAppointment: null,
          nextAppointment: null
        })
      }
      
      const patientData = patientMap.get(patientId)
      patientData.appointments.push(apt)
      patientData.appointmentCount++
      
      if (!patientData.lastAppointment || apt.date > patientData.lastAppointment) {
        patientData.lastAppointment = apt.date
      }
      
      const now = new Date()
      if (apt.date > now && (!patientData.nextAppointment || apt.date < patientData.nextAppointment)) {
        patientData.nextAppointment = apt.date
      }
    })

    const patients = Array.from(patientMap.values()).map(patient => ({
      id: patient.id,
      name: patient.name,
      email: patient.email,
      appointmentCount: patient.appointmentCount,
      lastAppointment: patient.lastAppointment?.toISOString(),
      nextAppointment: patient.nextAppointment?.toISOString()
    }))

    return NextResponse.json({ patients })
  } catch (error) {
    console.error('Erreur chargement patients médecin:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}