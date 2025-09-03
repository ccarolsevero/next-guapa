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
  
  // Detectar se está em modo somente leitura (acessado do histórico)
  const [isReadOnly, setIsReadOnly] = useState(false)
  
  // Verificar se está sendo acessado do histórico
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const fromHistory = urlParams.get('fromHistory')
    setIsReadOnly(fromHistory === 'true')
    
    if (fromHistory === 'true') {
      console.log('📖 Modo somente leitura ativado (acessado do histórico)')
    }
  }, [])

  const [comanda, setComanda] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingComanda, setEditingComanda] = useState<any>(null)
  const [editLoading, setEditLoading] = useState(false)

  const updateTotal = () => {
    if (!comanda) return
    
    const servicesTotal = comanda.servicos.reduce((sum: number, service: any) => sum + (service.preco * service.quantidade), 0)
    const productsTotal = comanda.produtos.reduce((sum: number, product: any) => sum + (product.preco * product.quantidade), 0)
    const newTotal = servicesTotal + productsTotal
    
    setComanda(prev => ({ ...prev, valorTotal: newTotal }))
  }

  const openEditModal = () => {
    setEditingComanda({ ...comanda })
    setShowEditModal(true)
  }

  const saveComandaChanges = async () => {
    if (!editingComanda) return
    
    try {
      setEditLoading(true)
      
      const response = await fetch(`/api/comandas/${comandaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingComanda)
      })
      
      if (response.ok) {
        setComanda(editingComanda)
        setShowEditModal(false)
        alert('Comanda atualizada com sucesso!')
      } else {
        const error = await response.json()
        alert('Erro ao atualizar comanda: ' + error.error)
      }
    } catch (error) {
      console.error('Erro ao atualizar comanda:', error)
      alert('Erro ao atualizar comanda')
    } finally {
      setEditLoading(false)
    }
  }

  useEffect(() => {
    updateTotal()
  }, [comanda?.servicos, comanda?.produtos])

  // Buscar dados da comanda específica
  useEffect(() => {
    const fetchComanda = async () => {
      if (!comandaId) return
      
      try {
        setLoading(true)
        console.log('🔄 Buscando comanda:', comandaId)
        
        const response = await fetch(`/api/comandas/${comandaId}`)
        console.log('📡 Resposta da API de comanda:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📊 Dados da comanda recebidos:', data)
          setComanda(data.comanda)
        } else {
          console.error('❌ Erro na API de comanda:', response.status)
          const errorText = await response.text()
          console.error('❌ Detalhes do erro:', errorText)
        }
      } catch (error) {
        console.error('❌ Erro ao buscar comanda:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComanda()
  }, [comandaId])

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
    const existingService = comanda?.servicos.find(s => s.id === service._id)
    
    if (existingService) {
      setComanda(prev => ({
        ...prev,
        servicos: prev.servicos.map(s => 
          s.id === service._id 
            ? { ...s, quantidade: s.quantidade + 1 }
            : s
        )
      }))
    } else {
      setComanda(prev => ({
        ...prev,
        servicos: [...prev.servicos, { 
          id: service._id,
          nome: service.name, 
          preco: service.price, 
          quantidade: 1 
        }]
      }))
    }
    setShowAddService(false)
  }

  const addProduct = async (product: any, soldByProfessionalId?: string, soldByProfessionalName?: string) => {
    try {
      console.log('🔄 Adicionando produto:', product)
      console.log('👩‍💼 Vendedor ID:', soldByProfessionalId)
      console.log('👩‍💼 Vendedor Nome:', soldByProfessionalName)
      
      // Verificar estoque antes de adicionar
      const response = await fetch(`/api/products/update-stock?productIds=${product._id}`)
      if (response.ok) {
        const stockData = await response.json()
        const productStock = stockData.products[0]
        console.log('📦 Dados do estoque:', stockData)
        
        if (!productStock || productStock.stock <= 0) {
          alert(`Produto ${product.name} está sem estoque!`)
          return
        }
        
        if (productStock.stock < 1) {
          alert(`Produto ${product.name} tem apenas ${productStock.stock} unidades em estoque!`)
          return
        }
      }

      const existingProduct = comanda?.produtos.find(p => p.id === product._id)
      console.log('🔍 Produto existente:', existingProduct)
      
      if (existingProduct) {
        console.log('📝 Atualizando quantidade do produto existente')
        setComanda(prev => ({
          ...prev,
          produtos: prev.produtos.map(p => 
            p.id === product._id 
              ? { ...p, quantidade: p.quantidade + 1 }
              : p
          )
        }))
        // Atualizar total após adicionar produto
        setTimeout(() => updateTotal(), 100)
      } else {
        console.log('🆕 Adicionando novo produto')
        const newProduct = { 
          id: product._id,
          nome: product.name, 
          preco: product.price, 
          quantidade: 1, 
          vendidoPor: soldByProfessionalName || comanda?.profissionalVendedora,
          vendidoPorId: soldByProfessionalId || comanda?.profissionalVendedoraId
        }
        console.log('🆕 Novo produto:', newProduct)
        
        setComanda(prev => ({
          ...prev,
          produtos: [...prev.produtos, newProduct]
        }))
        // Atualizar total após adicionar produto
        setTimeout(() => updateTotal(), 100)
      }
      setShowAddProduct(false)
      console.log('✅ Produto adicionado com sucesso')
    } catch (error) {
      console.error('❌ Erro ao verificar estoque:', error)
      alert('Erro ao verificar estoque do produto')
    }
  }

  const updateQuantity = async (type: 'service' | 'product', id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      if (type === 'service') {
        setComanda(prev => ({
          ...prev,
          servicos: prev.servicos.filter(s => s.id !== id)
        }))
      } else {
        // Remover produto da comanda
        const productToRemove = comanda?.produtos.find(p => p.id === id)
        if (productToRemove) {
          // Restaurar estoque do produto removido
          try {
            await fetch('/api/products/update-stock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                products: [{
                  productId: productToRemove.id,
                  quantity: -productToRemove.quantidade, // Quantidade negativa para restaurar
                  productName: productToRemove.nome
                }]
              })
            })
          } catch (error) {
            console.error('Erro ao restaurar estoque:', error)
          }
        }
        
        setComanda(prev => ({
          ...prev,
          produtos: prev.produtos.filter(p => p.id !== id)
        }))
        // Atualizar total após remover produto
        setTimeout(() => updateTotal(), 100)
      }
    } else {
      if (type === 'service') {
        setComanda(prev => ({
          ...prev,
          servicos: prev.servicos.map(s => 
            s.id === id ? { ...s, quantidade: newQuantity } : s
          )
        }))
      } else {
        // Atualizar quantidade de produto
        const productToUpdate = comanda?.produtos.find(p => p.id === id)
        if (productToUpdate) {
          const quantityDifference = newQuantity - productToUpdate.quantidade
          
          if (quantityDifference !== 0) {
            try {
              // Verificar se tem estoque suficiente para o aumento
              if (quantityDifference > 0) {
                const response = await fetch(`/api/products/update-stock?productIds=${productToUpdate.id}`)
                if (response.ok) {
                  const stockData = await response.json()
                  const productStock = stockData.products[0]
                  
                  if (productStock.stock < quantityDifference) {
                    alert(`Produto ${productToUpdate.nome} não tem estoque suficiente! Disponível: ${productStock.stock}`)
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
                    productName: productToUpdate.nome
                  }]
                })
              })
              
              // Atualizar quantidade na comanda
              setComanda(prev => ({
                ...prev,
                produtos: prev.produtos.map(p =>
                  p.id === id ? { ...p, quantidade: newQuantity } : p
                )
              }))
              
              // Atualizar total após alterar quantidade
              setTimeout(() => updateTotal(), 100)
            } catch (error) {
              console.error('Erro ao atualizar estoque:', error)
            }
          }
        }
      }
    }
  }

  const saveObservations = () => {
    setComanda(prev => ({ ...prev, observacoes: newObservation }))
    setEditingObservations(false)
  }

  const updateProductVendor = async (productId: number, newVendorId: string, newVendorName: string) => {
    try {
      const professional = availableProfessionals.find(p => p._id === newVendorId)
      if (professional) {
        setComanda(prev => ({
          ...prev,
          produtos: prev.produtos.map(p => 
            p.id === productId 
              ? { ...p, vendidoPor: professional.name, vendidoPorId: professional._id }
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
        clientId: comanda?.clienteId, // Assumindo que temos o ID do cliente
        comandaId: comandaId,
        professionalId: comanda?.profissionalId, // Assumindo que temos o ID do profissional
        historicoProcedimentos: prontuario.historicoProcedimentos,
        reacoesEfeitos: prontuario.reacoesEfeitos,
        recomendacoes: prontuario.recomendacoes,
        proximaSessao: prontuario.proximaSessao,
        observacoesAdicionais: prontuario.observacoesAdicionais,
        servicosRealizados: comanda?.servicos.map((service: any) => ({
          servicoId: service.id,
          nome: service.nome,
          preco: service.preco,
          quantidade: service.quantidade
        })),
        produtosVendidos: comanda?.produtos.map((product: any) => ({
          produtoId: product.id,
          nome: product.nome,
          preco: product.preco,
          quantidade: product.quantidade,
          vendidoPor: product.vendidoPorId // Assumindo que temos o ID do profissional que vendeu
        })),
        valorTotal: comanda?.valorTotal
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
        if (comanda?.produtos.length > 0) {
          try {
            const stockResponse = await fetch('/api/products/update-stock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                products: comanda?.produtos.map((product: any) => ({
                  productId: product.id,
                  quantity: product.quantidade,
                  productName: product.nome
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

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando comanda...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!comanda) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comanda não encontrada</h2>
            <p className="text-gray-600 mb-6">A comanda que você está procurando não existe ou foi removida.</p>
            <Link
              href="/admin/comandas"
              className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-medium tracking-wide"
            >
              Voltar para Comandas
            </Link>
          </div>
        </div>
      </div>
    )
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
                <h1 className="text-2xl font-light text-gray-900">
                  {isReadOnly ? 'Detalhes da Comanda' : 'Comanda'} #{comanda?.id}
                </h1>
                <p className="text-sm text-gray-600">
                  {comanda?.clienteNome}
                  {isReadOnly && ' - Modo Visualização'}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isReadOnly && (
                <>
                  <button
                    onClick={openEditModal}
                    className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 transition-colors font-medium tracking-wide flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                  <Link
                    href={`/admin/comandas/${comanda?.id}/finalizar`}
                    className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors font-medium tracking-wide"
                  >
                    Finalizar
                  </Link>
                </>
              )}
              {isReadOnly && (
                <Link
                  href={`/admin/clientes/${comanda?.clienteId}/historico`}
                  className="bg-gray-600 text-white px-6 py-2 hover:bg-gray-700 transition-colors font-medium tracking-wide flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao Histórico
                </Link>
              )}
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
                  <p className="font-semibold text-gray-900">{comanda?.clienteNome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Telefone</p>
                  <p className="font-semibold text-gray-900">{comanda?.clienteTelefone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Profissional</p>
                  <p className="font-semibold text-gray-900">{comanda?.profissionalNome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Início</p>
                  <p className="font-semibold text-gray-900">{comanda?.inicioAt}</p>
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
                {!isReadOnly && (
                  <button
                    onClick={() => setShowAddService(!showAddService)}
                    className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors font-medium text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Adicionar
                  </button>
                )}
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
                {comanda?.servicos.map((service: any) => (
                  <div key={service.id} className="flex items-center justify-between p-3 border border-gray-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{service.nome}</div>
                      <div className="text-sm text-gray-700 font-medium">R$ {service.preco.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity('service', service.id, service.quantidade - 1)}
                        className="w-8 h-8 border border-gray-400 bg-gray-100 hover:bg-gray-200 hover:border-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">{service.quantidade}</span>
                      <button
                        onClick={() => updateQuantity('service', service.id, service.quantidade + 1)}
                        className="w-8 h-8 border border-gray-400 bg-gray-100 hover:bg-gray-200 hover:border-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900">R$ {(service.preco * service.quantidade).toFixed(2)}</div>
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
                {!isReadOnly && (
                  <button
                    onClick={() => setShowAddProduct(!showAddProduct)}
                    className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors font-medium text-sm"
                  >
                    <Plus className="w-4 h-4 inline mr-1" />
                    Adicionar
                  </button>
                )}
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
                {comanda?.produtos.map((product: any) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border border-gray-200">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{product.nome}</div>
                      <div className="text-sm text-gray-700 font-medium">R$ {product.preco.toFixed(2)}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        Vendido por: 
                        <button
                          onClick={() => setEditingProductVendor(product.id)}
                          className="ml-1 font-medium text-blue-600 hover:text-blue-800 underline"
                        >
                          {product.vendidoPor || 'Não definido'}
                        </button>
                      </div>
                      
                      {/* Modal de seleção de vendedora */}
                      {editingProductVendor === product.id && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                              Selecionar Vendedora para "{product.nome}"
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
                        onClick={() => updateQuantity('product', product.id, product.quantidade - 1)}
                        className="w-8 h-8 border border-gray-400 bg-gray-100 hover:bg-gray-200 hover:border-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4 text-gray-700" />
                      </button>
                      <span className="w-8 text-center font-semibold text-gray-900">{product.quantidade}</span>
                      <button
                        onClick={() => updateQuantity('product', product.id, product.quantidade + 1)}
                        className="w-8 h-8 border border-gray-400 bg-gray-100 hover:bg-gray-200 hover:border-gray-600 transition-colors flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4 text-gray-700" />
                      </button>
                      <div className="text-right ml-4">
                        <div className="font-semibold text-gray-900">R$ {(product.preco * product.quantidade).toFixed(2)}</div>
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
                  {comanda?.observacoes || "Nenhuma observação adicionada."}
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
                    href={`/admin/clientes/${comanda?.clienteId}/historico`}
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
                  <span className="text-gray-900 font-semibold">R$ {comanda?.servicos.reduce((sum: number, s: any) => sum + (s.preco * s.quantidade), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700 font-medium">Produtos:</span>
                  <span className="text-gray-900 font-semibold">R$ {comanda?.produtos.reduce((sum: number, p: any) => sum + (p.preco * p.quantidade), 0).toFixed(2)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-lg font-medium">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-black font-bold">R$ {comanda?.valorTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-gray-700 font-medium">
                  <div>Itens: {comanda?.servicos.length + comanda?.produtos.length}</div>
                  <div>Tempo estimado: 75 min</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Link
                  href={`/admin/atendimentos/finalizar/${comanda?.id}`}
                  className="w-full bg-black text-white py-3 px-4 hover:bg-gray-800 transition-colors font-medium tracking-wide text-center block"
                >
                  Finalizar Atendimento
                </Link>
                <Link
                  href={`/admin/comandas/${comanda?.id}/editar`}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 hover:bg-gray-50 transition-colors font-medium text-center block"
                >
                  Editar Comanda
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Editar Comanda</h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Informações Básicas */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Informações Básicas</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editingComanda?.status || 'em_atendimento'}
                      onChange={(e) => setEditingComanda(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-black"
                    >
                      <option value="em_atendimento">Em Atendimento</option>
                      <option value="finalizada">Finalizada</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                    <textarea
                      value={editingComanda?.observacoes || ''}
                      onChange={(e) => setEditingComanda(prev => ({ ...prev, observacoes: e.target.value }))}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-0 focus:border-black"
                      placeholder="Observações da comanda..."
                    />
                  </div>
                </div>
              </div>

              {/* Serviços */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Serviços</h4>
                <div className="space-y-3">
                  {editingComanda?.servicos.map((service: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={service.nome}
                          onChange={(e) => {
                            const newServicos = [...editingComanda.servicos]
                            newServicos[index].nome = e.target.value
                            setEditingComanda(prev => ({ ...prev, servicos: newServicos }))
                          }}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-black"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={service.preco}
                          onChange={(e) => {
                            const newServicos = [...editingComanda.servicos]
                            newServicos[index].preco = parseFloat(e.target.value) || 0
                            setEditingComanda(prev => ({ ...prev, servicos: newServicos }))
                          }}
                          step="0.01"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-black"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={service.quantidade}
                          onChange={(e) => {
                            const newServicos = [...editingComanda.servicos]
                            newServicos[index].quantidade = parseInt(e.target.value) || 1
                            setEditingComanda(prev => ({ ...prev, servicos: newServicos }))
                          }}
                          min="1"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-black"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newServicos = editingComanda.servicos.filter((_: any, i: number) => i !== index)
                          setEditingComanda(prev => ({ ...prev, servicos: newServicos }))
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Produtos */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Produtos</h4>
                <div className="space-y-3">
                  {editingComanda?.produtos.map((product: any, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={product.nome}
                          onChange={(e) => {
                            const newProdutos = [...editingComanda.produtos]
                            newProdutos[index].nome = e.target.value
                            setEditingComanda(prev => ({ ...prev, produtos: newProdutos }))
                          }}
                          className="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-black"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          value={product.preco}
                          onChange={(e) => {
                            const newProdutos = [...editingComanda.produtos]
                            newProdutos[index].preco = parseFloat(e.target.value) || 0
                            setEditingComanda(prev => ({ ...prev, produtos: newProdutos }))
                          }}
                          step="0.01"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-black"
                        />
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          value={product.quantidade}
                          onChange={(e) => {
                            const newProdutos = [...editingComanda.produtos]
                            newProdutos[index].quantidade = parseInt(e.target.value) || 1
                            setEditingComanda(prev => ({ ...prev, produtos: newProdutos }))
                          }}
                          min="1"
                          className="w-full p-2 border border-gray-300 rounded focus:ring-0 focus:border-black"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const newProdutos = editingComanda.produtos.filter((_: any, i: number) => i !== index)
                          setEditingComanda(prev => ({ ...prev, produtos: newProdutos }))
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveComandaChanges}
                  disabled={editLoading}
                  className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                >
                  {editLoading ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
