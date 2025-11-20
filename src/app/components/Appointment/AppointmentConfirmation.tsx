'use client'
import { Doctor, TimeSlot } from '@/types/appointment'
import { useState } from 'react'

interface AppointmentConfirmationProps {
  doctor: Doctor
  selectedDate: Date
  selectedSlot: TimeSlot
  onConfirm: (appointmentData: {
    doctorId: string
    date: Date
    reason: string
    type: string
  }) => void
  onBack: () => void
}

export default function AppointmentConfirmation({
  doctor,
  selectedDate,
  selectedSlot,
  onConfirm,
  onBack
}: AppointmentConfirmationProps) {
  const [reason, setReason] = useState('')
  const [appointmentType, setAppointmentType] = useState('consultation')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm({
      doctorId: doctor.id,
      date: selectedSlot.start,
      reason,
      type: appointmentType
    })
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Confirmer le rendez-vous
      </h3>

      {/* Récapitulatif */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Médecin</p>
            <p className="font-semibold">{doctor.name}</p>
            <p className="text-gray-600">{doctor.specialty}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-semibold">
              {selectedDate.toLocaleDateString('fr-FR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Horaire</p>
            <p className="font-semibold">
              {selectedSlot.start.toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire de confirmation */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de consultation
          </label>
          <select
            value={appointmentType}
            onChange={(e) => setAppointmentType(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="consultation">Consultation standard</option>
            <option value="followup">Suivi</option>
            <option value="emergency">Urgence</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motif de la consultation
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Décrivez brièvement le motif de votre consultation..."
            rows={4}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
          <button
            type="submit"
            disabled={!reason.trim()}
            className="flex-1 px-6 py-3 bg-linear-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Confirmer le rendez-vous
          </button>
        </div>
      </form>
    </div>
  )
}