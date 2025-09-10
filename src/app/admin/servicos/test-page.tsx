'use client'

import { useState, useEffect } from 'react'

export default function TestServicosPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const loadServices = async () => {
    try {
      setLoading(true)
      console.log('🔍 Carregando serviços...')
      const response = await fetch('/api/services')
      console.log('📡 Response status:', response.status)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar serviços')
      }
      
      const data = await response.json()
      console.log('📋 Dados recebidos:', data)
      setServices(data)
    } catch (error) {
      console.error('❌ Erro ao carregar serviços:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Teste de Serviços</h1>
      
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <div>
          <p>Total de serviços: {services.length}</p>
          {services.map((service: any) => (
            <div key={service._id} className="border p-4 mb-2">
              <h3>{service.name}</h3>
              <p>Categoria: {service.category}</p>
              <p>Preço: R$ {service.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
