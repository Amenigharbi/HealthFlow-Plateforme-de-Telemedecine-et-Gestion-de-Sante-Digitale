'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../components/UI/LoadingSpinner'

interface Appointment {
  id: string
  date: string
  doctor: {
    name: string
    specialty: string
  }
  status: string
  reason: string
  duration: number
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    loadAppointments()
  }, [session, status, router])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Chargement des rendez-vous...')
      
      const response = await fetch('/api/appointments')
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Données reçues:', data)
        setAppointments(data.appointments || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Erreur lors du chargement')
        console.error('❌ Erreur API:', errorData)
      }
    } catch (error) {
      console.error('❌ Erreur chargement rendez-vous:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Recharger la liste
        await loadAppointments()
        alert('Rendez-vous annulé avec succès')
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Erreur lors de l\'annulation')
      }
    } catch (error) {
      console.error('Erreur annulation:', error)
      alert('Erreur lors de l\'annulation')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de vos rendez-vous..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes rendez-vous</h1>
              <p className="text-gray-600 mt-2">Gérez vos consultations médicales</p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
            >
              Prendre un RDV
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <p className="text-red-800">{error}</p>
              <button
                onClick={loadAppointments}
                className="mt-2 text-red-600 hover:text-red-800 font-medium"
              >
                Réessayer
              </button>
            </div>
          )}

          {appointments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun rendez-vous</h3>
              <p className="text-gray-600 mb-6">Vous n'avez pas encore de rendez-vous programmé.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-linear-to-r from-cyan-500 to-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Prendre mon premier rendez-vous
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                          <span className="text-cyan-600 text-xl">👨‍⚕️</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{appointment.doctor.name}</h3>
                          <p className="text-gray-600">{appointment.doctor.specialty}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Date et heure</p>
                          <p className="font-medium text-gray-900">
                            {new Date(appointment.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Motif</p>
                          <p className="font-medium text-gray-900">{appointment.reason}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Statut</p>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                              appointment.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'SCHEDULED'
                                ? 'bg-blue-100 text-blue-800'
                                : appointment.status === 'CANCELLED'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {appointment.status === 'CONFIRMED' ? 'Confirmé' : 
                             appointment.status === 'SCHEDULED' ? 'Programmé' : 
                             appointment.status === 'CANCELLED' ? 'Annulé' : 
                             appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {appointment.status === 'SCHEDULED' && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => cancelAppointment(appointment.id)}
                          className="px-4 py-2 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    )}
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