'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash, Search, Filter, DollarSign, Clock, TrendingUp } from 'lucide-react'

interface Service {
  _id: string
  name: string
  description: string
  price: number
  category: string
  isActive: boolean
  order: number
  createdAt: string
  updatedAt: string
}

// Dados reais dos serviços (serão carregados da API)
const [services, setServices] = useState<Service[]>([])
const [loading, setLoading] = useState(true)

// Carregar serviços da API
const loadServices = async () => {
  try {
    setLoading(true)
    const response = await fetch('/api/services')
    if (!response.ok) {
      throw new Error('Erro ao carregar serviços')
    }
    const data = await response.json()
    setServices(data)
  } catch (error) {
    console.error('Erro ao carregar serviços:', error)
    alert('Erro ao carregar serviços')
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  loadServices()
}, [])

  {
    id: 3,
    name: "Back To Natural - P",
    description: "Técnica exclusiva da Keune que repigmenta cabelos loiros no tom desejado, sem avermelhar e priorizando a saúde dos fios.",
    price: 231.00,
    duration: 150,
    category: "Coloração",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 4,
    name: "Cobertura de Brancos (Tinta Color Keune)",
    description: "Retiche de raiz para cobertura de cabelos grisalhos. Fórmula enriquecida com óleo de coco e proteína da seda. Inclui tratamento Keune.",
    price: 121.00,
    duration: 90,
    category: "Coloração",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 5,
    name: "Cobertura de Brancos (So Pure)",
    description: "Cobertura com Keune So Pure, coloração livre de amônia e parabeno. Maneira suave e eficaz de colorir com tons naturais.",
    price: 143.00,
    duration: 90,
    category: "Coloração",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 6,
    name: "Combo: Consultoria, Corte e Tratamento",
    description: "Consultoria de visagismo, corte e tratamento KEUNE CreamBath SPA Vital Nutrition.",
    price: 264.00,
    duration: 120,
    category: "Combo",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 7,
    name: "Consultoria de Corte",
    description: "Consultoria de visagismo analisa linhas e traços do seu rosto. Experiência de autoconhecimento e valorização da SUA beleza.",
    price: 198.00,
    duration: 60,
    category: "Consultoria",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 8,
    name: "Corte",
    description: "Corte retira pontas ressecadas e ajuda no crescimento dos fios. Corte escolhido por você ou manutenção de corte já realizado.",
    price: 132.00,
    duration: 60,
    category: "Cortes",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 9,
    name: "Corte e Tratamento Keune",
    description: "Corte desejado, tratamento premium Keune Care e finalização ao natural com difusor.",
    price: 198.00,
    duration: 90,
    category: "Combo",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 10,
    name: "Corte Infantil",
    description: "Corte realizado somente em crianças de até 6 anos.",
    price: 66.00,
    duration: 30,
    category: "Cortes",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 11,
    name: "Finalização",
    description: "Higienização e finalização com difusor ou escova.",
    price: 77.00,
    duration: 45,
    category: "Finalização",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 12,
    name: "Iluminado G (Cabelo Longo)",
    description: "Iluminado com efeito de queimado de sol, feito SEM pó descolorante. Para cabelos longos.",
    price: 715.00,
    duration: 240,
    category: "Coloração",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 13,
    name: "Iluminado M (Abaixo do Ombro)",
    description: "Iluminado com efeito de queimado de sol, feito SEM pó descolorante. Para cabelos abaixo da altura do ombro.",
    price: 605.00,
    duration: 210,
    category: "Coloração",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 14,
    name: "Iluminado P (Até o Ombro)",
    description: "Iluminado com efeito de queimado de sol, feito SEM pó descolorante. Para cabelos até a altura do ombro.",
    price: 500.00,
    duration: 180,
    category: "Coloração",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 15,
    name: "Iluminado PP (Cabelos Curtinhos)",
    description: "Iluminado com efeito de queimado de sol, feito SEM pó descolorante. Para cabelos curtinhos, pixie, na altura da orelha.",
    price: 390.00,
    duration: 150,
    category: "Coloração",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 16,
    name: "Mechas Coloridas",
    description: "Blocos de mechas localizadas, coloridas ou platinadas. Em cabelos naturais, sem coloração. Você escolhe a cor!",
    price: 250.00,
    duration: 180,
    category: "Coloração",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 17,
    name: "Mechas Invertidas",
    description: "Técnica para escurecer cabelos claros ou disfarçar cabelos grisalhos, deixando aspecto natural.",
    price: 220.00,
    duration: 150,
    category: "Coloração",
    isActive: true,
    professionalId: "bruna"
  },
  {
    id: 18,
    name: "Retoque de Corte",
    description: "Retoque apenas de cortes feitos aqui. Manutenção para curtinhos, pixie, etc. Até 60 dias do último corte.",
    price: 66.00,
    duration: 30,
    category: "Cortes",
    isActive: true,
    professionalId: "bruna"
  }
]

const categories = ["Todos", "Consultoria", "Cortes", "Coloração", "Combo", "Finalização"]
const professionals = [
  { id: "bruna", name: "Bruna" },
  { id: "cicera", name: "Cicera Canovas" }
]

export default function ServicosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [selectedProfessional, setSelectedProfessional] = useState('Todos')
  const [showInactive, setShowInactive] = useState(false)

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Todos' || service.category === selectedCategory
    const matchesStatus = showInactive ? true : service.isActive

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDelete = (id: number) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      console.log('Excluindo serviço:', id)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getProfessionalName = (professionalId: string) => {
    const professional = professionals.find(p => p.id === professionalId)
    return professional ? professional.name : 'Não definido'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Serviços</h1>
          <p className="mt-2 text-sm text-gray-700">
            Gerencie todos os serviços oferecidos pelo salão
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/admin/servicos/editar/novo"
            className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Link>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Buscar serviços..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              style={{ color: '#000000' }}
            />
          </div>
          
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
              style={{ color: '#000000' }}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={selectedProfessional}
              onChange={(e) => setSelectedProfessional(e.target.value)}
              className="px-4 py-3 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
              style={{ color: '#000000' }}
            >
              <option value="Todos">Todos os Profissionais</option>
              {professionals.map(prof => (
                <option key={prof.id} value={prof.id}>{prof.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-[#D15556] focus:ring-[#D15556] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Mostrar inativos</span>
            </label>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Serviços</p>
              <p className="text-2xl font-semibold text-gray-900">{mockServices.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Serviços Ativos</p>
              <p className="text-2xl font-semibold text-gray-900">
                {mockServices.filter(s => s.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Preço Médio</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(mockServices.reduce((sum, s) => sum + s.price, 0) / mockServices.length)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600">
              <Clock className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Duração Média</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(mockServices.reduce((sum, s) => sum + s.duration, 0) / mockServices.length)} min
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Serviços ({filteredServices.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profissional
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{service.name}</div>
                      <div className="text-sm text-gray-500">{service.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {service.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getProfessionalName(service.professionalId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(service.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.duration} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      service.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {service.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/servicos/editar/${service.id}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar serviço"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Excluir serviço"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
