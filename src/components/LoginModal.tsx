'use client'

import { useState } from 'react'
import { X, Mail, Lock, User } from 'lucide-react'
import { useToast } from '@/contexts/ToastContext'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const { showSuccess, showError } = useToast()
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        // Login
        const response = await fetch('/api/clients/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        })

        if (response.ok) {
          const data = await response.json()
          localStorage.setItem('clientToken', data.token)
          localStorage.setItem('clientData', JSON.stringify(data.client))
          showSuccess('Login realizado com sucesso!')
          onSuccess()
          onClose()
        } else {
          const error = await response.json()
          showError('Erro no login', error.message || 'Credenciais inválidas')
        }
      } else {
        // Cadastro
        if (formData.password !== formData.confirmPassword) {
          showError('Erro no cadastro', 'As senhas não coincidem')
          return
        }

        const response = await fetch('/api/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            password: formData.password
          })
        })

        if (response.ok) {
          showSuccess('Cadastro realizado com sucesso!', 'Faça login para continuar')
          setIsLogin(true)
          setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }))
        } else {
          const error = await response.json()
          showError('Erro no cadastro', error.message || 'Tente novamente')
        }
      }
    } catch (error) {
      console.error('Erro:', error)
      showError('Erro de conexão', 'Tente novamente')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="modal-container" style={{ zIndex: 10000 }}>
      {/* Overlay */}
      <div 
        className="modal-overlay"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="modal-content">
        {/* Header */}
        <div className="modal-header">
          <h2 className="text-xl font-semibold text-gray-900">
            {isLogin ? 'Fazer Login' : 'Criar Conta'}
          </h2>
          <button
            onClick={onClose}
            className="modal-close-btn"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-body space-y-4">
          {!isLogin && (
            <>
              <div className="modal-form-group">
                <label className="modal-form-label">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="modal-form-input pl-10"
                    placeholder="Seu nome completo"
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">
                  Telefone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="modal-form-input"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </>
          )}

          <div className="modal-form-group">
            <label className="modal-form-label">
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="modal-form-input pl-10"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div className="modal-form-group">
            <label className="modal-form-label">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="modal-form-input pl-10"
                placeholder="Sua senha"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="modal-form-group">
              <label className="modal-form-label">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className="modal-form-input pl-10"
                  placeholder="Confirme sua senha"
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="modal-btn modal-btn-primary modal-btn-full"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="modal-spinner"></div>
                <span>{isLogin ? 'Fazendo login...' : 'Criando conta...'}</span>
              </div>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>

          {/* Toggle Login/Cadastro */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setFormData({
                  name: '',
                  email: '',
                  phone: '',
                  password: '',
                  confirmPassword: ''
                })
              }}
              className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors text-sm"
            >
              {isLogin 
                ? 'Não tem uma conta? Criar conta' 
                : 'Já tem uma conta? Fazer login'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

