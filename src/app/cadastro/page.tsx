'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, User, Mail, Phone, MapPin, Calendar, Lock } from 'lucide-react'
import LayoutPublic from '../layout-public'


export default function CadastroPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres'
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirme sua senha'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('Iniciando cadastro...')
    console.log('Dados do formulário:', formData)
    
    if (!validateForm()) {
      console.log('Validação falhou')
      return
    }

    console.log('Validação passou, iniciando submissão...')
    setIsSubmitting(true)

    try {
      console.log('Enviando dados do cliente para o banco de dados...')
      
      // Cadastrar cliente usando API real
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes,
          password: formData.password
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao cadastrar cliente')
      }

      const newClient = await response.json()
      console.log('Cliente cadastrado com sucesso no banco:', newClient)
      
      // Salvar dados do cliente no localStorage local para sessão
      localStorage.setItem('currentClient', JSON.stringify(newClient))
      localStorage.setItem('isClientLoggedIn', 'true')
      
      // Mostrar mensagem de sucesso
      alert('Cadastro realizado com sucesso! Seus dados foram salvos no banco de dados.')
      
      // Redirecionar para o painel do cliente
      window.location.href = '/painel-cliente'
    } catch (error) {
      console.error('=== ERRO NO CADASTRO ===')
      console.error('Erro detalhado:', error)
      console.error('Tipo do erro:', typeof error)
      console.error('Stack trace:', error instanceof Error ? error.stack : 'N/A')
      
      const errorMessage = error instanceof Error ? error.message : 'Erro ao realizar cadastro. Tente novamente.'
      console.error('Mensagem de erro:', errorMessage)
      
      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <LayoutPublic>
      {/* Content */}
      <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-light text-[#f2dcbc] mb-2">
              Criar Conta
            </h2>
            <p className="text-[#f2dcbc] mb-8">
              Junte-se ao Espaço Guapa e acompanhe seus agendamentos
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-white/20">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Nome */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#f2dcbc] mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/90 text-black font-medium focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] transition-all duration-200 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ color: '#000000' }}
                  placeholder="Digite seu nome completo"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#f2dcbc] mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/90 text-black font-medium focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] transition-all duration-200 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ color: '#000000' }}
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-[#f2dcbc] mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/90 text-black font-medium focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] transition-all duration-200 ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ color: '#000000' }}
                  placeholder="(11) 99999-9999"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                )}
              </div>

              {/* Endereço */}
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-[#f2dcbc] mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Endereço
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg bg-white/90 text-black font-medium focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] transition-all duration-200 ${
                    errors.address ? 'border-red-300' : 'border-gray-300'
                  }`}
                  style={{ color: '#000000' }}
                  placeholder="Digite seu endereço completo"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-400">{errors.address}</p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#f2dcbc] mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white/90 text-black font-medium focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] transition-all duration-200 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    style={{ color: '#000000' }}
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Confirmar Senha */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#f2dcbc] mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 pr-12 border rounded-lg bg-white/90 text-black font-medium focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] transition-all duration-200 ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                    style={{ color: '#000000' }}
                    placeholder="Confirme sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Observações */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-[#f2dcbc] mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white/90 text-black font-medium focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] transition-all duration-200"
                  style={{ color: '#000000' }}
                  placeholder="Alguma observação ou preferência..."
                  rows={3}
                />
              </div>

              {/* Botão de Cadastro */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D15556] text-white py-3 px-4 rounded-lg hover:bg-[#c04546] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#f2dcbc]">
                Já tem uma conta?{' '}
                <Link href="/login-cliente" className="text-[#D15556] hover:text-[#c04546] font-medium">
                  Faça login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </LayoutPublic>
  )
}
