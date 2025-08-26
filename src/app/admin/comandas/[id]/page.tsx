'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Trash, 
  Clock, 
  User, 
  DollarSign,
  Edit,
  Check,
  X,
  ShoppingBag,
  Scissors,
  Star
} from 'lucide-react'

// Mock data
const availableServices = [
  { id: 1, name: "Corte Feminino", price: 45.00, category: "Cortes" },
  { id: 2, name: "Hidratação", price: 50.00, category: "Tratamentos" },
  { id: 3, name: "Coloração", price: 80.00, category: "Coloração" },
  { id: 4, name: "Mechas/Luzes", price: 120.00, category: "Coloração" },
  { id: 5, name: "Maquiagem Social", price: 80.00, category: "Maquiagem" },
  { id: 6, name: "Botox Capilar", price: 120.00, category: "Tratamentos" }
]

const availableProducts = [
  { id: 1, name: "Shampoo Profissional", price: 35.00, category: "Produtos" },
  { id: 2, name: "Máscara Hidratante", price: 28.00, category: "Produtos" },
  { id: 3, name: "Óleo Capilar", price: 45.00, category: "Produtos" },
  { id: 4, name: "Condicionador", price: 32.00, category: "Produtos" },
  { id: 5, name: "Protetor Térmico", price: 38.00, category: "Produtos" }
]

export default function ComandaDetalhesPage() {
  const router = useRouter()
  const params = useParams()
  const comandaId = params.id

  const [comanda, setComanda] = useState({
    id: 1,
    clientName: "Maria Silva",
    clientPhone: "(11) 99999-1234",
    professionalName: "Ana Carolina",
    startedAt: "2024-01-15 14:00",
    status: "em_atendimento",
    services: [
      { id: 1, name: "Corte Feminino", price: 45.00, quantity: 1 },
      { id: 2, name: "Hidratação", price: 50.00, quantity: 1 }
    ],
    products: [
      { id: 1, name: "Shampoo Profissional", price: 35.00, quantity: 1 },
      { id: 2, name: "Máscara Hidratante", price: 28.00, quantity: 1 }
    ],
    observations: "",
    total: 158.00
  })

  const [showAddService, setShowAddService] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingObservations, setEditingObservations] = useState(false)
  const [newObservation, setNewObservation] = useState("")

  const updateTotal = () => {
    const servicesTotal = comanda.services.reduce((sum, service) => sum + (service.price * service.quantity), 0)
    const productsTotal = comanda.products.reduce((sum, product) => sum + (product.price * product.quantity), 0)
    const newTotal = servicesTotal + productsTotal
    
    setComanda(prev => ({ ...prev, total: newTotal }))
  }

  useEffect(() => {
    updateTotal()
  }, [comanda.services, comanda.products])

  const addService = (service: any) => {
    const existingService = comanda.services.find(s => s.id === service.id)
    
    if (existingService) {
      setComanda(prev => ({
        ...prev,
        services: prev.services.map(s => 
          s.id === service.id 
            ? { ...s, quantity: s.quantity + 1 }
            : s
        )
      }))
    } else {
      setComanda(prev => ({
        ...prev,
        services: [...prev.services, { ...service, quantity: 1 }]
      }))
    }
    setShowAddService(false)
  }

  const addProduct = (product: any) => {
    const existingProduct = comanda.products.find(p => p.id === product.id)
    
    if (existingProduct) {
      setComanda(prev => ({
        ...prev,
        products: prev.products.map(p => 
          p.id === product.id 
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      }))
    } else {
      setComanda(prev => ({
        ...prev,
        products: [...prev.products, { ...product, quantity: 1 }]
      }))
    }
    setShowAddProduct(false)
  }

  const updateQuantity = (type: 'service' | 'product', id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      if (type === 'service') {
        setComanda(prev => ({
          ...prev,
          services: prev.services.filter(s => s.id !== id)
        }))
      } else {
        setComanda(prev => ({
          ...prev,
          products: prev.products.filter(p => p.id !== id)
        }))
      }
    } else {
      if (type === 'service') {
        setComanda(prev => ({
          ...prev,
          services: prev.services.map(s => 
            s.id === id ? { ...s, quantity: newQuantity } : s
          )
        }))
      } else {
        setComanda(prev => ({
          ...prev,
          products: prev.products.map(p => 
            p.id === id ? { ...p, quantity: newQuantity } : p
          )
        }))
      }
    }
  }

  const saveObservations = () => {
    setComanda(prev => ({ ...prev, observations: newObservation }))
    setEditingObservations(false)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link 
                href="/admin/comandas" 
                className="flex items-center text-gray-600 hover:text-black mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-light text-gray-900">Comanda #{comanda.id}</h1>
                <p className="text-sm text-gray-600">{comanda.clientName}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/admin/comandas/${comanda.id}/finalizar`}
                className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors font-medium tracking-wide"
              >
                Finalizar
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Coluna Principal - Itens da Comanda */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Cliente */}
            <div className="bg-white p-6 border border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informações do Cliente
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nome</p>
                  <p className="font-medium">{comanda.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{comanda.clientPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profissional</p>
                  <p className="font-medium">{comanda.professionalName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Início</p>
                  <p className="font-medium">{comanda.startedAt}</p>
                </div>
              </div>
            </div>

            {/* Serviços */}
            <div className="bg-white p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Scissors className="w-5 h-5 mr-2" />
                  Serviços
                </h2>
                <button
                  onClick={() => setShowAddService(!showAddService)}
                  className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Adicionar
                </button>
              </div>

              {showAddService && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-medium mb-3">Selecionar Serviço</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {availableServices.map(service => (
                      <button
                        key={service.id}
                        onClick={() => addService(service)}
                        className="text-left p-3 border border-gray-200 hover:border-black transition-colors"
                      >
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-600">R$ {service.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {comanda.services.map(service => (
                  <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200">
                    <div className="flex-1">
                      <div className="font-medium">{service.name}</div>
                      <div className="text-sm text-gray-600">R$ {service.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity('service', service.id, service.quantity - 1)}
                        className="w-8 h-8 border border-gray-300 hover:border-black transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{service.quantity}</span>
                      <button
                        onClick={() => updateQuantity('service', service.id, service.quantity + 1)}
                        className="w-8 h-8 border border-gray-300 hover:border-black transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <div className="text-right ml-4">
                        <div className="font-medium">R$ {(service.price * service.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Produtos */}
            <div className="bg-white p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Produtos
                </h2>
                <button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Adicionar
                </button>
              </div>

              {showAddProduct && (
                <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="font-medium mb-3">Selecionar Produto</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {availableProducts.map(product => (
                      <button
                        key={product.id}
                        onClick={() => addProduct(product)}
                        className="text-left p-3 border border-gray-200 hover:border-black transition-colors"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-600">R$ {product.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {comanda.products.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200">
                    <div className="flex-1">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-gray-600">R$ {product.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity('product', product.id, product.quantity - 1)}
                        className="w-8 h-8 border border-gray-300 hover:border-black transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{product.quantity}</span>
                      <button
                        onClick={() => updateQuantity('product', product.id, product.quantity + 1)}
                        className="w-8 h-8 border border-gray-300 hover:border-black transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <div className="text-right ml-4">
                        <div className="font-medium">R$ {(product.price * product.quantity).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observações */}
            <div className="bg-white p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  Observações
                </h2>
                <button
                  onClick={() => setEditingObservations(!editingObservations)}
                  className="text-gray-600 hover:text-black transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              
              {editingObservations ? (
                <div>
                  <textarea
                    value={newObservation}
                    onChange={(e) => setNewObservation(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                    style={{ color: '#000000' }}
                    placeholder="Adicione observações sobre o atendimento..."
                  />
                  <div className="flex justify-end space-x-2 mt-3">
                    <button
                      onClick={() => setEditingObservations(false)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveObservations}
                      className="px-3 py-1 bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700">
                  {comanda.observations || "Nenhuma observação adicionada."}
                </p>
              )}
            </div>
          </div>

          {/* Sidebar - Resumo */}
          <div className="space-y-6">
            {/* Resumo da Comanda */}
            <div className="bg-white p-6 border border-gray-100 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Resumo da Comanda</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Serviços:</span>
                  <span>R$ {comanda.services.reduce((sum, s) => sum + (s.price * s.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Produtos:</span>
                  <span>R$ {comanda.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-medium">
                    <span>Total:</span>
                    <span>R$ {comanda.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <div>Itens: {comanda.services.length + comanda.products.length}</div>
                  <div>Tempo estimado: 75 min</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Link
                  href={`/admin/atendimentos/finalizar/${comanda.id}`}
                  className="w-full bg-black text-white py-3 px-4 hover:bg-gray-800 transition-colors font-medium tracking-wide text-center block"
                >
                  Finalizar Atendimento
                </Link>
                <Link
                  href={`/admin/comandas/${comanda.id}/editar`}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 hover:bg-gray-50 transition-colors font-medium text-center block"
                >
                  Editar Comanda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
