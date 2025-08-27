'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ShoppingBag, Search, Filter, Plus, Minus, ArrowLeft } from 'lucide-react'
import Image from 'next/image'

// Mock data
const products = [
  {
    id: 1,
    name: "Shampoo Profissional",
    description: "Shampoo específico para seu tipo de cabelo",
    price: 45.00,
    category: "shampoo",
    inStock: true,
    image: "/placeholder.jpg"
  },
  {
    id: 2,
    name: "Creme de Tratamento",
    description: "Hidratação profunda para cabelos danificados",
    price: 65.00,
    category: "tratamento",
    inStock: true,
    image: "/placeholder.jpg"
  },
  {
    id: 3,
    name: "Máscara Capilar",
    description: "Reconstrução profunda para cabelos finos",
    price: 55.00,
    category: "tratamento",
    inStock: true,
    image: "/placeholder.jpg"
  },
  {
    id: 4,
    name: "Condicionador Nourish",
    description: "Condicionador nutritivo para cabelos secos",
    price: 40.00,
    category: "condicionador",
    inStock: true,
    image: "/placeholder.jpg"
  },
  {
    id: 5,
    name: "Óleo Capilar",
    description: "Óleo reparador para pontas duplas",
    price: 35.00,
    category: "oleo",
    inStock: true,
    image: "/placeholder.jpg"
  },
  {
    id: 6,
    name: "Kit Maquiagem Profissional",
    description: "Kit completo para maquiagem profissional",
    price: 120.00,
    category: "maquiagem",
    inStock: true,
    image: "/placeholder.jpg"
  }
]

const categories = [
  { id: "all", name: "Todos" },
  { id: "shampoo", name: "Shampoo" },
  { id: "tratamento", name: "Tratamento" },
  { id: "condicionador", name: "Condicionador" },
  { id: "oleo", name: "Óleo" },
  { id: "maquiagem", name: "Maquiagem" }
]

export default function ProdutosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [cart, setCart] = useState<{[key: number]: number}>({})
  const [showCart, setShowCart] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }))
  }

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const newCart = { ...prev }
      if (newCart[productId] && newCart[productId] > 1) {
        newCart[productId] -= 1
      } else {
        delete newCart[productId]
      }
      return newCart
    })
  }

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === parseInt(productId))
      return total + (product?.price || 0) * quantity
    }, 0)
  }

  const getCartItemCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#022b28' }}>
      {/* Header */}
      <header className="bg-[#D15556] border-b border-[#c04546] fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="/assents/logonavbar.svg" 
                  alt="Espaço Guapa" 
                  style={{ 
                    height: '60px', 
                    width: 'auto'
                  }}
                />
              </Link>
            </div>
            <nav className="hidden md:flex space-x-12">
              <Link href="/" className="text-white hover:text-[#EED7B6] transition-colors font-medium">
                Início
              </Link>
              <Link href="/servicos" className="text-white hover:text-[#EED7B6] transition-colors font-medium">
                Serviços
              </Link>
              <Link href="/profissionais" className="text-white hover:text-[#EED7B6] transition-colors font-medium">
                Nosso Time
              </Link>
              <Link href="/produtos" className="text-white hover:text-[#EED7B6] transition-colors font-medium">
                Produtos
              </Link>
            </nav>
            <Link 
              href="/agendamento"
              className="bg-white text-[#D15556] px-8 py-3 rounded-lg hover:bg-[#EED7B6] transition-colors font-medium tracking-wide"
            >
              Agendar
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer para compensar navbar fixa */}
      <div className="h-20"></div>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-white to-[#EED7B6]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-light text-gray-900 mb-6">Nossos Produtos</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Leve a qualidade do Espaço Guapa para casa. Produtos profissionais selecionados para cuidar da sua beleza.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 bg-white text-black font-medium focus:ring-[#D15556] focus:border-[#D15556] focus:outline-none transition-colors rounded-lg"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 border transition-colors rounded-lg ${
                    selectedCategory === category.id
                      ? 'bg-[#D15556] text-white border-[#D15556]'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-[#D15556] hover:text-[#D15556]'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white border border-gray-100 overflow-hidden hover:border-[#D15556] transition-colors group">
                <div className="h-64 bg-[#EED7B6]/20 flex items-center justify-center">
                  <ShoppingBag className="w-20 h-20 text-[#D15556] group-hover:text-[#D15556] transition-colors" />
                </div>
                <div className="p-8">
                  <h3 className="text-xl font-light text-gray-900 mb-3">{product.name}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-light text-[#D15556]">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                    <button
                      onClick={() => addToCart(product.id)}
                      className="border border-[#D15556] text-[#D15556] px-6 py-2 font-medium hover:bg-[#D15556] hover:text-white transition-colors rounded-lg"
                    >
                      Fazer Pedido
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">Nenhum produto encontrado com os filtros selecionados.</p>
            </div>
          )}
        </div>
      </section>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-light text-gray-900">Seu Pedido</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {Object.keys(cart).length === 0 ? (
                <p className="text-gray-600 text-center py-8">Seu pedido está vazio.</p>
              ) : (
                <div className="space-y-4">
                  {Object.entries(cart).map(([productId, quantity]) => {
                    const product = products.find(p => p.id === parseInt(productId))
                    if (!product) return null
                    
                    return (
                      <div key={productId} className="flex items-center justify-between p-4 border border-gray-100">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product.name}</h4>
                          <p className="text-sm text-gray-600">R$ {product.price.toFixed(2).replace('.', ',')} cada</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => removeFromCart(product.id)}
                              className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-[#D15556] hover:text-[#D15556] transition-colors rounded-lg"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => addToCart(product.id)}
                              className="w-8 h-8 border border-gray-300 flex items-center justify-center hover:border-[#D15556] hover:text-[#D15556] transition-colors rounded-lg"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="font-medium text-[#D15556]">
                            R$ {(product.price * quantity).toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  
                  <div className="border-t border-gray-100 pt-4">
                    <div className="flex justify-between items-center text-lg font-medium">
                      <span>Total:</span>
                      <span className="text-[#D15556]">R$ {getCartTotal().toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-4 pt-6">
                    <button
                      onClick={() => setShowCart(false)}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      Continuar Comprando
                    </button>
                    <Link
                      href="/produtos/finalizar"
                      className="flex-1 bg-[#D15556] text-white py-3 hover:bg-[#c04546] transition-colors text-center rounded-lg"
                    >
                      Enviar Pedido
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-gray-900 py-16 border-t border-[#D15556]" style={{ backgroundColor: '#F5F0E8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <h3 className="text-2xl font-light text-gray-900 mb-6">Espaço Guapa</h3>
              <p className="text-gray-600 leading-relaxed">
                Transformando vidas através da beleza e autoestima.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-6">Links Rápidos</h4>
              <ul className="space-y-3">
                <li><Link href="/servicos" className="text-gray-600 hover:text-[#D15556] transition-all duration-300">Serviços</Link></li>
                <li><Link href="/profissionais" className="text-gray-600 hover:text-[#D15556] transition-all duration-300">Profissionais</Link></li>
                <li><Link href="/agendamento" className="text-gray-600 hover:text-[#D15556] transition-all duration-300">Agendamento</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-6">Contato</h4>
              <div className="space-y-3 text-gray-600">
                <p>Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP</p>
                <p>(11) 99999-9999</p>
                <p>contato@espacoguapa.com</p>
              </div>
            </div>
          </div>
          <div className="border-t border-[#EED7B6] mt-12 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Espaço Guapa. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
