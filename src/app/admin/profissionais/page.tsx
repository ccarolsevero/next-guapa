'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Edit, 
  Trash2, 
  User, 
  Search, 
  Eye, 
  EyeOff, 
  Star, 
  StarOff,
  Image,
  Phone,
  Mail,
  MapPin
} from 'lucide-react'

interface Professional {
  _id: string
  name: string
  title: string
  email: string
  phone: string
  shortDescription: string
  fullDescription: string
  services: string[]
  profileImage: string
  gallery: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export default function ProfissionaisPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [professionalToDelete, setProfessionalToDelete] = useState<Professional | null>(null)

  useEffect(() => {
    loadProfessionals()
  }, [])

  const loadProfessionals = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/professionals')
      if (!response.ok) {
        throw new Error('Erro ao carregar profissionais')
      }
      const data = await response.json()
      setProfessionals(data)
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
      alert('Erro ao carregar profissionais')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async (professional: Professional) => {
    try {
      const response = await fetch(`/api/professionals/${professional._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...professional,
          isActive: !professional.isActive
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar profissional')
      }

      await loadProfessionals()
      alert(`Profissional ${professional.isActive ? 'desativado' : 'ativado'} com sucesso!`)
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      alert('Erro ao atualizar profissional')
    }
  }

  const handleToggleFeatured = async (professional: Professional) => {
    try {
      const response = await fetch(`/api/professionals/${professional._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...professional,
          isFeatured: !professional.isFeatured
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar profissional')
      }

      await loadProfessionals()
      alert(`Profissional ${professional.isFeatured ? 'removido dos' : 'adicionado aos'} destaques!`)
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      alert('Erro ao atualizar profissional')
    }
  }

  const handleDeleteProfessional = async () => {
    if (!professionalToDelete) return

    try {
      const response = await fetch(`/api/professionals/${professionalToDelete._id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar profissional')
      }

      await loadProfessionals()
      alert('Profissional deletado com sucesso!')
      setShowDeleteModal(false)
      setProfessionalToDelete(null)
    } catch (error) {
      console.error('Erro ao deletar profissional:', error)
      alert('Erro ao deletar profissional')
    }
  }

  const filteredProfessionals = professionals.filter(professional =>
    professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    professional.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Profissionais</h1>
          <Link
            href="/admin/profissionais/novo"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Novo Profissional
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar profissionais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Profissionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfessionals.map((professional) => (
            <div key={professional._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Imagem de Perfil */}
              <div className="relative h-48 bg-gray-200">
                <img
                  src={professional.profileImage}
                  alt={professional.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/assents/fotobruna.jpeg'
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={() => handleToggleFeatured(professional)}
                    className={`p-2 rounded-full ${
                      professional.isFeatured 
                        ? 'bg-yellow-500 text-white' 
                        : 'bg-white text-gray-600'
                    } hover:bg-yellow-500 hover:text-white transition-colors`}
                    title={professional.isFeatured ? 'Remover dos destaques' : 'Adicionar aos destaques'}
                  >
                    {professional.isFeatured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleToggleActive(professional)}
                    className={`p-2 rounded-full ${
                      professional.isActive 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    } hover:opacity-80 transition-colors`}
                    title={professional.isActive ? 'Desativar' : 'Ativar'}
                  >
                    {professional.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Informações */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{professional.name}</h3>
                    <p className="text-gray-600">{professional.title}</p>
                  </div>
                  {professional.isFeatured && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Destaque
                    </span>
                  )}
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {professional.shortDescription}
                </p>

                {/* Contato */}
                <div className="space-y-2 mb-4">
                  {professional.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {professional.email}
                    </div>
                  )}
                  {professional.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="w-4 h-4 mr-2" />
                      {professional.phone}
                    </div>
                  )}
                </div>

                {/* Serviços */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-800 mb-2">Serviços:</h4>
                  <div className="flex flex-wrap gap-1">
                    {professional.services.slice(0, 3).map((service, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                      >
                        {service}
                      </span>
                    ))}
                    {professional.services.length > 3 && (
                      <span className="text-gray-500 text-xs">
                        +{professional.services.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>

                {/* Galeria */}
                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Image className="w-4 h-4 mr-2" />
                    {professional.gallery.length} fotos na galeria
                  </div>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/profissionais/editar/${professional._id}`}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                  >
                    <Edit className="w-4 h-4 inline mr-1" />
                    Editar
                  </Link>
                  <button
                    onClick={() => {
                      setProfessionalToDelete(professional)
                      setShowDeleteModal(true)
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4 inline mr-1" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProfessionals.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm ? 'Nenhum profissional encontrado' : 'Nenhum profissional cadastrado'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Tente ajustar os filtros de busca' : 'Comece adicionando o primeiro profissional'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && professionalToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Confirmar Exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir a profissional <strong>{professionalToDelete.name}</strong>?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProfessionalToDelete(null)
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteProfessional}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
