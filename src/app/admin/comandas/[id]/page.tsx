'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
// import Prontuario from '@/models/Prontuario'
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

export default function ComandaDetalhesPage() {
  // Estados para dados do banco
  const [availableServices, setAvailableServices] = useState<Array<{_id: string, name: string, price: number, category: string}>>([])
  const [availableProducts, setAvailableProducts] = useState<Array<{_id: string, name: string, price: number, category: string, stock: number}>>([])
  const [availableProfessionals, setAvailableProfessionals] = useState<Array<{_id: string, name: string}>>([])
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
      { id: 1, name: "Shampoo Profissional", price: 35.00, quantity: 1, soldBy: "Ana Carolina" },
      { id: 2, name: "Máscara Hidratante", price: 28.00, quantity: 1, soldBy: "Bruna" }
    ],
    observations: "",
    total: 158.00
  })

  const [showAddService, setShowAddService] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editingObservations, setEditingObservations] = useState(false)
  const [newObservation, setNewObservation] = useState("")
  const [editingProntuario, setEditingProntuario] = useState(false)
  const [prontuario, setProntuario] = useState({
    historicoProcedimentos: "",
    reacoesEfeitos: "",
    recomendacoes: "",
    proximaSessao: "",
    observacoesAdicionais: ""
  })
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string>('')
  const [editingProductVendor, setEditingProductVendor] = useState<number | null>(null)

  const updateTotal = () => {
    const servicesTotal = comanda.services.reduce((sum, service) => sum + (service.price * service.quantity), 0)
    const productsTotal = comanda.products.reduce((sum, product) => sum + (product.price * product.quantity), 0)
    const newTotal = servicesTotal + productsTotal
    
    setComanda(prev => ({ ...prev, total: newTotal }))
  }

  useEffect(() => {
    updateTotal()
  }, [comanda.services, comanda.products])

  // Buscar dados do banco
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔄 Iniciando busca de dados...')
        
        // Buscar profissionais
        console.log('👩‍💼 Buscando profissionais...')
        const professionalsResponse = await fetch('/api/professionals')
        console.log('👩‍💼 Resposta da API de profissionais:', professionalsResponse.status)
        
        if (professionalsResponse.ok) {
          const data = await professionalsResponse.json()
          console.log('👩‍💼 Dados brutos da API de profissionais:', data)
          setAvailableProfessionals(data.professionals || data)
          console.log('👩‍💼 Profissionais carregados:', data.professionals?.length || data.length || 0)
        } else {
          console.error('❌ Erro na API de profissionais:', professionalsResponse.status)
          const errorText = await professionalsResponse.text()
          console.error('❌ Detalhes do erro:', errorText)
        }

        // Buscar serviços
        console.log('✂️ Buscando serviços...')
        const servicesResponse = await fetch('/api/services')
        console.log('✂️ Resposta da API de serviços:', servicesResponse.status)
        
        if (servicesResponse.ok) {
          const data = await servicesResponse.json()
          console.log('✂️ Dados brutos da API de serviços:', data)
          setAvailableServices(data.services || data)
          console.log('✂️ Serviços carregados:', data.services?.length || data.length || 0)
        } else {
          console.error('❌ Erro na API de serviços:', servicesResponse.status)
          const errorText = await servicesResponse.text()
          console.error('❌ Detalhes do erro:', errorText)
        }

        // Buscar produtos
        console.log('🛍️ Buscando produtos...')
        const productsResponse = await fetch('/api/products')
        if (productsResponse.ok) {
          const data = await productsResponse.json()
          setAvailableProducts(data.products || [])
          console.log('🛍️ Produtos carregados:', data.products?.length || 0)
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados:', error)
      }
    }

    fetchData()
  }, [])

  const addService = (service: any) => {
    const existingService = comanda.services.find(s => s.id === service._id)
    
    if (existingService) {
      setComanda(prev => ({
        ...prev,
        services: prev.services.map(s => 
          s.id === service._id 
            ? { ...s, quantity: s.quantity + 1 }
            : s
        )
      }))
    } else {
      setComanda(prev => ({
        ...prev,
        services: [...prev.services, { 
          id: service._id,
          name: service.name, 
          price: service.price, 
          quantity: 1 
        }]
      }))
    }
    setShowAddService(false)
  }

  const addProduct = async (product: any, soldByProfessionalId?: string, soldByProfessionalName?: string) => {
    try {
      // Verificar estoque antes de adicionar
      const response = await fetch(`/api/products/update-stock?productIds=${product._id}`)
      if (response.ok) {
        const stockData = await response.json()
        const productStock = stockData.products[0]
        
        if (!productStock || productStock.stock <= 0) {
          alert(`Produto ${product.name} está sem estoque!`)
          return
        }
        
        if (productStock.stock < 1) {
          alert(`Produto ${product.name} tem apenas ${productStock.stock} unidades em estoque!`)
          return
        }
      }

      const existingProduct = comanda.products.find(p => p.id === product._id)
      
      if (existingProduct) {
        setComanda(prev => ({
          ...prev,
          products: prev.products.map(p => 
            p.id === product._id 
              ? { ...p, quantity: p.quantity + 1 }
              : p
          )
        }))
      } else {
        setComanda(prev => ({
          ...prev,
          products: [...prev.products, { 
            id: product._id,
            name: product.name, 
            price: product.price, 
            quantity: 1, 
            soldBy: soldByProfessionalName || comanda.professionalName,
            soldById: soldByProfessionalId || comanda.professionalId
          }]
        }))
      }
      setShowAddProduct(false)
    } catch (error) {
      console.error('Erro ao verificar estoque:', error)
      alert('Erro ao verificar estoque do produto')
    }
  }

  const updateQuantity = async (type: 'service' | 'product', id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      if (type === 'service') {
        setComanda(prev => ({
          ...prev,
          services: prev.services.filter(s => s.id !== id)
        }))
      } else {
        // Remover produto da comanda
        const productToRemove = comanda.products.find(p => p.id === id)
        if (productToRemove) {
          // Restaurar estoque do produto removido
          try {
            await fetch('/api/products/update-stock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                products: [{
                  productId: productToRemove.id,
                  quantity: -productToRemove.quantity, // Quantidade negativa para restaurar
                  productName: productToRemove.name
                }]
              })
            })
          } catch (error) {
            console.error('Erro ao restaurar estoque:', error)
          }
        }
        
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
        // Atualizar quantidade de produto
        const productToUpdate = comanda.products.find(p => p.id === id)
        if (productToUpdate) {
          const quantityDifference = newQuantity - productToUpdate.quantity
          
          if (quantityDifference !== 0) {
            try {
              // Verificar se tem estoque suficiente para o aumento
              if (quantityDifference > 0) {
                const response = await fetch(`/api/products/update-stock?productIds=${productToUpdate.id}`)
                if (response.ok) {
                  const stockData = await response.json()
                  const productStock = stockData.products[0]
                  
                  if (productStock.stock < quantityDifference) {
                    alert(`Produto ${productToUpdate.name} não tem estoque suficiente! Disponível: ${productStock.stock}`)
                    return
                  }
                }
              }
              
              // Atualizar estoque
              await fetch('/api/products/update-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  products: [{
                    productId: productToUpdate.id,
                    quantity: quantityDifference,
                    productName: productToUpdate.name
                  }]
                })
              })
            } catch (error) {
              console.error('Erro ao atualizar estoque:', error)
              alert('Erro ao atualizar estoque do produto')
              return
            }
          }
        }
        
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

  const updateProductVendor = async (productId: number, newVendorId: string) => {
    try {
      const professional = availableProfessionals.find(p => p._id === newVendorId)
      if (professional) {
        setComanda(prev => ({
          ...prev,
          products: prev.products.map(p => 
            p.id === productId 
              ? { ...p, soldBy: professional.name, soldById: professional._id }
              : p
          )
        }))
        setEditingProductVendor(null)
      }
    } catch (error) {
      console.error('Erro ao atualizar vendedora:', error)
      alert('Erro ao atualizar vendedora')
    }
  }

  const saveProntuario = async () => {
    try {
      // Preparar dados para salvar
      const prontuarioData = {
        clientId: comanda.clientId, // Assumindo que temos o ID do cliente
        comandaId: comandaId,
        professionalId: comanda.professionalId, // Assumindo que temos o ID do profissional
        historicoProcedimentos: prontuario.historicoProcedimentos,
        reacoesEfeitos: prontuario.reacoesEfeitos,
        recomendacoes: prontuario.recomendacoes,
        proximaSessao: prontuario.proximaSessao,
        observacoesAdicionais: prontuario.observacoesAdicionais,
        servicosRealizados: comanda.services.map(service => ({
          servicoId: service.id,
          nome: service.name,
          preco: service.price,
          quantidade: service.quantity
        })),
        produtosVendidos: comanda.products.map(product => ({
          produtoId: product.id,
          nome: product.name,
          preco: product.price,
          quantidade: product.quantity,
          vendidoPor: product.soldById // Assumindo que temos o ID do profissional que vendeu
        })),
        valorTotal: comanda.total
      }

      // Salvar no banco via API
      const response = await fetch('/api/prontuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(prontuarioData)
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Prontuário salvo com sucesso:', result)
        setEditingProntuario(false)
        
        // Baixar estoque final dos produtos vendidos
        if (comanda.products.length > 0) {
          try {
            const stockResponse = await fetch('/api/products/update-stock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                products: comanda.products.map(product => ({
                  productId: product.id,
                  quantity: product.quantity,
                  productName: product.name
                }))
              })
            })
            
            if (stockResponse.ok) {
              const stockResult = await stockResponse.json()
              console.log('Estoque atualizado:', stockResult)
            } else {
              console.error('Erro ao atualizar estoque final')
            }
          } catch (error) {
            console.error('Erro ao atualizar estoque final:', error)
          }
        }
        
        // Atualizar comanda para status finalizada
        // Aqui você pode implementar a lógica para atualizar a comanda
        
      } else {
        const error = await response.json()
        console.error('Erro ao salvar prontuário:', error)
        alert('Erro ao salvar prontuário: ' + error.error)
      }
    } catch (error) {
      console.error('Erro ao salvar prontuário:', error)
      alert('Erro ao salvar prontuário')
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
                  <p className="text-sm text-gray-700 font-medium">Nome</p>
                  <p className="font-semibold text-gray-900">{comanda.clientName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Telefone</p>
                  <p className="font-semibold text-gray-900">{comanda.clientPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Profissional</p>
                  <p className="font-semibold text-gray-900">{comanda.professionalName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Início</p>
                  <p className="font-semibold text-gray-900">{comanda.startedAt}</p>
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
                  <h3 className="font-bold text-black mb-3">Selecionar Serviço</h3>
                  <div className="grid md:grid-cols-2 gap-2">
                    {availableServices.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <Scissors className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Nenhum serviço encontrado no banco de dados</p>
                        <p className="text-sm">Verifique se há serviços cadastrados</p>
                      </div>
                    ) : (
                      availableServices.map(service => (
                        <button
                          key={service._id}
                          onClick={() => addService(service)}
                          className="text-left p-3 border border-gray-200 hover:border-black transition-colors"
                        >
                          <div className="font-medium text-gray-900">{service.name}</div>
                          <div className="text-sm text-gray-700 font-medium">R$ {service.price.toFixed(2)}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {comanda.services.map(service => (
                  <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-700 font-medium">R$ {service.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity('service', service.id, service.quantity - 1)}
                        className="w-8 h-8 border border-gray-400 bg-gray-100 hover:bg-gray-200 hover:border-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">{service.quantity}</span>
                      <button
                        onClick={() => updateQuantity('service', service.id, service.quantity + 1)}
                        className="w-8 h-8 border border-gray-400 bg-gray-100 hover:bg-gray-200 hover:border-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900">R$ {(service.price * service.quantity).toFixed(2)}</div>
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
                  <h3 className="font-bold text-black mb-3">Selecionar Produto</h3>
                  
                  {/* Seleção de Produto */}
                  <div className="grid md:grid-cols-2 gap-2 mb-4">
                    {availableProducts.length === 0 ? (
                      <div className="col-span-2 text-center py-8 text-gray-500">
                        <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Nenhum produto encontrado no banco de dados</p>
                        <p className="text-sm">Verifique se há produtos cadastrados</p>
                      </div>
                    ) : (
                      availableProducts.map(product => (
                        <button
                          key={product._id}
                          onClick={() => setSelectedProduct(product)}
                          className={`text-left p-3 border transition-colors ${
                            selectedProduct?._id === product._id 
                              ? 'border-black bg-gray-100' 
                              : 'border-gray-200 hover:border-black'
                          }`}
                        >
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-700 font-medium">R$ {product.price.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">Estoque: {product.stock}</div>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Seleção de Profissional e Adicionar */}
                  {selectedProduct && (
                    <div className="border-t pt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profissional que vendeu: <span className="text-xs text-gray-500">({availableProfessionals.length} profissionais)</span>
                          </label>
                          <select 
                            value={selectedProfessionalId}
                            onChange={(e) => setSelectedProfessionalId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900"
                          >
                            <option value="">Selecione um profissional</option>
                            {availableProfessionals.length === 0 ? (
                              <option value="" disabled>Nenhum profissional encontrado</option>
                            ) : (
                              availableProfessionals.map(professional => (
                                <option key={professional._id} value={professional._id}>
                                  {professional.name}
                                </option>
                              ))
                            )}
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <button
                            onClick={() => {
                              if (selectedProduct && selectedProfessionalId) {
                                const professional = availableProfessionals.find(p => p._id === selectedProfessionalId)
                                addProduct(selectedProduct, selectedProfessionalId, professional?.name)
                                setSelectedProduct(null)
                                setSelectedProfessionalId('')
                              }
                            }}
                            disabled={!selectedProduct || !selectedProfessionalId}
                            className="w-full bg-black text-white py-2 px-4 hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Adicionar Produto
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {comanda.products.map(product => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-700 font-medium">R$ {product.price.toFixed(2)}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Vendido por: 
                        <button
                          onClick={() => setEditingProductVendor(product.id)}
                          className="ml-1 font-medium text-blue-600 hover:text-blue-800 underline"
                        >
                          {product.soldBy || 'Não definido'}
                        </button>
                      </div>
                      
                      {/* Modal de seleção de vendedora */}
                      {editingProductVendor === product.id && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Selecionar Vendedora para "{product.name}"
                            </h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                              {availableProfessionals.map(professional => (
                                <button
                                  key={professional.id}
                                  onClick={() => updateProductVendor(product.id, professional.id, professional.name)}
                                  className="w-full text-left p-3 border border-gray-200 hover:border-black transition-colors rounded"
                                >
                                  <div className="font-medium text-gray-900">{professional.name}</div>
                                </button>
                              ))}
                            </div>
                            <div className="flex justify-end mt-4">
                              <button
                                onClick={() => setEditingProductVendor(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors rounded"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity('product', product.id, product.quantity - 1)}
                        className="w-8 h-8 border border-gray-400 bg-gray-100 hover:bg-gray-200 hover:border-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">{product.quantity}</span>
                      <button
                        onClick={() => updateQuantity('product', product.id, product.quantity + 1)}
                        className="w-8 h-8 border border-gray-400 bg-gray-100 hover:bg-gray-200 hover:border-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900">R$ {(product.price * product.quantity).toFixed(2)}</div>
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

            {/* Prontuário Médico/Estético */}
            <div className="bg-white p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Prontuário
                </h2>
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/clientes/${comanda.clientName}/historico`}
                    className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                  >
                    Ver Histórico Completo
                  </Link>
                  <button
                    onClick={() => setEditingProntuario(!editingProntuario)}
                    className="text-gray-600 hover:text-black transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {editingProntuario ? (
                <div className="space-y-4">
                  {/* Histórico de Procedimentos */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Histórico de Procedimentos Realizados:
                    </label>
                    <textarea
                      value={prontuario.historicoProcedimentos}
                      onChange={(e) => setProntuario(prev => ({ ...prev, historicoProcedimentos: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                      placeholder="Descreva os procedimentos realizados nesta sessão..."
                    />
                  </div>

                  {/* Reações e Efeitos Colaterais */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reações ou Efeitos Colaterais:
                    </label>
                    <textarea
                      value={prontuario.reacoesEfeitos}
                      onChange={(e) => setProntuario(prev => ({ ...prev, reacoesEfeitos: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                      placeholder="Descreva qualquer reação ou efeito colateral observado..."
                    />
                  </div>

                  {/* Recomendações Pós-Tratamento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recomendações Pós-Tratamento:
                    </label>
                    <textarea
                      value={prontuario.recomendacoes}
                      onChange={(e) => setProntuario(prev => ({ ...prev, recomendacoes: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                      placeholder="Instruções para cuidados pós-tratamento..."
                    />
                  </div>

                  {/* Próxima Sessão */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Sugerida para Próxima Sessão:
                    </label>
                    <input
                      type="date"
                      value={prontuario.proximaSessao}
                      onChange={(e) => setProntuario(prev => ({ ...prev, proximaSessao: e.target.value }))}
                      className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                    />
                  </div>

                  {/* Observações Adicionais */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações Adicionais:
                    </label>
                    <textarea
                      value={prontuario.observacoesAdicionais}
                      onChange={(e) => setProntuario(prev => ({ ...prev, observacoesAdicionais: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                      placeholder="Outras observações importantes..."
                    />
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <button
                      onClick={() => setEditingProntuario(false)}
                      className="px-3 py-1 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={saveProntuario}
                      className="px-3 py-1 bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                      Salvar Prontuário
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Histórico de Procedimentos:</p>
                      <p className="text-gray-900">{prontuario.historicoProcedimentos || "Não preenchido"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Reações/Efeitos:</p>
                      <p className="text-gray-900">{prontuario.reacoesEfeitos || "Nenhuma reação observada"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Recomendações:</p>
                      <p className="text-gray-900">{prontuario.recomendacoes || "Não especificadas"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Próxima Sessão:</p>
                      <p className="text-gray-900">{prontuario.proximaSessao || "Não agendada"}</p>
                    </div>
                  </div>
                  {prontuario.observacoesAdicionais && (
                    <div>
                      <p className="text-sm text-gray-600 font-medium">Observações Adicionais:</p>
                      <p className="text-gray-900">{prontuario.observacoesAdicionais}</p>
                    </div>
                  )}
                </div>
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
                  <span className="text-gray-700 font-medium">Serviços:</span>
                  <span className="text-gray-900 font-semibold">R$ {comanda.services.reduce((sum, s) => sum + (s.price * s.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Produtos:</span>
                  <span className="text-gray-900 font-semibold">R$ {comanda.products.reduce((sum, p) => sum + (p.price * p.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-black font-bold">R$ {comanda.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-gray-700 font-medium">
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
