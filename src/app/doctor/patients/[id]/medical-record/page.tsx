'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import LoadingSpinner from '../../../../components/UI/LoadingSpinner'

interface MedicalRecordForm {
  bloodType?: string
  height?: number
  weight?: number
  allergies: string[]
  medications: string[]
  conditions: string[]
  emergencyContact?: string
}

interface PatientInfo {
  id: string
  name: string
  email: string
  phone?: string
  birthDate?: string
  gender?: string
}

export default function MedicalRecordPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [patient, setPatient] = useState<PatientInfo | null>(null)
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecordForm>({
    allergies: [],
    medications: [],
    conditions: []
  })
  
  const [newAllergy, setNewAllergy] = useState('')
  const [newMedication, setNewMedication] = useState('')
  const [newCondition, setNewCondition] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'DOCTOR') {
      router.push('/dashboard')
      return
    }
    loadPatientData()
  }, [session, status, router, params.id])

  const loadPatientData = async () => {
    try {
      const response = await fetch(`/api/doctor/patients/${params.id}/medical-record`)
      if (response.ok) {
        const data = await response.json()
        setPatient(data.patient)
        setMedicalRecord(data.medicalRecord || {
          allergies: [],
          medications: [],
          conditions: []
        })
      }
    } catch (error) {
      console.error('Erreur chargement données:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch(`/api/doctor/patients/${params.id}/medical-record`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(medicalRecord)
      })

      if (response.ok) {
        router.push(`/doctor/patients/${params.id}?message=Fiche médicale mise à jour`)
      } else {
        alert('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const addAllergy = () => {
    if (newAllergy.trim() && !medicalRecord.allergies.includes(newAllergy.trim())) {
      setMedicalRecord(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }))
      setNewAllergy('')
    }
  }

  const removeAllergy = (index: number) => {
    setMedicalRecord(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }))
  }

  const addMedication = () => {
    if (newMedication.trim() && !medicalRecord.medications.includes(newMedication.trim())) {
      setMedicalRecord(prev => ({
        ...prev,
        medications: [...prev.medications, newMedication.trim()]
      }))
      setNewMedication('')
    }
  }

  const removeMedication = (index: number) => {
    setMedicalRecord(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }))
  }

  const addCondition = () => {
    if (newCondition.trim() && !medicalRecord.conditions.includes(newCondition.trim())) {
      setMedicalRecord(prev => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()]
      }))
      setNewCondition('')
    }
  }

  const removeCondition = (index: number) => {
    setMedicalRecord(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de la fiche médicale..." />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Patient non trouvé</h1>
          <button
            onClick={() => router.push('/doctor/patients')}
            className="bg-cyan-500 text-white px-6 py-2 rounded-xl hover:bg-cyan-600"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        {/* En-tête */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Fiche médicale - {patient.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Modifier les informations médicales du patient
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/doctor/patients/${params.id}`)}
                className="bg-gray-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {saving ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>

        {/* Formulaire de fiche médicale */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Colonne gauche - Informations de base */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations vitales</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Groupe sanguin
                    </label>
                    <select
                      value={medicalRecord.bloodType || ''}
                      onChange={(e) => setMedicalRecord(prev => ({ ...prev, bloodType: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taille (cm)
                    </label>
                    <input
                      type="number"
                      value={medicalRecord.height || ''}
                      onChange={(e) => setMedicalRecord(prev => ({ ...prev, height: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="175"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={medicalRecord.weight || ''}
                      onChange={(e) => setMedicalRecord(prev => ({ ...prev, weight: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="70.5"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact d'urgence
                    </label>
                    <input
                      type="text"
                      value={medicalRecord.emergencyContact || ''}
                      onChange={(e) => setMedicalRecord(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Nom et téléphone"
                    />
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Allergies</h2>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ajouter une allergie"
                    />
                    <button
                      onClick={addAllergy}
                      className="bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {medicalRecord.allergies.map((allergy, index) => (
                      <div key={index} className="flex items-center justify-between bg-red-50 p-3 rounded-xl">
                        <span className="text-red-800">{allergy}</span>
                        <button
                          onClick={() => removeAllergy(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite - Antécédents et traitements */}
            <div className="space-y-6">
              {/* Antécédents médicaux */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Antécédents médicaux</h2>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newCondition}
                      onChange={(e) => setNewCondition(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ajouter un antécédent"
                    />
                    <button
                      onClick={addCondition}
                      className="bg-orange-500 text-white px-4 py-3 rounded-xl hover:bg-orange-600 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {medicalRecord.conditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between bg-orange-50 p-3 rounded-xl">
                        <span className="text-orange-800">{condition}</span>
                        <button
                          onClick={() => removeCondition(index)}
                          className="text-orange-500 hover:text-orange-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Traitements en cours */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Traitements en cours</h2>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMedication}
                      onChange={(e) => setNewMedication(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ajouter un traitement"
                    />
                    <button
                      onClick={addMedication}
                      className="bg-blue-500 text-white px-4 py-3 rounded-xl hover:bg-blue-600 transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {medicalRecord.medications.map((medication, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-xl">
                        <span className="text-blue-800">{medication}</span>
                        <button
                          onClick={() => removeMedication(index)}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}