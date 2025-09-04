'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Lightbulb, 
  Plus, 
  Paperclip, 
  Download, 
  Eye, 
  Trash2, 
  Edit,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
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

interface ClienteData {
  _id: string
  name: string
}

export default function RecomendacoesPage() {
  const params = useParams()
  const [recomendacoes, setRecomendacoes] = useState<Recomendacao[]>([])
  const [cliente, setCliente] = useState<ClienteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)

  // Estados do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'pos-atendimento' as const,
    prioridade: 'media' as const,
    dataValidade: '',
    observacoes: ''
  })
  const [anexos, setAnexos] = useState<Array<{
    nome: string
    url: string
    tipo: string
    tamanho: number
    dataUpload: Date
  }>>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Buscar dados do cliente
        const clientResponse = await fetch(`/api/clients/${params.id}/detalhes`)
        if (clientResponse.ok) {
          const clientData = await clientResponse.json()
          setCliente(clientData)
        }
        
        // Buscar recomendações
        const recomendacoesResponse = await fetch(`/api/recomendacoes?clientId=${params.id}`)
        if (recomendacoesResponse.ok) {
          const recomendacoesData = await recomendacoesResponse.json()
          setRecomendacoes(recomendacoesData.recomendacoes)
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
        setError('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Erro no upload')
      }
      
      const result = await response.json()
      setAnexos(prev => [...prev, result.file])
      
    } catch (error) {
      console.error('Erro no upload:', error)
      alert('Erro ao fazer upload do arquivo')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!cliente) return
    
    try {
      setSaving(true)
      
      const response = await fetch('/api/recomendacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: cliente._id,
          ...formData,
          anexos,
          profissionalId: '68b0ebbcd9700d5d16b546b8' // ID temporário - deve vir do contexto de autenticação
        }),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao salvar recomendação')
      }
      
      // Recarregar recomendações
      const recomendacoesResponse = await fetch(`/api/recomendacoes?clientId=${params.id}`)
      if (recomendacoesResponse.ok) {
        const recomendacoesData = await recomendacoesResponse.json()
        setRecomendacoes(recomendacoesData.recomendacoes)
      }
      
      // Limpar formulário
      setFormData({
        titulo: '',
        descricao: '',
        tipo: 'produto',
        prioridade: 'media',
        dataValidade: '',
        observacoes: ''
      })
      setAnexos([])
      setShowModal(false)
      
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar recomendação')
    } finally {
      setSaving(false)
    }
  }

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#D15556]" />
            <span className="text-gray-600">Carregando recomendações...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !cliente) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Lightbulb className="w-16 h-16 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Erro ao carregar</h2>
            <p className="text-gray-600">{error || 'Cliente não encontrado'}</p>
          </div>
          <Link 
            href="/admin/clientes"
            className="inline-flex items-center text-[#D15556] hover:text-[#B84444]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Clientes
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
          href={`/admin/clientes/${cliente._id}`}
          className="flex items-center text-[#D15556] hover:text-[#B84444] mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar para Cliente
        </Link>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Lightbulb className="w-8 h-8 text-orange-600 mr-3" />
              Recomendações
            </h1>
            <p className="text-gray-600">Recomendações para {cliente.name}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Recomendação
          </button>
        </div>
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
                    <h3 className="text-xl font-semibold text-gray-900">{recomendacao.titulo}</h3>
                    <p className="text-gray-600 mt-1">{recomendacao.descricao}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(recomendacao.status)}`}>
                    {recomendacao.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPrioridadeColor(recomendacao.prioridade)}`}>
                    {recomendacao.prioridade}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  <span>{recomendacao.professional.name}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{new Date(recomendacao.dataRecomendacao).toLocaleDateString('pt-BR')}</span>
                </div>
                {recomendacao.dataValidade && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Válida até: {new Date(recomendacao.dataValidade).toLocaleDateString('pt-BR')}</span>
                  </div>
                )}
              </div>
              
              {recomendacao.anexos && recomendacao.anexos.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                    <Paperclip className="w-4 h-4 mr-2" />
                    Anexos ({recomendacao.anexos.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recomendacao.anexos.map((anexo, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{anexo.nome}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(anexo.tamanho)}</p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <a
                            href={anexo.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <a
                            href={anexo.url}
                            download={anexo.nome}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
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
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900 mb-1">Observações</h4>
                  <p className="text-sm text-gray-600">{recomendacao.observacoes}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Lightbulb className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma recomendação encontrada</h3>
            <p className="text-gray-600 mb-4">Comece criando uma recomendação para este cliente.</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Recomendação
            </button>
          </div>
        )}
      </div>

      {/* Modal de Nova Recomendação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Nova Recomendação</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    placeholder="Ex: Cuidados pós-coloração"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 resize-none"
                    rows={3}
                    placeholder="Descreva os cuidados e orientações em detalhes..."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      value={formData.tipo}
                      onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                      required
                    >
                      <option value="pos-atendimento">Pós-Atendimento</option>
                      <option value="cuidados">Cuidados</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="orientacoes">Orientações</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade
                    </label>
                    <select
                      value={formData.prioridade}
                      onChange={(e) => setFormData(prev => ({ ...prev, prioridade: e.target.value as any }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                    >
                      <option value="baixa">Baixa</option>
                      <option value="media">Média</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Validade
                  </label>
                  <input
                    type="date"
                    value={formData.dataValidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, dataValidade: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 resize-none"
                    rows={2}
                    placeholder="Observações adicionais..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Anexar Arquivos
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          Array.from(e.target.files).forEach(handleFileUpload)
                        }
                      }}
                      className="hidden"
                      id="file-upload"
                      accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Clique para anexar arquivos
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        JPG, PNG, GIF, PDF, DOC, DOCX, TXT (máx. 10MB)
                      </span>
                    </label>
                  </div>
                  
                  {uploading && (
                    <div className="mt-2 flex items-center text-orange-600">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      <span className="text-sm">Fazendo upload...</span>
                    </div>
                  )}
                  
                  {anexos.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Arquivos anexados:</h4>
                      {anexos.map((anexo, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                          <span className="text-sm text-gray-900">{anexo.nome}</span>
                          <button
                            type="button"
                            onClick={() => setAnexos(prev => prev.filter((_, i) => i !== index))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Recomendação'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
