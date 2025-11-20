'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../components/UI/LoadingSpinner'

interface Doctor {
  id: string
  name: string
  specialty: string
  email: string
  phone?: string
  experience?: number
  rating?: number
}

export default function DoctorsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    loadDoctors()
  }, [session, status, router])

  useEffect(() => {
    filterDoctors()
  }, [searchTerm, specialtyFilter, doctors])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/doctors')
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      }
    } catch (error) {
      console.error('Erreur chargement médecins:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = doctors

    if (searchTerm) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (specialtyFilter) {
      filtered = filtered.filter(doctor =>
        doctor.specialty === specialtyFilter
      )
    }

    setFilteredDoctors(filtered)
  }

  const specialties = Array.from(new Set(doctors.map(d => d.specialty)))

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des médecins..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Trouver un médecin</h1>
            <p className="text-gray-600">Recherchez un professionnel de santé selon vos besoins</p>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher
              </label>
              <input
                type="text"
                placeholder="Nom du médecin ou spécialité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Spécialité
              </label>
              <select
                value={specialtyFilter}
                onChange={(e) => setSpecialtyFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="">Toutes les spécialités</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Liste des médecins */}
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun médecin trouvé</h3>
              <p className="text-gray-600">Aucun médecin ne correspond à vos critères de recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:border-cyan-300"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center text-white font-semibold text-lg">
                      {doctor.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{doctor.name}</h3>
                      <p className="text-cyan-600 font-medium">{doctor.specialty}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <span>📧</span>
                      <span>{doctor.email}</span>
                    </div>
                    {doctor.phone && (
                      <div className="flex items-center space-x-2">
                        <span>📞</span>
                        <span>{doctor.phone}</span>
                      </div>
                    )}
                    {doctor.experience && (
                      <div className="flex items-center space-x-2">
                        <span>⏳</span>
                        <span>{doctor.experience} ans d'expérience</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => router.push(`/dashboard?action=appointment&doctorId=${doctor.id}`)}
                    className="w-full bg-cyan-500 text-white py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
                  >
                    Prendre rendez-vous
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}