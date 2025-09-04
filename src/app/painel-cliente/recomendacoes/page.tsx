'use client'

import { useState, useEffect } from 'react'
import { 
  Lightbulb, 
  Download, 
  Eye, 
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Paperclip
} from 'lucide-react'

interface Recomendacao {
  _id: string
  titulo: string
  descricao: string
  tipo: 'pos-atendimento' | 'cuidados' | 'manutencao' | 'orientacoes' | 'outro'
  prioridade: 'baixa' | 'media' | 'alta'
  status: 'ativa' | 'concluida' | 'cancelada'
  anexos: Array<{
    nome: string
    url: string
    tipo: string
    tamanho: number
    dataUpload: string
  }>
  professional: {
    _id: string
    name: string
  }
  dataRecomendacao: string
  dataValidade?: string
  observacoes?: string
  createdAt: string
  updatedAt: string
}

export default function RecomendacoesClientePage() {
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRecomendacoes = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Buscar ID do cliente do localStorage ou contexto de autenticação
        const clienteId = localStorage.getItem('clienteId') // Ajustar conforme sua implementação de auth
        
        if (!clienteId) {
          throw new Error('Cliente não autenticado')
        }
        
        const response = await fetch(`/api/recomendacoes?clientId=${clienteId}`)
        
        if (!response.ok) {
          throw new Error('Erro ao carregar recomendações')
        }
        
        const data = await response.json()
        setRecomendacoes(data.recomendacoes)
      } catch (err) {
        console.error('Erro ao buscar recomendações:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchRecomendacoes()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa': return 'bg-green-100 text-green-800'
      case 'concluida': return 'bg-blue-100 text-blue-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-100 text-red-800'
      case 'media': return 'bg-yellow-100 text-yellow-800'
      case 'baixa': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'pos-atendimento': return '📋'
      case 'cuidados': return '💅'
      case 'manutencao': return '🔧'
      case 'orientacoes': return '📖'
      default: return '💡'
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'pos-atendimento': return 'Pós-Atendimento'
      case 'cuidados': return 'Cuidados'
      case 'manutencao': return 'Manutenção'
      case 'orientacoes': return 'Orientações'
      default: return 'Outro'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const isExpired = (dataValidade?: string) => {
    if (!dataValidade) return false
    return new Date(dataValidade) < new Date()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#D15556]" />
            <span className="text-gray-600">Carregando suas recomendações...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Lightbulb className="w-16 h-16 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Erro ao carregar</h2>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Lightbulb className="w-8 h-8 text-orange-600 mr-3" />
          Orientações e Cuidados
        </h1>
        <p className="text-gray-600 mt-2">
          Orientações e cuidados pós-atendimento dos nossos profissionais
        </p>
      </div>

      {/* Lista de Recomendações */}
      <div className="space-y-6">
        {recomendacoes.length > 0 ? (
          recomendacoes.map((recomendacao) => (
            <div key={recomendacao._id} className="bg-white rounded-lg shadow-lg border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getTipoIcon(recomendacao.tipo)}</span>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-xl font-semibold text-gray-900">{recomendacao.titulo}</h3>
                      <span className="text-sm text-gray-500">• {getTipoLabel(recomendacao.tipo)}</span>
                    </div>
                    <p className="text-gray-600">{recomendacao.descricao}</p>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(recomendacao.status)}`}>
                    {recomendacao.status === 'ativa' ? 'Ativa' : 
                     recomendacao.status === 'concluida' ? 'Concluída' : 'Cancelada'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPrioridadeColor(recomendacao.prioridade)}`}>
                    Prioridade {recomendacao.prioridade}
                  </span>
                  {isExpired(recomendacao.dataValidade) && (
                    <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Expirada
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>Recomendado por: {recomendacao.professional.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(recomendacao.dataRecomendacao).toLocaleDateString('pt-BR')}</span>
                </div>
                {recomendacao.dataValidade && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span className={isExpired(recomendacao.dataValidade) ? 'text-red-600' : ''}>
                      Válida até: {new Date(recomendacao.dataValidade).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
              
              {recomendacao.anexos && recomendacao.anexos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Guias e Materiais ({recomendacao.anexos.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recomendacao.anexos.map((anexo, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{anexo.nome}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(anexo.tamanho)}</p>
                        </div>
                        <div className="flex space-x-2 ml-3">
                          <a
                            href={anexo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded border"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <a
                            href={anexo.url}
                            download={anexo.nome}
                            className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded border"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {recomendacao.observacoes && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Observações Importantes
                  </h4>
                  <p className="text-sm text-blue-800">{recomendacao.observacoes}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma orientação encontrada</h3>
            <p className="text-gray-600">
              Nossos profissionais ainda não criaram orientações de cuidados para você.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
