'use client'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-size-[64px_64px] mask-[radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>
      </div>

      <nav className="relative z-20">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-linear-to-r from-cyan-500 to-blue-500 rounded-xl"></div>
              <span className="text-xl font-bold bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                HealthFlow
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
                Fonctionnalités
              </a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors duration-300 font-medium">
                À propos
              </a>
              <Link 
                href="/login" 
                className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300 font-medium"
              >
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-2 mb-8 animate-bounce">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                <span className="text-sm text-cyan-300 font-medium">
                  Plateforme de santé nouvelle génération
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-linear-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-transparent">
                  Votre santé,
                </span>
                <br />
                <span className="bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  simplifiée.
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed">
                Gérez vos rendez-vous, consultez vos dossiers médicaux et connectez-vous 
                avec des professionnels de santé. Tout cela, en toute sécurité.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/register" 
                  className="group relative overflow-hidden bg-linear-to-r from-cyan-600 to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-500 hover:scale-105 shadow-2xl shadow-cyan-500/25 hover:shadow-3xl hover:shadow-cyan-500/40 animate-pulse hover:animate-none"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-cyan-700 to-blue-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  <div className="relative flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="bg-linear-to-r from-white to-gray-200 bg-clip-text text-transparent">
                      Commencer gratuitement
                    </span>
                  </div>
                </Link>

                <Link 
                  href="/login" 
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-500 hover:scale-105 hover:bg-white/10 hover:border-white/20"
                >
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </div>
                    <span>Se connecter</span>
                  </div>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-xs">Données sécurisées</p>
                </div>
                
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-xs">Gain de temps</p>
                </div>
                
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-400 text-xs">+10k pros</p>
                </div>
              </div>
            </div>

            <div>
              <div className="relative">
                <div className="relative bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-linear-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl p-6">
                    <div className="aspect-video rounded-2xl flex items-center justify-center relative overflow-hidden">
                      <img
                        src="/images/health.png"
                        alt="Dashboard HealthFlow - Interface moderne de gestion de santé"
                        className="object-cover rounded-xl w-full h-full"
                      />
                      <div className="absolute inset-0 bg-linear-to-br from-cyan-500/10 to-blue-500/10 mix-blend-overlay"></div>
                      <div className="absolute inset-0 bg-linear-to-t from-slate-900/20 to-transparent"></div>
                    </div>
                  </div>
                </div>

                <div className="absolute -top-4 -right-4 bg-green-500/10 backdrop-blur-sm border border-green-500/20 rounded-2xl p-4 rotate-6 animate-bounce">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-medium">Rendez-vous confirmé</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-purple-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 -rotate-6 animate-bounce delay-1000">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <span className="text-white text-sm font-medium">Dossier à jour</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-10 w-4 h-4 bg-cyan-400/30 rounded-full animate-ping"></div>
      <div className="absolute top-20 right-20 w-6 h-6 bg-purple-400/20 rounded-full animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 left-1/4 w-3 h-3 bg-blue-400/40 rounded-full animate-pulse delay-500"></div>
    </div>
  )
}