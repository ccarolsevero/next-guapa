'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Save, 
  X, 
  Clock, 
  DollarSign, 
  User,
  Tag,
  FileText,
  CheckCircle,
  Percent,
  Users
} from 'lucide-react'

// Interface para categorias
interface Category {
  _id: string
  name: string
  description?: string
  isActive: boolean
  order: number
}

// Interface para profissionais do banco
interface Professional {
  _id: string
  name: string
  title: string
  isActive: boolean
}

interface Commission {
  professionalId: string
  professionalName: string
  commission: number
  assistantCommission: number
}

interface Service {
  id: string
  name: string
  category: string
  duration: number
  breakTime: number
  allowOnlineBooking: boolean
  description: string
  valueType: 'fixed' | 'variable'
  price: number
  cost: number
  returnDays: number
  isActive: boolean
  commissions: Commission[]
}

interface ServicePackage {
  id: string
  name: string
  validity: number
  services: PackageService[]
  description: string
  originalValue: number
  discountedValue: number
  discount: number
  isActive: boolean
}

interface PackageService {
  serviceId: string
  serviceName: string
  value: number
  quantity: number
}

export default function EditarServicoPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id

  const [activeTab, setActiveTab] = useState('servico')
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [service, setService] = useState<Service>({
    id: '',
    name: '',
    category: '',
    duration: 30,
    breakTime: 0,
    allowOnlineBooking: true,
    description: '',
    valueType: 'fixed',
    price: 0,
    cost: 0,
    returnDays: 0,
    isActive: true,
    commissions: []
  })

  const [servicePackage, setServicePackage] = useState<ServicePackage>({
    id: '',
    name: '',
    validity: 90,
    services: [],
    description: '',
    originalValue: 0,
    discountedValue: 0,
    discount: 0,
    isActive: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Carregar profissionais do banco de dados
  const loadProfessionals = async () => {
    try {
      const response = await fetch('/api/professionals')
      if (response.ok) {
        const data = await response.json()
        setProfessionals(data)
      } else {
        console.error('Erro ao carregar profissionais')
        // Fallback para profissionais de teste
        setProfessionals([
          { _id: '1', name: 'Bruna Canovas', title: 'Cabeleireira', isActive: true },
          { _id: '2', name: 'Cicera Aparecida Canovas', title: 'Cabeleireira', isActive: true }
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error)
      // Fallback para profissionais de teste
      setProfessionals([
        { _id: '1', name: 'Bruna Canovas', title: 'Cabeleireira', isActive: true },
        { _id: '2', name: 'Cicera Aparecida Canovas', title: 'Cabeleireira', isActive: true }
      ])
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/service-categories?isActive=true')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Erro ao carregar categorias de serviços')
        // Fallback para categorias padrão
        setCategories([
          { _id: '1', name: 'Consultoria e Avaliação', isActive: true, order: 1 },
          { _id: '2', name: 'Cortes', isActive: true, order: 2 },
          { _id: '3', name: 'Colorimetria', isActive: true, order: 3 },
          { _id: '4', name: 'Tratamentos', isActive: true, order: 4 }
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar categorias de serviços:', error)
      // Fallback para categorias padrão
      setCategories([
        { _id: '1', name: 'Consultoria e Avaliação', isActive: true, order: 1 },
        { _id: '2', name: 'Cortes', isActive: true, order: 2 },
        { _id: '3', name: 'Colorimetria', isActive: true, order: 3 },
        { _id: '4', name: 'Tratamentos', isActive: true, order: 4 }
      ])
    }
  }

  useEffect(() => {
    // Carregar profissionais e categorias
    loadProfessionals()
    loadCategories()
  }, [])

  useEffect(() => {
    // Só executar quando profissionais estiverem carregados
    if (professionals.length === 0) return

    if (serviceId === 'novo') {
      // Novo serviço - inicializar comissões vazias
      const initialCommissions = professionals.map(prof => ({
        professionalId: prof._id,
        professionalName: prof.name,
        commission: 0,
        assistantCommission: 0
      }))
      
      setService(prev => ({
        ...prev,
        commissions: initialCommissions
      }))
    } else {
      // Serviço existente - simular dados
      const existingCommissions = professionals.map(prof => ({
        professionalId: prof._id,
        professionalName: prof.name,
        commission: Math.floor(Math.random() * 20) + 10, // 10-30%
        assistantCommission: Math.floor(Math.random() * 15) + 5 // 5-20%
      }))
      
      setService({
        id: serviceId as string,
        name: 'Corte Feminino',
        category: 'Cortes',
        duration: 60,
        breakTime: 15,
        allowOnlineBooking: true,
        description: 'Corte personalizado para mulheres com lavagem incluída',
        valueType: 'fixed',
        price: 45.00,
        cost: 15.00,
        returnDays: 30,
        isActive: true,
        commissions: existingCommissions
      })
    }
  }, [serviceId, professionals])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setService(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setService(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleCommissionChange = (professionalId: string, field: 'commission' | 'assistantCommission', value: string) => {
    const numValue = parseFloat(value) || 0
    setService(prev => ({
      ...prev,
      commissions: prev.commissions.map(comm => 
        comm.professionalId === professionalId 
          ? { ...comm, [field]: numValue }
          : comm
      )
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setMessage('Serviço salvo com sucesso!')
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/admin/servicos')
      }, 2000)
    } catch (error) {
      setMessage('Erro ao salvar serviço. Tente novamente.')
    } finally {
      setIsLoading(false)
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
                href="/admin/servicos" 
                className="flex items-center text-gray-600 hover:text-black mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <h1 className="text-2xl font-light text-gray-900">
                {serviceId === 'novo' ? 'Novo Serviço' : 'Editar Serviço'}
              </h1>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admin/servicos')}
                className="px-4 py-2 border border-gray-400 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('servico')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'servico'
                  ? 'border-[#D15556] text-[#D15556]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cadastre o Serviço
            </button>
            <button
              onClick={() => setActiveTab('comissoes')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'comissoes'
                  ? 'border-[#D15556] text-[#D15556]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Comissões
            </button>

          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {activeTab === 'servico' ? (
          /* Tab: Cadastre o Serviço */
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-white p-8 border border-gray-100 rounded-lg">
              <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center">
                <Tag className="w-5 h-5 mr-2" />
                Informações do Serviço
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Nome do Serviço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do serviço *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={service.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                    placeholder="Nome do serviço"
                  />
                </div>

                {/* Categoria */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria (Obrigatório) *
                  </label>
                  <select
                    name="category"
                    value={service.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category._id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>

                {/* Duração */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duração *
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      name="duration"
                      value={service.duration}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                      placeholder="30"
                    />
                    <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-700 font-medium">
                      min
                    </div>
                  </div>
                </div>

                {/* Folga */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folga necessária
                    <span className="ml-1 text-gray-400 cursor-help" title="Tempo de folga entre agendamentos">?</span>
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      name="breakTime"
                      value={service.breakTime}
                      onChange={handleInputChange}
                      min="0"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                      placeholder="0"
                    />
                    <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-700 font-medium">
                      min
                    </div>
                  </div>
                </div>

                {/* Agendamento Online */}
                <div className="md:col-span-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="allowOnlineBooking"
                      checked={service.allowOnlineBooking}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 text-[#D15556] border-gray-300 rounded focus:ring-[#D15556] focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Permitir Agendamento Online
                    </span>
                  </label>
                </div>

                {/* Descrição */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={service.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                    placeholder="Descrição detalhada do serviço..."
                  />
                </div>

                {/* Tipo de Valor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo valor
                  </label>
                  <select
                    name="valueType"
                    value={service.valueType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  >
                    <option value="fixed">Fixo</option>
                    <option value="variable">Variável</option>
                  </select>
                </div>

                {/* Valor Cobrado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor cobrado
                  </label>
                  <div className="flex">
                    <div className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-700 font-medium">
                      R$
                    </div>
                    <input
                      type="number"
                      name="price"
                      value={service.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {/* Custo do Serviço */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custo do serviço
                  </label>
                  <div className="flex">
                    <div className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-700 font-medium">
                      R$
                    </div>
                    <input
                      type="number"
                      name="cost"
                      value={service.cost}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                {/* Sugerir Retorno */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sugerir retorno em
                  </label>
                  <div className="flex">
                    <input
                      type="number"
                      name="returnDays"
                      value={service.returnDays}
                      onChange={handleInputChange}
                      min="0"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                      placeholder="0"
                    />
                    <div className="px-4 py-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-lg text-gray-700 font-medium">
                      dias
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="bg-[#D15556] text-white px-8 py-3 rounded-lg hover:bg-[#c04546] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Serviço'}
              </button>
            </div>
          </form>
        ) : (
          /* Tab: Comissões */
          <div className="space-y-8">
            <div className="bg-white p-8 border border-gray-100 rounded-lg">
              <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center">
                <Percent className="w-5 h-5 mr-2" />
                Comissões por Profissional
              </h2>
              
              <p className="text-gray-600 mb-6">
                Informe a comissão dos profissionais que realizam o serviço
              </p>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        <input type="checkbox" className="w-4 h-4 text-[#D15556] border-gray-300 rounded focus:ring-[#D15556] focus:ring-2" />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Nome</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Comissão (%)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Comissão Assistente (%)</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Tempo (min)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {service.commissions.map((commission, index) => (
                      <tr key={commission.professionalId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-[#D15556] border-gray-300 rounded focus:ring-[#D15556] focus:ring-2" 
                          />
                        </td>
                        <td className="py-3 px-4 font-medium text-gray-900">
                          {commission.professionalName}
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={commission.commission}
                            onChange={(e) => handleCommissionChange(commission.professionalId, 'commission', e.target.value)}
                            min="0"
                            max="100"
                            className="w-20 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black text-center"
                          />
                          <span className="ml-1 text-gray-500">%</span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={commission.assistantCommission}
                            onChange={(e) => handleCommissionChange(commission.professionalId, 'assistantCommission', e.target.value)}
                            min="0"
                            max="100"
                            className="w-20 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black text-center"
                          />
                          <span className="ml-1 text-gray-500">%</span>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="number"
                            value={service.duration}
                            onChange={(e) => setService(prev => ({ ...prev, duration: parseFloat(e.target.value) || 0 }))}
                            min="0"
                            className="w-20 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black text-center"
                          />
                          <span className="ml-1 text-gray-500">min</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-[#D15556] text-white px-8 py-3 rounded-lg hover:bg-[#c04546] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-5 h-5 mr-2" />
                {isLoading ? 'Salvando...' : 'Salvar Comissões'}
              </button>
            </div>
          </div>
        )}

        {/* Mensagem de sucesso/erro */}
        {message && (
          <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
            message.includes('sucesso') ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  )
}
