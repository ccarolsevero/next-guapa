'use client'

import { useState } from 'react'
import { X, User, Mail, Phone, Calendar, MapPin, Lock, CheckCircle } from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: any) => void
  clientData: any
}

export default function OnboardingModal({ isOpen, onClose, onComplete, clientData }: OnboardingModalProps) {
  const [formData, setFormData] = useState({
    name: clientData?.name || '',
    email: clientData?.email || '',
    phone: clientData?.phone || '',
    birthDate: clientData?.birthDate || '',
    address: clientData?.address || '',
    newPassword: '',
    confirmPassword: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Formato de email inválido'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório'
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      newErrors.newPassword = 'A senha deve ter pelo menos 6 caracteres'
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/clients/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          clientId: clientData.id || clientData._id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          birthDate: formData.birthDate,
          address: formData.address,
          newPassword: formData.newPassword || undefined
        })
      })

      const data = await response.json()

      if (response.ok) {
        onComplete(data.client)
      } else {
        setErrors({ general: data.error })
      }
    } catch (error) {
      console.error('Erro ao completar onboarding:', error)
      setErrors({ general: 'Erro ao salvar dados. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#D15556] rounded-full flex items-center justify-center mr-4">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#006D5B]">
                  Complete seu Cadastro
                </h2>
                <p className="text-gray-600">
                  Atualize seus dados para uma melhor experiência
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-[#006D5B] mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nome Completo *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-900 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Digite seu nome completo"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#006D5B] mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-900 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Digite seu email"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              <p className="text-gray-500 text-sm mt-1">
                Este será seu email para login no site
              </p>
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-[#006D5B] mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Telefone *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-900 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="(11) 99999-9999"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Data de Nascimento */}
            <div>
              <label className="block text-sm font-medium text-[#006D5B] mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data de Nascimento
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-900"
              />
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-medium text-[#006D5B] mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Endereço
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-900"
                placeholder="Rua, número, bairro, cidade"
              />
            </div>

            {/* Nova Senha */}
            <div>
              <label className="block text-sm font-medium text-[#006D5B] mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Nova Senha (opcional)
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleInputChange('newPassword', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-900 ${
                  errors.newPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.newPassword && <p className="text-red-600 text-sm mt-1">{errors.newPassword}</p>}
            </div>

            {/* Confirmar Senha */}
            {formData.newPassword && (
              <div>
                <label className="block text-sm font-medium text-[#006D5B] mb-2">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Confirmar Nova Senha
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#D15556] focus:border-transparent text-gray-900 ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                  placeholder="Confirme sua nova senha"
                />
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            )}

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-[#D15556] text-white px-6 py-3 rounded-lg hover:bg-[#c04546] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Completar Cadastro
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}