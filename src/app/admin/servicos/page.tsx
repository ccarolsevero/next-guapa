'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash, Search, Filter, DollarSign, Clock, TrendingUp, Tag, X, Trash2 } from 'lucide-react'

interface Service {
  _id: string
  id: string
  name: string
  description: string
  price: number
  category: string
  duration: number
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
  professionalId: string
}




interface Category {
  _id: string
  name: string
  description?: string
  isActive: boolean
  order: number
}

const professionals = [
  { id: "bruna", name: "Bruna" },
  { id: "cicera", name: "Cicera Canovas" }
]

export default function ServicosPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategories, setActiveCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedProfessional, setSelectedProfessional] = useState('Todos')
  const [showInactive, setShowInactive] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showCategoriesListModal, setShowCategoriesListModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryDescription, setNewCategoryDescription] = useState('')

  // Carregar serviços da API
  const loadServices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/services')
      if (!response.ok) {
        throw new Error('Erro ao carregar serviços')
      }
      const data = await response.json()
      setServices(data)
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
      alert('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  // Carregar todas as categorias (para o modal de gerenciamento)
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true)
      // Para o modal de gerenciamento, carregar todas as categorias (ativas e inativas)
      const response = await fetch('/api/service-categories-v2')
      if (!response.ok) {
        throw new Error('Erro ao carregar categorias de serviços')
      }
      const data = await response.json()
      console.log('📋 Todas as categorias carregadas:', data)
      setCategories(data)
    } catch (error) {
      console.error('Erro ao carregar categorias de serviços:', error)
      // Fallback para categorias padrão se a API falhar
      const fallbackCategories = [
        { _id: '1', name: 'Consultoria e Avaliação', isActive: true, order: 1 },
        { _id: '2', name: 'Cortes', isActive: true, order: 2 },
        { _id: '3', name: 'Colorimetria', isActive: true, order: 3 },
        { _id: '4', name: 'Tratamentos', isActive: true, order: 4 }
      ]
      console.log('📋 Usando categorias fallback:', fallbackCategories)
      setCategories(fallbackCategories)
    } finally {
      setCategoriesLoading(false)
    }
  }

  // Carregar apenas categorias ativas (para o select de filtro)
  const loadActiveCategories = async () => {
    try {
      const response = await fetch('/api/service-categories-v2?isActive=true')
      if (!response.ok) {
        throw new Error('Erro ao carregar categorias ativas')
      }
      const data = await response.json()
      console.log('📋 Categorias ativas carregadas:', data)
      setActiveCategories(data)
    } catch (error) {
      console.error('Erro ao carregar categorias ativas:', error)
      // Fallback para categorias padrão se a API falhar
      const fallbackCategories = [
        { _id: '1', name: 'Consultoria e Avaliação', isActive: true, order: 1 },
        { _id: '2', name: 'Cortes', isActive: true, order: 2 },
        { _id: '3', name: 'Colorimetria', isActive: true, order: 3 },
        { _id: '4', name: 'Tratamentos', isActive: true, order: 4 }
      ]
      setActiveCategories(fallbackCategories)
    }
  }

  // Criar nova categoria de serviço
  const createCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Nome da categoria é obrigatório')
      return
    }

    try {
      const response = await fetch('/api/service-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          description: newCategoryDescription.trim()
        }),
      })

      if (response.ok) {
        // Recarregar categorias
        await loadCategories()
        await loadActiveCategories()
        // Fechar modal e limpar campos
        setShowCategoryModal(false)
        setNewCategoryName('')
        setNewCategoryDescription('')
        alert('Categoria de serviço criada com sucesso!')
      } else {
        const error = await response.json()
        alert(`Erro ao criar categoria: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao criar categoria:', error)
      alert('Erro ao criar categoria')
    }
  }

  // Toggle ativar/desativar categoria
  const toggleCategoryStatus = async (categoryName: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    const action = newStatus ? 'ativar' : 'desativar'
    
    if (!confirm(`Tem certeza que deseja ${action} a categoria "${categoryName}"?`)) {
      return
    }

    try {
      const response = await fetch('/api/service-categories', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryName,
          isActive: newStatus
        }),
      })

      if (response.ok) {
        console.log(`✅ Categoria ${action}da:`, categoryName)
        
        // Recarregar categorias
        await loadCategories()
        await loadActiveCategories()
        
        alert(`Categoria ${action}da com sucesso!`)
      } else {
        const error = await response.json()
        console.error(`❌ Erro ao ${action} categoria:`, error)
        alert(`Erro ao ${action} categoria: ${error.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error(`❌ Erro ao ${action} categoria:`, error)
      alert(`Erro ao ${action} categoria. Tente novamente.`)
    }
  }

  // Deletar categoria de serviço
  const deleteCategory = async (categoryName: string) => {
    if (!confirm(`Tem certeza que deseja deletar a categoria "${categoryName}"?\n\nEsta ação não pode ser desfeita.`)) {
      return
    }

    try {
      const response = await fetch('/api/service-categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: categoryName
        }),
      })

      if (response.ok) {
        console.log('✅ Categoria deletada:', categoryName)
        
        // Recarregar categorias
        await loadCategories()
        await loadActiveCategories()
        
        alert('Categoria deletada com sucesso!')
      } else {
        const error = await response.json()
        console.error('❌ Erro ao deletar categoria:', error)
        alert(`Erro ao deletar categoria: ${error.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('❌ Erro ao deletar categoria:', error)
      alert('Erro ao deletar categoria. Tente novamente.')
    }
  }

  useEffect(() => {
    loadServices()
    loadCategories() // Para o modal de gerenciamento (todas as categorias)
    loadActiveCategories() // Para o select de filtro (apenas ativas)
  }, [])

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || service.category === selectedCategory
    const matchesProfessional = selectedProfessional === 'Todos' || service.professionalId === selectedProfessional
    const matchesStatus = showInactive ? true : service.isActive

    return matchesSearch && matchesCategory && matchesProfessional && matchesStatus
  })

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      try {
        const response = await fetch(`/api/services/${id}`, {
          method: 'DELETE',
        })
        
        if (response.ok) {
          // Recarregar a lista de serviços
          await loadServices()
          alert('Serviço excluído com sucesso!')
        } else {
          const error = await response.json()
          alert(`Erro ao excluir serviço: ${error.error}`)
        }
      } catch (error) {
        console.error('Erro ao excluir serviço:', error)
        alert('Erro ao excluir serviço')
      }
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getProfessionalName = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId);
    return professional ? professional.name : 'Não definido';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todos os serviços oferecidos pelo salão
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="flex space-x-3">
            <div className="flex gap-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-[#006D5B] text-white px-4 py-2 rounded-lg hover:bg-[#005a4d] transition-colors flex items-center"
              >
                <Tag className="w-4 h-4 mr-2" />
                Nova Categoria
              </button>
              <button
                onClick={() => setShowCategoriesListModal(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <Tag className="w-4 h-4 mr-2" />
                Gerenciar Categorias
              </button>
            </div>
            <Link
              href="/admin/servicos/editar/novo"
              className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Serviço
            </Link>
          </div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              style={{ color: '#000000' }}
            />
          </div>
          
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
              style={{ color: '#000000' }}
              disabled={categoriesLoading}
            >
              <option value="Todos">Todos</option>
              {categoriesLoading ? (
                <option value="">Carregando categorias...</option>
              ) : (
                activeCategories.map(category => (
                  <option key={category._id} value={category.name}>{category.name}</option>
                ))
              )}
            </select>
          </div>
          
          <div>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
              style={{ color: '#000000' }}
            >
              <option value="Todos">Todos os Profissionais</option>
              {professionals.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-[#D15556] focus:ring-[#D15556] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Mostrar inativos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Serviços</p>
                              <p className="text-2xl font-semibold text-gray-900">{services.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Serviços Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {services.filter(s => s.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Preço Médio</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(services.reduce((sum, s) => sum + s.price, 0) / services.length)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Duração Média</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(services.reduce((sum, s) => sum + (s.duration || 0), 0) / services.length)} min
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Serviços ({filteredServices.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(service.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      service.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getProfessionalName(service.professionalId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/servicos/editar/${service.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar serviço"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir serviço"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para criar nova categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Nova Categoria de Serviço
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Tratamentos Capilares"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D5B] focus:border-[#006D5B]"
                  style={{ color: '#000000' }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Descrição da categoria..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#006D5B] focus:border-[#006D5B]"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCategoryModal(false)
                  setNewCategoryName('')
                  setNewCategoryDescription('')
                }}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createCategory}
                className="px-4 py-2 bg-[#006D5B] text-white rounded-lg hover:bg-[#005a4d] transition-colors"
              >
                Criar Categoria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Gerenciamento de Categorias */}
      {showCategoriesListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Gerenciar Categorias de Serviços
              </h3>
              <button
                onClick={() => setShowCategoriesListModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-3">
              {categoriesLoading ? (
                <div className="text-center py-4">
                  <div className="text-gray-500">Carregando categorias...</div>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-gray-500">Nenhuma categoria encontrada</div>
                </div>
              ) : (
                categories.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          {category.serviceCount} serviço{category.serviceCount !== 1 ? 's' : ''}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          category.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {category.isActive ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Toggle Ativar/Desativar */}
                      <button
                        onClick={() => toggleCategoryStatus(category.name, category.isActive)}
                        className={`px-3 py-1 rounded transition-colors ${
                          category.isActive
                            ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50'
                            : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                        }`}
                        title={category.isActive ? 'Desativar categoria' : 'Ativar categoria'}
                      >
                        {category.isActive ? (
                          <span className="text-xs font-medium">Desativar</span>
                        ) : (
                          <span className="text-xs font-medium">Ativar</span>
                        )}
                      </button>
                      
                      {/* Botão Deletar */}
                      <button
                        onClick={() => deleteCategory(category.name)}
                        className="px-3 py-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Deletar categoria"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowCategoriesListModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
