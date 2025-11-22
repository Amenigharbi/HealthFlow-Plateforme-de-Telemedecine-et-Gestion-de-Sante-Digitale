'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import LoadingSpinner from '../../../components/UI/LoadingSpinner'

interface PatientDetail {
  id: string
  name: string
  email: string
  phone?: string
  birthDate?: string
  gender?: string
  medicalRecord?: {
    bloodType?: string
    height?: number
    weight?: number
    allergies: string[]
    medications: string[]
    conditions: string[]
    emergencyContact?: string
  }
  appointments: Array<{
    id: string
    date: string
    reason: string
    status: string
    diagnosis?: string
    treatment?: string
    notes?: string
  }>
  stats: {
    totalAppointments: number
    completedAppointments: number
    upcomingAppointments: number
    averageDuration: number
  }
}

export default function PatientDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [patient, setPatient] = useState<PatientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'DOCTOR') {
      router.push('/dashboard')
      return
    }
    loadPatient()
  }, [session, status, router, params.id])

  const loadPatient = async () => {
    try {
      const response = await fetch(`/api/doctor/patients/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setPatient(data.patient)
      }
    } catch (error) {
      console.error('Erreur chargement patient:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateAge = (birthDate: string) => {
    return Math.floor((Date.now() - new Date(birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement du dossier patient..." />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient non trouvé</h1>
          <button
            onClick={() => router.push('/doctor/patients')}
            className="bg-cyan-500 text-white px-6 py-2 rounded-xl hover:bg-cyan-600"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        {/* En-tête du patient */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-linear-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-semibold text-2xl">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{patient.name}</h1>
                <p className="text-gray-600">{patient.email}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  {patient.phone && <span>📞 {patient.phone}</span>}
                  {patient.birthDate && <span>🎂 {calculateAge(patient.birthDate)} ans</span>}
                  {patient.gender && <span>👤 {patient.gender}</span>}
                  {patient.medicalRecord?.bloodType && <span>🩸 {patient.medicalRecord.bloodType}</span>}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/dashboard?action=appointment&patientId=${patient.id}`)}
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
              >
                Nouveau RDV
              </button>
              <button
                onClick={() => router.push(`/doctor/patients/${patient.id}/medical-record`)}
                className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
              >
                Modifier fiche
              </button>
            </div>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{patient.stats.totalAppointments}</div>
            <div className="text-sm text-blue-600">Consultations total</div>
          </div>
          <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{patient.stats.completedAppointments}</div>
            <div className="text-sm text-green-600">Consultations terminées</div>
          </div>
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">{patient.stats.upcomingAppointments}</div>
            <div className="text-sm text-orange-600">RDV à venir</div>
          </div>
          <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{patient.stats.averageDuration}min</div>
            <div className="text-sm text-purple-600">Durée moyenne</div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Vue générale' },
                { id: 'medical', label: 'Fiche médicale' },
                { id: 'appointments', label: 'Historique RDV' },
                { id: 'documents', label: 'Documents' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-cyan-500 text-cyan-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Contenu des onglets */}
          <div className="min-h-96">
            {activeTab === 'overview' && <OverviewTab patient={patient} />}
            {activeTab === 'medical' && <MedicalTab patient={patient} />}
            {activeTab === 'appointments' && <AppointmentsTab patient={patient} />}
            {activeTab === 'documents' && <DocumentsTab patient={patient} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant Vue Générale
function OverviewTab({ patient }: { patient: PatientDetail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Informations médicales */}
      <div className="space-y-6">
        <div className="bg-blue-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-blue-900">Informations vitales</h3>
          <div className="grid grid-cols-2 gap-4">
            {patient.medicalRecord?.height && (
              <div>
                <label className="text-sm text-blue-700">Taille</label>
                <p className="font-semibold">{patient.medicalRecord.height} cm</p>
              </div>
            )}
            {patient.medicalRecord?.weight && (
              <div>
                <label className="text-sm text-blue-700">Poids</label>
                <p className="font-semibold">{patient.medicalRecord.weight} kg</p>
              </div>
            )}
            {patient.medicalRecord?.bloodType && (
              <div>
                <label className="text-sm text-blue-700">Groupe sanguin</label>
                <p className="font-semibold">{patient.medicalRecord.bloodType}</p>
              </div>
            )}
            {patient.medicalRecord?.emergencyContact && (
              <div>
                <label className="text-sm text-blue-700">Contact urgence</label>
                <p className="font-semibold">{patient.medicalRecord.emergencyContact}</p>
              </div>
            )}
          </div>
        </div>

        {/* Allergies */}
        <div className="bg-red-50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4 text-red-900">Allergies</h3>
          {patient.medicalRecord?.allergies.length ? (
            <ul className="space-y-1">
              {patient.medicalRecord.allergies.map((allergy, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                  {allergy}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-red-700">Aucune allergie connue</p>
          )}
        </div>
      </div>

      {/* Dernières consultations */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Dernières consultations</h3>
        <div className="space-y-4">
          {patient.appointments.slice(0, 3).map(appointment => (
            <div key={appointment.id} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-gray-900">
                  {new Date(appointment.date).toLocaleDateString('fr-FR')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {appointment.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{appointment.reason}</p>
              {appointment.diagnosis && (
                <p className="text-sm"><strong>Diagnostic:</strong> {appointment.diagnosis}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Composant Fiche Médicale
function MedicalTab({ patient }: { patient: PatientDetail }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Antécédents médicaux */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Antécédents médicaux</h3>
        {patient.medicalRecord?.conditions.length ? (
          <ul className="space-y-2">
            {patient.medicalRecord.conditions.map((condition, index) => (
              <li key={index} className="flex items-center p-3 bg-orange-50 rounded-lg">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                {condition}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucun antécédent médical enregistré</p>
        )}
      </div>

      {/* Traitements en cours */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Traitements en cours</h3>
        {patient.medicalRecord?.medications.length ? (
          <ul className="space-y-2">
            {patient.medicalRecord.medications.map((medication, index) => (
              <li key={index} className="flex items-center p-3 bg-green-50 rounded-lg">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                {medication}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-center py-8">Aucun traitement en cours</p>
        )}
      </div>
    </div>
  )
}

// Composant Historique des RDV
function AppointmentsTab({ patient }: { patient: PatientDetail }) {
  return (
    <div className="space-y-4">
      {patient.appointments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun rendez-vous</h3>
          <p className="text-gray-600">Ce patient n'a pas encore de rendez-vous.</p>
        </div>
      ) : (
        patient.appointments.map(appointment => (
          <div key={appointment.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {new Date(appointment.date).toLocaleDateString('fr-FR', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </h4>
                <p className="text-gray-600 mt-1">{appointment.reason}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                appointment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                appointment.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                appointment.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {appointment.status === 'COMPLETED' ? 'Terminé' :
                 appointment.status === 'SCHEDULED' ? 'Programmé' :
                 appointment.status === 'CANCELLED' ? 'Annulé' : appointment.status}
              </span>
            </div>
            
            {(appointment.diagnosis || appointment.treatment || appointment.notes) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                {appointment.diagnosis && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Diagnostic</label>
                    <p className="text-gray-900">{appointment.diagnosis}</p>
                  </div>
                )}
                {appointment.treatment && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Traitement</label>
                    <p className="text-gray-900">{appointment.treatment}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Notes</label>
                    <p className="text-gray-900">{appointment.notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

// Composant Documents (à implémenter)
function DocumentsTab({ patient }: { patient: PatientDetail }) {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 text-6xl mb-4">📁</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Module Documents</h3>
      <p className="text-gray-600 mb-6">Cette fonctionnalité sera disponible prochainement.</p>
      <button className="bg-cyan-500 text-white px-6 py-2 rounded-xl hover:bg-cyan-600 transition-colors">
        Uploader un document
      </button>
    </div>
  )
}