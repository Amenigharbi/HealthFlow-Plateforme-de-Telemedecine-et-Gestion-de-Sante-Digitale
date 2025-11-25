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
  description?: string
  category: string
  severity?: string
  status?: string
}

export default function DocumentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

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
        
        const uniqueDocuments = removeDuplicateDocuments(data.documents)
        setDocuments(uniqueDocuments)
        
        if (data.documents.length !== uniqueDocuments.length) {
          console.warn(`${data.documents.length - uniqueDocuments.length} documents en double ont été supprimés`)
        }
      } else {
        console.error('Erreur lors du chargement des documents')
      }
    } catch (error) {
      console.error('Erreur chargement documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeDuplicateDocuments = (docs: Document[]): Document[] => {
    const seen = new Map()
    const result: Document[] = []
    
    docs.forEach(doc => {
      if (doc.id && !seen.has(doc.id)) {
        seen.set(doc.id, true)
        result.push(doc)
      } else {
        console.warn(`Document en double ou sans ID détecté: ${doc.id} - ${doc.title}`)
      }
    })
    
    return result
  }

  const handleViewDetails = (document: Document) => {
    setSelectedDocument(document)
    setShowDetailsModal(true)
  }

  const handleShareDocument = async (document: Document) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          text: document.description,
          url: `${window.location.origin}/documents/${document.id}`,
        })
      } catch (error) {
        console.error('Erreur partage:', error)
      }
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/documents/${document.id}`)
      alert('Lien copié dans le presse-papier !')
    }
  }

  const handlePrintDocument = (document: Document) => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${document.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .section { margin-bottom: 15px; }
              .label { font-weight: bold; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${document.title}</h1>
              <p><span class="label">Type:</span> ${document.type}</p>
              <p><span class="label">Date:</span> ${new Date(document.date).toLocaleDateString('fr-FR')}</p>
              ${document.doctor ? `<p><span class="label">Médecin:</span> ${document.doctor}</p>` : ''}
            </div>
            ${document.description ? `<div class="section"><span class="label">Description:</span><br>${document.description}</div>` : ''}
            ${document.severity ? `<div class="section"><span class="label">Priorité:</span> ${document.severity}</div>` : ''}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const filteredDocuments = filter === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === filter)

  const documentTypes = Array.from(new Set(documents.map(d => d.type)))

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'prescription':
        return '💊'
      case 'consultation':
        return '👨‍⚕️'
      case 'lab_result':
        return '🧪'
      case 'imaging':
        return '🖼️'
      case 'vaccination':
        return '💉'
      case 'note':
        return '📝'
      case 'condition':
        return '📋'
      case 'procedure':
        return '🔬'
      default:
        return '📄'
    }
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'HIGH':
      case 'CRITICAL':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'MEDIUM':
        return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'LOW':
        return 'text-green-600 bg-green-50 border-green-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement de vos documents..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      {showDetailsModal && selectedDocument && (
        <DocumentDetailsModal
          document={selectedDocument}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedDocument(null)
          }}
          onShare={handleShareDocument}
          onPrint={handlePrintDocument}
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 border border-gray-100/50 backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 mb-8">
            <div className="text-center lg:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 bg-linear-to-r from-cyan-600 to-blue-600 bg-clip-text">
                Mes Documents Médicaux
              </h1>
              <p className="text-gray-700 mt-3 text-base sm:text-lg font-medium">
                Consultez et gérez tous vos documents de santé
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-base bg-white text-black font-medium shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <option value="all" className="text-black">Tous les documents</option>
                {documentTypes.map(type => (
                  <option key={type} value={type} className="text-black">
                    {type.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-linear-to-br from-cyan-500 to-blue-500 text-white p-4 rounded-2xl text-center shadow-lg">
              <div className="text-2xl font-bold">{documents.length}</div>
              <div className="text-sm opacity-90">Total</div>
            </div>
            <div className="bg-linear-to-br from-green-500 to-emerald-500 text-white p-4 rounded-2xl text-center shadow-lg">
              <div className="text-2xl font-bold">
                {documents.filter(d => d.severity === 'LOW').length}
              </div>
              <div className="text-sm opacity-90">Faible Priorité</div>
            </div>
            <div className="bg-linear-to-br from-orange-500 to-amber-500 text-white p-4 rounded-2xl text-center shadow-lg">
              <div className="text-2xl font-bold">
                {documents.filter(d => d.severity === 'MEDIUM').length}
              </div>
              <div className="text-sm opacity-90">Moyenne Priorité</div>
            </div>
            <div className="bg-linear-to-br from-red-500 to-rose-500 text-white p-4 rounded-2xl text-center shadow-lg">
              <div className="text-2xl font-bold">
                {documents.filter(d => d.severity === 'HIGH' || d.severity === 'CRITICAL').length}
              </div>
              <div className="text-sm opacity-90">Haute Priorité</div>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-linear-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
              <div className="text-gray-400 text-6xl sm:text-7xl mb-4">📁</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Aucun document trouvé</h3>
              <p className="text-gray-600 text-base max-w-md mx-auto">
                {documents.length === 0 
                  ? "Vous n'avez pas encore de document médical dans votre dossier." 
                  : "Aucun document ne correspond à votre filtre actuel."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDocuments.map((document, index) => (
                <div
                  key={`${document.id}-${index}`} 
                  className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:border-cyan-200/50 backdrop-blur-sm"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-linear-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white text-xl">
                          {getDocumentIcon(document.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-lg truncate leading-tight">
                          {document.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-medium capitalize mt-1">
                          {document.type.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {document.description && (
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2 leading-relaxed font-medium">
                      {document.description}
                    </p>
                  )}

                  <div className="space-y-3 text-sm text-gray-700 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Date:</span>
                      <span className="font-bold text-black text-right">
                        {new Date(document.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {document.doctor && (
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Médecin:</span>
                        <span className="font-bold text-black text-right max-w-[60%] truncate" title={document.doctor}>
                          {document.doctor}
                        </span>
                      </div>
                    )}
                    {document.severity && (
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Priorité:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(document.severity)}`}>
                          {document.severity.toLowerCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleViewDetails(document)}
                      className="flex-1 bg-linear-to-r from-gray-600 to-gray-700 text-white py-3 px-4 rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                    >
                      Voir Détails
                    </button>
                  </div>
                  
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleShareDocument(document)}
                      className="flex-1 bg-linear-to-r from-green-500 to-emerald-500 text-white py-3 px-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                    >
                      Partager
                    </button>
                    <button
                      onClick={() => handlePrintDocument(document)}
                      className="flex-1 bg-linear-to-r from-purple-500 to-indigo-500 text-white py-3 px-4 rounded-xl font-bold hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm"
                    >
                      Imprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DocumentDetailsModal({ document, onClose, onShare, onPrint }: { 
  document: Document;
  onClose: () => void;
  onShare: (doc: Document) => void;
  onPrint: (doc: Document) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200/50">
        <div className="sticky top-0 bg-linear-to-r from-cyan-500 to-blue-500 text-white p-6 rounded-t-3xl">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold wrap-break-word pr-4">
                {document.title}
              </h2>
              <p className="text-cyan-100 capitalize mt-2 text-lg font-medium">
                {document.type.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-cyan-100 text-3xl transition-colors duration-200 shrink-0 bg-black/20 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-600 font-semibold mb-1">Date</p>
              <p className="font-bold text-black text-lg">
                {new Date(document.date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            {document.doctor && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 font-semibold mb-1">Médecin</p>
                <p className="font-bold text-black text-lg">{document.doctor}</p>
              </div>
            )}
            {document.severity && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 font-semibold mb-1">Priorité</p>
                <p className="font-bold text-black text-lg capitalize">{document.severity.toLowerCase()}</p>
              </div>
            )}
            {document.status && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 font-semibold mb-1">Statut</p>
                <p className="font-bold text-black text-lg capitalize">{document.status.toLowerCase()}</p>
              </div>
            )}
          </div>

          {document.description && (
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="text-sm text-gray-600 font-semibold mb-3">Description</p>
              <p className="text-black whitespace-pre-wrap text-base leading-relaxed font-medium">
                {document.description}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              onClick={() => onShare(document)}
              className="flex-1 bg-linear-to-r from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
            >
              Partager le Document
            </button>
            <button
              onClick={() => onPrint(document)}
              className="flex-1 bg-linear-to-r from-purple-500 to-indigo-500 text-white py-4 rounded-xl font-bold hover:from-purple-600 hover:to-indigo-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-base"
            >
              Imprimer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}