'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../components/UI/LoadingSpinner'

interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  prescribedAt: string
  doctor: {
    name: string
    specialty: string
  }
}

export default function PrescriptionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    loadPrescriptions()
  }, [session, status, router])

  const loadPrescriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/prescriptions')
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data.prescriptions)
      }
    } catch (error) {
      console.error('Erreur chargement ordonnances:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setShowDetailsModal(true)
  }

  const handlePrintPrescription = (prescription: Prescription) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Ordonnance - ${prescription.medication}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 30px; line-height: 1.6; }
              .header { border-bottom: 3px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              .label { font-weight: bold; color: #333; }
              .medication { font-size: 1.4em; font-weight: bold; margin-bottom: 10px; }
              .doctor-info { text-align: right; }
              .footer { margin-top: 50px; border-top: 1px solid #ccc; padding-top: 20px; font-size: 0.9em; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ORDONNANCE MÉDICALE</h1>
              <div class="doctor-info">
                <p><strong>Dr. ${prescription.doctor.name}</strong></p>
                <p>${prescription.doctor.specialty}</p>
                <p>Date: ${new Date(prescription.prescribedAt).toLocaleDateString('fr-FR')}</p>
              </div>
            </div>
            
            <div class="section">
              <div class="medication">${prescription.medication}</div>
              <p><span class="label">Dosage:</span> ${prescription.dosage}</p>
              <p><span class="label">Fréquence:</span> ${prescription.frequency}</p>
              <p><span class="label">Durée:</span> ${prescription.duration}</p>
              ${prescription.instructions ? `<p><span class="label">Instructions:</span> ${prescription.instructions}</p>` : ''}
            </div>
            
            <div class="footer">
              <p>Document généré le ${new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const getMedicationColor = (medication: string) => {
    const colors = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-blue-500',
      'from-teal-500 to-green-500',
    ]
    const index = medication.length % colors.length
    return colors[index]
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de vos ordonnances..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      {showDetailsModal && selectedPrescription && (
        <PrescriptionDetailsModal
          prescription={selectedPrescription}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedPrescription(null)
          }}
          onPrint={handlePrintPrescription}
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 border border-gray-100/50 backdrop-blur-sm">
          <div className="text-center lg:text-left mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text mb-3">
              Mes Ordonnances
            </h1>
            <p className="text-gray-700 text-lg sm:text-xl font-medium max-w-2xl">
              Consultez et gérez toutes vos prescriptions médicales en toute sécurité
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <div className="bg-linear-to-br from-cyan-500 to-blue-500 text-white p-4 sm:p-6 rounded-2xl text-center shadow-lg">
              <div className="text-2xl sm:text-3xl font-bold">{prescriptions.length}</div>
              <div className="text-sm sm:text-base opacity-90">Ordonnances totales</div>
            </div>
            <div className="bg-linear-to-br from-purple-500 to-pink-500 text-white p-4 sm:p-6 rounded-2xl text-center shadow-lg">
              <div className="text-2xl sm:text-3xl font-bold">
                {new Set(prescriptions.map(p => p.doctor.name)).size}
              </div>
              <div className="text-sm sm:text-base opacity-90">Médecins différents</div>
            </div>
            <div className="bg-linear-to-br from-green-500 to-emerald-500 text-white p-4 sm:p-6 rounded-2xl text-center shadow-lg">
              <div className="text-2xl sm:text-3xl font-bold">
                {new Set(prescriptions.map(p => p.medication)).size}
              </div>
              <div className="text-sm sm:text-base opacity-90">Médicaments différents</div>
            </div>
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-linear-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
              <div className="text-gray-400 text-6xl sm:text-7xl mb-4">💊</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Aucune ordonnance trouvée</h3>
              <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto">
                Vous n'avez pas encore d'ordonnance médicale enregistrée dans votre dossier.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-200/50 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className={`w-12 h-12 bg-linear-to-br ${getMedicationColor(prescription.medication)} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-white text-lg font-bold">💊</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg sm:text-xl truncate leading-tight">
                          {prescription.medication}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium mt-1">
                          Dr. {prescription.doctor.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-semibold">Spécialité:</span>
                      <span className="text-gray-900 font-bold text-right">
                        {prescription.doctor.specialty}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-600 font-semibold">Prescrit le:</span>
                      <span className="text-gray-900 font-bold">
                        {new Date(prescription.prescribedAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="bg-linear-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-600 font-semibold mb-1">DOSAGE</p>
                      <p className="text-sm text-gray-900 font-bold">{prescription.dosage}</p>
                    </div>
                    <div className="bg-linear-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100">
                      <p className="text-xs text-purple-600 font-semibold mb-1">FRÉQUENCE</p>
                      <p className="text-sm text-gray-900 font-bold">{prescription.frequency}</p>
                    </div>
                    <div className="bg-linear-to-br from-green-50 to-emerald-50 p-3 rounded-xl border border-green-100">
                      <p className="text-xs text-green-600 font-semibold mb-1">DURÉE</p>
                      <p className="text-sm text-gray-900 font-bold">{prescription.duration}</p>
                    </div>
                    <div className="bg-linear-to-br from-orange-50 to-amber-50 p-3 rounded-xl border border-orange-100">
                      <p className="text-xs text-orange-600 font-semibold mb-1">STATUT</p>
                      <p className="text-sm text-gray-900 font-bold">Active</p>
                    </div>
                  </div>

                  {/* Instructions */}
                  {prescription.instructions && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-xs text-amber-600 font-semibold mb-2">INSTRUCTIONS IMPORTANTES</p>
                      <p className="text-sm text-gray-900 font-medium">{prescription.instructions}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleViewDetails(prescription)}
                      className="flex-1 bg-linear-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                    >
                      Voir Détails
                    </button>
                    <button
                      onClick={() => handlePrintPrescription(prescription)}
                      className="flex-1 bg-linear-to-r from-purple-500 to-indigo-500 text-white py-3 px-4 rounded-xl font-bold hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                    >
                      Imprimer
                    </button>
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

function PrescriptionDetailsModal({ prescription, onClose, onPrint }: { 
  prescription: Prescription;
  onClose: () => void;
  onPrint: (prescription: Prescription) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50">
        <div className="sticky top-0 bg-linear-to-r from-cyan-500 to-blue-500 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold wrap-break-word pr-4">
                {prescription.medication}
              </h2>
              <p className="text-cyan-100 mt-2 text-lg font-medium">
                Ordonnance médicale
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-cyan-100 text-3xl transition-colors duration-200 shrink-0 bg-black/20 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-5 border border-blue-200">
            <h3 className="font-bold text-gray-900 text-lg mb-3">Informations du médecin</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Médecin prescripteur</p>
                <p className="font-bold text-black text-lg">Dr. {prescription.doctor.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Spécialité</p>
                <p className="font-bold text-black text-lg">{prescription.doctor.specialty}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-semibold mb-1">Date de prescription</p>
                <p className="font-bold text-black text-lg">
                  {new Date(prescription.prescribedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          {/* Prescription Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 font-semibold mb-2">Dosage</p>
              <p className="font-bold text-black text-lg">{prescription.dosage}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 font-semibold mb-2">Fréquence</p>
              <p className="font-bold text-black text-lg">{prescription.frequency}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 font-semibold mb-2">Durée du traitement</p>
              <p className="font-bold text-black text-lg">{prescription.duration}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 font-semibold mb-2">Statut</p>
              <p className="font-bold text-black text-lg">Ordonnance active</p>
            </div>
          </div>

          {/* Instructions */}
          {prescription.instructions && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <h3 className="font-bold text-amber-800 text-lg mb-3">📋 Instructions particulières</h3>
              <p className="text-black whitespace-pre-wrap text-base leading-relaxed font-medium">
                {prescription.instructions}
              </p>
            </div>
          )}

          {/* Important Notice */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
            <h3 className="font-bold text-red-800 text-lg mb-2">⚠️ Important</h3>
            <p className="text-red-700 text-sm">
              Cette ordonnance est valable uniquement sous la responsabilité du médecin prescripteur. 
              Respectez scrupuleusement les dosages et la durée du traitement.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => onPrint(prescription)}
              className="flex-1 bg-linear-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-bold hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
            >
              🖨️ Imprimer l'Ordonnance
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}