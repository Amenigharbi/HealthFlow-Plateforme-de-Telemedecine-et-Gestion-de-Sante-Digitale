import { useState, useEffect } from 'react'
import { Doctor, TimeSlot } from '@/types/appointment'

export function useAppointmentBooking() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [availableDates, setAvailableDates] = useState<Date[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch('/api/doctors')
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des médecins')
        }
        
        const doctorsData = await response.json()
        setDoctors(doctorsData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        console.error('Erreur fetchDoctors:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchDoctors()
  }, [])

useEffect(() => {
  const fetchAvailableDates = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/doctors/availability?professionalId=${doctorId}`)
      
      if (response.ok) {
        const data = await response.json()
        setAvailableDates(data.availableDates || [])
      } else {
        console.error('❌ Erreur API dates disponibles:', response.status)
        setAvailableDates([])
      }
    } catch (error) {
      console.error('❌ Erreur chargement dates disponibles:', error)
      setAvailableDates([])
    }
  }

  if (selectedDoctor) {
    fetchAvailableDates(selectedDoctor.id)
  } else {
    setAvailableDates([])
  }
}, [selectedDoctor])

  useEffect(() => {
    const fetchTimeSlots = async () => {
      if (!selectedDoctor || !selectedDate) return

      try {
        setLoading(true)
        setError(null)
        const dateString = selectedDate.toISOString().split('T')[0]
        const response = await fetch(
      `/api/doctors/slots?professionalId=${selectedDoctor.id}&date=${dateString}`
    )
        
        if (!response.ok) {
          throw new Error('Erreur lors du chargement des créneaux')
        }
        
        const data = await response.json()
        setAvailableSlots(data.slots)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
        console.error('Erreur fetchTimeSlots:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTimeSlots()
  }, [selectedDoctor, selectedDate])

  const handleBookAppointment = async (appointmentData: {
    doctorId: string
    date: Date
    reason: string
    type: string
  }) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la réservation')
      }

      setSelectedDoctor(null)
      setSelectedDate(null)
      setSelectedSlot(null)
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  return {
    doctors,
    selectedDoctor,
    setSelectedDoctor,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    availableSlots,
    availableDates,
    loading,
    error,
    handleBookAppointment,
    clearError
  }
}