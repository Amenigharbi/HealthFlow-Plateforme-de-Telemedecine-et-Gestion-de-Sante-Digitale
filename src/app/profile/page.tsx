'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../components/UI/LoadingSpinner'

interface UserProfile {
  name: string
  email: string
  phone?: string
  birthDate?: string
  address?: string
  emergencyContact?: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    address: '',
    emergencyContact: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    loadProfile()
  }, [session, status, router])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setFormData(data.profile)
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setProfile(formData)
        setEditing(false)
      } else {
        alert('Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('Erreur sauvegarde profil:', error)
      alert('Erreur lors de la sauvegarde')
    }
  }

  const handleCancel = () => {
    setFormData(profile!)
    setEditing(false)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de votre profil..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mon profil</h1>
                <p className="text-gray-600 mt-2">Gérez vos informations personnelles</p>
              </div>
              
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
                >
                  Modifier le profil
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
                  >
                    Sauvegarder
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Informations personnelles */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  {editing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.phone || 'Non renseigné'}</p>
                  )}
                </div>
              </div>

              {/* Informations supplémentaires */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Informations médicales</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de naissance
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      value={formData.birthDate || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {profile?.birthDate ? new Date(profile.birthDate).toLocaleDateString('fr-FR') : 'Non renseignée'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact d'urgence
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.emergencyContact || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
                      placeholder="Nom et téléphone"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.emergencyContact || 'Non renseigné'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  {editing ? (
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 resize-none"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{profile?.address || 'Non renseignée'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}