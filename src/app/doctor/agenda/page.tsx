'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

interface Appointment {
  id: string
  date: string
  patient: {
    name: string
    email: string
    phone?: string
  }
  reason: string
  status: string
  duration: number
}

export default function DoctorAgendaPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [view, setView] = useState<'day' | 'week'>('day')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'DOCTOR') {
      router.push('/dashboard')
      return
    }

    loadAppointments()
  }, [session, status, router, selectedDate])

  const loadAppointments = async () => {
    try {
      setLoading(true)
      const dateString = selectedDate.toISOString().split('T')[0]
      const response = await fetch(`/api/doctor/appointments?date=${dateString}&view=${view}`)
      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments)
      }
    } catch (error) {
      console.error('Erreur chargement agenda:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/doctor/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        loadAppointments() 
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur mise à jour statut:', error)
      alert('Erreur lors de la mise à jour')
    }
  }

  const getAppointmentsForTimeSlot = (hour: number) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.getHours() === hour
    })
  }

  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8) // 8h à 19h

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de votre agenda..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Agenda</h1>
              <p className="text-gray-600 mt-2">
                {selectedDate.toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex space-x-4">
              <div className="flex space-x-2">
                <button
                  onClick={() => setView('day')}
                  className={`px-4 py-2 rounded-xl font-semibold ${
                    view === 'day' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Jour
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-4 py-2 rounded-xl font-semibold ${
                    view === 'week' 
                      ? 'bg-cyan-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Semaine
                </button>
              </div>
              
              <button
                onClick={() => {
                  const newDate = new Date(selectedDate)
                  newDate.setDate(newDate.getDate() + (view === 'day' ? 1 : 7))
                  setSelectedDate(newDate)
                }}
                className="bg-cyan-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{appointments.length}</div>
              <div className="text-sm text-blue-600">RDV aujourd'hui</div>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {appointments.filter(a => a.status === 'CONFIRMED').length}
              </div>
              <div className="text-sm text-green-600">Confirmés</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">
                {appointments.filter(a => a.status === 'SCHEDULED').length}
              </div>
              <div className="text-sm text-orange-600">En attente</div>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4 border border-purple-200">
              <div className="text-2xl font-bold text-purple-700">
                {appointments.filter(a => a.status === 'COMPLETED').length}
              </div>
              <div className="text-sm text-purple-600">Terminés</div>
            </div>
          </div>

          {/* Agenda visuel */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            {timeSlots.map(hour => (
              <div key={hour} className="flex border-b border-gray-200 last:border-b-0">
                {/* Heure */}
                <div className="w-24 bg-gray-50 p-4 flex items-center justify-center border-r border-gray-200">
                  <span className="font-semibold text-gray-700">{hour}h</span>
                </div>
                
                {/* Créneaux */}
                <div className="flex-1 p-4 min-h-24">
                  {getAppointmentsForTimeSlot(hour).map(appointment => (
                    <div
                      key={appointment.id}
                      className="mb-2 last:mb-0 p-3 rounded-xl border-l-4 bg-blue-50 border-blue-500"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{appointment.patient.name}</h4>
                          <p className="text-sm text-gray-600">{appointment.reason}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(appointment.date).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        
                        <select
                          value={appointment.status}
                          onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1"
                        >
                          <option value="SCHEDULED">Programmé</option>
                          <option value="CONFIRMED">Confirmé</option>
                          <option value="IN_PROGRESS">En cours</option>
                          <option value="COMPLETED">Terminé</option>
                          <option value="CANCELLED">Annulé</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  
                  {getAppointmentsForTimeSlot(hour).length === 0 && (
                    <div className="text-center text-gray-400 py-4">
                      Aucun rendez-vous
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions rapides */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => router.push('/doctor/availability')}
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
            >
              Gérer les disponibilités
            </button>
            <button
              onClick={() => router.push('/doctor/patients')}
              className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
            >
              Voir mes patients
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}