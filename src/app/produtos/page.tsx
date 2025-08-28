'use client'

import LayoutPublic from '../layout-public'
import { useState, useEffect } from 'react'
import { Package, Star, ShoppingCart } from 'lucide-react'

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

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")

  // Carregar produtos ativos
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/products?isActive=true&limit=100')
        const data = await response.json()
        
        if (response.ok) {
          setProducts(data.products)
        } else {
          console.error('Erro ao carregar produtos:', data.error)
        }
      } catch (error) {
        console.error('Erro ao carregar produtos:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  // Obter categorias únicas dos produtos
  const categories = ["Todos", ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <LayoutPublic>
      {/* Hero Section */}
      <section className="pt-24 pb-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
              Nossa Lojinha
            </h1>
            <p className="text-lg md:text-xl leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
              Produtos profissionais Keune para cuidar dos seus cabelos em casa
            </p>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Busca */}
            <div className="w-full md:w-96">
              <input
                type="text"
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-white/20 bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#d34d4c]"
                style={{ color: '#f2dcbc' }}
              />
            </div>

            {/* Categorias */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#d34d4c] text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Produtos */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: '#f2dcbc' }}>
                Nenhum produto encontrado com os filtros selecionados.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:scale-105 border border-white/20">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-[#d34d4c] rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-2" style={{ color: '#f2dcbc' }}>
                      {product.name}
                    </h3>
                    <p className="text-sm font-medium text-[#d34d4c] mb-2">
                      {product.category}
                    </p>
                    <p className="text-base leading-relaxed font-body" style={{ color: '#f2dcbc' }}>
                      {product.description}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-light text-[#d34d4c] mb-4">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </p>
                    <a 
                      href="/login-cliente"
                      className="w-full bg-[#d34d4c] text-white py-2 px-4 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 font-medium text-center block"
                    >
                      Comprar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-24 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 font-heading" style={{ color: '#f2dcbc' }}>
            Precisa de Aconselhamento?
          </h2>
          <p className="text-lg md:text-xl leading-relaxed font-body mb-8" style={{ color: '#f2dcbc' }}>
            Nossos profissionais podem ajudar você a escolher os produtos ideais para o seu cabelo.
          </p>
          <a 
            href="/login-cliente"
            className="bg-[#d34d4c] text-white px-8 py-4 rounded-lg hover:bg-[#b83e3d] transition-all duration-300 transform hover:scale-105 font-medium tracking-wide shadow-md hover:shadow-lg inline-block"
          >
            Agendar Consulta
          </a>
        </div>
      </section>
    </LayoutPublic>
  )
}
