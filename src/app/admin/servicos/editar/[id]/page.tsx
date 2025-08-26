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
  FileText
} from 'lucide-react'

// Mock data para categorias e profissionais
const categories = ["Consultoria", "Cortes", "Coloração", "Combo", "Finalização"]
const professionals = [
  { id: "bruna", name: "Bruna" },
  { id: "cicera", name: "Cicera Canovas" }
]

export default function EditarServicoPage() {
  const router = useRouter()
  const params = useParams()
  const serviceId = params.id

  const [service, setService] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    duration: 0,
    category: '',
    professionalId: '',
    isActive: true,
    instructions: '',
    requirements: '',
    maxGroupSize: 1,
    preparationTime: 0
  })

  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    // Simular carregamento do serviço
    if (serviceId === 'novo') {
      // Novo serviço
      setService({
        id: '',
        name: '',
        description: '',
        price: 0,
        duration: 60,
        category: '',
        professionalId: '',
        isActive: true,
        instructions: '',
        requirements: '',
        maxGroupSize: 1,
        preparationTime: 0
      })
    } else {
      // Serviço existente - simular dados
      setService({
        id: serviceId as string,
        name: 'Corte Feminino',
        description: 'Corte personalizado para mulheres com lavagem incluída',
        price: 45.00,
        duration: 60,
        category: 'Cortes',
        professionalId: 'ana',
        isActive: true,
        instructions: 'Chegar com o cabelo seco. Trazer foto de referência se desejar.',
        requirements: 'Não há restrições',
        maxGroupSize: 1,
        preparationTime: 5
      })
    }
  }, [serviceId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setService(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
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

      {/* Form */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações Básicas */}
          <div className="bg-white p-8 border border-gray-100">
            <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center">
              <Tag className="w-5 h-5 mr-2" />
              Informações Básicas
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  name="name"
                  value={service.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  style={{ color: '#000000' }}
                  placeholder="Nome do serviço"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  name="category"
                  value={service.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  style={{ color: '#000000' }}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  name="description"
                  value={service.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  style={{ color: '#000000' }}
                  placeholder="Descrição detalhada do serviço"
                />
              </div>
            </div>
          </div>

          {/* Preços e Duração */}
          <div className="bg-white p-8 border border-gray-100">
            <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Preços e Duração
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={service.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  style={{ color: '#000000' }}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração (minutos) *
                </label>
                <input
                  type="number"
                  name="duration"
                  value={service.duration}
                  onChange={handleInputChange}
                  required
                  min="15"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  style={{ color: '#000000' }}
                  placeholder="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo de Preparação (min)
                </label>
                <input
                  type="number"
                  name="preparationTime"
                  value={service.preparationTime}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  style={{ color: '#000000' }}
                  placeholder="5"
                />
              </div>
            </div>
          </div>

          {/* Profissional e Configurações */}
          <div className="bg-white p-8 border border-gray-100">
            <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profissional e Configurações
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profissional Responsável
                </label>
                <select
                  name="professionalId"
                  value={service.professionalId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  style={{ color: '#000000' }}
                >
                  <option value="">Selecione um profissional</option>
                  {professionals.map(prof => (
                    <option key={prof.id} value={prof.id}>{prof.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho Máximo do Grupo
                </label>
                <input
                  type="number"
                  name="maxGroupSize"
                  value={service.maxGroupSize}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  style={{ color: '#000000' }}
                  placeholder="1"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={service.isActive}
                    onChange={(e) => setService(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-[#D15556] focus:ring-[#D15556] border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                    Serviço ativo (disponível para agendamento)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Instruções e Requisitos */}
          <div className="bg-white p-8 border border-gray-100">
            <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Instruções e Requisitos
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Instruções para o Cliente
                </label>
                <textarea
                  name="instructions"
                  value={service.instructions}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  style={{ color: '#000000' }}
                  placeholder="Instruções que o cliente deve seguir antes do serviço..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requisitos ou Restrições
                </label>
                <textarea
                  name="requirements"
                  value={service.requirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] bg-white text-black transition-colors"
                  style={{ color: '#000000' }}
                  placeholder="Requisitos, restrições ou contra-indicações..."
                />
              </div>
            </div>
          </div>

          {/* Mensagem de feedback */}
          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('sucesso') 
                ? 'bg-green-50 border border-green-200 text-green-600' 
                : 'bg-red-50 border border-red-200 text-red-600'
            }`}>
              {message}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/admin/servicos')}
              className="px-6 py-3 border border-gray-400 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-[#D15556] text-white font-medium hover:bg-[#c04546] transition-colors disabled:bg-gray-400 tracking-wide rounded-lg"
            >
              {isLoading ? 'Salvando...' : 'Salvar Serviço'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
