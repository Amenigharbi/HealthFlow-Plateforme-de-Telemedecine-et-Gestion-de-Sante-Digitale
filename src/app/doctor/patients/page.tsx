'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

interface Patient {
  id: string
  name: string
  email: string
  phone?: string
  birthDate?: string
  gender?: string
  lastAppointment?: string
  nextAppointment?: string
  appointmentCount: number
}

export default function DoctorPatientsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'DOCTOR') {
      router.push('/dashboard')
      return
    }

    loadPatients()
  }, [session, status, router])

  const loadPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/doctor/patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients)
      }
    } catch (error) {
      console.error('Erreur chargement patients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de vos patients..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Patients</h1>
              <p className="text-gray-600 mt-2">Gérez votre liste de patients</p>
            </div>
            
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="Rechercher un patient..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              <button
                onClick={() => router.push('/doctor/agenda')}
                className="bg-cyan-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
              >
                Voir l'agenda
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{patients.length}</div>
              <div className="text-sm text-blue-600">Patients total</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {patients.filter(p => p.nextAppointment).length}
              </div>
              <div className="text-sm text-green-600">RDV à venir</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {patients.filter(p => new Date(p.lastAppointment || '') > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-orange-600">Actifs (30j)</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">
                {patients.reduce((acc, patient) => acc + patient.appointmentCount, 0)}
              </div>
              <div className="text-sm text-purple-600">Consultations total</div>
            </div>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun patient</h3>
              <p className="text-gray-600">Vous n'avez pas encore de patients dans votre liste.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-linear-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white font-semibold text-lg">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-600">{patient.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {patient.phone && (
                      <div className="flex justify-between">
                        <span>Téléphone:</span>
                        <span className="font-medium">{patient.phone}</span>
                      </div>
                    )}
                    {patient.birthDate && (
                      <div className="flex justify-between">
                        <span>Âge:</span>
                        <span className="font-medium">
                          {Math.floor((Date.now() - new Date(patient.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} ans
                        </span>
                      </div>
                    )}
                    {patient.gender && (
                      <div className="flex justify-between">
                        <span>Genre:</span>
                        <span className="font-medium capitalize">{patient.gender}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Consultations:</span>
                      <span className="font-medium">{patient.appointmentCount}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {patient.lastAppointment && (
                      <div className="text-xs text-gray-500">
                        Dernier RDV: {new Date(patient.lastAppointment).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    {patient.nextAppointment && (
                      <div className="text-xs text-green-600 font-semibold">
                        Prochain RDV: {new Date(patient.nextAppointment).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => router.push(`/doctor/patients/${patient.id}`)}
                      className="flex-1 bg-cyan-500 text-white py-2 rounded-xl font-semibold hover:bg-cyan-600 transition-colors text-sm"
                    >
                      Dossier
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard?action=appointment&patientId=${patient.id}`)}
                      className="flex-1 bg-green-500 text-white py-2 rounded-xl font-semibold hover:bg-green-600 transition-colors text-sm"
                    >
                      Nouveau RDV
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}