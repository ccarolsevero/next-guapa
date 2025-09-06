'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Target, DollarSign, Users, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

interface Meta {
  _id?: string
  nome: string
  descricao: string
  tipo: 'produto' | 'servico' | 'venda_total'
  tipoMeta: 'valor' | 'quantidade' // Novo campo para definir se é por valor ou quantidade
  valorMeta: number
  quantidadeMeta: number // Novo campo para metas por quantidade
  unidade: string // Unidade da quantidade (ex: "unidades", "kg", "litros")
  comissaoNormal: number // Comissão padrão (%)
  comissaoMeta: number // Comissão quando atinge a meta (%)
  periodo: 'mensal' | 'semanal' | 'diario'
  ativa: boolean
  funcionarias: string[] // IDs das funcionárias
  dataInicio: string
  dataFim: string
}

interface Funcionaria {
  _id: string
  name: string
  email: string
}

export default function MetasComissaoPage() {
  const [metas, setMetas] = useState<Meta[]>([])
  const [funcionarias, setFuncionarias] = useState<Funcionaria[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMeta, setEditingMeta] = useState<Meta | null>(null)
  const [formData, setFormData] = useState<Meta>({
    nome: '',
    descricao: '',
    tipo: 'produto',
    tipoMeta: 'valor',
    valorMeta: 0,
    quantidadeMeta: 0,
    unidade: 'unidades',
    comissaoNormal: 0,
    comissaoMeta: 0,
    periodo: 'mensal',
    ativa: true,
    funcionarias: [],
    dataInicio: '',
    dataFim: ''
  })

  useEffect(() => {
    loadMetas()
    loadFuncionarias()
  }, [])

  const loadMetas = async () => {
    try {
      const response = await fetch('/api/metas-comissao')
      if (response.ok) {
        const data = await response.json()
        setMetas(data)
      }
    } catch (error) {
      console.error('Erro ao carregar metas:', error)
      toast.error('Erro ao carregar metas')
    } finally {
      setLoading(false)
    }
  }

  const loadFuncionarias = async () => {
    try {
      const response = await fetch('/api/professionals')
      if (response.ok) {
        const data = await response.json()
        setFuncionarias(data)
      }
    } catch (error) {
      console.error('Erro ao carregar funcionárias:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const url = editingMeta ? `/api/metas-comissao/${editingMeta._id}` : '/api/metas-comissao'
      const method = editingMeta ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(editingMeta ? 'Meta atualizada com sucesso!' : 'Meta criada com sucesso!')
        setShowModal(false)
        setEditingMeta(null)
        resetForm()
        loadMetas()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Erro ao salvar meta')
      }
    } catch (error) {
      console.error('Erro ao salvar meta:', error)
      toast.error('Erro ao salvar meta')
    }
  }

  const handleEdit = (meta: Meta) => {
    setEditingMeta(meta)
    setFormData(meta)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta meta?')) return

    try {
      const response = await fetch(`/api/metas-comissao/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Meta excluída com sucesso!')
        loadMetas()
      } else {
        toast.error('Erro ao excluir meta')
      }
    } catch (error) {
      console.error('Erro ao excluir meta:', error)
      toast.error('Erro ao excluir meta')
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'produto',
      tipoMeta: 'valor',
      valorMeta: 0,
      quantidadeMeta: 0,
      unidade: 'unidades',
      comissaoNormal: 0,
      comissaoMeta: 0,
      periodo: 'mensal',
      ativa: true,
      funcionarias: [],
      dataInicio: '',
      dataFim: ''
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'funcionarias') {
      const checked = (e.target as HTMLInputElement).checked
      const funcionariaId = value
      setFormData(prev => ({
        ...prev,
        funcionarias: checked 
          ? [...prev.funcionarias, funcionariaId]
          : prev.funcionarias.filter(id => id !== funcionariaId)
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D15556]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Metas e Comissões</h1>
          <p className="text-gray-600 mt-2">Gerencie metas e comissões das funcionárias</p>
        </div>
        <button
          onClick={() => {
            resetForm()
            setEditingMeta(null)
            setShowModal(true)
          }}
          className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors font-medium flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Meta
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Metas</p>
              <p className="text-2xl font-bold text-gray-900">{metas.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Metas Ativas</p>
              <p className="text-2xl font-bold text-gray-900">{metas.filter(m => m.ativa).length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Funcionárias</p>
              <p className="text-2xl font-bold text-gray-900">{funcionarias.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metas List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Metas Cadastradas</h2>
        </div>
        
        {metas.length === 0 ? (
          <div className="p-8 text-center">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhuma meta cadastrada ainda</p>
            <p className="text-sm text-gray-400 mt-2">Clique em "Nova Meta" para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor/Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comissão Normal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Comissão Meta
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
                {metas.map((meta) => (
                  <tr key={meta._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{meta.nome}</div>
                        <div className="text-sm text-gray-500">{meta.descricao}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {meta.tipo === 'produto' ? 'Produto' : meta.tipo === 'servico' ? 'Serviço' : 'Venda Total'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {meta.tipoMeta === 'valor' ? (
                        <>R$ {meta.valorMeta.toFixed(2)}</>
                      ) : (
                        <>{meta.quantidadeMeta} {meta.unidade}</>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {meta.comissaoNormal}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {meta.comissaoMeta}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        meta.ativa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {meta.ativa ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(meta)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(meta._id!)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingMeta ? 'Editar Meta' : 'Nova Meta'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingMeta(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome da Meta *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                      style={{ color: '#000000' }}
                      placeholder="Ex: Meta de Vendas Janeiro"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Meta *
                    </label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                      style={{ color: '#000000' }}
                    >
                      <option value="produto">Venda de Produtos</option>
                      <option value="servico">Venda de Serviços</option>
                      <option value="venda_total">Venda Total</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Medição *
                    </label>
                    <select
                      name="tipoMeta"
                      value={formData.tipoMeta}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                      style={{ color: '#000000' }}
                    >
                      <option value="valor">Por Valor (R$)</option>
                      <option value="quantidade">Por Quantidade</option>
                    </select>
                  </div>

                  {formData.tipoMeta === 'quantidade' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unidade *
                      </label>
                      <input
                        type="text"
                        name="unidade"
                        value={formData.unidade}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                        style={{ color: '#000000' }}
                        placeholder="Ex: unidades, kg, litros"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                    style={{ color: '#000000' }}
                    placeholder="Descreva os detalhes da meta..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {formData.tipoMeta === 'valor' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor da Meta (R$) *
                      </label>
                      <input
                        type="number"
                        name="valorMeta"
                        value={formData.valorMeta}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                        style={{ color: '#000000' }}
                        placeholder="0.00"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantidade da Meta *
                      </label>
                      <input
                        type="number"
                        name="quantidadeMeta"
                        value={formData.quantidadeMeta}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                        style={{ color: '#000000' }}
                        placeholder="0"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comissão Normal (%) *
                    </label>
                    <input
                      type="number"
                      name="comissaoNormal"
                      value={formData.comissaoNormal}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                      style={{ color: '#000000' }}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Comissão Meta (%) *
                    </label>
                    <input
                      type="number"
                      name="comissaoMeta"
                      value={formData.comissaoMeta}
                      onChange={handleInputChange}
                      required
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                      style={{ color: '#000000' }}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Período *
                    </label>
                    <select
                      name="periodo"
                      value={formData.periodo}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                      style={{ color: '#000000' }}
                    >
                      <option value="diario">Diário</option>
                      <option value="semanal">Semanal</option>
                      <option value="mensal">Mensal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Início *
                    </label>
                    <input
                      type="date"
                      name="dataInicio"
                      value={formData.dataInicio}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                      style={{ color: '#000000' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data Fim *
                    </label>
                    <input
                      type="date"
                      name="dataFim"
                      value={formData.dataFim}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white text-gray-900"
                      style={{ color: '#000000' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funcionárias *
                  </label>
                  <div className="grid grid-cols-2 gap-4 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    {funcionarias.map((funcionaria) => (
                      <label key={funcionaria._id} className="flex items-center">
                        <input
                          type="checkbox"
                          name="funcionarias"
                          value={funcionaria._id}
                          checked={formData.funcionarias.includes(funcionaria._id)}
                          onChange={handleInputChange}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">{funcionaria.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="ativa"
                    checked={formData.ativa}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Meta ativa</label>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingMeta(null)
                      resetForm()
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-[#D15556] text-white rounded-lg hover:bg-[#c04546] transition-colors"
                  >
                    {editingMeta ? 'Atualizar' : 'Criar'} Meta
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
