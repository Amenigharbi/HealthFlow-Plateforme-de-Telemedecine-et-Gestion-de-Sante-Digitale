// app/page.tsx
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            HealthFlow
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Votre plateforme de santé digitale. Gérez vos rendez-vous, 
            consultez vos dossiers médicaux et connectez-vous avec des professionnels.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Créer un compte
            </Link>
            <Link 
              href="/login" 
              className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}