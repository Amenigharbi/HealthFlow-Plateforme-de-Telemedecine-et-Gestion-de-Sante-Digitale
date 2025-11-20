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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de vos ordonnances..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes ordonnances</h1>
            <p className="text-gray-600">Consultez vos prescriptions médicales</p>
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">💊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune ordonnance</h3>
              <p className="text-gray-600">Vous n'avez pas encore d'ordonnance enregistrée.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {prescription.medication}
                      </h3>
                      <p className="text-gray-600">Par le Dr. {prescription.doctor.name} - {prescription.doctor.specialty}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(prescription.prescribedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Dosage</p>
                      <p className="font-medium text-gray-900">{prescription.dosage}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fréquence</p>
                      <p className="font-medium text-gray-900">{prescription.frequency}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Durée</p>
                      <p className="font-medium text-gray-900">{prescription.duration}</p>
                    </div>
                  </div>

                  {prescription.instructions && (
                    <div className="mt-4">
                      <p className="text-gray-500 text-sm mb-1">Instructions</p>
                      <p className="text-gray-900">{prescription.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}