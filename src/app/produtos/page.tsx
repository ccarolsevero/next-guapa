'use client'

import LayoutPublic from '../layout-public'
import { useState } from 'react'

const products = [
  {
    id: 1,
    name: "Shampoo Keune Care",
    category: "Limpeza",
    price: 45.00,
    description: "Shampoo profissional para todos os tipos de cabelo, com fórmula suave e hidratante.",
    image: "/product1.jpg"
  },
  {
    id: 2,
    name: "Condicionador Keune Care",
    category: "Tratamento",
    price: 42.00,
    description: "Condicionador hidratante que nutre e desembaraça os fios, deixando-os macios e brilhantes.",
    image: "/product2.jpg"
  },
  {
    id: 3,
    name: "Máscara Keune So Pure",
    category: "Tratamento",
    price: 65.00,
    description: "Máscara de reparação profunda que fortalece e regenera cabelos danificados.",
    image: "/product3.jpg"
  },
  {
    id: 4,
    name: "Óleo Keune Care",
    category: "Finalização",
    price: 38.00,
    description: "Óleo de argan puro que protege, hidrata e adiciona brilho aos cabelos.",
    image: "/product4.jpg"
  },
  {
    id: 5,
    name: "Protetor Térmico Keune",
    category: "Proteção",
    price: 52.00,
    description: "Protetor térmico que protege os fios do calor de secadores e chapinhas.",
    image: "/product5.jpg"
  },
  {
    id: 6,
    name: "Spray Keune So Pure",
    category: "Finalização",
    price: 35.00,
    description: "Spray de finalização que fixa o penteado e mantém os fios saudáveis.",
    image: "/product6.jpg"
  }
]

const categories = ["Todos", "Limpeza", "Tratamento", "Finalização", "Proteção"]

export default function ProdutosPage() {
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === "Todos" || product.category === selectedCategory
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase())
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
