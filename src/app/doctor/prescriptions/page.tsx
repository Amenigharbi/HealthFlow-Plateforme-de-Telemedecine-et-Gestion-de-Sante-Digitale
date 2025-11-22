'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import PrescriptionEditor from '@/app/components/Prescription/PrescriptionEditor'

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  patientName: string
  patientId: string
  prescribedAt: string
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
}

interface Patient {
  id: string
  name: string
}

export default function DoctorPrescriptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPrescription, setShowNewPrescription] = useState(false)
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED'>('ALL')

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
      
      // Charger les prescriptions
      const prescriptionsResponse = await fetch('/api/doctor/prescriptions')
      if (prescriptionsResponse.ok) {
        const prescriptionsData = await prescriptionsResponse.json()
        setPrescriptions(prescriptionsData.prescriptions)
      }

      // Charger la liste des patients
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

  const filteredPrescriptions = prescriptions.filter(prescription => {
    if (filter === 'ALL') return true
    return prescription.status === filter
  })

  const handleSavePrescription = async (prescriptionData: any) => {
    try {
      const response = await fetch('/api/doctor/prescriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(prescriptionData)
      })

      if (response.ok) {
        setShowNewPrescription(false)
        loadData() // Recharger la liste
      } else {
        const error = await response.json()
        alert(error.error || 'Erreur lors de la création de la prescription')
      }
    } catch (error) {
      console.error('Erreur création prescription:', error)
      alert('Erreur lors de la création de la prescription')
    }
  }

  const updatePrescriptionStatus = async (prescriptionId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/doctor/prescriptions/${prescriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        loadData() // Recharger la liste
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de vos prescriptions..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Prescriptions Médicales</h1>
              <p className="text-gray-600 mt-2">Gérez les ordonnances de vos patients</p>
            </div>
            
            <button
              onClick={() => setShowNewPrescription(true)}
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center space-x-2"
            >
              <span>+</span>
              <span>Nouvelle prescription</span>
            </button>
          </div>

          {/* Filtres et statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{prescriptions.length}</div>
              <div className="text-sm text-blue-600">Prescriptions total</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {prescriptions.filter(p => p.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-green-600">En cours</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {prescriptions.filter(p => p.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-orange-600">Terminées</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">
                {prescriptions.filter(p => p.status === 'CANCELLED').length}
              </div>
              <div className="text-sm text-purple-600">Annulées</div>
            </div>
          </div>

          {/* Filtres */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-4 py-2 rounded-xl font-medium ${
                filter === 'ALL'
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={`px-4 py-2 rounded-xl font-medium ${
                filter === 'ACTIVE'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Actives
            </button>
            <button
              onClick={() => setFilter('COMPLETED')}
              className={`px-4 py-2 rounded-xl font-medium ${
                filter === 'COMPLETED'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Terminées
            </button>
          </div>

          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {filter === 'ALL' ? 'Aucune prescription' : `Aucune prescription ${filter.toLowerCase()}`}
              </h3>
              <p className="text-gray-600 mb-6">
                {filter === 'ALL' 
                  ? "Vous n'avez pas encore créé de prescription médicale."
                  : `Aucune prescription ${filter.toLowerCase()} pour le moment.`
                }
              </p>
              {filter === 'ALL' && (
                <button
                  onClick={() => setShowNewPrescription(true)}
                  className="bg-linear-to-r from-green-500 to-emerald-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Créer ma première prescription
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {prescription.medication}
                      </h3>
                      <p className="text-gray-600">Patient: {prescription.patientName}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        prescription.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : prescription.status === 'COMPLETED'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {prescription.status === 'ACTIVE' ? 'Active' : 
                       prescription.status === 'COMPLETED' ? 'Terminée' : 'Annulée'}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Posologie:</span>
                      <span className="text-sm font-medium">{prescription.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Fréquence:</span>
                      <span className="text-sm font-medium">{prescription.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Durée:</span>
                      <span className="text-sm font-medium">{prescription.duration}</span>
                    </div>
                    {prescription.instructions && (
                      <div>
                        <span className="text-sm text-gray-600">Instructions:</span>
                        <p className="text-sm mt-1 text-gray-700">{prescription.instructions}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-sm text-gray-500">
                      Prescrite le {new Date(prescription.prescribedAt).toLocaleDateString('fr-FR')}
                    </span>
                    
                    <div className="flex space-x-2">
                      <select
                        value={prescription.status}
                        onChange={(e) => updatePrescriptionStatus(prescription.id, e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Terminée</option>
                        <option value="CANCELLED">Annulée</option>
                      </select>
                      
                      <button
                        onClick={() => router.push(`/doctor/prescriptions/${prescription.id}`)}
                        className="px-3 py-1 text-cyan-600 border border-cyan-300 rounded-lg hover:bg-cyan-50 transition-colors text-sm"
                      >
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showNewPrescription && (
        <PrescriptionEditor
          patients={patients}
          onSave={handleSavePrescription}
          onCancel={() => setShowNewPrescription(false)}
        />
      )}
    </div>
  )
}