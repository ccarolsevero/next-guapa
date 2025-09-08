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
  Loader2,
  Users,
  Plus,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  X
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

interface Employee {
  _id: string
  name: string
  username: string
  role: 'admin' | 'professional'
  canAccessFinancial: boolean
  canAccessSiteEdit: boolean
  canAccessGoals: boolean
  canAccessReports: boolean
  isActive: boolean
  lastLogin?: Date
  createdAt: Date
  updatedAt: Date
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
  
  // Estados para gerenciamento de funcionários
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    username: '',
    password: '',
    role: 'professional' as 'admin' | 'professional',
    canAccessFinancial: false,
    canAccessSiteEdit: false,
    canAccessGoals: false,
    canAccessReports: false
  })

  const tabs = [
    { id: 'general', name: 'Geral', icon: Settings },
    { id: 'business', name: 'Negócio', icon: Building },
    { id: 'schedule', name: 'Horários', icon: Clock },
    { id: 'employees', name: 'Funcionários', icon: Users }
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

    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true)
        const response = await fetch('/api/professionals')
        
        if (response.ok) {
          const data = await response.json()
          setEmployees(data)
        }
      } catch (err) {
        console.error('Erro ao buscar funcionários:', err)
      } finally {
        setLoadingEmployees(false)
      }
    }

    fetchConfiguracao()
    fetchEmployees()
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

  // Funções para gerenciar funcionários
  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.username || !newEmployee.password) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    try {
      const response = await fetch('/api/professionals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newEmployee.name,
          username: newEmployee.username,
          password: newEmployee.password,
          role: newEmployee.role,
          canAccessFinancial: newEmployee.canAccessFinancial,
          canAccessSiteEdit: newEmployee.canAccessSiteEdit,
          canAccessGoals: newEmployee.canAccessGoals,
          canAccessReports: newEmployee.canAccessReports,
          isActive: true
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao adicionar funcionário')
      }

      // Recarregar lista de funcionários
      const employeesResponse = await fetch('/api/professionals')
      if (employeesResponse.ok) {
        const data = await employeesResponse.json()
        setEmployees(data)
      }

      setShowAddEmployeeModal(false)
      setNewEmployee({
        name: '',
        username: '',
        password: '',
        role: 'professional',
        canAccessFinancial: false,
        canAccessSiteEdit: false,
        canAccessGoals: false,
        canAccessReports: false
      })
      alert('Funcionário adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar funcionário:', error)
      alert('Erro ao adicionar funcionário')
    }
  }

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee)
    setShowEditEmployeeModal(true)
  }

  const handleSaveEmployeeEdit = async () => {
    if (!selectedEmployee) return

    try {
      const response = await fetch(`/api/professionals/${selectedEmployee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedEmployee.name,
          username: selectedEmployee.username,
          role: selectedEmployee.role,
          canAccessFinancial: selectedEmployee.canAccessFinancial,
          canAccessSiteEdit: selectedEmployee.canAccessSiteEdit,
          canAccessGoals: selectedEmployee.canAccessGoals,
          canAccessReports: selectedEmployee.canAccessReports,
          isActive: selectedEmployee.isActive
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar funcionário')
      }

      // Recarregar lista de funcionários
      const employeesResponse = await fetch('/api/professionals')
      if (employeesResponse.ok) {
        const data = await employeesResponse.json()
        setEmployees(data)
      }

      setShowEditEmployeeModal(false)
      setSelectedEmployee(null)
      alert('Funcionário atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error)
      alert('Erro ao atualizar funcionário')
    }
  }

  const handleToggleEmployeeActive = async (employee: Employee) => {
    try {
      const response = await fetch(`/api/professionals/${employee._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...employee,
          isActive: !employee.isActive
        })
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar funcionário')
      }

      // Recarregar lista de funcionários
      const employeesResponse = await fetch('/api/professionals')
      if (employeesResponse.ok) {
        const data = await employeesResponse.json()
        setEmployees(data)
      }

      alert(`Funcionário ${employee.isActive ? 'desativado' : 'ativado'} com sucesso!`)
    } catch (error) {
      console.error('Erro ao atualizar funcionário:', error)
      alert('Erro ao atualizar funcionário')
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

        {/* Gerenciamento de Funcionários */}
        {activeTab === 'employees' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-[#006D5B]">Funcionários</h3>
                <button
                  onClick={() => setShowAddEmployeeModal(true)}
                  className="bg-[#D15556] text-white px-4 py-2 rounded-lg hover:bg-[#c04546] transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Funcionário
                </button>
              </div>

              {loadingEmployees ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#D15556]" />
                  <span className="ml-2 text-gray-600">Carregando funcionários...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {employees.map((employee) => (
                    <div key={employee._id} className={`border rounded-lg p-4 ${!employee.isActive ? 'opacity-60 bg-gray-100' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-[#D15556] rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className={`font-semibold ${!employee.isActive ? 'text-gray-500' : 'text-gray-800'}`}>
                              {employee.name}
                            </h4>
                            <p className="text-sm text-gray-600">@{employee.username}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                employee.role === 'admin' 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {employee.role === 'admin' ? 'Admin' : 'Professional'}
                              </span>
                              {!employee.isActive && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Inativo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleEmployeeActive(employee)}
                            className={`p-2 rounded-full transition-colors ${
                              employee.isActive 
                                ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                            title={employee.isActive ? 'Desativar' : 'Ativar'}
                          >
                            {employee.isActive ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleEditEmployee(employee)}
                            className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Permissões */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {employee.canAccessFinancial && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Financeiro
                          </span>
                        )}
                        {employee.canAccessSiteEdit && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Editar Site
                          </span>
                        )}
                        {employee.canAccessGoals && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Metas
                          </span>
                        )}
                        {employee.canAccessReports && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            Relatórios
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {employees.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-600 mb-2">
                        Nenhum funcionário cadastrado
                      </h3>
                      <p className="text-gray-500">
                        Comece adicionando o primeiro funcionário
                      </p>
                    </div>
                  )}
                </div>
              )}
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

      {/* Modal Adicionar Funcionário */}
      {showAddEmployeeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#D15556]">Adicionar Funcionário</h3>
              <button
                onClick={() => setShowAddEmployeeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={newEmployee.username}
                  onChange={(e) => setNewEmployee({...newEmployee, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                  placeholder="username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Senha *
                </label>
                <input
                  type="password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={newEmployee.role}
                  onChange={(e) => setNewEmployee({...newEmployee, role: e.target.value as 'admin' | 'professional'})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissões
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newEmployee.canAccessFinancial}
                      onChange={(e) => setNewEmployee({...newEmployee, canAccessFinancial: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Acesso ao Financeiro</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newEmployee.canAccessSiteEdit}
                      onChange={(e) => setNewEmployee({...newEmployee, canAccessSiteEdit: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Editar Site</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newEmployee.canAccessGoals}
                      onChange={(e) => setNewEmployee({...newEmployee, canAccessGoals: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Metas e Comissões</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newEmployee.canAccessReports}
                      onChange={(e) => setNewEmployee({...newEmployee, canAccessReports: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Relatórios</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowAddEmployeeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddEmployee}
                  className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Funcionário */}
      {showEditEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-[#D15556]">Editar Funcionário</h3>
              <button
                onClick={() => setShowEditEmployeeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={selectedEmployee.name}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, name: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username *
                </label>
                <input
                  type="text"
                  value={selectedEmployee.username}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, username: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={selectedEmployee.role}
                  onChange={(e) => setSelectedEmployee({...selectedEmployee, role: e.target.value as 'admin' | 'professional'})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Permissões
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedEmployee.canAccessFinancial}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, canAccessFinancial: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Acesso ao Financeiro</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedEmployee.canAccessSiteEdit}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, canAccessSiteEdit: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Editar Site</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedEmployee.canAccessGoals}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, canAccessGoals: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Metas e Comissões</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedEmployee.canAccessReports}
                      onChange={(e) => setSelectedEmployee({...selectedEmployee, canAccessReports: e.target.checked})}
                      className="mr-2"
                    />
                    <span className="text-sm">Relatórios</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedEmployee.isActive}
                    onChange={(e) => setSelectedEmployee({...selectedEmployee, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Funcionário ativo</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowEditEmployeeModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEmployeeEdit}
                  className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


