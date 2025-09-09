'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tag,
  Package,
  Save,
  X
} from 'lucide-react'

interface ServiceCategory {
  _id: string
  name: string
  description?: string
  color: string
  icon?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

interface ProductCategory {
  _id: string
  name: string
  description?: string
  color: string
  icon?: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export default function CategoriasPage() {
  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>([])
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | ProductCategory | null>(null)
  const [categoryType, setCategoryType] = useState<'service' | 'product'>('service')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#D15556',
    icon: '',
    order: 0
  })

  // Categorias padrão para serviços
  const defaultServiceCategories = [
    "Consultoria", "Cortes", "Coloração", "Combo", "Finalização", 
    "Tratamentos", "Hidratação", "Reconstrução", "Penteados", "Maquiagem"
  ]

  // Categorias padrão para produtos
  const defaultProductCategories = [
    "Shampoo", "Condicionador", "Máscara", "Óleo", "Protetor Térmico",
    "Tratamentos", "Finalizadores", "Acessórios"
  ]

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      // Carregar categorias de serviços
      const serviceResponse = await fetch('/api/service-categories')
      if (serviceResponse.ok) {
        const serviceData = await serviceResponse.json()
        setServiceCategories(serviceData)
      }

      // Carregar categorias de produtos
      const productResponse = await fetch('/api/product-categories')
      if (productResponse.ok) {
        const productData = await productResponse.json()
        setProductCategories(productData)
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Nome da categoria é obrigatório')
      return
    }

    try {
      const apiUrl = categoryType === 'service' 
        ? '/api/service-categories' 
        : '/api/product-categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      const url = editingCategory ? `${apiUrl}/${editingCategory._id}` : apiUrl

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await loadCategories()
        setShowModal(false)
        setEditingCategory(null)
        setFormData({
          name: '',
          description: '',
          color: categoryType === 'service' ? '#D15556' : '#006D5B',
          icon: '',
          order: 0
        })
      } else {
        const errorData = await response.json()
        alert(`Erro: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      alert('Erro ao salvar categoria')
    }
  }

  const handleEdit = (category: ServiceCategory | ProductCategory, type: 'service' | 'product') => {
    setEditingCategory(category)
    setCategoryType(type)
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color,
      icon: category.icon || '',
      order: category.order
    })
    setShowModal(true)
  }

  const handleDelete = async (categoryId: string, type: 'service' | 'product') => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const apiUrl = type === 'service' 
        ? `/api/service-categories/${categoryId}` 
        : `/api/product-categories/${categoryId}`

      const response = await fetch(apiUrl, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadCategories()
      } else {
        const errorData = await response.json()
        alert(`Erro: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      alert('Erro ao excluir categoria')
    }
  }

  const toggleActive = async (category: ServiceCategory | ProductCategory, type: 'service' | 'product') => {
    try {
      const apiUrl = type === 'service' 
        ? `/api/service-categories/${category._id}` 
        : `/api/product-categories/${category._id}`

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          isActive: !category.isActive
        }),
      })

      if (response.ok) {
        await loadCategories()
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
    }
  }

  const addDefaultCategories = async (type: 'service' | 'product') => {
    const defaultCats = type === 'service' ? defaultServiceCategories : defaultProductCategories
    
    try {
      for (const name of defaultCats) {
        const categoryData = {
          name,
          description: `Categoria padrão para ${type === 'service' ? 'serviços' : 'produtos'}`,
          color: type === 'service' ? '#D15556' : '#006D5B',
          order: 0
        }

        const apiUrl = type === 'service' 
          ? '/api/service-categories' 
          : '/api/product-categories'

        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(categoryData),
        })
      }
      
      await loadCategories()
    } catch (error) {
      console.error('Erro ao adicionar categorias padrão:', error)
      alert('Erro ao adicionar categorias padrão')
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link 
                href="/admin" 
                className="text-gray-600 hover:text-black mr-4"
              >
                ← Voltar ao Admin
              </Link>
              <h1 className="text-2xl font-light text-gray-900">
                Gerenciar Categorias
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => addDefaultCategories('service')}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center"
              >
                <Tag className="w-4 h-4 mr-2" />
                Adicionar Categorias de Serviços
              </button>
              <button
                onClick={() => addDefaultCategories('product')}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <Package className="w-4 h-4 mr-2" />
                Adicionar Categorias de Produtos
              </button>
              <button
                onClick={() => {
                  setCategoryType('service')
                  setEditingCategory(null)
                  setFormData({
                    name: '',
                    description: '',
                    color: '#D15556',
                    icon: '',
                    order: 0
                  })
                  setShowModal(true)
                }}
                className="px-4 py-2 bg-[#D15556] text-white text-sm rounded hover:bg-[#c04546] transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria de Serviço
              </button>
              <button
                onClick={() => {
                  setCategoryType('product')
                  setEditingCategory(null)
                  setFormData({
                    name: '',
                    description: '',
                    color: '#006D5B',
                    icon: '',
                    order: 0
                  })
                  setShowModal(true)
                }}
                className="px-4 py-2 bg-[#006D5B] text-white text-sm rounded hover:bg-[#005a4a] transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria de Produto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Categorias</p>
                <p className="text-2xl font-semibold text-gray-900">{serviceCategories.length + productCategories.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorias de Serviços</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {serviceCategories.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categorias de Produtos</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {productCategories.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Categorias</h2>
          </div>

          {isLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D15556] mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando categorias...</p>
            </div>
          ) : serviceCategories.length === 0 && productCategories.length === 0 ? (
            <div className="p-6 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma categoria encontrada</p>
              <p className="text-sm text-gray-500 mt-1">
                Clique em &quot;Nova Categoria&quot; para começar
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Categorias de Serviços */}
                  {serviceCategories.map((category) => (
                    <tr key={`service-${category._id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Serviço
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(category, 'service')}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.isActive ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(category, 'service')}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id, 'service')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Categorias de Produtos */}
                  {productCategories.map((category) => (
                    <tr key={`product-${category._id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          ></div>
                          <div className="text-sm font-medium text-gray-900">
                            {category.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Produto
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(category, 'product')}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {category.isActive ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(category, 'product')}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id, 'product')}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para Nova/Editar Categoria */}
      {showModal && (
        <div className="modal-container">
          <div className="modal-overlay" onClick={() => {
            setShowModal(false)
            setEditingCategory(null)
            setFormData({
              name: '',
              description: '',
              color: '#D15556',
              icon: '',
              order: 0
            })
          }} />
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Editar Categoria' : `Nova Categoria de ${categoryType === 'service' ? 'Serviço' : 'Produto'}`}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingCategory(null)
                  setFormData({
                    name: '',
                    description: '',
                    color: '#D15556',
                    icon: '',
                    order: 0
                  })
                }}
                className="modal-close-btn"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body space-y-4">
              <div className="modal-form-group">
                <label className="modal-form-label">
                  Nome da Categoria *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="modal-form-input"
                  placeholder="Nome da categoria"
                  required
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="modal-form-input modal-form-textarea"
                  placeholder="Descrição da categoria"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  Cor
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D15556]"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  Ícone (opcional)
                </label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="modal-form-input"
                  placeholder="Ex: scissors, heart, star"
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  Ordem
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  className="modal-form-input"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                    setFormData({
                      name: '',
                      description: '',
                      color: '#D15556',
                      icon: '',
                      order: 0
                    })
                  }}
                  className="modal-btn modal-btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="modal-btn modal-btn-primary flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
