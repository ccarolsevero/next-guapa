'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, ShoppingBag, Package, Search, Filter } from 'lucide-react'

// Mock data para categorias
const categories = [
  { id: '1', name: 'Shampoos', description: 'Produtos para limpeza capilar', isActive: true },
  { id: '2', name: 'Condicionadores', description: 'Produtos para finalização', isActive: true },
  { id: '3', name: 'Máscaras', description: 'Tratamentos profundos', isActive: true },
  { id: '4', name: 'Cremes de Tratamento', description: 'Produtos para manutenção', isActive: true },
  { id: '5', name: 'Maquiagem', description: 'Produtos de beleza', isActive: true },
  { id: '6', name: 'Acessórios', description: 'Ferramentas e acessórios', isActive: true },
]

// Mock data para produtos
const products = [
  {
    id: '1',
    name: 'Shampoo Profissional Hidratação',
    description: 'Shampoo específico para cabelos secos e danificados. Proporciona hidratação profunda e maciez duradoura.',
    price: 45.00,
    salePrice: 38.00,
    categoryId: '1',
    category: 'Shampoos',
    imageUrl: null,
    stock: 15,
    isActive: true,
    rating: 4.8,
    reviews: 24,
    sales: 45
  },
  {
    id: '2',
    name: 'Condicionador Nutrição Intensa',
    description: 'Condicionador com proteínas e vitaminas para cabelos quebradiços. Restaura a fibra capilar.',
    price: 50.00,
    salePrice: null,
    categoryId: '2',
    category: 'Condicionadores',
    imageUrl: null,
    stock: 12,
    isActive: true,
    rating: 4.6,
    reviews: 18,
    sales: 32
  },
  {
    id: '3',
    name: 'Máscara Capilar Reconstrução',
    description: 'Tratamento profundo para cabelos finos e quebradiços. Repara danos e fortalece a fibra capilar.',
    price: 55.00,
    salePrice: 49.00,
    categoryId: '3',
    category: 'Máscaras',
    imageUrl: null,
    stock: 8,
    isActive: true,
    rating: 4.9,
    reviews: 31,
    sales: 28
  },
  {
    id: '4',
    name: 'Creme de Tratamento Sem Enxágue',
    description: 'Creme para uso diário que protege o cabelo de danos externos e mantém a hidratação.',
    price: 65.00,
    salePrice: null,
    categoryId: '4',
    category: 'Cremes de Tratamento',
    imageUrl: null,
    stock: 20,
    isActive: true,
    rating: 4.7,
    reviews: 42,
    sales: 38
  },
  {
    id: '5',
    name: 'Kit Maquiagem Completo',
    description: 'Kit com base, pó, blush, sombra e batom. Ideal para maquiagens profissionais.',
    price: 120.00,
    salePrice: 99.00,
    categoryId: '5',
    category: 'Maquiagem',
    imageUrl: null,
    stock: 5,
    isActive: true,
    rating: 4.5,
    reviews: 15,
    sales: 12
  },
  {
    id: '6',
    name: 'Escova Profissional Térmica',
    description: 'Escova com tecnologia de íons para cabelos mais lisos e brilhantes.',
    price: 85.00,
    salePrice: null,
    categoryId: '6',
    category: 'Acessórios',
    imageUrl: null,
    stock: 10,
    isActive: true,
    rating: 4.8,
    reviews: 28,
    sales: 22
  }
]

export default function ProdutosAdminPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.categoryId === selectedCategory
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'in-stock' && product.stock > 0) ||
                        (stockFilter === 'out-of-stock' && product.stock === 0) ||
                        (stockFilter === 'low-stock' && product.stock <= 5 && product.stock > 0)
    
    return matchesSearch && matchesCategory && matchesStock
  })

  // Estatísticas
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.isActive).length
  const lowStockProducts = products.filter(p => p.stock <= 5 && p.stock > 0).length
  const outOfStockProducts = products.filter(p => p.stock === 0).length
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0)

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Produtos</h1>
          <Link
            href="/admin/produtos/novo"
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Link>
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
                <ShoppingBag className="w-6 h-6 text-green-600" />
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
                <Package className="w-6 h-6 text-yellow-600" />
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
                <Package className="w-6 h-6 text-red-600" />
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
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Vendas Totais</p>
                <p className="text-2xl font-bold text-gray-900">{totalSales}</p>
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
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                style={{ color: '#000000' }}
              >
                <option value="all">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estoque</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                style={{ color: '#000000' }}
              >
                <option value="all">Todos</option>
                <option value="in-stock">Em estoque</option>
                <option value="low-stock">Estoque baixo</option>
                <option value="out-of-stock">Sem estoque</option>
              </select>
            </div>

            <div className="flex items-end">
              <Link
                href="/admin/produtos/categorias"
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center"
              >
                Gerenciar Categorias
              </Link>
            </div>
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                    Vendas
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
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Package className="w-5 h-5 text-pink-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
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
                        {product.salePrice ? (
                          <div>
                            <span className="text-pink-600 font-bold">R$ {product.salePrice.toFixed(2)}</span>
                            <span className="text-gray-500 line-through ml-2">R$ {product.price.toFixed(2)}</span>
                          </div>
                        ) : (
                          <span>R$ {product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${
                          product.stock === 0 ? 'text-red-600' :
                          product.stock <= 5 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.stock}
                        </span>
                        {product.stock <= 5 && product.stock > 0 && (
                          <span className="ml-2 text-xs text-yellow-600">Baixo</span>
                        )}
                        {product.stock === 0 && (
                          <span className="ml-2 text-xs text-red-600">Esgotado</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sales}
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
                        <Link
                          href={`/admin/produtos/${product.id}/editar`}
                          className="text-pink-600 hover:text-pink-900"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este produto?')) {
                              // Implementar exclusão
                              console.log('Excluir produto:', product.id)
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
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

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum produto encontrado</p>
            <p className="text-gray-400">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>
    </div>
  )
}
