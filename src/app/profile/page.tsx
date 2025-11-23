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
const CHANGE_PASSWORD_API = '/api/auth/change-password'

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
  ),
  Lock: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Eye: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  EyeOff: (props: { className?: string }) => (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  )
}

const ChangePasswordModal = ({ 
  isOpen, 
  onClose, 
  onChangePassword 
}: { 
  isOpen: boolean
  onClose: () => void
  onChangePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) => Promise<void>
}) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await onChangePassword(formData)
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      onClose()
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="bg-linear-to-r from-cyan-500 to-blue-600 px-6 py-4 rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Changer le mot de passe</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showCurrentPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNewPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 bg-gray-50 focus:bg-white text-gray-900 pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <Icons.EyeOff className="w-5 h-5" /> : <Icons.Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-cyan-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Changement...</span>
                </>
              ) : (
                <>
                  <Icons.Lock className="w-5 h-5" />
                  <span>Changer</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
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
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false)

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

  const calculateCompletion = (profile: UserProfile | null): number => {
    if (!profile) return 0

    const requiredFields = {
      name: profile.name?.trim() !== '',
      email: profile.email?.trim() !== '',
      phone: profile.phone?.trim() !== '',
      address: profile.address?.trim() !== '',
    }

    const doctorFields = {
      specialty: profile.specialty?.trim() !== '',
    }

    const patientFields = {
      birthDate: profile.birthDate?.trim() !== '',
      emergencyContact: profile.emergencyContact?.trim() !== '',
    }

    let totalFields = Object.keys(requiredFields).length
    let completedFields = Object.values(requiredFields).filter(Boolean).length

    if (isDoctor) {
      totalFields += Object.keys(doctorFields).length
      completedFields += Object.values(doctorFields).filter(Boolean).length
    } else if (isPatient) {
      totalFields += Object.keys(patientFields).length
      completedFields += Object.values(patientFields).filter(Boolean).length
    }

    return Math.round((completedFields / totalFields) * 100)
  }

  const completionPercentage = calculateCompletion(profile)

  const handleSave = async () => {
    try {
      setSaving(true)
      
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


      const response = await fetch(PROFILE_API, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      })

      const result = await response.json()

      if (response.ok) {        
        if (result.profile) {
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

  const handleChangePassword = async (passwordData: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    const response = await fetch(CHANGE_PASSWORD_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(passwordData)
    })

    const result = await response.json()

    if (response.ok) {
      alert(result.message || 'Mot de passe modifié avec succès!')
      return
    } else {
      throw new Error(result.error || 'Erreur lors du changement de mot de passe')
    }
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
    <>
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
                    
                    <div className="space-y-6">
                      {renderField('Nom complet', 'name', Icons.User)}
                      {renderField('Email', 'email', Icons.Email, 'email')}
                      {renderField('Téléphone', 'phone', Icons.Phone, 'tel', '+33 1 23 45 67 89')}
                      
                      {isDoctor && renderSpecialtyField()}
                    </div>

                    <div className="space-y-6">
                      {isPatient ? (
                        <>
                          {renderField('Date de naissance', 'birthDate', Icons.Calendar, 'date')}
                          {renderField('Contact d\'urgence', 'emergencyContact', Icons.Emergency, 'text', 'Nom et téléphone')}
                          {renderField('Adresse', 'address', Icons.Location, 'textarea', 'Votre adresse complète')}
                        </>
                      ) : (
                        <>
                          {renderField('Adresse du cabinet', 'address', Icons.Location, 'textarea', 'Adresse de votre cabinet médical')}
                        </>
                      )}
                    </div>
                    
                  </div>
                </div>
              </div>
            </div>

            <ProfileSidebar 
              isDoctor={isDoctor}
              completionPercentage={completionPercentage}
              onChangePassword={() => setChangePasswordModalOpen(true)}
            />

          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={changePasswordModalOpen}
        onClose={() => setChangePasswordModalOpen(false)}
        onChangePassword={handleChangePassword}
      />
    </>
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

const ProfileSidebar = ({ 
  isDoctor, 
  completionPercentage, 
  onChangePassword 
}: { 
  isDoctor: boolean
  completionPercentage: number
  onChangePassword: () => void
}) => (
  <div className="space-y-6">
    <ProfileCompletionCard 
      isDoctor={isDoctor} 
      completionPercentage={completionPercentage} 
    />
    <SecurityCard onChangePassword={onChangePassword} />
  </div>
)

const ProfileCompletionCard = ({ 
  isDoctor, 
  completionPercentage 
}: { 
  isDoctor: boolean
  completionPercentage: number
}) => {
  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-cyan-600'
    if (percentage >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompletionMessage = (percentage: number, isDoctor: boolean) => {
    if (percentage >= 90) return 'Profil excellent !'
    if (percentage >= 70) return 'Profil bien complété'
    if (percentage >= 50) return 'Profil moyennement complété'
    if (percentage >= 30) return 'Profil à compléter'
    return 'Profil très incomplet'
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statut du profil</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Complétion</span>
          <span className={`font-semibold ${getCompletionColor(completionPercentage)}`}>
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${completionPercentage}%`,
              backgroundColor: completionPercentage >= 80 ? '#059669' : 
                             completionPercentage >= 60 ? '#0891b2' : 
                             completionPercentage >= 40 ? '#d97706' : '#dc2626'
            }}
          ></div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {getCompletionMessage(completionPercentage, isDoctor)}
        </p>
        {completionPercentage < 100 && (
          <p className="text-xs text-gray-400">
            Complétez les informations manquantes pour améliorer votre expérience
          </p>
        )}
      </div>
    </div>
  )
}

const SecurityCard = ({ onChangePassword }: { onChangePassword: () => void }) => (
  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sécurité</h3>
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <Icons.Lock className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">Compte sécurisé</p>
          <p className="text-sm text-gray-500">Authentification active</p>
        </div>
      </div>
      
      <button 
        onClick={onChangePassword}
        className="w-full bg-gray-50 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
      >
        <Icons.Lock className="w-4 h-4" />
        <span>Changer le mot de passe</span>
      </button>
    </div>
  </div>
)