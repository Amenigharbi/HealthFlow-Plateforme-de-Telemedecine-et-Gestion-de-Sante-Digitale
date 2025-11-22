'use client'
import { useState } from 'react'

interface Patient {
  id: string
  name: string
}

interface ReportFormData {
  patientId: string
  title: string
  recordType: string
  content: string
  diagnosis?: string
  treatment?: string
  prescriptions?: string[]
  recommendations?: string
  severity: string
  followUpDate?: string
}

interface ReportEditorProps {
  patients: Patient[]
  onSave: (data: ReportFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<ReportFormData>
}

export default function ReportEditor({ patients, onSave, onCancel, initialData }: ReportEditorProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    patientId: initialData?.patientId || '',
    title: initialData?.title || '',
    recordType: initialData?.recordType || 'NOTE',
    content: initialData?.content || '',
    diagnosis: initialData?.diagnosis || '',
    treatment: initialData?.treatment || '',
    prescriptions: initialData?.prescriptions || [],
    recommendations: initialData?.recommendations || '',
    severity: initialData?.severity || 'LOW',
    followUpDate: initialData?.followUpDate || ''
  })

  const [newPrescription, setNewPrescription] = useState('')
  const [saving, setSaving] = useState(false)

  const addPrescription = () => {
    if (newPrescription.trim() && !formData.prescriptions?.includes(newPrescription.trim())) {
      setFormData(prev => ({
        ...prev,
        prescriptions: [...(prev.prescriptions || []), newPrescription.trim()]
      }))
      setNewPrescription('')
    }
  }

  const removePrescription = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave(formData)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient et Titre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Patient *
          </label>
          <select
            required
            value={formData.patientId}
            onChange={(e) => setFormData(prev => ({ ...prev, patientId: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="">Sélectionner un patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre du rapport *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Ex: Consultation de suivi"
          />
        </div>
      </div>

      {/* Type et Sévérité */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de rapport *
          </label>
          <select
            required
            value={formData.recordType}
            onChange={(e) => setFormData(prev => ({ ...prev, recordType: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="NOTE">Note médicale</option>
            <option value="CONDITION">Diagnostic</option>
            <option value="PROCEDURE">Procédure</option>
            <option value="LAB_RESULT">Résultat d'analyse</option>
            <option value="IMAGING">Compte-rendu d'imagerie</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Niveau de sévérité *
          </label>
          <select
            required
            value={formData.severity}
            onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          >
            <option value="LOW">Normal</option>
            <option value="MEDIUM">Important</option>
            <option value="HIGH">Urgent</option>
            <option value="CRITICAL">Critique</option>
          </select>
        </div>
      </div>

      {/* Contenu principal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Observations et examen clinique *
        </label>
        <textarea
          required
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Décrivez les symptômes, l'examen clinique, les observations..."
        />
      </div>

      {/* Diagnostic */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Diagnostic
        </label>
        <input
          type="text"
          value={formData.diagnosis}
          onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Diagnostic principal"
        />
      </div>

      {/* Traitement */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Traitement prescrit
        </label>
        <textarea
          value={formData.treatment}
          onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Traitement, posologie, durée..."
        />
      </div>

      {/* Prescriptions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Médicaments prescrits
        </label>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newPrescription}
              onChange={(e) => setNewPrescription(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPrescription())}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Ajouter un médicament"
            />
            <button
              type="button"
              onClick={addPrescription}
              className="bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-colors"
            >
              Ajouter
            </button>
          </div>
          <div className="space-y-2">
            {formData.prescriptions?.map((prescription, index) => (
              <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-xl">
                <span className="text-blue-800">{prescription}</span>
                <button
                  type="button"
                  onClick={() => removePrescription(index)}
                  className="text-blue-500 hover:text-blue-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommandations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Recommandations
        </label>
        <textarea
          value={formData.recommendations}
          onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Conseils, suivi recommandé, mode de vie..."
        />
      </div>

      {/* Date de suivi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date de suivi recommandée
        </label>
        <input
          type="date"
          value={formData.followUpDate}
          onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
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
          className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors disabled:opacity-50"
        >
          {saving ? 'Sauvegarde...' : 'Enregistrer le rapport'}
        </button>
      </div>
    </form>
  )
}