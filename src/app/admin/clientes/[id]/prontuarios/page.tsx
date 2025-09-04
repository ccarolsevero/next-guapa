'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  User, 
  DollarSign, 
  Scissors, 
  Package,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react'

interface Prontuario {
  _id: string
  dataAtendimento: string
  historicoProcedimentos: string
  reacoesEfeitos: string
  recomendacoes: string
  proximaSessao?: string
  observacoesAdicionais: string
  servicosRealizados: Array<{
    servicoId: string
    nome: string
    preco: number
    quantidade: number
  }>
  produtosVendidos: Array<{
    produtoId: string
    nome: string
    preco: number
    quantidade: number
    vendidoPor?: string
  }>
  valorTotal: number
  professional: {
    _id: string
    name: string
  }
  comanda: {
    _id: string
    dataInicio: string
    status: string
  }
  createdAt: string
  updatedAt: string
}

interface ProntuariosResponse {
  prontuarios: Prontuario[]
  total: number
}

export default function ProntuariosPage() {
  const params = useParams()
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedProntuario, setExpandedProntuario] = useState<string | null>(null)

  useEffect(() => {
    const fetchProntuarios = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/clients/${params.id}/prontuarios`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar prontuários')
        }
        
        const data: ProntuariosResponse = await response.json()
        setProntuarios(data.prontuarios)
      } catch (err) {
        console.error('Erro ao buscar prontuários:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProntuarios()
    }
  }, [params.id])

  const toggleExpanded = (prontuarioId: string) => {
    setExpandedProntuario(expandedProntuario === prontuarioId ? null : prontuarioId)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#D15556]" />
            <span className="text-gray-600">Carregando prontuários...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertCircle className="w-16 h-16 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Erro ao carregar prontuários</h2>
            <p className="text-gray-600">{error}</p>
          </div>
          <Link 
            href={`/admin/clientes/${params.id}`}
            className="inline-flex items-center text-[#D15556] hover:text-[#B84444]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Cliente
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href={`/admin/clientes/${params.id}`}
          className="flex items-center text-[#D15556] hover:text-[#B84444] mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Cliente
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 text-[#D15556] mr-3" />
              Prontuários
            </h1>
            <p className="text-gray-600">Histórico completo de atendimentos</p>
          </div>
          <div className="bg-[#D15556] text-white px-4 py-2 rounded-lg">
            {prontuarios.length} {prontuarios.length === 1 ? 'Prontuário' : 'Prontuários'}
          </div>
        </div>
      </div>

      {/* Lista de Prontuários */}
      {prontuarios.length > 0 ? (
        <div className="space-y-6">
          {prontuarios.map((prontuario) => (
            <div key={prontuario._id} className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
              {/* Header do Prontuário */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpanded(prontuario._id)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <div className="flex items-center text-[#D15556]">
                        <Calendar className="w-5 h-5 mr-2" />
                        <span className="font-semibold">{formatDate(prontuario.dataAtendimento)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        <span>{prontuario.professional.name}</span>
                      </div>
                      <div className="flex items-center text-green-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        <span className="font-semibold">R$ {prontuario.valorTotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="text-gray-700">
                      <p className="font-medium mb-1">Histórico de Procedimentos:</p>
                      <p className="text-sm line-clamp-2">{prontuario.historicoProcedimentos}</p>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <div className={`transform transition-transform duration-200 ${
                      expandedProntuario === prontuario._id ? 'rotate-180' : ''
                    }`}>
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conteúdo Expandido */}
              {expandedProntuario === prontuario._id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informações Principais */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Histórico de Procedimentos</h3>
                        <p className="text-gray-700 bg-white p-3 rounded-lg border">{prontuario.historicoProcedimentos}</p>
                      </div>
                      
                      {prontuario.reacoesEfeitos && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Reações e Efeitos</h3>
                          <p className="text-gray-700 bg-white p-3 rounded-lg border">{prontuario.reacoesEfeitos}</p>
                        </div>
                      )}
                      
                      {prontuario.recomendacoes && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Recomendações</h3>
                          <p className="text-gray-700 bg-white p-3 rounded-lg border">{prontuario.recomendacoes}</p>
                        </div>
                      )}
                      
                      {prontuario.observacoesAdicionais && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Observações Adicionais</h3>
                          <p className="text-gray-700 bg-white p-3 rounded-lg border">{prontuario.observacoesAdicionais}</p>
                        </div>
                      )}
                    </div>

                    {/* Serviços e Produtos */}
                    <div className="space-y-4">
                      {/* Serviços Realizados */}
                      {prontuario.servicosRealizados.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Scissors className="w-5 h-5 text-[#D15556] mr-2" />
                            Serviços Realizados
                          </h3>
                          <div className="space-y-2">
                            {prontuario.servicosRealizados.map((servico, index) => (
                              <div key={index} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-900">{servico.nome}</span>
                                  <span className="text-gray-600 ml-2">x{servico.quantidade}</span>
                                </div>
                                <span className="font-semibold text-[#D15556]">
                                  R$ {(servico.preco * servico.quantidade).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Produtos Vendidos */}
                      {prontuario.produtosVendidos.length > 0 && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <Package className="w-5 h-5 text-[#D15556] mr-2" />
                            Produtos Vendidos
                          </h3>
                          <div className="space-y-2">
                            {prontuario.produtosVendidos.map((produto, index) => (
                              <div key={index} className="bg-white p-3 rounded-lg border flex justify-between items-center">
                                <div>
                                  <span className="font-medium text-gray-900">{produto.nome}</span>
                                  <span className="text-gray-600 ml-2">x{produto.quantidade}</span>
                                </div>
                                <span className="font-semibold text-[#D15556]">
                                  R$ {(produto.preco * produto.quantidade).toFixed(2)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Próxima Sessão */}
                      {prontuario.proximaSessao && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            Próxima Sessão
                          </h3>
                          <p className="text-blue-800">
                            {new Date(prontuario.proximaSessao).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum prontuário encontrado</h3>
          <p className="text-gray-600">Este cliente ainda não possui prontuários registrados.</p>
        </div>
      )}
    </div>
  )
}
