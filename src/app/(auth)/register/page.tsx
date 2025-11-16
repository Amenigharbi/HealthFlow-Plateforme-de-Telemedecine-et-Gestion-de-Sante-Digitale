'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { registerSchema } from '@/lib/validations/auth'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type FormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        router.push('/login?message=Compte créé avec succès')
      } else {
        setError(result.error || 'Une erreur est survenue lors de la création du compte')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur. Veuillez réessayer.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Animated Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 transform transition-all duration-500 hover:shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-linear-to-r from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xl shadow-purple-500/25 transform transition-transform duration-300 hover:scale-105">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent mb-3">
              Rejoindre HealthFlow
            </h1>
            <p className="text-gray-400 text-sm font-light">
              Commencez votre parcours santé en toute sécurité
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 backdrop-blur-sm animate-fade-in">
              <div className="flex items-center space-x-3">
                <div className="shrink-0 w-8 h-8 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-red-300 text-sm flex-1">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-3">
              <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                Nom complet
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <input
                  {...register('name')}
                  id="name"
                  type="text"
                  className={`relative w-full px-4 py-4 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                    errors.name 
                      ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50' 
                      : 'border-white/10 focus:ring-purple-500/20 focus:border-purple-500/50 group-hover:border-white/20'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                  placeholder="Votre nom complet"
                />
                {errors.name && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm flex items-center space-x-2 animate-fade-in">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-3">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Adresse email
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <input
                  {...register('email')}
                  id="email"
                  type="email"
                  className={`relative w-full px-4 py-4 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                    errors.email 
                      ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50' 
                      : 'border-white/10 focus:ring-purple-500/20 focus:border-purple-500/50 group-hover:border-white/20'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm flex items-center space-x-2 animate-fade-in">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Mot de passe
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <input
                  {...register('password')}
                  id="password"
                  type="password"
                  className={`relative w-full px-4 py-4 bg-white/5 border rounded-2xl focus:outline-none focus:ring-2 transition-all duration-300 backdrop-blur-sm ${
                    errors.password 
                      ? 'border-red-500/50 focus:ring-red-500/20 focus:border-red-500/50' 
                      : 'border-white/10 focus:ring-purple-500/20 focus:border-purple-500/50 group-hover:border-white/20'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isLoading}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm flex items-center space-x-2 animate-fade-in">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Role Field */}
            <div className="space-y-3">
              <label htmlFor="role" className="block text-sm font-medium text-gray-300">
                Je suis
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-sm group-hover:blur-md transition-all duration-300 opacity-0 group-hover:opacity-100"></div>
                <select
                  {...register('role')}
                  id="role"
                  className={`relative w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/50 transition-all duration-300 appearance-none backdrop-blur-sm ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : 'group-hover:border-white/20'
                  }`}
                  disabled={isLoading}
                >
                  <option value="PATIENT" className="bg-slate-900 text-white">👤 Patient</option>
                  <option value="DOCTOR" className="bg-slate-900 text-white">👨‍⚕️ Professionnel de santé</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative overflow-hidden bg-linear-to-r from-purple-600 to-cyan-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-2xl shadow-purple-500/25 hover:shadow-3xl hover:shadow-purple-500/40"
            >
              {/* Animated background */}
              <div className="absolute inset-0 bg-linear-to-r from-purple-700 to-cyan-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              
              {/* Button content */}
              <div className="relative flex items-center justify-center space-x-3">
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="bg-linear-to-r from-white to-gray-200 bg-clip-text text-transparent">
                      Créer mon compte
                    </span>
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Déjà un compte ?{' '}
              <Link 
                href="/login" 
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-all duration-300 hover:underline hover:underline-offset-4"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            En créant un compte, vous acceptez nos{' '}
            <a href="#" className="text-gray-400 hover:text-gray-300 underline transition-colors">conditions</a>
            {' '}et notre{' '}
            <a href="#" className="text-gray-400 hover:text-gray-300 underline transition-colors">confidentialité</a>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(-180deg); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}