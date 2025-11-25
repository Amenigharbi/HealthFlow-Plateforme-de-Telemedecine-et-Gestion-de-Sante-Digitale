'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import AppointmentBooking from '../components/Appointment/AppointmentBooking'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showAppointmentBooking, setShowAppointmentBooking] = useState(false)
  const [appointmentStats, setAppointmentStats] = useState({
    total: 0,
    today: 0,
    upcoming: 0
  })
  const [doctorCount, setDoctorCount] = useState(0)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!session?.user?.id) return
      
      try {
        const statsResponse = await fetch('/api/appointments/stats')
        if (statsResponse.ok) {
          const stats = await statsResponse.json()
          setAppointmentStats(stats)
        }

        if (session.user?.role === 'PATIENT') {
          const doctorsResponse = await fetch('/api/doctors/count')
          if (doctorsResponse.ok) {
            const data = await doctorsResponse.json()
            setDoctorCount(data.count || 0)
          }
        }
      } catch (error) {
        console.error('Erreur chargement données dashboard:', error)
      }
    }

    loadDashboardData()
  }, [session])

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return 'from-blue-500 to-cyan-500'
      case 'PATIENT':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'DOCTOR':
        return '👨‍⚕️'
      case 'PATIENT':
        return '👤'
      default:
        return '🔒'
    }
  }

  const getQuickActions = (role: string) => {
    const commonActions = [
      {
        label: role === 'DOCTOR' ? 'Documents patients' : 'Mes documents',
        description: role === 'DOCTOR' ? 'Gérer les documents' : 'Consulter mes documents',
        icon: '📋',
        color: 'blue',
        onClick: () => router.push(role === 'DOCTOR' ? '/doctor/documents' : '/documents')
      }
    ]

    const patientActions = [
      {
        label: 'Prendre rendez-vous',
        description: 'Réservez une consultation',
        icon: '📅',
        color: 'cyan',
        onClick: () => setShowAppointmentBooking(true)
      },
      {
        label: 'Trouver un médecin',
        description: 'Rechercher un professionnel',
        icon: '👨‍⚕️',
        color: 'green',
        onClick: () => router.push('/doctors')
      },
      {
        label: 'Mes ordonnances',
        description: 'Consulter mes prescriptions',
        icon: '💊',
        color: 'purple',
        onClick: () => router.push('/prescriptions')
      },
      {
        label: 'Mes rendez-vous',
        description: 'Voir mes consultations',
        icon: '🕒',
        color: 'orange',
        onClick: () => router.push('/appointments')
      }
    ]

    const doctorActions = [
      {
        label: 'Mon agenda',
        description: 'Gérer mes rendez-vous',
        icon: '📅',
        color: 'cyan',
        onClick: () => router.push('/doctor/agenda')
      },
      {
        label: 'Mes patients',
        description: 'Voir la liste des patients',
        icon: '👥',
        color: 'green',
        onClick: () => router.push('/doctor/patients')
      },
      {
        label: 'Rapports médicaux',
        description: 'Rédiger des comptes-rendus',
        icon: '📝',
        color: 'orange',
        onClick: () => router.push('/doctor/reports')
      },
      {
        label: 'Prescriptions',
        description: 'Éditer des ordonnances',
        icon: '💊',
        color: 'purple',
        onClick: () => router.push('/doctor/prescriptions')
      },
      {
        label: 'Disponibilités',
        description: 'Gérer mes créneaux',
        icon: '⏰',
        color: 'blue',
        onClick: () => router.push('/doctor/availability')
      }
    ]

    if (role === 'DOCTOR') {
      return [...commonActions, ...doctorActions]
    } else {
      return [...commonActions, ...patientActions]
    }
  }

  const quickActions = getQuickActions(session.user?.role || 'PATIENT')

  const getAppointmentStats = () => {
    if (session.user?.role === 'DOCTOR') {
      return [
        {
          label: "RDV aujourd'hui",
          value: appointmentStats.today,
          color: 'cyan',
          icon: '📅'
        },
        {
          label: 'RDV à venir',
          value: appointmentStats.upcoming,
          color: 'cyan',
          icon: '🕒'
        },
        {
          label: 'Patients',
          value: appointmentStats.total,
          color: 'cyan',
          icon: '👥'
        }
      ]
    } else {
      return [
        {
          label: 'Prochain RDV',
          value: appointmentStats.upcoming > 0 ? '1' : '0',
          color: 'cyan',
          icon: '📅'
        },
        {
          label: 'RDV passés',
          value: appointmentStats.total,
          color: 'blue',
          icon: '📋'
        },
        {
          label: 'Médecins consultés',
          value: doctorCount.toString(),
          color: 'green',
          icon: '👨‍⚕️'
        }
      ]
    }
  }

  const stats = getAppointmentStats()

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      {showAppointmentBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Prendre un rendez-vous</h2>
              <button
                onClick={() => setShowAppointmentBooking(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <AppointmentBooking onSuccess={() => setShowAppointmentBooking(false)} />
          </div>
        </div>
      )}

      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  HealthFlow
                </h1>
                <p className="text-sm text-gray-500">Tableau de bord</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{session.user?.name}</p>
                <p className="text-sm text-gray-500">{session.user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-linear-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    Bon retour, {session.user?.name || 'Utilisateur'} !
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Bienvenue dans votre espace {session.user?.role === 'DOCTOR' ? 'professionnel' : 'santé personnel'}
                  </p>
                </div>
                <div className={`w-20 h-20 bg-linear-to-r ${getRoleColor(session.user?.role || '')} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl">{getRoleIcon(session.user?.role || '')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div 
                    key={index}
                    className="bg-linear-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        stat.color === 'cyan' ? 'bg-cyan-500/20' :
                        stat.color === 'blue' ? 'bg-blue-500/20' :
                        stat.color === 'green' ? 'bg-green-500/20' : 'bg-gray-500/20'
                      }`}>
                        <span className="text-2xl">{stat.icon}</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className={`text-sm ${
                          stat.color === 'cyan' ? 'text-cyan-700' :
                          stat.color === 'blue' ? 'text-blue-700' :
                          stat.color === 'green' ? 'text-green-700' : 'text-gray-700'
                        }`}>
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Nom complet</p>
                      <p className="font-medium text-gray-900">{session.user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{session.user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Rôle</p>
                      <p className="font-medium text-gray-900 capitalize">{session.user?.role?.toLowerCase()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <h3 className="font-semibold text-gray-900 mb-4">Statut du compte</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-700">Compte vérifié</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">Session active</span>
                    </div>
                    {session.user?.role === 'DOCTOR' && (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">Mode professionnel</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {session.user?.role === 'DOCTOR' && (
              <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 mt-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Rendez-vous aujourd'hui</h3>
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📅</div>
                  <p className="text-gray-500">Aucun rendez-vous aujourd'hui</p>
                  <button 
                    onClick={() => router.push('/doctor/agenda')}
                    className="mt-4 text-cyan-600 hover:text-cyan-700 font-medium"
                  >
                    Voir l'agenda complet →
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Votre profil</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-linear-to-r ${getRoleColor(session.user?.role || '')} rounded-xl flex items-center justify-center`}>
                    <span className="text-white text-lg">{getRoleIcon(session.user?.role || '')}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{session.user?.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{session.user?.role?.toLowerCase()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/profile')}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200"
                >
                  Modifier le profil
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className="w-full text-left p-4 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 group"
                    style={{
                      borderColor: action.color === 'cyan' ? '#22d3ee' : 
                                  action.color === 'blue' ? '#3b82f6' :
                                  action.color === 'green' ? '#10b981' :
                                  action.color === 'purple' ? '#8b5cf6' :
                                  action.color === 'orange' ? '#f59e0b' : '#d1d5db',
                      backgroundColor: action.color === 'cyan' ? '#f0fdff' : 
                                      action.color === 'blue' ? '#f0f9ff' :
                                      action.color === 'green' ? '#f0fdf4' :
                                      action.color === 'purple' ? '#faf5ff' :
                                      action.color === 'orange' ? '#fffbeb' : '#f9fafb'
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: action.color === 'cyan' ? 'rgba(34, 211, 238, 0.1)' : 
                                          action.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' :
                                          action.color === 'green' ? 'rgba(16, 185, 129, 0.1)' :
                                          action.color === 'purple' ? 'rgba(139, 92, 246, 0.1)' :
                                          action.color === 'orange' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(107, 114, 128, 0.1)'
                        }}
                      >
                        <span className="text-lg">{action.icon}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{action.label}</p>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Notifications</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">ℹ️</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Bienvenue sur HealthFlow</p>
                    <p className="text-xs text-gray-500">Découvrez toutes les fonctionnalités</p>
                  </div>
                </div>
                
                {session.user?.role === 'PATIENT' && (
                  <div className="flex items-center space-x-3 p-3 bg-cyan-50 rounded-lg">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">📅</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Prenez votre premier RDV</p>
                      <p className="text-xs text-gray-500">Réservez une consultation en ligne</p>
                    </div>
                  </div>
                )}

                {session.user?.role === 'DOCTOR' && (
                  <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">👥</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Configurez vos disponibilités</p>
                      <p className="text-xs text-gray-500">Définissez vos créneaux de consultation</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}