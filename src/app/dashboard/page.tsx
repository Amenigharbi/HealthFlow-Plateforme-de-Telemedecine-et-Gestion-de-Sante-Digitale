'use client'
import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
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
                    Bienvenue dans votre espace santé personnel
                  </p>
                </div>
                <div className={`w-20 h-20 bg-linear-to-r ${getRoleColor(session.user?.role || '')} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl">{getRoleIcon(session.user?.role || '')}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-linear-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📅</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-cyan-700">0</p>
                      <p className="text-sm text-cyan-600">Rendez-vous</p>
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📋</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-700">0</p>
                      <p className="text-sm text-green-600">Dossiers</p>
                    </div>
                  </div>
                </div>

                <div className="bg-linear-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-purple-700">0</p>
                      <p className="text-sm text-purple-600">Professionnels</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Informations personnelles</h3>
                  <div className="space-y-3">
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
                  </div>
                </div>
              </div>
            </div>
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
                <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200">
                  Modifier le profil
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Actions rapides</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-200 group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                      <span className="text-lg">📅</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Prendre rendez-vous</p>
                      <p className="text-sm text-gray-500">Réservez une consultation</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <span className="text-lg">📋</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Mes dossiers</p>
                      <p className="text-sm text-gray-500">Consulter mes documents</p>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                      <span className="text-lg">👨‍⚕️</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Trouver un médecin</p>
                      <p className="text-sm text-gray-500">Rechercher un professionnel</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}