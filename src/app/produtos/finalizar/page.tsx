'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, ArrowLeft, CheckCircle, Phone, Mail, MapPin } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function FinalizarPedidoPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  })

  // Mock cart data - em uma aplicação real, isso viria do contexto ou localStorage
  const cart: CartItem[] = [
    { id: '1', name: 'Shampoo Profissional Hidratação', price: 38.00, quantity: 1 },
    { id: '3', name: 'Máscara Capilar Reconstrução', price: 49.00, quantity: 2 }
  ]

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aqui você enviaria os dados para o backend
    console.log('Pedido finalizado:', { formData, cart })
    setStep(3)
  }

  const isFormValid = formData.name && formData.phone

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/produtos" className="flex items-center text-gray-600 hover:text-pink-600">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar aos Produtos
            </Link>
            <h1 className="text-2xl font-bold text-pink-600">Finalizar Pedido</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 1 ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-300'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Carrinho</span>
            </div>
            <div className={`w-16 h-1 ${step >= 2 ? 'bg-pink-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 2 ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-300'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Dados</span>
            </div>
            <div className={`w-16 h-1 ${step >= 3 ? 'bg-pink-600' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step >= 3 ? 'text-pink-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step >= 3 ? 'bg-pink-600 border-pink-600 text-white' : 'border-gray-300'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Confirmação</span>
            </div>
          </div>
        </div>

        {step === 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Seu Carrinho</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Seu carrinho está vazio</p>
                <Link 
                  href="/produtos"
                  className="mt-4 inline-block bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
                >
                  Continuar Comprando
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-gray-600">Quantidade: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-pink-600">
                          R$ {(item.price * item.quantity).toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500">R$ {item.price.toFixed(2)} cada</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Total:</span>
                    <span className="text-2xl font-bold text-pink-600">
                      R$ {getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Link 
                    href="/produtos"
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                  >
                    Continuar Comprando
                  </Link>
                  <button
                    onClick={() => setStep(2)}
                    className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700"
                  >
                    Enviar Pedido
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Dados para Entrega</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="seu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="00000-000"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Rua, número e complemento"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Sua cidade"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="SP"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Alguma informação adicional sobre o pedido..."
                  />
                </div>
              </div>
              
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold">Total do Pedido:</span>
                  <span className="text-2xl font-bold text-pink-600">
                    R$ {getCartTotal().toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Confirmar Pedido
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pedido Enviado!</h2>
            <p className="text-gray-600 mb-6">
              Obrigado pelo seu pedido! Entraremos em contato em breve para confirmar os detalhes e formas de pagamento.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resumo do Pedido</h3>
              <div className="space-y-2 text-left">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-semibold">R$ {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 mt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span className="text-pink-600">R$ {getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-center text-gray-600">
                <Phone className="w-5 h-5 mr-2" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <Mail className="w-5 h-5 mr-2" />
                <span>contato@espacoguapa.com</span>
              </div>
              <div className="flex items-center justify-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                <span>Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP</span>
              </div>
            </div>
            
            <div className="mt-8">
              <Link 
                href="/produtos"
                className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
