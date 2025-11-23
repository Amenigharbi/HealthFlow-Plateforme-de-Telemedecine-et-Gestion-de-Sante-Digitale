'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import ReportEditor from '../../components/MedicalReport/ReportEditor'

interface MedicalReport {
  id: string
  title: string
  patientName: string
  patientId: string
  recordType: string
  content: string
  diagnosis?: string
  treatment?: string
  prescriptions?: string[]
  recommendations?: string
  severity: string
  followUpDate?: string
  date: string
  status: string
}

interface Patient {
  id: string
  name: string
}

export default function DoctorReportsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [reports, setReports] = useState<MedicalReport[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewReport, setShowNewReport] = useState(false)
  const [editingReport, setEditingReport] = useState<MedicalReport | null>(null)
  const [viewingReport, setViewingReport] = useState<MedicalReport | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'DOCTOR') {
      router.push('/dashboard')
      return
    }

    loadData()
  }, [session, status, router])

  const loadData = async () => {
    try {
      setLoading(true)
      
      const reportsResponse = await fetch('/api/doctor/reports')
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData.reports)
      }

      const patientsResponse = await fetch('/api/doctor/patients')
      if (patientsResponse.ok) {
        const patientsData = await patientsResponse.json()
        setPatients(patientsData.patients)
      }
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveReport = async (reportData: any) => {
    try {
      const url = editingReport 
        ? `/api/doctor/reports/${editingReport.id}`
        : '/api/doctor/reports'
      
      const method = editingReport ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      })

      if (response.ok) {
        setShowNewReport(false)
        setEditingReport(null)
        loadData() 
      } else {
        alert('Erreur lors de la sauvegarde du rapport')
      }
    } catch (error) {
      console.error('Erreur sauvegarde rapport:', error)
      alert('Erreur lors de la sauvegarde du rapport')
    }
  }

  const handleDeleteReport = async (reportId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
      return
    }

    try {
      const response = await fetch(`/api/doctor/reports/${reportId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData()
        setViewingReport(null)
      } else {
        alert('Erreur lors de la suppression du rapport')
      }
    } catch (error) {
      console.error('Erreur suppression rapport:', error)
      alert('Erreur lors de la suppression du rapport')
    }
  }

  const getRecordTypeLabel = (recordType: string) => {
    const types: { [key: string]: string } = {
      'NOTE': 'Note médicale',
      'CONDITION': 'Diagnostic',
      'PROCEDURE': 'Procédure',
      'LAB_RESULT': 'Résultat d\'analyse',
      'IMAGING': 'Compte-rendu d\'imagerie'
    }
    return types[recordType] || recordType
  }

  const getSeverityLabel = (severity: string) => {
    const severities: { [key: string]: string } = {
      'LOW': 'Normal',
      'MEDIUM': 'Important',
      'HIGH': 'Urgent',
      'CRITICAL': 'Critique'
    }
    return severities[severity] || severity
  }

  const prepareReportForEdit = (report: MedicalReport) => {
    return {
      patientId: report.patientId,
      title: report.title,
      recordType: report.recordType,
      content: report.content,
      diagnosis: report.diagnosis || '',
      treatment: report.treatment || '',
      prescriptions: report.prescriptions || [],
      recommendations: report.recommendations || '',
      severity: report.severity,
      followUpDate: report.followUpDate || ''
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de vos rapports..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Rapports Médicaux</h1>
              <p className="text-gray-600 mt-2">Gérez vos comptes-rendus et observations</p>
            </div>
            
            <button
              onClick={() => setShowNewReport(true)}
              className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Nouveau rapport</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{reports.length}</div>
              <div className="text-sm text-blue-600">Rapports total</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {reports.filter(r => r.recordType === 'NOTE').length}
              </div>
              <div className="text-sm text-green-600">Notes</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {reports.filter(r => r.recordType === 'PROCEDURE').length}
              </div>
              <div className="text-sm text-orange-600">Procédures</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">
                {reports.filter(r => r.severity === 'HIGH').length}
              </div>
              <div className="text-sm text-purple-600">Urgents</div>
            </div>
          </div>

          {reports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun rapport</h3>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore rédigé de rapport médical.</p>
              <button
                onClick={() => setShowNewReport(true)}
                className="bg-linear-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Rédiger mon premier rapport
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {report.title}
                      </h3>
                      <p className="text-gray-600">Patient: {report.patientName}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          report.severity === 'HIGH' || report.severity === 'CRITICAL'
                            ? 'bg-red-100 text-red-800'
                            : report.severity === 'MEDIUM'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {getSeverityLabel(report.severity)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(report.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        report.recordType === 'NOTE'
                          ? 'bg-blue-100 text-blue-800'
                          : report.recordType === 'PROCEDURE'
                          ? 'bg-purple-100 text-purple-800'
                          : report.recordType === 'CONDITION'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {getRecordTypeLabel(report.recordType)}
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingReport(report)}
                        className="px-4 py-2 text-cyan-600 border border-cyan-300 rounded-xl hover:bg-cyan-50 transition-colors"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => {
                          setEditingReport(report)
                          setShowNewReport(true)
                        }}
                        className="px-4 py-2 text-green-600 border border-green-300 rounded-xl hover:bg-green-50 transition-colors"
                      >
                        Modifier
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(showNewReport || editingReport) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingReport ? 'Modifier le rapport' : 'Nouveau rapport médical'}
              </h2>
              <button
                onClick={() => {
                  setShowNewReport(false)
                  setEditingReport(null)
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <ReportEditor
                patients={patients}
                onSave={handleSaveReport}
                onCancel={() => {
                  setShowNewReport(false)
                  setEditingReport(null)
                }}
                initialData={editingReport ? prepareReportForEdit(editingReport) : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {viewingReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">{viewingReport.title}</h2>
              <button
                onClick={() => setViewingReport(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                    {viewingReport.patientName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de rapport
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                    {getRecordTypeLabel(viewingReport.recordType)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Niveau de sévérité
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                    {getSeverityLabel(viewingReport.severity)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <p className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                    {new Date(viewingReport.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observations et examen clinique
                </label>
                <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 whitespace-pre-wrap">
                  {viewingReport.content}
                </div>
              </div>

              {viewingReport.diagnosis && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnostic
                  </label>
                  <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                    {viewingReport.diagnosis}
                  </div>
                </div>
              )}

              {viewingReport.treatment && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Traitement prescrit
                  </label>
                  <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 whitespace-pre-wrap">
                    {viewingReport.treatment}
                  </div>
                </div>
              )}

              {viewingReport.prescriptions && viewingReport.prescriptions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Médicaments prescrits
                  </label>
                  <div className="space-y-2">
                    {viewingReport.prescriptions.map((prescription, index) => (
                      <div key={index} className="text-gray-900 bg-blue-50 px-4 py-3 rounded-xl border border-blue-200">
                        {prescription}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewingReport.recommendations && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommandations
                  </label>
                  <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200 whitespace-pre-wrap">
                    {viewingReport.recommendations}
                  </div>
                </div>
              )}

              {viewingReport.followUpDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de suivi recommandée
                  </label>
                  <div className="text-gray-900 bg-gray-50 px-4 py-3 rounded-xl border border-gray-200">
                    {new Date(viewingReport.followUpDate).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handleDeleteReport(viewingReport.id)}
                  className="px-6 py-3 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => {
                    setEditingReport(viewingReport)
                    setViewingReport(null)
                    setShowNewReport(true)
                  }}
                  className="px-6 py-3 text-green-600 border border-green-300 rounded-xl hover:bg-green-50 transition-colors"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setViewingReport(null)}
                  className="px-6 py-3 bg-cyan-500 text-white rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}