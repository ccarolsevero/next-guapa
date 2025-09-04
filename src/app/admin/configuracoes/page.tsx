'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  User, 
  Building, 
  Clock, 
  Save,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react'

interface Configuracao {
  _id?: string
  nomeSalao: string
  emailContato: string
  telefone: string
  endereco: string
  moeda: string
  fusoHorario: string
  taxaCancelamento: number
  tempoAntecedencia: number
  politicaCancelamento: string
  politicaReagendamento: string
  horariosFuncionamento: Array<{
    dia: string
    ativo: boolean
    horaInicio: string
    horaFim: string
  }>
  autenticacaoDuasEtapas: boolean
  sessaoAutomatica: boolean
  logAtividades: boolean
}

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showPassword, setShowPassword] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [configuracao, setConfiguracao] = useState<Configuracao | null>(null)
  const [error, setError] = useState<string | null>(null)

  const tabs = [
    { id: 'general', name: 'Geral', icon: Settings },
    { id: 'business', name: 'Negócio', icon: Building },
    { id: 'schedule', name: 'Horários', icon: Clock }
  ]

  useEffect(() => {
    const fetchConfiguracao = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/configuracoes')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar configurações')
        }
        
        const data = await response.json()
        setConfiguracao(data)
      } catch (err) {
        console.error('Erro ao buscar configurações:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
      } finally {
        setLoading(false)
      }
    }

    fetchConfiguracao()
  }, [])

  const handleSave = async () => {
    if (!configuracao) return
    
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/configuracoes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configuracao),
      })
      
      if (!response.ok) {
        throw new Error('Erro ao salvar configurações')
      }
      
      const result = await response.json()
      console.log('Configurações salvas:', result)
      
      // Mostrar feedback de sucesso
      alert('Configurações salvas com sucesso!')
      
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar configurações. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const updateConfiguracao = (field: string, value: any) => {
    setConfiguracao(prev => prev ? { ...prev, [field]: value } : null)
  }

  const updateHorarioFuncionamento = (index: number, field: string, value: any) => {
    if (!configuracao) return
    
    const novosHorarios = [...configuracao.horariosFuncionamento]
    novosHorarios[index] = { ...novosHorarios[index], [field]: value }
    
    setConfiguracao(prev => prev ? { ...prev, horariosFuncionamento: novosHorarios } : null)
  }

  const handleChangePassword = async () => {
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      alert('Por favor, preencha todos os campos de senha')
      return
    }

    if (novaSenha !== confirmarSenha) {
      alert('A nova senha e a confirmação não coincidem')
      return
    }

    if (novaSenha.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres')
      return
    }

    try {
      setSalvandoSenha(true)
      
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senhaAtual,
          novaSenha
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao alterar senha')
      }
      
      // Limpar campos
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
      
      alert('Senha alterada com sucesso!')
      
    } catch (error) {
      console.error('Erro ao alterar senha:', error)
      alert(error instanceof Error ? error.message : 'Erro ao alterar senha')
    } finally {
      setSalvandoSenha(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#D15556]" />
            <span className="text-gray-600">Carregando configurações...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !configuracao) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <Settings className="w-16 h-16 mx-auto mb-2" />
            <h2 className="text-xl font-semibold">Erro ao carregar configurações</h2>
            <p className="text-gray-600">{error || 'Configurações não encontradas'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-[#006D5B]">Configurações</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure as preferências do sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-[#D15556] text-[#D15556]'
                    : 'border-transparent text-gray-500 hover:text-[#D15556] hover:border-[#D15556]'
                }`}
              >
                <IconComponent className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Conteúdo das Tabs */}
      <div className="space-y-8">
        {/* Configurações Gerais */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
              <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Informações do Sistema</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Salão
                  </label>
                  <input
                    type="text"
                    value={configuracao.nomeSalao}
                    onChange={(e) => updateConfiguracao('nomeSalao', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email de Contato
                  </label>
                  <input
                    type="email"
                    value={configuracao.emailContato}
                    onChange={(e) => updateConfiguracao('emailContato', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={configuracao.telefone}
                    onChange={(e) => updateConfiguracao('telefone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={configuracao.endereco}
                    onChange={(e) => updateConfiguracao('endereco', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
              <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Alterar Senha</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Senha Atual
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent pr-10"
                      style={{ color: '#000000' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleChangePassword}
                    disabled={salvandoSenha}
                    className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#b83e3d] transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {salvandoSenha ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      'Alterar Senha'
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Configurações do Negócio */}
        {activeTab === 'business' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
              <h3 className="text-lg font-semibold text-[#006D5B] mb-4">Configurações do Negócio</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Moeda
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    style={{ color: '#000000' }}>
                    <option value="BRL">Real Brasileiro (R$)</option>
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuso Horário
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    style={{ color: '#000000' }}>
                    <option value="America/Sao_Paulo">São Paulo (GMT-3)</option>
                    <option value="America/New_York">Nova York (GMT-5)</option>
                    <option value="Europe/London">Londres (GMT+0)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taxa de Cancelamento (%)
                  </label>
                  <input
                    type="number"
                    defaultValue="10"
                    min="0"
                    max="100"
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo de Antecedência (min)
                  </label>
                  <input
                    type="number"
                    defaultValue="15"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Políticas</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Política de Cancelamento
                  </label>
                  <textarea
                    rows={4}
                    defaultValue="Cancelamentos devem ser feitos com pelo menos 24h de antecedência. Cancelamentos em menos de 24h podem ser cobrados 50% do valor do serviço."
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Política de Reagendamento
                  </label>
                  <textarea
                    rows={4}
                    defaultValue="Reagendamentos podem ser feitos até 2h antes do horário marcado, sem custo adicional."
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Configurações de Horários */}
        {activeTab === 'schedule' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Horário de Funcionamento</h3>
              
              <div className="space-y-4">
                {['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'].map((day) => (
                  <div key={day} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        defaultChecked={day !== 'Domingo'}
                        className="rounded"
                      />
                      <span className="font-medium text-gray-900">{day}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        defaultValue="09:00"
                        className="px-3 py-1 border border-gray-300 bg-white text-black rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        style={{ color: '#000000' }}
                      />
                      <span className="text-gray-500">até</span>
                      <input
                        type="time"
                        defaultValue="18:00"
                        className="px-3 py-1 border border-gray-300 bg-white text-black rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        style={{ color: '#000000' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}


      </div>

      {/* Botão Salvar */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center disabled:opacity-50"
        >
          <Save className="w-4 h-4 mr-2" />
          {isLoading ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  )
}


