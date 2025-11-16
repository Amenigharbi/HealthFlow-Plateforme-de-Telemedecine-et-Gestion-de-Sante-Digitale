'use client'

import { useEffect, useState } from 'react'
import { auth, signOut } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default function DashboardPage() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const sessionData = await auth()
      setSession(sessionData)
      setIsLoading(false)
      
      if (!sessionData) {
        redirect('/login')
      }
    }
    
    getSession()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Bienvenue, {session?.user?.name || 'Utilisateur'}!
          </h1>
          <p className="text-gray-600 mb-4">
            Email: {session?.user?.email}
          </p>
          <p className="text-gray-600 mb-4">
            Rôle: {session?.user?.role}
          </p>
          
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button
              type="submit"
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Se déconnecter
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}