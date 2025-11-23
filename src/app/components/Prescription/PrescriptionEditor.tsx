'use client'
import { useState } from 'react'

interface Patient {
  id: string
  name: string
}

interface PrescriptionFormData {
  patientId: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

interface PrescriptionEditorProps {
  patients: Patient[]
  onSave: (data: PrescriptionFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<PrescriptionFormData>
}

export default function PrescriptionEditor({ patients, onSave, onCancel, initialData }: PrescriptionEditorProps) {
  const [formData, setFormData] = useState<PrescriptionFormData>({
    patientId: initialData?.patientId || '',
    medication: initialData?.medication || '',
    dosage: initialData?.dosage || '',
    frequency: initialData?.frequency || '',
    duration: initialData?.duration || '',
    instructions: initialData?.instructions || ''
  })

  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.patientId || !formData.medication || !formData.dosage || !formData.frequency || !formData.duration) {
      alert('Veuillez remplir tous les champs obligatoires')
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Nouvelle prescription</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient *
              </label>
              <select
                required
                value={formData.patientId}
                onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Sélectionner un patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Médicament */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Médicament *
              </label>
              <input
                type="text"
                required
                value={formData.medication}
                onChange={(e) => setFormData(prev => ({ ...prev, medication: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Nom du médicament"
              />
            </div>

            {/* Posologie et Fréquence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posologie *
                </label>
                <input
                  type="text"
                  required
                  value={formData.dosage}
                  onChange={(e) => setFormData(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                  placeholder="Ex: 1 comprimé, 500mg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fréquence *
                </label>
                <select
                  required
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="">Sélectionner</option>
                  <option value="1 fois par jour">1 fois par jour</option>
                  <option value="2 fois par jour">2 fois par jour</option>
                  <option value="3 fois par jour">3 fois par jour</option>
                  <option value="4 fois par jour">4 fois par jour</option>
                  <option value="Au coucher">Au coucher</option>
                  <option value="Au besoin">Au besoin</option>
                  <option value="Toutes les 4 heures">Toutes les 4 heures</option>
                  <option value="Toutes les 6 heures">Toutes les 6 heures</option>
                  <option value="Toutes les 8 heures">Toutes les 8 heures</option>
                  <option value="Toutes les 12 heures">Toutes les 12 heures</option>
                </select>
              </div>
            </div>

            {/* Durée */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durée du traitement *
              </label>
              <select
                required
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="">Sélectionner</option>
                <option value="5 jours">5 jours</option>
                <option value="7 jours">7 jours</option>
                <option value="10 jours">10 jours</option>
                <option value="14 jours">14 jours</option>
                <option value="21 jours">21 jours</option>
                <option value="1 mois">1 mois</option>
                <option value="2 mois">2 mois</option>
                <option value="3 mois">3 mois</option>
                <option value="6 mois">6 mois</option>
                <option value="1 an">1 an</option>
                <option value="Traitement continu">Traitement continu</option>
              </select>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions particulières
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white"
                placeholder="Instructions, précautions, modalités de prise..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Création...' : 'Créer la prescription'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}