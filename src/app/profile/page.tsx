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
  specialty?: string
}

const PROFILE_API = '/api/profile'

const MEDICAL_SPECIALTIES = [
  'Médecine générale',
  'Cardiologie',
  'Dermatologie',
  'Pédiatrie',
  'Gynécologie',
  'Psychiatrie',
  'Neurologie',
  'Radiologie',
  'Chirurgie',
  'Ophtalmologie',
  'ORL',
  'Urologie',
  'Rhumatologie',
  'Endocrinologie',
  'Gastro-entérologie',
  'Pneumologie',
  'Néphrologie',
  'Hématologie',
  'Oncologie',
  'Médecine interne',
  'Médecine du travail',
  'Médecine d\'urgence',
  'Anesthésiologie',
  'Médecine physique et réadaptation',
  'Médecine légale',
  'Allergologie',
  'Infectiologie',
  'Médecine nucléaire',
  'Anatomie pathologique',
  'Biologie médicale'
]

const Icons = {
  User: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Email: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Phone: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Calendar: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Emergency: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Location: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Medical: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  ChevronDown: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Edit: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Cancel: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Save: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
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
    emergencyContact: '',
    specialty: ''
  })
  const [saving, setSaving] = useState(false)

  const isDoctor = session?.user?.role === 'DOCTOR'
  const isPatient = session?.user?.role === 'PATIENT'

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
      const response = await fetch(PROFILE_API)
      
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
        setFormData(data.profile)
      } else {
        console.error('Erreur lors du chargement du profil')
      }
    } catch (error) {
      console.error('Erreur chargement profil:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('💾 Sauvegarde des données:', formData)
      
      const dataToSend = isDoctor 
        ? {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            specialty: formData.specialty,
            birthDate: '',
            emergencyContact: ''
          }
        : formData

      console.log('📤 Données envoyées (adaptées au rôle):', dataToSend)

      const response = await fetch(PROFILE_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const result = await response.json()
      console.log('📨 Réponse API complète:', result)

      if (response.ok) {
        console.log('✅ Sauvegarde réussie')
        
        if (result.profile) {
          console.log('📊 Utilisation des données API:', result.profile)
          setProfile(result.profile)
          setFormData(result.profile)
        } else {
          await loadProfile()
        }
        
        setEditing(false)
        alert('Profil mis à jour avec succès!')
      } else {
        console.error('❌ Erreur API:', result.error)
        alert(result.error || 'Erreur lors de la mise à jour')
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde profil:', error)
      alert('Erreur de connexion lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData(profile!)
    setEditing(false)
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSpecialtyChange = (specialty: string) => {
    setFormData(prev => ({ ...prev, specialty }))
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || ''
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const renderField = (
    label: string,
    field: keyof UserProfile,
    IconComponent: React.ComponentType<{ className?: string }>,
    type: string = 'text',
    placeholder: string = '',
    disabled: boolean = false
  ) => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-3 items-center">
        <IconComponent className="w-4 h-4 mr-2 text-cyan-500" />
        {label}
      </label>
      
      {editing ? (
        type === 'textarea' ? (
          <textarea
            value={formData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            rows={3}
            className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 resize-none ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder={placeholder}
            disabled={disabled}
          />
        ) : (
          <input
            type={type}
            value={formData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className={`w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 ${
              disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            placeholder={placeholder}
            disabled={disabled}
          />
        )
      ) : (
        <p className="text-gray-900 font-medium text-lg bg-gray-50 px-4 py-3.5 rounded-xl border-2 border-transparent group-hover:border-cyan-100 transition-colors min-h-[60px] flex items-center">
          {field === 'birthDate' && profile?.birthDate ? (
            formatDate(profile.birthDate)
          ) : profile?.[field] || (
            <span className="text-gray-500 italic">
              {field === 'birthDate' ? 'Non renseignée' : 'Non renseigné'}
            </span>
          )}
        </p>
      )}
    </div>
  )

  const renderSpecialtyField = () => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-3 items-center">
        <Icons.Medical className="w-4 h-4 mr-2 text-cyan-500" />
        Spécialité
      </label>
      
      {editing ? (
        <div className="relative">
          <select
            value={formData.specialty || ''}
            onChange={(e) => handleSpecialtyChange(e.target.value)}
            className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 appearance-none cursor-pointer"
          >
            <option value="">Sélectionnez une spécialité</option>
            {MEDICAL_SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
            <Icons.ChevronDown className="w-4 h-4" />
          </div>
        </div>
      ) : (
        <p className="text-gray-900 font-medium text-lg bg-gray-50 px-4 py-3.5 rounded-xl border-2 border-transparent group-hover:border-cyan-100 transition-colors min-h-[60px] flex items-center">
          {profile?.specialty || <span className="text-gray-500 italic">Non renseignée</span>}
        </p>
      )}
    </div>
  )

  const renderActionButtons = () => (
    !editing ? (
      <button
        onClick={() => setEditing(true)}
        className="mt-4 sm:mt-0 bg-white text-cyan-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2"
      >
        <Icons.Edit className="w-5 h-5" />
        <span>Modifier le profil</span>
      </button>
    ) : (
      <div className="flex space-x-3 mt-4 sm:mt-0">
        <button
          onClick={handleCancel}
          disabled={saving}
          className="px-6 py-2.5 border-2 border-white text-white rounded-xl font-semibold hover:bg-white hover:bg-opacity-10 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
        >
          <Icons.Cancel className="w-5 h-5" />
          <span>Annuler</span>
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-white text-cyan-600 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
              <span>Sauvegarde...</span>
            </>
          ) : (
            <>
              <Icons.Save className="w-5 h-5" />
              <span>Sauvegarder</span>
            </>
          )}
        </button>
      </div>
    )
  )

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de votre profil..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-100 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        <ProfileHeader 
          profile={profile} 
          editing={editing} 
          getInitials={getInitials}
          isDoctor={isDoctor}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              
              <div className="bg-linear-to-r from-cyan-500 to-blue-600 px-8 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {isDoctor ? 'Informations Professionnelles' : 'Informations Personnelles'}
                    </h2>
                    <p className="text-cyan-100 mt-1">
                      {isDoctor ? 'Vos informations professionnelles' : 'Vos données personnelles et de contact'}
                    </p>
                  </div>
                  {renderActionButtons()}
                </div>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Colonne gauche - Champs communs */}
                  <div className="space-y-6">
                    {renderField('Nom complet', 'name', Icons.User)}
                    {renderField('Email', 'email', Icons.Email, 'email')}
                    {renderField('Téléphone', 'phone', Icons.Phone, 'tel', '+33 1 23 45 67 89')}
                    
                    {/* Spécialité - Dropdown pour les docteurs */}
                    {isDoctor && renderSpecialtyField()}
                  </div>

                  {/* Colonne droite - Champs spécifiques */}
                  <div className="space-y-6">
                    {isPatient ? (
                      // Champs pour les patients
                      <>
                        {renderField('Date de naissance', 'birthDate', Icons.Calendar, 'date')}
                        {renderField('Contact d\'urgence', 'emergencyContact', Icons.Emergency, 'text', 'Nom et téléphone')}
                        {renderField('Adresse', 'address', Icons.Location, 'textarea', 'Votre adresse complète')}
                      </>
                    ) : (
                      // Champs pour les docteurs
                      <>
                        {renderField('Adresse du cabinet', 'address', Icons.Location, 'textarea', 'Adresse de votre cabinet médical')}
                      </>
                    )}
                  </div>
                  
                </div>
              </div>
            </div>
          </div>

          <ProfileSidebar isDoctor={isDoctor} />

        </div>
      </div>
    </div>
  )
}

const ProfileHeader = ({ 
  profile, 
  editing, 
  getInitials,
  isDoctor 
}: { 
  profile: UserProfile | null
  editing: boolean
  getInitials: (name: string) => string
  isDoctor: boolean
}) => (
  <div className="text-center mb-8">
    <div className="relative inline-block">
      <div className="w-24 h-24 bg-linear-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg mx-auto mb-4">
        {getInitials(profile?.name || '')}
      </div>
      {editing && (
        <button className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-md border border-gray-200 hover:scale-110 transition-transform">
          <Icons.Edit className="w-4 h-4 text-gray-600" />
        </button>
      )}
    </div>
    <h1 className="text-4xl font-bold text-gray-900 mb-2">
      {isDoctor ? 'Mon Profil Médecin' : 'Mon Profil Patient'}
    </h1>
    <p className="text-gray-600 text-lg max-w-md mx-auto">
      {isDoctor 
        ? 'Gérez vos informations professionnelles' 
        : 'Gérez vos informations personnelles et médicales en toute sécurité'
      }
    </p>
  </div>
)

const ProfileSidebar = ({ isDoctor }: { isDoctor: boolean }) => (
  <div className="space-y-6">
    <ProfileCompletionCard isDoctor={isDoctor} />
    <SecurityCard />
    <HelpCard />
  </div>
)

const ProfileCompletionCard = ({ isDoctor }: { isDoctor: boolean }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut du profil</h3>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-gray-600">Complétion</span>
        <span className="font-semibold text-cyan-600">
          {isDoctor ? '85%' : '75%'}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-cyan-500 h-2 rounded-full" 
          style={{ width: isDoctor ? '85%' : '75%' }}
        ></div>
      </div>
      <p className="text-sm text-gray-500 mt-2">
        {isDoctor 
          ? 'Votre profil médecin est presque complet' 
          : 'Complétez vos informations pour améliorer votre expérience'
        }
      </p>
    </div>
  </div>
)

const SecurityCard = () => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h3>
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <div>
          <p className="font-medium text-gray-900">Données sécurisées</p>
          <p className="text-sm text-gray-500">Chiffrement SSL activé</p>
        </div>
      </div>
      
      <button className="w-full bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
        </svg>
        <span>Changer le mot de passe</span>
      </button>
    </div>
  </div>
)

const HelpCard = () => (
  <div className="bg-linear-to-r from-cyan-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white">
    <h3 className="text-lg font-semibold mb-2">Besoin d'aide ?</h3>
    <p className="text-cyan-100 text-sm mb-4">
      Notre équipe est là pour vous accompagner
    </p>
    <button className="w-full bg-white text-cyan-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
      Contacter le support
    </button>
  </div>
)