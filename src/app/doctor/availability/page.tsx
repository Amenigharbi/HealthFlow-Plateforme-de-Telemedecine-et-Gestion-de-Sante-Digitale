'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

interface BreakSlot {
  id: string
  startTime: string
  endTime: string
}

interface Availability {
  id: string
  dayOfWeek: number
  dayName: string
  startTime: string
  endTime: string
  isActive: boolean
  breaks: BreakSlot[]
}

export default function DoctorAvailabilityPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [availabilities, setAvailabilities] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showBreakModal, setShowBreakModal] = useState<{
    availabilityIndex: number
    breakIndex?: number
    breakData?: BreakSlot
  } | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'DOCTOR') {
      router.push('/dashboard')
      return
    }

    loadAvailabilities()
  }, [session, status, router])

  const loadAvailabilities = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/doctor/availability')
      if (response.ok) {
        const data = await response.json()
        setAvailabilities(data.availabilities)
      }
    } catch (error) {
      console.error('Erreur chargement disponibilités:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAvailability = async (availabilityId: string, updates: any) => {
    try {
      const response = await fetch(`/api/doctor/availability-item?id=${availabilityId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Erreur mise à jour')
      }

      return await response.json()
    } catch (error) {
      console.error('Erreur mise à jour disponibilité:', error)
      throw error
    }
  }

  const handleSaveAll = async () => {
    try {
      setSaving(true)
      await Promise.all(availabilities.map(avail => 
        updateAvailability(avail.id, {
          startTime: avail.startTime,
          endTime: avail.endTime,
          isActive: avail.isActive
        })
      ))
      alert('Disponibilités mises à jour avec succès!')
    } catch (error) {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = (index: number) => {
    setAvailabilities(prev => prev.map((avail, i) => 
      i === index ? { ...avail, isActive: !avail.isActive } : avail
    ))
  }

  const updateTime = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setAvailabilities(prev => prev.map((avail, i) => 
      i === index ? { ...avail, [field]: value } : avail
    ))
  }

  const addBreak = (availabilityIndex: number) => {
    setShowBreakModal({
      availabilityIndex,
      breakData: {
        id: `temp-${Date.now()}`,
        startTime: '12:00',
        endTime: '13:00'
      }
    })
  }

  const editBreak = (availabilityIndex: number, breakIndex: number) => {
    const availability = availabilities[availabilityIndex]
    const breakData = availability.breaks[breakIndex]
    setShowBreakModal({
      availabilityIndex,
      breakIndex,
      breakData
    })
  }

  const deleteBreak = async (availabilityIndex: number, breakId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette pause ?')) return

    try {
      if (!breakId.startsWith('temp-')) {
        const response = await fetch(`/api/doctor/breaks/${breakId}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error('Erreur suppression pause')
        }
      }

      setAvailabilities(prev => prev.map((avail, i) => 
        i === availabilityIndex 
          ? { 
              ...avail, 
              breaks: avail.breaks.filter(b => b.id !== breakId) 
            }
          : avail
      ))

    } catch (error) {
      console.error('Erreur suppression pause:', error)
      alert('Erreur lors de la suppression de la pause')
    }
  }

  const saveBreak = async (breakData: {
    availabilityIndex: number
    breakIndex?: number
    startTime: string
    endTime: string
  }) => {
    const { availabilityIndex, breakIndex, startTime, endTime } = breakData

    if (startTime >= endTime) {
      alert('L\'heure de fin doit être après l\'heure de début')
      return
    }

    const availability = availabilities[availabilityIndex]
    
    if (startTime < availability.startTime || endTime > availability.endTime) {
      alert('La pause doit être comprise dans les horaires de disponibilité')
      return
    }

    const newBreak: BreakSlot = {
      id: breakIndex !== undefined ? availability.breaks[breakIndex].id : `temp-${Date.now()}`,
      startTime,
      endTime
    }

    try {
      if (breakIndex === undefined) {
        const response = await fetch(`/api/doctor/availability/${availability.id}/breaks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ startTime, endTime })
        })

        if (response.ok) {
          const result = await response.json()
          newBreak.id = result.break.id 
        } else {
          throw new Error('Erreur création pause')
        }
      } else {
        const response = await fetch(`/api/doctor/availability/breaks/${newBreak.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ startTime, endTime })
        })

        if (!response.ok) {
          throw new Error('Erreur mise à jour pause')
        }
      }

      setAvailabilities(prev => prev.map((avail, i) => {
        if (i !== availabilityIndex) return avail

        if (breakIndex !== undefined) {
          const updatedBreaks = [...avail.breaks]
          updatedBreaks[breakIndex] = newBreak
          return { ...avail, breaks: updatedBreaks }
        } else {
          return { 
            ...avail, 
            breaks: [...avail.breaks, newBreak] 
          }
        }
      }))

      setShowBreakModal(null)
      
    } catch (error) {
      console.error('Erreur sauvegarde pause:', error)
      alert('Erreur lors de la sauvegarde de la pause')
    }
  }

  const daysOfWeek = [
    'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'
  ]

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de vos disponibilités..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes Disponibilités</h1>
              <p className="text-gray-600 mt-2">Configurez vos créneaux de consultation</p>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleSaveAll}
                disabled={saving}
                className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                onClick={() => router.push('/doctor/agenda')}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Voir l'agenda
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {availabilities.map((availability, index) => (
              <div
                key={availability.id}
                className="border border-gray-200 rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleDay(index)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        availability.isActive ? 'bg-cyan-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transform transition-transform ${
                          availability.isActive ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {daysOfWeek[availability.dayOfWeek]}
                    </h3>
                  </div>
                  
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      availability.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {availability.isActive ? 'Actif' : 'Inactif'}
                  </span>
                </div>

                {availability.isActive && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Heure de début
                        </label>
                        <input
                          type="time"
                          value={availability.startTime}
                          onChange={(e) => updateTime(index, 'startTime', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Heure de fin
                        </label>
                        <input
                          type="time"
                          value={availability.endTime}
                          onChange={(e) => updateTime(index, 'endTime', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pauses
                        </label>
                        <button
                          onClick={() => addBreak(index)}
                          className="w-full px-4 py-2 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-cyan-300 hover:text-cyan-600 transition-colors"
                        >
                          + Ajouter une pause
                        </button>
                      </div>
                    </div>

                    {availability.breaks.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Pauses configurées:</h4>
                        <div className="space-y-2">
                          {availability.breaks.map((breakSlot, breakIndex) => (
                            <div
                              key={breakSlot.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
                            >
                              <span className="text-sm text-gray-700">
                                {breakSlot.startTime} - {breakSlot.endTime}
                              </span>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => editBreak(index, breakIndex)}
                                  className="text-cyan-600 hover:text-cyan-800 text-sm"
                                >
                                  Modifier
                                </button>
                                <button
                                  onClick={() => deleteBreak(index, breakSlot.id)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aperçu de la semaine</h3>
            <div className="grid grid-cols-7 gap-2">
              {availabilities.map(availability => (
                <div
                  key={availability.dayOfWeek}
                  className={`text-center p-3 rounded-xl border ${
                    availability.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700">
                    {daysOfWeek[availability.dayOfWeek].slice(0, 3)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {availability.isActive ? (
                      <>
                        {availability.startTime} - {availability.endTime}
                        {availability.breaks.length > 0 && (
                          <div className="text-orange-600 mt-1">
                            {availability.breaks.length} pause(s)
                          </div>
                        )}
                      </>
                    ) : (
                      'Fermé'
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showBreakModal && (
        <BreakModal
          breakData={showBreakModal.breakData!}
          onSave={(breakData) => saveBreak({
            ...breakData,
            availabilityIndex: showBreakModal.availabilityIndex,
            breakIndex: showBreakModal.breakIndex
          })}
          onClose={() => setShowBreakModal(null)}
        />
      )}
    </div>
  )
}

interface BreakModalProps {
  breakData: BreakSlot
  onSave: (breakData: { startTime: string; endTime: string }) => void
  onClose: () => void
}

function BreakModal({ breakData, onSave, onClose }: BreakModalProps) {
  const [formData, setFormData] = useState({
    startTime: breakData.startTime,
    endTime: breakData.endTime
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {breakData.id.startsWith('temp-') ? 'Ajouter une pause' : 'Modifier la pause'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de début
            </label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Heure de fin
            </label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="bg-cyan-500 text-white px-4 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
            >
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}