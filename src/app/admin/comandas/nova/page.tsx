'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Search, 
  User, 
  Calendar,
  Play,
  Check,
  Plus,
  Phone,
  Mail,
  ShoppingBag,
  X
} from 'lucide-react'

interface Client {
  _id: string
  name: string
  phone: string
  email: string
}

interface Professional {
  _id: string
  name: string
}

interface Service {
  _id: string
  name: string
  price: number
  duration: number
}

interface Product {
  _id: string
  name: string
  price: number
  stock: number
}

export default function NovaComandaPage() {
  const router = useRouter()
  const [clientSearchTerm, setClientSearchTerm] = useState('')
  const [serviceSearchTerm, setServiceSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  
  // Estados para dados do banco
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  
  // Estados para criação da comanda
  const [showClientSelector, setShowClientSelector] = useState(false)
  const [showProfessionalSelector, setShowProfessionalSelector] = useState(false)
  const [showServiceSelector, setShowServiceSelector] = useState(false)

  // Buscar dados do banco
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        console.log('🔄 Iniciando busca de dados...')
        
        // Buscar clientes
        console.log('📞 Buscando clientes...')
        const clientsResponse = await fetch('/api/clients')
        console.log('📞 Resposta da API de clientes:', clientsResponse.status)
        
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          console.log('📞 Dados de clientes recebidos:', clientsData)
          // Verificar se é um array direto ou tem propriedade clients
          const clientsArray = Array.isArray(clientsData) ? clientsData : (clientsData.clients || [])
          console.log('📞 Array de clientes processado:', clientsArray.length)
          setClients(clientsArray)
        } else {
          console.error('❌ Erro na API de clientes:', clientsResponse.status)
        }

        // Buscar profissionais
        console.log('👩‍💼 Buscando profissionais...')
        const professionalsResponse = await fetch('/api/professionals')
        console.log('👩‍💼 Resposta da API de profissionais:', professionalsResponse.status)
        
        if (professionalsResponse.ok) {
          const professionalsData = await professionalsResponse.json()
          console.log('👩‍💼 Dados de profissionais recebidos:', professionalsData)
          // Verificar se é um array direto ou tem propriedade professionals
          const professionalsArray = Array.isArray(professionalsData) ? professionalsData : (professionalsData.professionals || [])
          console.log('👩‍💼 Array de profissionais processado:', professionalsArray.length)
          setProfessionals(professionalsArray)
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
          const servicesData = await servicesResponse.json()
          console.log('✂️ Dados de serviços recebidos:', servicesData)
          // Verificar se é um array direto ou tem propriedade services
          const servicesArray = Array.isArray(servicesData) ? servicesData : (servicesData.services || [])
          console.log('✂️ Array de serviços processado:', servicesArray.length)
          setServices(servicesArray)
        } else {
          console.error('❌ Erro na API de serviços:', servicesResponse.status)
          const errorText = await servicesResponse.text()
          console.error('❌ Detalhes do erro:', errorText)
        }

      } catch (error) {
        console.error('❌ Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
        console.log('✅ Busca de dados concluída')
        console.log('📊 Resumo dos dados carregados:')
        console.log(`  👥 Clientes: ${clients.length}`)
        console.log(`  👩‍💼 Profissionais: ${professionals.length}`)
        console.log(`  ✂️ Serviços: ${services.length}`)
      }
    }

    fetchData()
  }, [])

  // Filtrar clientes baseado na busca
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.phone.includes(clientSearchTerm) ||
    client.email.toLowerCase().includes(clientSearchTerm.toLowerCase())
  )

  const createComanda = async () => {
    if (!selectedClient || !selectedProfessional || !selectedService) {
      alert('Selecione cliente, profissional e serviço para criar a comanda')
      return
    }

    try {
      setLoading(true)
      
      // Criar comanda no banco
      const comandaData = {
        clientId: selectedClient._id,
        professionalId: selectedProfessional._id,
        status: 'em_atendimento',
        servicos: [{
          servicoId: selectedService._id,
          nome: selectedService.name,
          preco: selectedService.price,
          quantidade: 1
        }],
        produtos: [],
        observacoes: '',
        valorTotal: selectedService.price
      }

      const response = await fetch('/api/comandas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comandaData)
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/admin/comandas/${result.comanda._id}`)
      } else {
        const error = await response.json()
        alert('Erro ao criar comanda: ' + error.error)
      }
    } catch (error) {
      console.error('Erro ao criar comanda:', error)
      alert('Erro ao criar comanda')
    } finally {
      setLoading(false)
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
              <h1 className="text-2xl font-bold text-black">Nova Comanda</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 border border-gray-100">
          <h2 className="text-xl font-bold text-black mb-6">Nova Comanda</h2>
          <p className="text-gray-600 mb-6">
            Selecione cliente, profissional e serviço para criar uma nova comanda.
          </p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando dados...</p>
            </div>
          ) : (
            <>
              {/* Seleção de Cliente */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Cliente
                  <span className="ml-2 text-sm text-gray-500">({clients.length} clientes carregados)</span>
                </h3>
                
                {!selectedClient ? (
                  <div>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar cliente por nome, telefone ou email..."
                        value={clientSearchTerm}
                        onChange={(e) => setClientSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                        style={{ color: '#000000' }}
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {clients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>Nenhum cliente encontrado no banco de dados</p>
                          <p className="text-sm">Verifique se há clientes cadastrados</p>
                        </div>
                      ) : filteredClients.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Search className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>Nenhum cliente encontrado com &quot;{clientSearchTerm}&quot;</p>
                          <p className="text-sm">Tente outro termo de busca</p>
                        </div>
                      ) : (
                        filteredClients.map((client) => (
                          <div 
                            key={client._id}
                            className="border border-gray-200 p-4 hover:border-black transition-colors cursor-pointer"
                            onClick={() => setSelectedClient(client)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{client.name}</h4>
                                <div className="text-sm text-gray-600 space-y-1">
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {client.phone}
                                  </div>
                                  {client.email && (
                                    <div className="flex items-center">
                                      <Mail className="w-4 h-4 mr-2" />
                                      {client.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Plus className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedClient.name}</h4>
                        <div className="text-sm text-gray-600">
                          {selectedClient.phone} • {selectedClient.email}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedClient(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Seleção de Profissional */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Profissional
                  <span className="ml-2 text-sm text-gray-500">({professionals.length} profissionais carregados)</span>
                </h3>
                
                {!selectedProfessional ? (
                  <div>
                    {professionals.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                        <User className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Nenhum profissional encontrado no banco de dados</p>
                        <p className="text-sm">Verifique se há profissionais cadastrados</p>
                      </div>
                    ) : (
                      <select
                        onChange={(e) => {
                          const professional = professionals.find(p => p._id === e.target.value)
                          setSelectedProfessional(professional || null)
                        }}
                        className="w-full p-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                        defaultValue=""
                      >
                        <option value="" disabled>Selecione um profissional</option>
                        {professionals.map((professional) => (
                          <option key={professional._id} value={professional._id}>
                            {professional.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedProfessional.name}</h4>
                      </div>
                      <button
                        onClick={() => setSelectedProfessional(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Seleção de Serviço */}
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Serviço
                  <span className="ml-2 text-sm text-gray-500">({services.length} serviços carregados)</span>
                </h3>
                
                {!selectedService ? (
                  <div>
                    {services.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 border border-gray-200 rounded-lg">
                        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Nenhum serviço encontrado no banco de dados</p>
                        <p className="text-sm">Verifique se há serviços cadastrados</p>
                      </div>
                    ) : (
                      <div>
                        <div className="relative mb-4">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <input
                            type="text"
                            placeholder="Buscar serviço por nome..."
                            value={serviceSearchTerm}
                            onChange={(e) => setServiceSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                            style={{ color: '#000000' }}
                          />
                        </div>
                        
                        <div className="max-h-60 overflow-y-auto space-y-2">
                          {services.filter(service => 
                            service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase())
                          ).map((service) => (
                            <div 
                              key={service._id}
                              className="border border-gray-200 p-4 hover:border-black transition-colors cursor-pointer"
                              onClick={() => setSelectedService(service)}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{service.name}</h4>
                                  <div className="text-sm text-gray-600">
                                    R$ {service.price.toFixed(2)} • {service.duration} min
                                  </div>
                                </div>
                                <Plus className="w-5 h-5 text-gray-400" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border border-gray-200 p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{selectedService.name}</h4>
                        <div className="text-sm text-gray-600">
                          R$ {selectedService.price.toFixed(2)} • {selectedService.duration} min
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedService(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>



              {/* Botão Criar Comanda */}
              <div className="text-center">
                <button
                  onClick={createComanda}
                  disabled={!selectedClient || !selectedProfessional || !selectedService || loading}
                  className="bg-black text-white px-8 py-4 hover:bg-gray-800 transition-colors font-medium tracking-wide text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center mx-auto"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {loading ? 'Criando Comanda...' : 'Criar Comanda'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
