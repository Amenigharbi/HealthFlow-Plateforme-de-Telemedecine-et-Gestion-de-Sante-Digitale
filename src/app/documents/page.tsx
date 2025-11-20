'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../components/UI/LoadingSpinner'

interface Document {
  id: string
  title: string
  type: string
  date: string
  doctor?: string
  fileUrl?: string
}

export default function DocumentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }

    loadDocuments()
  }, [session, status, router])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/documents')
      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents)
      }
    } catch (error) {
      console.error('Erreur chargement documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = filter === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === filter)

  const documentTypes = Array.from(new Set(documents.map(d => d.type)))

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de vos documents..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mes documents</h1>
              <p className="text-gray-600 mt-2">Accédez à tous vos documents médicaux</p>
            </div>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500"
            >
              <option value="all">Tous les documents</option>
              {documentTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun document</h3>
              <p className="text-gray-600">Vous n'avez pas encore de document médical.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                      <span className="text-cyan-600 text-xl">
                        {document.type === 'report' ? '📝' : 
                         document.type === 'lab' ? '🧪' : 
                         document.type === 'imaging' ? '🖼️' : '📋'}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{document.title}</h3>
                      <p className="text-sm text-gray-600 capitalize">{document.type}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">
                        {new Date(document.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {document.doctor && (
                      <div className="flex justify-between">
                        <span>Médecin:</span>
                        <span className="font-medium">{document.doctor}</span>
                      </div>
                    )}
                  </div>

                  {document.fileUrl && (
                    <button
                      onClick={() => window.open(document.fileUrl, '_blank')}
                      className="w-full bg-cyan-500 text-white py-2 rounded-xl font-semibold hover:bg-cyan-600 transition-colors"
                    >
                      Télécharger
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}