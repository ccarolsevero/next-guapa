'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Upload, X } from 'lucide-react'

interface ProductCategory {
  _id: string
  name: string
  description?: string
  isActive: boolean
  order: number
}

export default function NovoProdutoPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    commissionValue: '',
    discount: '',
    category: '', // Será definida quando as categorias carregarem
    imageUrl: '',
    stock: '',
    isActive: true,
    isFeatured: false,
    tags: '',
    brand: '',
  })

  // Carregar categorias do banco de dados
  const loadCategories = async () => {
    try {
      console.log('🔄 Iniciando carregamento de categorias...')
      setCategoriesLoading(true)
      
      // Teste direto da URL
      const url = '/api/product-categories?active=true'
      console.log('🌐 Fazendo requisição para:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      console.log('📡 Response status:', response.status)
      console.log('📡 Response ok:', response.ok)
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (response.ok) {
        const data = await response.json()
        console.log('📋 Categorias de produtos carregadas:', data)
        console.log('📊 Total de categorias:', data.length)
        setCategories(data)
        
        // Definir a primeira categoria como selecionada se não houver nenhuma selecionada
        if (data.length > 0) {
          setFormData(prev => ({
            ...prev,
            category: prev.category || data[0].name
          }))
          console.log('🎯 Primeira categoria selecionada:', data[0].name)
        }
      } else {
        console.error('❌ Erro ao carregar categorias de produtos - Status:', response.status)
        const errorText = await response.text()
        console.error('❌ Erro response:', errorText)
        
        // Fallback para categorias padrão
        const fallbackCategories = [
          { _id: '1', name: 'Geral', isActive: true, order: 1 },
          { _id: '2', name: 'Shampoos', isActive: true, order: 2 },
          { _id: '3', name: 'Condicionadores', isActive: true, order: 3 },
          { _id: '4', name: 'Máscaras', isActive: true, order: 4 },
          { _id: '5', name: 'Cremes de Tratamento', isActive: true, order: 5 },
          { _id: '6', name: 'Maquiagem', isActive: true, order: 6 },
          { _id: '7', name: 'Acessórios', isActive: true, order: 7 }
        ]
        console.log('🔄 Usando categorias fallback:', fallbackCategories)
        setCategories(fallbackCategories)
        
        // Definir a primeira categoria fallback como selecionada
        setFormData(prev => ({
          ...prev,
          category: prev.category || fallbackCategories[0].name
        }))
        console.log('🎯 Primeira categoria fallback selecionada:', fallbackCategories[0].name)
      }
    } catch (error) {
      console.error('❌ Erro ao carregar categorias de produtos:', error)
      
      // Fallback para categorias padrão
      const fallbackCategories = [
        { _id: '1', name: 'Geral', isActive: true, order: 1 },
        { _id: '2', name: 'Shampoos', isActive: true, order: 2 },
        { _id: '3', name: 'Condicionadores', isActive: true, order: 3 },
        { _id: '4', name: 'Máscaras', isActive: true, order: 4 },
        { _id: '5', name: 'Cremes de Tratamento', isActive: true, order: 5 },
        { _id: '6', name: 'Maquiagem', isActive: true, order: 6 },
        { _id: '7', name: 'Acessórios', isActive: true, order: 7 }
      ]
      console.log('🔄 Usando categorias fallback após erro:', fallbackCategories)
      setCategories(fallbackCategories)
      
      // Definir a primeira categoria fallback como selecionada
      setFormData(prev => ({
        ...prev,
        category: prev.category || fallbackCategories[0].name
      }))
      console.log('🎯 Primeira categoria fallback após erro selecionada:', fallbackCategories[0].name)
    } finally {
      console.log('✅ Finalizando carregamento de categorias')
      setCategoriesLoading(false)
    }
  }

  // Carregar categorias quando o componente montar
  useEffect(() => {
    console.log('🚀 useEffect executado - carregando categorias')
    loadCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('🔄 Iniciando criação do produto...')
      console.log('📋 Dados do formulário:', formData)

      // Validações básicas
      if (!formData.name.trim()) {
        alert('Nome do produto é obrigatório')
        return
      }

      if (!formData.price || isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
        alert('Preço deve ser um número válido e maior que zero')
        return
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: parseFloat(formData.price), // Usar o preço como preço original
        costPrice: formData.costPrice && formData.costPrice !== '' ? parseFloat(formData.costPrice) : 0,
        commissionValue: formData.commissionValue && formData.commissionValue !== '' ? parseFloat(formData.commissionValue) : 0,
        discount: formData.discount && formData.discount !== '' ? parseFloat(formData.discount) : 0,
        stock: parseInt(formData.stock) || 0,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : []
      }

      console.log('📦 Dados processados para envio:', productData)

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
      })

      console.log('📡 Resposta da API:', response.status, response.ok)

      const data = await response.json()
      console.log('📄 Dados da resposta:', data)

      if (response.ok) {
        alert('Produto criado com sucesso!')
        router.push('/admin/produtos')
      } else {
        console.error('❌ Erro na API:', data)
        alert(`Erro: ${data.error || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error)
      alert(`Erro ao criar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center mb-6">
          <Link
            href="/admin/produtos"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Novo Produto</h1>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                  disabled={categoriesLoading}
                >
                  {categoriesLoading ? (
                    <option value="">Carregando categorias...</option>
                  ) : categories.length === 0 ? (
                    <option value="">Nenhuma categoria encontrada</option>
                  ) : (
                    categories.map((category) => (
                      <option key={category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))
                  )}
                </select>
                {/* Debug info */}
                <div className="text-xs text-gray-500 mt-1">
                  Debug: {categoriesLoading ? 'Carregando...' : `${categories.length} categorias carregadas`}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço de Venda *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço de Custo
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor da Comissão (%)
                </label>
                <input
                  type="number"
                  name="commissionValue"
                  value={formData.commissionValue}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                  placeholder="0.00"
                />
              </div>



              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desconto (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estoque
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                  style={{ color: '#000000' }}
                />
              </div>

            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#000000' }}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Ex: hidratação, cabelos secos, profissional"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#000000' }}
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL da Imagem
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://exemplo.com/imagem.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                style={{ color: '#000000' }}
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Produto ativo
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Produto em destaque
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Link
              href="/admin/produtos"
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Produto
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
