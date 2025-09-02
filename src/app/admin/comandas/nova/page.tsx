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
  Mail
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

export default function NovaComandaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  
  // Estados para dados do banco
  const [clients, setClients] = useState<Client[]>([])
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [services, setServices] = useState<Service[]>([])
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
        // Buscar clientes
        const clientsResponse = await fetch('/api/clients')
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json()
          setClients(clientsData.clients || [])
        }

        // Buscar profissionais
        const professionalsResponse = await fetch('/api/professionals')
        if (professionalsResponse.ok) {
          const professionalsData = await professionalsResponse.json()
          setProfessionals(professionalsData.professionals || [])
        }

        // Buscar serviços
        const servicesResponse = await fetch('/api/services')
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json()
          setServices(servicesData.services || [])
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar clientes baseado na busca
  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-2xl font-light text-gray-900">Nova Comanda</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 border border-gray-100">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Nova Comanda</h2>
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
                </h3>
                
                {!selectedClient ? (
                  <div>
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Buscar cliente por nome, telefone ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                        style={{ color: '#000000' }}
                      />
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {filteredClients.map((client) => (
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
                      ))}
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
                </h3>
                
                {!selectedProfessional ? (
                  <div className="grid grid-cols-2 gap-4">
                    {professionals.map((professional) => (
                      <div 
                        key={professional._id}
                        className="border border-gray-200 p-4 hover:border-black transition-colors cursor-pointer text-center"
                        onClick={() => setSelectedProfessional(professional)}
                      >
                        <h4 className="font-medium text-gray-900">{professional.name}</h4>
                        <Plus className="w-5 h-5 text-gray-400 mx-auto mt-2" />
                      </div>
                    ))}
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
                </h3>
                
                {!selectedService ? (
                  <div className="grid grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div 
                        key={service._id}
                        className="border border-gray-200 p-4 hover:border-black transition-colors cursor-pointer"
                        onClick={() => setSelectedService(service)}
                      >
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <div className="text-sm text-gray-600 mt-2">
                          <div>R$ {service.price.toFixed(2)}</div>
                          <div>{service.duration} min</div>
                        </div>
                        <Plus className="w-5 h-5 text-gray-400 mx-auto mt-2" />
                      </div>
                    ))}
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
