'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

interface Document {
  id: string
  title: string
  type: string
  date: string
  patientName: string
  patientId: string
  description?: string
  category: string
  severity?: string
  status?: string
}

export default function DoctorDocumentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [patientFilter, setPatientFilter] = useState('all')
  const [editingDocument, setEditingDocument] = useState<Document | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'DOCTOR') {
      router.push('/login')
      return
    }

    loadDocuments()
  }, [session, status, router])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/doctor/documents')
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

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document)
    setShowEditModal(true)
  }

  const handleUpdateDocument = async (updatedData: Partial<Document>) => {
    try {
      const response = await fetch(`/api/doctor/documents/${editingDocument?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        loadDocuments()
        setShowEditModal(false)
        setEditingDocument(null)
      } else {
        console.error('Erreur lors de la modification du document')
      }
    } catch (error) {
      console.error('Erreur modification document:', error)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return
    }

    try {
      const response = await fetch(`/api/doctor/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        loadDocuments()
      } else {
        console.error('Erreur lors de la suppression du document')
      }
    } catch (error) {
      console.error('Erreur suppression document:', error)
    }
  }

  const handleViewDetails = (document: Document) => {
    router.push(`/doctor/documents/${document.id}`)
  }

  const handleCreateNewDocument = () => {
    router.push('/doctor/documents/new')
  }

  const patients = Array.from(new Set(
    documents.map(doc => ({ id: doc.patientId, name: doc.patientName }))
  ))

  const filteredDocuments = documents.filter(doc => {
    const typeMatch = typeFilter === 'all' || doc.type === typeFilter
    const patientMatch = patientFilter === 'all' || doc.patientId === patientFilter
    return typeMatch && patientMatch
  })

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Chargement des documents patients..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-cyan-50">
      {showEditModal && editingDocument && (
        <EditDocumentModal
          document={editingDocument}
          onSave={handleUpdateDocument}
          onClose={() => {
            setShowEditModal(false)
            setEditingDocument(null)
          }}
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6 sm:mb-8">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Documents des patients</h1>
              <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
                Gérez les documents médicaux de vos patients
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <button
                onClick={handleCreateNewDocument}
                className="bg-green-500 text-white px-4 sm:px-6 py-2 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base order-first sm:order-0"
              >
                <span>+</span>
                Nouveau document
              </button>
              
              <select
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">Tous les patients</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name}
                  </option>
                ))}
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="all">Tous les types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>
                    {type.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredDocuments.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-400 text-4xl sm:text-6xl mb-3 sm:mb-4">📁</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Aucun document</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-4">
                {documents.length === 0 
                  ? "Vous n'avez pas encore créé de documents pour vos patients." 
                  : "Aucun document ne correspond à vos filtres."}
              </p>
              <button
                onClick={handleCreateNewDocument}
                className="bg-cyan-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-cyan-600 transition-colors text-sm sm:text-base"
              >
                Créer votre premier document
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {filteredDocuments.map((document, index) => (
                <div
                  key={`${document.id}-${index}`} 
                  className="border border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:shadow-md transition-all duration-200 bg-white group"
                >
                  <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-blue-600 text-lg sm:text-xl">
                        {getDocumentIcon(document.type)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {document.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 capitalize">
                        {document.type.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </p>
                    </div>
                  </div>

                  {document.description && (
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-2">
                      {document.description}
                    </p>
                  )}

                  <div className="space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Patient:</span>
                      <span className="font-medium text-right max-w-[60%] truncate" title={document.patientName}>
                        {document.patientName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium text-right">
                        {new Date(document.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {document.severity && (
                      <div className="flex justify-between items-center">
                        <span>Priorité:</span>
                        <span className="font-medium capitalize text-right">
                          {document.severity.toLowerCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleViewDetails(document)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-xl font-medium hover:bg-gray-200 transition-colors text-sm"
                    >
                      Détails
                    </button>
                    <button
                      onClick={() => handleEditDocument(document)}
                      className="flex-1 bg-blue-500 text-white py-2 px-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors text-sm"
                    >
                      Modifier
                    </button>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleDeleteDocument(document.id)}
                      className="w-full bg-red-500 text-white py-2 px-3 rounded-xl font-semibold hover:bg-red-600 transition-colors text-sm"
                    >
                      Supprimer
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

function EditDocumentModal({ document, onSave, onClose }: { 
  document: Document; 
  onSave: (data: Partial<Document>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    title: document.title,
    description: document.description || '',
    severity: document.severity || 'MEDIUM'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 wrap-break-word">
                Modifier le document
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl ml-4 shrink-0"
            >
              ×
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              >
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
                <option value="CRITICAL">Critique</option>
              </select>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-xl font-medium hover:bg-gray-400 transition-colors text-sm sm:text-base"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-500 text-white py-2 rounded-xl font-semibold hover:bg-blue-600 transition-colors text-sm sm:text-base"
              >
                Enregistrer
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}