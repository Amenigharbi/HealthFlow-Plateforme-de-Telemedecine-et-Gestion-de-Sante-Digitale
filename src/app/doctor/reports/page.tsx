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
  recordType: string
  date: string
  status: string
  severity?: string
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
      const response = await fetch('/api/doctor/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reportData)
      })

      if (response.ok) {
        setShowNewReport(false)
        loadData() 
      } else {
        alert('Erreur lors de la création du rapport')
      }
    } catch (error) {
      console.error('Erreur création rapport:', error)
      alert('Erreur lors de la création du rapport')
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
                          report.severity === 'HIGH'
                            ? 'bg-red-100 text-red-800'
                            : report.severity === 'MEDIUM'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {report.severity === 'HIGH' ? 'Urgent' : 
                         report.severity === 'MEDIUM' ? 'Important' : 'Normal'}
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
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {report.recordType === 'NOTE' ? 'Note médicale' :
                       report.recordType === 'PROCEDURE' ? 'Procédure' :
                       report.recordType === 'CONDITION' ? 'Diagnostic' : 'Rapport'}
                    </span>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => router.push(`/doctor/reports/${report.id}`)}
                        className="px-4 py-2 text-cyan-600 border border-cyan-300 rounded-xl hover:bg-cyan-50 transition-colors"
                      >
                        Voir
                      </button>
                      <button
                        onClick={() => router.push(`/doctor/reports/${report.id}/edit`)}
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

      {/* Modal de création de rapport */}
      {showNewReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Nouveau rapport médical</h2>
              <button
                onClick={() => setShowNewReport(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <ReportEditor
                patients={patients}
                onSave={handleSaveReport}
                onCancel={() => setShowNewReport(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}