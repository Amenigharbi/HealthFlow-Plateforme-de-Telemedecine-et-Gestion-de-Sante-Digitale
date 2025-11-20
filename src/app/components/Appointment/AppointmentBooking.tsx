'use client'
import { useState, useEffect } from 'react'
import { useAppointmentBooking } from '../../hooks/useAppointmentBooking'
import DoctorSelection from './DoctorSelection'
import DateCalendar from './DateCalendar'
import TimeSlots from './TimeSlots'
import AppointmentConfirmation from './AppointmentConfirmation'
import Notification from '../../components/UI/Notification'

interface AppointmentBookingProps {
  onSuccess?: () => void
}

export default function AppointmentBooking({ onSuccess }: AppointmentBookingProps) {
  const {
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
  } = useAppointmentBooking()

  const [step, setStep] = useState<'doctor' | 'date' | 'time' | 'confirm'>('doctor')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)

  // Afficher les erreurs du hook
  useEffect(() => {
    if (error) {
      setNotification({ type: 'error', message: error })
    }
  }, [error])

  // Navigation entre les étapes
  useEffect(() => {
    if (selectedDoctor) setStep('date')
    if (selectedDate) setStep('time')
    if (selectedSlot) setStep('confirm')
  }, [selectedDoctor, selectedDate, selectedSlot])

  const handleBack = () => {
    if (step === 'confirm') {
      setStep('time')
      setSelectedSlot(null)
    } else if (step === 'time') {
      setStep('date')
      setSelectedDate(null)
    } else if (step === 'date') {
      setStep('doctor')
      setSelectedDoctor(null)
    }
  }

  const handleConfirmAppointment = async (appointmentData: {
    doctorId: string
    date: Date
    reason: string
    type: string
  }) => {
    try {
      const result = await handleBookAppointment(appointmentData)
      
      setNotification({
        type: 'success',
        message: result.message || 'Rendez-vous confirmé avec succès!'
      })

      // Appeler le callback onSuccess après un délai
      setTimeout(() => {
        if (onSuccess) {
          onSuccess()
        }
        
        // Reset complet
        setStep('doctor')
        setSelectedDoctor(null)
        setSelectedDate(null)
        setSelectedSlot(null)
      }, 2000)

    } catch (err) {
      // L'erreur est déjà gérée par le hook
      console.error('Erreur de confirmation:', err)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => {
            setNotification(null)
            clearError()
          }}
        />
      )}

      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Prendre un rendez-vous
        </h1>
        <p className="text-gray-600">
          Choisissez un professionnel de santé et réservez votre consultation
        </p>
      </div>

      {/* Barre de progression */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-4">
          {['Médecin', 'Date', 'Horaire', 'Confirmation'].map((label, index) => {
            const stepIndex = ['doctor', 'date', 'time', 'confirm'].indexOf(step)
            const isCompleted = index < stepIndex
            const isCurrent = index === stepIndex

            return (
              <div key={label} className="flex items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isCompleted
                      ? 'bg-cyan-500 text-white'
                      : isCurrent
                      ? 'bg-cyan-100 text-cyan-700 border-2 border-cyan-500'
                      : 'bg-gray-100 text-gray-400'
                    }
                  `}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span
                  className={`
                    ml-2 text-sm font-medium
                    ${isCompleted || isCurrent ? 'text-cyan-700' : 'text-gray-400'}
                  `}
                >
                  {label}
                </span>
                {index < 3 && (
                  <div
                    className={`
                      w-8 h-0.5 mx-4
                      ${isCompleted ? 'bg-cyan-500' : 'bg-gray-200'}
                    `}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Indicateur de chargement global */}
      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-500"></div>
            <span className="text-gray-700">Chargement...</span>
          </div>
        </div>
      )}

      {/* Contenu de l'étape courante */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {step === 'doctor' && (
          <DoctorSelection
            doctors={doctors}
            selectedDoctor={selectedDoctor}
            onSelectDoctor={setSelectedDoctor}
          />
        )}

        {step === 'date' && selectedDoctor && (
          <>
            <DateCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              availableDates={availableDates}
            />
            <div className="hidden lg:block"></div>
            <div className="hidden lg:block"></div>
          </>
        )}

        {step === 'time' && selectedDoctor && selectedDate && (
          <>
            <DoctorSelection
              doctors={doctors}
              selectedDoctor={selectedDoctor}
              onSelectDoctor={setSelectedDoctor}
            />
            <DateCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              availableDates={availableDates}
            />
            <TimeSlots
              slots={availableSlots}
              selectedSlot={selectedSlot}
              onSelectSlot={setSelectedSlot}
              loading={loading}
            />
          </>
        )}

        {step === 'confirm' && selectedDoctor && selectedDate && selectedSlot && (
          <>
            <DoctorSelection
              doctors={doctors}
              selectedDoctor={selectedDoctor}
              onSelectDoctor={setSelectedDoctor}
            />
            <DateCalendar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              availableDates={availableDates}
            />
            <AppointmentConfirmation
              doctor={selectedDoctor}
              selectedDate={selectedDate}
              selectedSlot={selectedSlot}
              onConfirm={handleConfirmAppointment}
              onBack={handleBack}
            />
          </>
        )}
      </div>

      {/* Bouton retour */}
      {step !== 'doctor' && (
        <div className="mt-6 text-center">
          <button
            onClick={handleBack}
            disabled={loading}
            className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center justify-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>‹</span>
            <span>Retour</span>
          </button>
        </div>
      )}
    </div>
  )
}