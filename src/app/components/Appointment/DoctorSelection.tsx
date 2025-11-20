'use client'
import { useState } from 'react'
import { Doctor } from '@/types/appointment'

interface DoctorSelectionProps {
  doctors: Doctor[]
  selectedDoctor: Doctor | null
  onSelectDoctor: (doctor: Doctor) => void
}

export default function DoctorSelection({
  doctors,
  selectedDoctor,
  onSelectDoctor
}: DoctorSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Choisir un professionnel
      </h3>
      
      {/* Barre de recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher un médecin ou une spécialité..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Liste des médecins */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredDoctors.map((doctor) => (
          <div
            key={doctor.id}
            onClick={() => onSelectDoctor(doctor)}
            className={`p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
              selectedDoctor?.id === doctor.id
                ? 'border-cyan-500 bg-cyan-50 ring-2 ring-cyan-500/20'
                : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-25'
            }`}
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-linear-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center text-white font-semibold">
                {doctor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{doctor.name}</h4>
                <p className="text-sm text-gray-600">{doctor.specialty}</p>
                <p className="text-xs text-gray-500">{doctor.email}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                selectedDoctor?.id === doctor.id ? 'bg-cyan-500' : 'bg-gray-300'
              }`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}