'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Edit, 
  Trash2, 
  ShoppingBag, 
  Package, 
  Search, 
  Filter,
  Eye,
  EyeOff,
  Star,
  Tag,
  TrendingUp,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Percent,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface Product {
  _id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  discount: number
  finalPrice: number
  category: string
  imageUrl?: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  tags: string[]
  brand?: string
  sku?: string
  createdAt: string
  updatedAt: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [bulkDiscount, setBulkDiscount] = useState('')
  const [bulkPrice, setBulkPrice] = useState('')

  // Carregar produtos
  const loadProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      })

      if (searchTerm) params.append('search', searchTerm)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (statusFilter !== 'all') params.append('isActive', statusFilter === 'active' ? 'true' : 'false')

      const response = await fetch(`/api/products?${params}`)
      const data = await response.json()

      if (response.ok) {
        setProducts(data.products)
        setPagination(data.pagination)
      } else {
        console.error('Erro ao carregar produtos:', data.error)
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Carregar produtos na montagem do componente
  useEffect(() => {
    loadProducts()
  }, [pagination.page, searchTerm, selectedCategory, statusFilter])

  // Ações em lote
  const handleBulkAction = async (action: string) => {
    if (selectedProducts.length === 0) return

    try {
      const body: {
        action: string
        productIds: string[]
        data?: { discount?: number; price?: number }
      } = {
        action,
        productIds: selectedProducts
      }

      if (action === 'applyDiscount' && bulkDiscount) {
        body.data = { discount: parseFloat(bulkDiscount) }
      } else if (action === 'updatePrice' && bulkPrice) {
        body.data = { price: parseFloat(bulkPrice) }
      }

      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (response.ok) {
        alert(data.message)
        setSelectedProducts([])
        setShowBulkActions(false)
        loadProducts() // Recarregar produtos
      } else {
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro na ação em lote:', error)
      alert('Erro ao executar ação em lote')
    }
  }

  // Excluir produto
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Produto excluído com sucesso!')
        loadProducts() // Recarregar produtos
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error)
      alert('Erro ao excluir produto')
    }
  }

  // Alternar seleção de produto
  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Selecionar todos
  const selectAll = () => {
    setSelectedProducts(products.map(p => p._id))
  }

  // Desmarcar todos
  const deselectAll = () => {
    setSelectedProducts([])
  }

  // Funções para gerenciar categorias
  const handleAddCategory = () => {
    setEditingCategory(null)
    setCategoryForm({ name: '', description: '' })
    setShowCategoryModal(true)
  }

  const handleEditCategory = (categoryName: string) => {
    setEditingCategory(categoryName)
    setCategoryForm({ name: categoryName, description: '' })
    setShowCategoryModal(true)
  }

  const handleSaveCategory = () => {
    if (!categoryForm.name.trim()) {
      alert('Nome da categoria é obrigatório')
      return
    }

    if (editingCategory) {
      // Editar categoria existente - atualizar produtos
      const updatedProducts = products.map(product => 
        product.category === editingCategory 
          ? { ...product, category: categoryForm.name }
          : product
      )
      setProducts(updatedProducts)
    } else {
      // Nova categoria - apenas adicionar à lista
      if (!categories.includes(categoryForm.name)) {
        // Não precisamos fazer nada aqui pois as categorias são extraídas dos produtos
      }
    }

    setShowCategoryModal(false)
    setCategoryForm({ name: '', description: '' })
    setEditingCategory(null)
  }

  const handleDeleteCategory = (categoryName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a categoria "${categoryName}"?`)) return

    // Remover categoria dos produtos (definir como "Sem categoria")
    const updatedProducts = products.map(product => 
      product.category === categoryName 
        ? { ...product, category: 'Sem categoria' }
        : product
    )
    setProducts(updatedProducts)
  }

  const addDefaultCategories = () => {
    // Adicionar categorias padrão apenas aos produtos que não têm categoria
    const updatedProducts = products.map(product => {
      if (!product.category || product.category === 'Sem categoria' || product.category.trim() === '') {
        const randomCategory = defaultProductCategories[Math.floor(Math.random() * defaultProductCategories.length)]
        return { ...product, category: randomCategory }
      }
      return product
    })
    setProducts(updatedProducts)
  }

  // Toggle ativo/inativo
  const handleToggleActive = async (productId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus })
      })

      if (response.ok) {
        alert(`Produto ${newStatus ? 'ativado' : 'desativado'} com sucesso!`)
        loadProducts() // Recarregar produtos
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao alterar status do produto:', error)
      alert('Erro ao alterar status do produto')
    }
  }

  // Toggle destaque
  const handleToggleFeatured = async (productId: string, newStatus: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: newStatus })
      })

      if (response.ok) {
        alert(`Produto ${newStatus ? 'adicionado ao' : 'removido do'} destaque!`)
        loadProducts() // Recarregar produtos
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao alterar destaque do produto:', error)
      alert('Erro ao alterar destaque do produto')
    }
  }

  // Estatísticas
  const totalProducts = pagination.total
  const activeProducts = products.filter(p => p.isActive).length
  const lowStockProducts = products.filter(p => p.stock <= 5 && p.stock > 0).length
  const outOfStockProducts = products.filter(p => p.stock === 0).length
  const featuredProducts = products.filter(p => p.isFeatured).length

  // Categorias únicas
  const categories = Array.from(new Set(products.map(p => p.category)))
  
  // Estado para gerenciamento de categorias
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  })
  
  // Categorias padrão para produtos
  const defaultProductCategories = [
    "Shampoo", "Condicionador", "Máscara", "Óleo", "Protetor Térmico",
    "Tratamentos", "Finalizadores", "Acessórios", "Coloração", "Hidratação"
  ]

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h1>
          <div className="flex space-x-3">
            <button
              onClick={addDefaultCategories}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Tag className="w-4 h-4 mr-2" />
              Adicionar Categorias Padrão
            </button>
            <button
              onClick={handleAddCategory}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Tag className="w-4 h-4 mr-2" />
              Gerenciar Categorias
            </button>
            <Link
              href="/admin/produtos/novo"
              className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Produto
            </Link>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Produtos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">{activeProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Sem Estoque</p>
                <p className="text-2xl font-bold text-gray-900">{outOfStockProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Destaques</p>
                <p className="text-2xl font-bold text-gray-900">{featuredProducts}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <div className="flex space-x-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  style={{ color: '#000000' }}
                >
                  <option value="all">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddCategory}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Adicionar nova categoria"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                style={{ color: '#000000' }}
              >
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Ações em Lote
              </button>
            </div>
          </div>
        </div>

        {/* Ações em Lote */}
        {showBulkActions && (
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ações em Lote</h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Selecionar Todos
                </button>
                <button
                  onClick={deselectAll}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Desmarcar Todos
                </button>
              </div>
            </div>

            {selectedProducts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ativar ({selectedProducts.length})
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Desativar ({selectedProducts.length})
                </button>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Desconto %"
                    value={bulkDiscount}
                    onChange={(e) => setBulkDiscount(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => handleBulkAction('applyDiscount')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Aplicar
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Novo preço"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <button
                    onClick={() => handleBulkAction('updatePrice')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Atualizar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tabela de Produtos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando produtos...</p>
            </div>
          ) : (
            <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedProducts.length === products.length && products.length > 0}
                          onChange={selectedProducts.length === products.length ? deselectAll : selectAll}
                          className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                        />
                      </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
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
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product._id)}
                            onChange={() => toggleProductSelection(product._id)}
                            className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                          />
                        </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="h-8 w-8 rounded object-cover" />
                              ) : (
                          <Package className="w-5 h-5 text-pink-600" />
                              )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                              {product.isFeatured && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                                  <Star className="w-3 h-3 mr-1" />
                                  Destaque
                                </span>
                              )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                            {product.discount > 0 ? (
                          <div>
                                <span className="line-through text-gray-500">R$ {product.price.toFixed(2)}</span>
                                <br />
                                <span className="text-green-600 font-medium">R$ {product.finalPrice.toFixed(2)}</span>
                                <span className="text-red-600 text-xs ml-1">-{product.discount}%</span>
                          </div>
                        ) : (
                          <span>R$ {product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {product.stock > 0 ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.stock <= 5 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {product.stock} unidades
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Sem estoque
                        </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        product.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                            {/* Toggle Ativo/Inativo */}
                            <button
                              onClick={() => handleToggleActive(product._id, !product.isActive)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                product.isActive 
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                              title={product.isActive ? 'Desativar produto' : 'Ativar produto'}
                            >
                              {product.isActive ? 'Ativo' : 'Inativo'}
                            </button>
                            
                            {/* Toggle Destaque */}
                            <button
                              onClick={() => handleToggleFeatured(product._id, !product.isFeatured)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                product.isFeatured 
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                              }`}
                              title={product.isFeatured ? 'Remover destaque' : 'Adicionar destaque'}
                            >
                              <Star className={`w-3 h-3 ${product.isFeatured ? 'fill-current' : ''}`} />
                            </button>
                            
                        <Link
                              href={`/admin/produtos/editar/${product._id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar produto"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                              onClick={() => handleDeleteProduct(product._id)}
                          className="text-red-600 hover:text-red-900"
                              title="Excluir produto"
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

              {/* Paginação */}
              {pagination.pages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                      disabled={pagination.page === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Próxima
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                        <span className="font-medium">
                          {Math.min(pagination.page * pagination.limit, pagination.total)}
                        </span> de{' '}
                        <span className="font-medium">{pagination.total}</span> resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                          const page = i + 1
                          return (
                            <button
                              key={page}
                              onClick={() => setPagination(prev => ({ ...prev, page }))}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                page === pagination.page
                                  ? 'z-10 bg-pink-50 border-pink-500 text-pink-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        })}
                        <button
                          onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                          disabled={pagination.page === pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
          </div>
        </div>
          </div>
        )}
            </>
          )}
        </div>
      </div>

      {/* Modal para Gerenciar Categorias */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900">
                  Gerenciar Categorias de Produtos
                </h3>
                <button
                  onClick={() => {
                    setShowCategoryModal(false)
                    setCategoryForm({ name: '', description: '' })
                    setEditingCategory(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Formulário para nova categoria */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Categoria *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Nome da categoria"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <input
                      type="text"
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Descrição da categoria"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSaveCategory}
                    className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingCategory ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </div>

              {/* Lista de categorias existentes */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Categorias Existentes</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produtos
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category) => (
                        <tr key={category} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {category}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {products.filter(p => p.category === category).length} produtos
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="text-blue-600 hover:text-blue-900 p-1"
                                title="Editar categoria"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Excluir categoria"
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
