'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, X, Plus, Trash2 } from 'lucide-react'

interface Service {
  _id: string
  name: string
  price: number
  duration: number
}

interface PackageService {
  serviceId: string
  name: string
  price: number
}

interface PackageData {
  _id: string
  name: string
  description: string
  validityDays: number
  services: PackageService[]
  originalPrice: number
  discountedPrice: number
  discount: number
  commission: string
  availableOnline: boolean
  availableInSystem: boolean
  isActive: boolean
}

export default function EditarPacotePage() {
  const router = useRouter()
  const params = useParams()
  const packageId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [packageData, setPackageData] = useState<PackageData | null>(null)
  const [availableServices, setAvailableServices] = useState<Service[]>([])
  const [showServiceModal, setShowServiceModal] = useState(false)

  // Carregar dados do pacote
  useEffect(() => {
    const loadPackage = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/packages/${packageId}`)
        if (!response.ok) {
          throw new Error('Erro ao carregar pacote')
        }
        const data = await response.json()
        setPackageData(data)
      } catch (error) {
        console.error('Erro ao carregar pacote:', error)
        alert('Erro ao carregar pacote')
        router.push('/admin/pacotes')
      } finally {
        setLoading(false)
      }
    }

    if (packageId) {
      loadPackage()
    }
  }, [packageId, router])

  // Carregar serviços disponíveis
  useEffect(() => {
    const loadServices = async () => {
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          setAvailableServices(data)
        }
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
      }
    }
    loadServices()
  }, [])

  const handleInputChange = (field: string, value: any) => {
    if (!packageData) return

    setPackageData(prev => {
      if (!prev) return null
      
      const updated = { ...prev, [field]: value }
      
      // Recalcular preços se necessário
      if (field === 'services' || field === 'discount') {
        const originalPrice = field === 'services' 
          ? value.reduce((sum: number, service: PackageService) => sum + service.price, 0)
          : updated.services.reduce((sum: number, service: PackageService) => sum + service.price, 0)
        
        updated.originalPrice = originalPrice
        updated.discountedPrice = originalPrice * (1 - (updated.discount || 0) / 100)
      }
      
      return updated
    })
  }

  const addService = (service: Service) => {
    if (!packageData) return

    const newService: PackageService = {
      serviceId: service._id,
      name: service.name,
      price: service.price
    }

    const updatedServices = [...packageData.services, newService]
    handleInputChange('services', updatedServices)
    setShowServiceModal(false)
  }

  const removeService = (index: number) => {
    if (!packageData) return

    const updatedServices = packageData.services.filter((_, i) => i !== index)
    handleInputChange('services', updatedServices)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!packageData) return

    try {
      setSaving(true)
      
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packageData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Erro ao atualizar pacote')
      }

      alert('Pacote atualizado com sucesso!')
      router.push('/admin/pacotes')
    } catch (error) {
      console.error('Erro ao atualizar pacote:', error)
      alert(`Erro ao atualizar pacote: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D15556]"></div>
        </div>
      </div>
    )
  }

  if (!packageData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Pacote não encontrado</h2>
          <Link href="/admin/pacotes" className="text-[#D15556] hover:underline">
            Voltar para a lista de pacotes
          </Link>
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
            className="flex items-center text-[#D15556] hover:text-[#c04546] transition-colors mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Editar Pacote</h1>
        </div>
        <p className="text-gray-600">
          Edite as informações do pacote "{packageData.name}"
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações Básicas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Informações Básicas</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Pacote *
              </label>
              <input
                type="text"
                value={packageData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validade (dias) *
              </label>
              <input
                type="number"
                value={packageData.validityDays}
                onChange={(e) => handleInputChange('validityDays', parseInt(e.target.value))}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={packageData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
            />
          </div>
        </div>

        {/* Serviços */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Serviços Incluídos</h2>
            <button
              type="button"
              onClick={() => setShowServiceModal(true)}
              className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Serviço
            </button>
          </div>
          
          {packageData.services.length > 0 ? (
            <div className="space-y-3">
              {packageData.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600">{formatCurrency(service.price)}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhum serviço adicionado ao pacote
            </p>
          )}
        </div>

        {/* Preços e Desconto */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Preços e Desconto</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço Original
              </label>
              <input
                type="text"
                value={formatCurrency(packageData.originalPrice)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Desconto (%)
              </label>
              <input
                type="number"
                value={packageData.discount}
                onChange={(e) => handleInputChange('discount', parseFloat(e.target.value) || 0)}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preço Final
              </label>
              <input
                type="text"
                value={formatCurrency(packageData.discountedPrice)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Configurações</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Comissão
              </label>
              <select
                value={packageData.commission}
                onChange={(e) => handleInputChange('commission', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
              >
                <option value="comissao-valor-integral">Comissão Valor Integral</option>
                <option value="comissao-valor-desconto">Comissão Valor Desconto</option>
                <option value="sem-comissao">Sem Comissão</option>
              </select>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="availableOnline"
                  checked={packageData.availableOnline}
                  onChange={(e) => handleInputChange('availableOnline', e.target.checked)}
                  className="h-4 w-4 text-[#D15556] focus:ring-[#D15556] border-gray-300 rounded"
                />
                <label htmlFor="availableOnline" className="ml-2 text-sm text-gray-700">
                  Disponível Online
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="availableInSystem"
                  checked={packageData.availableInSystem}
                  onChange={(e) => handleInputChange('availableInSystem', e.target.checked)}
                  className="h-4 w-4 text-[#D15556] focus:ring-[#D15556] border-gray-300 rounded"
                />
                <label htmlFor="availableInSystem" className="ml-2 text-sm text-gray-700">
                  Disponível no Sistema
                </label>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={packageData.isActive}
                onChange={(e) => handleInputChange('isActive', e.target.checked)}
                className="h-4 w-4 text-[#D15556] focus:ring-[#D15556] border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                Pacote Ativo
              </label>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/pacotes"
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>

      {/* Modal de Seleção de Serviços */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Adicionar Serviço</h3>
                <button
                  onClick={() => setShowServiceModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {availableServices
                  .filter(service => !packageData.services.some(pkgService => pkgService.serviceId === service._id))
                  .map((service) => (
                    <div
                      key={service._id}
                      onClick={() => addService(service)}
                      className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-[#D15556] hover:bg-[#F5F0E8] transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.duration} min</p>
                        </div>
                        <span className="text-[#D15556] font-semibold">
                          {formatCurrency(service.price)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              
              {availableServices.filter(service => !packageData.services.some(pkgService => pkgService.serviceId === service._id)).length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  Todos os serviços já foram adicionados ao pacote
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
