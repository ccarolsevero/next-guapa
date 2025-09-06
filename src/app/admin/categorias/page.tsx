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

interface Category {
  _id: string
  name: string
  type: 'service' | 'product'
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'service' as 'service' | 'product',
    description: ''
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
      // Simular carregamento de categorias do banco
      // Aqui você conectaria com sua API real
      const mockCategories: Category[] = [
        {
          _id: '1',
          name: 'Cortes',
          type: 'service',
          description: 'Cortes femininos e masculinos',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          name: 'Coloração',
          type: 'service',
          description: 'Serviços de coloração capilar',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          name: 'Shampoo',
          type: 'product',
          description: 'Produtos para limpeza capilar',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setCategories(mockCategories)
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
      if (editingCategory) {
        // Editar categoria existente
        const updatedCategories = categories.map(cat => 
          cat._id === editingCategory._id 
            ? { ...cat, ...formData, updatedAt: new Date().toISOString() }
            : cat
        )
        setCategories(updatedCategories)
      } else {
        // Nova categoria
        const newCategory: Category = {
          _id: Date.now().toString(),
          ...formData,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setCategories(prev => [...prev, newCategory])
      }

      // Limpar formulário e fechar modal
      setFormData({ name: '', type: 'service', description: '' })
      setEditingCategory(null)
      setShowModal(false)
    } catch (error) {
      console.error('Erro ao salvar categoria:', error)
      alert('Erro ao salvar categoria')
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      type: category.type,
      description: category.description
    })
    setShowModal(true)
  }

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return

    try {
      const updatedCategories = categories.filter(cat => cat._id !== categoryId)
      setCategories(updatedCategories)
    } catch (error) {
      console.error('Erro ao excluir categoria:', error)
      alert('Erro ao excluir categoria')
    }
  }

  const toggleActive = (categoryId: string) => {
    const updatedCategories = categories.map(cat => 
      cat._id === categoryId 
        ? { ...cat, isActive: !cat.isActive, updatedAt: new Date().toISOString() }
        : cat
    )
    setCategories(updatedCategories)
  }

  const addDefaultCategories = (type: 'service' | 'product') => {
    const defaultCats = type === 'service' ? defaultServiceCategories : defaultProductCategories
    
    const newCategories: Category[] = defaultCats.map(name => ({
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name,
      type,
      description: `Categoria padrão para ${type === 'service' ? 'serviços' : 'produtos'}`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }))

    setCategories(prev => [...prev, ...newCategories])
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
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-[#D15556] text-white text-sm rounded hover:bg-[#c04546] transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
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
                <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
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
                  {categories.filter(c => c.type === 'service').length}
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
                  {categories.filter(c => c.type === 'product').length}
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
          ) : categories.length === 0 ? (
            <div className="p-6 text-center">
              <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma categoria encontrada</p>
              <p className="text-sm text-gray-500 mt-1">
                Clique em "Nova Categoria" para começar
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
                  {categories.map((category) => (
                    <tr key={category._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          category.type === 'service' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {category.type === 'service' ? 'Serviço' : 'Produto'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleActive(category._id)}
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
                            onClick={() => handleEdit(category)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
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
            setFormData({ name: '', type: 'service', description: '' })
          }} />
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingCategory(null)
                  setFormData({ name: '', type: 'service', description: '' })
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
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'service' | 'product' }))}
                  className="modal-form-input"
                >
                  <option value="service">Serviço</option>
                  <option value="product">Produto</option>
                </select>
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

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                    setFormData({ name: '', type: 'service', description: '' })
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
