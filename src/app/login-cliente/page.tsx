'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, Phone } from 'lucide-react'
import LayoutPublic from '../layout-public'
import { useAuth } from '@/contexts/AuthContext'

function LoginClienteContent() {
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: ''
  })
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email')
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

    if (loginMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email é obrigatório'
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email inválido'
      }
    } else {
      if (!formData.phone.trim()) {
        newErrors.phone = 'Telefone é obrigatório'
      } else if (!/^[\d\s\(\)\-\+]+$/.test(formData.phone)) {
        newErrors.phone = 'Telefone inválido'
      }
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar dados para envio (apenas o método selecionado)
      const loginData = {
        password: formData.password,
        ...(loginMethod === 'email' ? { email: formData.email } : { phone: formData.phone })
      }

      // Fazer login via API
      const response = await fetch('/api/clients/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setErrors({ submit: errorData.error || 'Erro ao realizar login' })
        return
      }

      const { client, token } = await response.json()
      
      // Usar o contexto de autenticação
      login(client, token)
      
      // Redirecionar para o painel do cliente
      window.location.href = '/painel-cliente'
    } catch (error) {
      console.error('Erro no login:', error)
      setErrors({ submit: 'Erro ao realizar login. Tente novamente.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-light text-[#f2dcbc] mb-2">
              Acessar Conta
            </h2>
            <p className="text-[#f2dcbc] mb-8">
              Entre com suas credenciais para acessar seu painel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm rounded-lg shadow-xl p-8 border border-white/20">
            {errors.submit && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Seletor de método de login */}
              <div>
                <label className="block text-sm font-medium text-[#f2dcbc] mb-3">
                  Como deseja fazer login?
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('email')
                      setErrors({})
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all duration-200 ${
                      loginMethod === 'email'
                        ? 'bg-[#D15556] text-white border-[#D15556]'
                        : 'bg-white/10 text-[#f2dcbc] border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginMethod('phone')
                      setErrors({})
                    }}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all duration-200 ${
                      loginMethod === 'phone'
                        ? 'bg-[#D15556] text-white border-[#D15556]'
                        : 'bg-white/10 text-[#f2dcbc] border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <Phone className="w-4 h-4 inline mr-2" />
                    Telefone
                  </button>
                </div>
              </div>

              {/* Campo de Email */}
              {loginMethod === 'email' && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#f2dcbc] mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] transition-all duration-200 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="seu@email.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                  )}
                </div>
              )}

              {/* Campo de Telefone */}
              {loginMethod === 'phone' && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#f2dcbc] mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] transition-all duration-200 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                  )}
                </div>
              )}

              {/* Senha */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#f2dcbc] mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg bg-white text-gray-900 font-medium focus:ring-2 focus:ring-[#D15556] focus:border-[#D15556] transition-all duration-200 ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Digite sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Botão de Login */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#D15556] text-white py-3 px-4 rounded-lg hover:bg-[#c04546] transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-[#f2dcbc]">
                Não tem uma conta?{' '}
                <Link href="/cadastro" className="text-[#D15556] hover:text-[#c04546] font-medium">
                  Faça seu cadastro
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    )
}

export default function LoginClientePage() {
  return (
    <LayoutPublic>
      <LoginClienteContent />
    </LayoutPublic>
  )
}
