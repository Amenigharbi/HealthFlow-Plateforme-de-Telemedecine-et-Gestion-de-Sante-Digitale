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

    const reports = await prisma.medicalReport.findMany({
      where: {
        professionalId: professional.id
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedReports = reports.map(report => ({
      id: report.id,
      title: report.title,
      patientName: report.patient.user.name,
      patientId: report.patientId,
      recordType: report.recordType,
      content: report.content,
      diagnosis: report.diagnosis,
      treatment: report.treatment,
      prescriptions: report.prescriptions,
      recommendations: report.recommendations,
      severity: report.severity,
      followUpDate: report.followUpDate?.toISOString().split('T')[0],
      date: report.createdAt.toISOString(),
      status: 'COMPLETED'
    }))

    return NextResponse.json({ 
      success: true, 
      reports: formattedReports 
    })

  } catch (error) {
    console.error('Erreur récupération rapports:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      patientId,
      title,
      recordType,
      content,
      diagnosis,
      treatment,
      prescriptions,
      recommendations,
      severity,
      followUpDate
    } = body

    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    })

    if (!patient) {
      return NextResponse.json({ error: 'Patient non trouvé' }, { status: 404 })
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        professionalId: professional.id
      }
    })

    if (!appointment) {
      return NextResponse.json({ 
        error: 'Aucun rendez-vous trouvé avec ce patient' 
      }, { status: 400 })
    }

    const report = await prisma.medicalReport.create({
      data: {
        patientId,
        professionalId: professional.id,
        title,
        recordType,
        content,
        diagnosis,
        treatment,
        prescriptions: prescriptions || [],
        recommendations,
        severity,
        followUpDate: followUpDate ? new Date(followUpDate) : null
      },
      include: {
        patient: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      report: {
        id: report.id,
        title: report.title,
        patientName: report.patient.user.name,
        recordType: report.recordType,
        date: report.createdAt,
        severity: report.severity
      }
    })

  } catch (error) {
    console.error('Erreur création rapport:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')
    
    if (!reportId) {
      return NextResponse.json({ error: 'ID rapport manquant' }, { status: 400 })
    }

    const body = await request.json()
    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    const existingReport = await prisma.medicalReport.findFirst({
      where: {
        id: reportId,
        professionalId: professional.id
      }
    })

    if (!existingReport) {
      return NextResponse.json({ error: 'Rapport non trouvé' }, { status: 404 })
    }

    const updatedReport = await prisma.medicalReport.update({
      where: { id: reportId },
      data: {
        title: body.title,
        recordType: body.recordType,
        content: body.content,
        diagnosis: body.diagnosis,
        treatment: body.treatment,
        prescriptions: body.prescriptions,
        recommendations: body.recommendations,
        severity: body.severity,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : null
      },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      report: {
        id: updatedReport.id,
        title: updatedReport.title,
        patientName: updatedReport.patient.user.name,
        recordType: updatedReport.recordType,
        date: updatedReport.createdAt,
        severity: updatedReport.severity
      }
    })

  } catch (error) {
    console.error('Erreur modification rapport:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.role !== 'DOCTOR') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get('id')
    
    if (!reportId) {
      return NextResponse.json({ error: 'ID rapport manquant' }, { status: 400 })
    }

    const professional = await prisma.professional.findUnique({
      where: { userId: session.user.id }
    })

    if (!professional) {
      return NextResponse.json({ error: 'Profil médecin non trouvé' }, { status: 404 })
    }

    // Vérifier que le rapport appartient au médecin
    const existingReport = await prisma.medicalReport.findFirst({
      where: {
        id: reportId,
        professionalId: professional.id
      }
    })

    if (!existingReport) {
      return NextResponse.json({ error: 'Rapport non trouvé' }, { status: 404 })
    }

    await prisma.medicalReport.delete({
      where: { id: reportId }
    })

    return NextResponse.json({
      success: true,
      message: 'Rapport supprimé avec succès'
    })

  } catch (error) {
    console.error('Erreur suppression rapport:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
