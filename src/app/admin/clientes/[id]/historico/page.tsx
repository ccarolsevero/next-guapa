'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star,
  User,
  Scissors,
  ShoppingBag
} from 'lucide-react'

interface Cliente {
  _id: string
  name: string
  phone: string
  email: string
  address?: string
}

interface Comanda {
  _id: string
  dataInicio: string
  professionalId: {
    _id: string
    name: string
  }
  servicos: Array<{
    nome: string
    preco: number
    quantidade: number
  }>
  produtos: Array<{
    nome: string
    preco: number
    quantidade: number
  }>
  valorTotal: number
  status: string
  observacoes?: string
}

export default function HistoricoClientePage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id

  const [client, setClient] = useState<Cliente | null>(null)
  const [comandas, setComandas] = useState<Comanda[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVisit, setSelectedVisit] = useState<Comanda | null>(null)

  // Buscar dados do cliente e suas comandas
  useEffect(() => {
    const fetchData = async () => {
      if (!clientId) return
      
      try {
        setLoading(true)
        console.log('🔄 Buscando dados do cliente:', clientId)
        
        // Buscar dados do cliente
        const clientResponse = await fetch(`/api/clients/${clientId}`)
        console.log('📡 Resposta da API cliente:', clientResponse.status)
        
        if (clientResponse.ok) {
          const clientData = await clientResponse.json()
          console.log('📦 Dados do cliente recebidos:', clientData)
          
          // A API retorna o cliente diretamente, não dentro de clientData.client
          setClient(clientData)
          console.log('✅ Cliente carregado:', clientData.name)
        } else {
          console.error('❌ Erro ao buscar cliente:', clientResponse.status)
          const errorData = await clientResponse.json()
          console.error('❌ Detalhes do erro:', errorData)
        }
        
        // Buscar comandas do cliente
        const comandasResponse = await fetch(`/api/comandas?clientId=${clientId}`)
        console.log('📡 Resposta da API comandas:', comandasResponse.status)
        
        if (comandasResponse.ok) {
          const comandasData = await comandasResponse.json()
          console.log('📦 Dados das comandas recebidos:', comandasData)
          
          // A API retorna { comandas: [...] }
          setComandas(comandasData.comandas || [])
          console.log('✅ Comandas carregadas:', comandasData.comandas?.length || 0)
        } else {
          console.error('❌ Erro ao buscar comandas:', comandasResponse.status)
          const errorData = await comandasResponse.json()
          console.error('❌ Detalhes do erro:', errorData)
        }
        
      } catch (error) {
        console.error('❌ Erro ao buscar dados:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [clientId])

  const getTotalRevenue = () => comandas.reduce((sum, comanda) => sum + comanda.valorTotal, 0)
  const getTotalVisits = () => comandas.length
  const getLastVisit = () => {
    if (comandas.length === 0) return null
    const sorted = [...comandas].sort((a, b) => {
      // Sempre usar dataInicio, que é o campo correto da comanda
      const dateA = a.dataInicio
      const dateB = b.dataInicio
      if (!dateA || !dateB) {
        console.warn('⚠️ Comanda sem dataInicio:', { a: a._id, b: b._id })
        return 0
      }
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
    return sorted[0]
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }) + ' ' + 
           date.toLocaleTimeString('pt-BR', { 
             hour: '2-digit', 
             minute: '2-digit',
             timeZone: 'America/Sao_Paulo'
           })
  }

  const getComandaDate = (comanda: Comanda) => {
    // Sempre usar dataInicio, que é o campo correto
    if (!comanda.dataInicio) {
      console.warn('⚠️ Comanda sem dataInicio:', comanda._id)
    }
    return comanda.dataInicio || 'Data não definida'
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando histórico...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cliente não encontrado</h2>
            <p className="text-gray-600 mb-6">O cliente que você está procurando não existe ou foi removido.</p>
            <Link
              href="/admin/clientes"
              className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-medium tracking-wide"
            >
              Voltar para Clientes
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
                href={`/admin/clientes/${clientId}`}
                className="flex items-center text-gray-600 hover:text-black mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-light text-gray-900">Histórico da Cliente</h1>
                <p className="text-sm text-gray-600">{client.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gray-50 border border-gray-100">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Visitas</p>
                <p className="text-2xl font-light text-gray-900">{getTotalVisits()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 border border-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Gasto</p>
                <p className="text-2xl font-light text-gray-900">R$ {getTotalRevenue().toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 border border-blue-100">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-2xl font-light text-gray-900">
                  R$ {getTotalVisits() > 0 ? (getTotalRevenue() / getTotalVisits()).toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-50 border border-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Última Visita</p>
                <p className="text-2xl font-light text-gray-900">
                  {getLastVisit() ? formatDate(getLastVisit()!.dataInicio) : 'Nunca'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Atendimentos */}
        <div className="bg-white border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-medium text-gray-900">Histórico de Atendimentos</h2>
          </div>
          
          {comandas.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum atendimento encontrado</h3>
              <p className="text-gray-600">Esta cliente ainda não possui histórico de atendimentos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Profissional
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serviços/Produtos
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comandas.map((comanda) => (
                    <tr key={comanda._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDateTime(comanda.dataInicio)}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{comanda.professionalId.name}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center mb-1">
                            <Scissors className="w-4 h-4 mr-2 text-blue-600" />
                            <span className="font-medium">Serviços:</span>
                          </div>
                          {comanda.servicos.map((servico, index) => (
                            <div key={index} className="ml-6 text-sm text-gray-700">
                              • {servico.nome} (R$ {servico.preco.toFixed(2)} x {servico.quantidade})
                            </div>
                          ))}
                          
                          {comanda.produtos.length > 0 && (
                            <>
                              <div className="flex items-center mb-1 mt-2">
                                <ShoppingBag className="w-4 h-4 mr-2 text-green-600" />
                                <span className="font-medium">Produtos:</span>
                              </div>
                              {comanda.produtos.map((produto, index) => (
                                <div key={index} className="ml-6 text-sm text-gray-700">
                                  • {produto.nome} (R$ {produto.preco.toFixed(2)} x {produto.quantidade})
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        R$ {comanda.valorTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          comanda.status === 'em_atendimento' ? 'bg-blue-100 text-blue-800' :
                          comanda.status === 'finalizada' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {comanda.status === 'em_atendimento' ? 'Em Atendimento' :
                           comanda.status === 'finalizada' ? 'Finalizada' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <Link
                          href={`/admin/comandas/${comanda._id}`}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          Ver Detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
