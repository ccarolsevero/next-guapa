'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash, Save } from 'lucide-react'

interface Service {
  _id: string
  id: string
  name: string
  price: number
}

interface PackageForm {
  name: string
  validityDays: number
  description: string
  discount: number
  commission: string
  availableOnline: boolean
  availableInSystem: boolean
  isActive: boolean
  services: Array<{
    serviceId: string
    name: string
    price: number
  }>
}

const commissionOptions = [
  { value: 'comissao-valor-integral', label: 'Comissão do Valor Integral' },
  { value: 'comissao-valor-desconto', label: 'Comissão do Valor com Desconto' },
  { value: 'sem-comissao', label: 'Sem Comissão' }
]

export default function EditarPacotePage() {
  const router = useRouter()
  const params = useParams()
  const packageId = params.id as string
  
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPackage, setLoadingPackage] = useState(true)
  const [formData, setFormData] = useState<PackageForm>({
    name: '',
    validityDays: 30,
    description: '',
    discount: 0,
    commission: 'sem-comissao',
    availableOnline: true,
    availableInSystem: true,
    isActive: true,
    services: []
  })

  // Carregar serviços disponíveis
  const loadServices = async () => {
    try {
      const response = await fetch('/api/services?isActive=true')
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error('Erro ao carregar serviços:', error)
    }
  }

  // Carregar dados do pacote
  const loadPackage = async () => {
    try {
      setLoadingPackage(true)
      const response = await fetch(`/api/packages/${packageId}`)
      if (response.ok) {
        const packageData = await response.json()
        
        // Calcular desconto baseado nos preços
        const originalPrice = packageData.originalPrice || 0
        const discountedPrice = packageData.discountedPrice || 0
        const discount = originalPrice > 0 ? ((originalPrice - discountedPrice) / originalPrice) * 100 : 0
        
        setFormData({
          name: packageData.name || '',
          validityDays: packageData.validityDays || 30,
          description: packageData.description || '',
          discount: Math.round(discount),
          commission: packageData.commission || 'sem-comissao',
          availableOnline: packageData.availableOnline !== false,
          availableInSystem: packageData.availableInSystem !== false,
          isActive: packageData.isActive !== false,
          services: packageData.services || []
        })
      } else {
        alert('Erro ao carregar dados do pacote')
        router.push('/admin/pacotes')
      }
    } catch (error) {
      console.error('Erro ao carregar pacote:', error)
      alert('Erro ao carregar dados do pacote')
      router.push('/admin/pacotes')
    } finally {
      setLoadingPackage(false)
    }
  }

  useEffect(() => {
    loadServices()
    loadPackage()
  }, [packageId])

  const handleInputChange = (field: keyof PackageForm, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addService = () => {
    if (formData.services.length < 10) { // Limite de 10 serviços por pacote
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, {
          serviceId: '',
          name: '',
          price: 0
        }]
      }))
    }
  }

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }))
  }

  const updateService = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newServices = [...prev.services]
      newServices[index] = { ...newServices[index], [field]: value }
      
      // Se o serviceId foi alterado, buscar dados do serviço
      if (field === 'serviceId') {
        const selectedService = services.find(s => s._id === value)
        if (selectedService) {
          newServices[index] = {
            ...newServices[index],
            name: selectedService.name,
            price: selectedService.price
          }
        }
      }
      
      return {
        ...prev,
        services: newServices
      }
    })
  }

  const calculateOriginalPrice = () => {
    return formData.services.reduce((sum, service) => sum + (service.price || 0), 0)
  }

  const calculateDiscountedPrice = () => {
    const total = calculateOriginalPrice()
    return total * (1 - formData.discount / 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || formData.validityDays < 1) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (formData.services.length === 0) {
      alert('Por favor, adicione pelo menos um serviço ao pacote')
      return
    }

    if (formData.services.some(s => !s.serviceId)) {
      alert('Por favor, selecione todos os serviços')
      return
    }

    if (!formData.availableOnline && !formData.availableInSystem) {
      alert('O pacote deve estar disponível pelo menos em uma plataforma (Online ou Sistema)')
      return
    }

    setLoading(true)

    try {
      const packageData = {
        ...formData,
        originalPrice: calculateOriginalPrice(),
        discountedPrice: calculateDiscountedPrice()
      }

      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      })

      if (response.ok) {
        alert('Pacote atualizado com sucesso!')
        router.push('/admin/pacotes')
      } else {
        const error = await response.json()
        alert(`Erro ao atualizar pacote: ${error.error}`)
      }
    } catch (error) {
      console.error('Erro ao atualizar pacote:', error)
      alert('Erro ao atualizar pacote')
    } finally {
      setLoading(false)
    }
  }

  if (loadingPackage) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D15556] mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando dados do pacote...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Link
            href="/admin/pacotes"
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar Pacote</h1>
        </div>
        <p className="text-sm text-gray-700">
          Edite as informações do pacote de serviços
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Pacote *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                placeholder="Ex: Pacote Completo de Cabelo"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validade (dias) *
              </label>
              <input
                type="number"
                min="1"
                value={formData.validityDays}
                onChange={(e) => handleInputChange('validityDays', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                placeholder="30"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                placeholder="Descreva o que está incluído no pacote..."
                required
              />
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configurações</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desconto (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comissão
              </label>
              <select
                value={formData.commission}
                onChange={(e) => handleInputChange('commission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556]"
              >
                {commissionOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-[#D15556] focus:ring-[#D15556] border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Ativo</span>
              </label>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilidade
              </label>
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.availableOnline}
                    onChange={(e) => handleInputChange('availableOnline', e.target.checked)}
                    className="h-4 w-4 text-[#D15556] focus:ring-[#D15556] border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Disponível Online</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.availableInSystem}
                    onChange={(e) => handleInputChange('availableInSystem', e.target.checked)}
                    className="h-4 w-4 text-[#D15556] focus:ring-[#D15556] border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Disponível no Sistema</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Serviços */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Serviços do Pacote</h2>
            <button
              type="button"
              onClick={addService}
              className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center"
              disabled={formData.services.length >= 10}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Serviço
            </button>
          </div>

          {formData.services.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum serviço adicionado. Clique em "Adicionar Serviço" para começar.
            </p>
          ) : (
            <div className="space-y-4">
              {formData.services.map((service, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">Serviço {index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeService(index)}
                      className="text-red-600 hover:text-red-900 p-1"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Serviço *
                      </label>
                      <select
                        value={service.serviceId}
                        onChange={(e) => updateService(index, 'serviceId', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] text-sm"
                        required
                      >
                        <option value="">Selecione um serviço</option>
                        {services.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Preço
                      </label>
                      <input
                        type="number"
                        value={service.price}
                        onChange={(e) => updateService(index, 'price', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] text-sm"
                        placeholder="0.00"
                        readOnly
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumo do Preço */}
        {formData.services.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Preço</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Preço Original</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(calculateOriginalPrice())}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">Desconto</p>
                <p className="text-2xl font-bold text-green-600">
                  {formData.discount > 0 ? `-${formData.discount}%` : '0%'}
                </p>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600">Preço Final</p>
                <p className="text-2xl font-bold text-[#D15556]">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(calculateDiscountedPrice())}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/pacotes"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}

