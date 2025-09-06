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

    if (!formData.birthDate.trim()) {
      newErrors.birthDate = 'Data de nascimento é obrigatória'
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
    <div className="modal-container">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content modal-content-large">
        {/* Header */}
        <div className="modal-header">
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
            className="modal-close-btn"
            aria-label="Fechar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="modal-body space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Nome */}
          <div className="modal-form-group">
            <label className="modal-form-label">
              <User className="w-4 h-4 inline mr-2" />
              Nome Completo *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`modal-form-input ${
                errors.name ? 'error' : ''
              }`}
              placeholder="Digite seu nome completo"
            />
            {errors.name && <p className="modal-error-message">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="modal-form-group">
            <label className="modal-form-label">
              <Mail className="w-4 h-4 inline mr-2" />
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`modal-form-input ${
                errors.email ? 'error' : ''
              }`}
              placeholder="Digite seu email"
            />
            {errors.email && <p className="modal-error-message">{errors.email}</p>}
            <p className="text-gray-500 text-sm mt-1">
              Este será seu email para login no site
            </p>
          </div>

          {/* Telefone */}
          <div className="modal-form-group">
            <label className="modal-form-label">
              <Phone className="w-4 h-4 inline mr-2" />
              Telefone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`modal-form-input ${
                errors.phone ? 'error' : ''
              }`}
              placeholder="(11) 99999-9999"
            />
            {errors.phone && <p className="modal-error-message">{errors.phone}</p>}
          </div>

          {/* Data de Nascimento */}
          <div className="modal-form-group">
            <label className="modal-form-label">
              <Calendar className="w-4 h-4 inline mr-2" />
              Data de Nascimento *
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className={`modal-form-input ${
                errors.birthDate ? 'error' : ''
              }`}
            />
            {errors.birthDate && <p className="modal-error-message">{errors.birthDate}</p>}
          </div>

          {/* Endereço */}
          <div className="modal-form-group">
            <label className="modal-form-label">
              <MapPin className="w-4 h-4 inline mr-2" />
              Endereço
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="modal-form-input"
              placeholder="Rua, número, bairro, cidade"
            />
          </div>

          {/* Nova Senha */}
          <div className="modal-form-group">
            <label className="modal-form-label">
              <Lock className="w-4 h-4 inline mr-2" />
              Nova Senha (opcional)
            </label>
            <input
              type="password"
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`modal-form-input ${
                errors.newPassword ? 'error' : ''
              }`}
              placeholder="Mínimo 6 caracteres"
            />
            {errors.newPassword && <p className="modal-error-message">{errors.newPassword}</p>}
          </div>

          {/* Confirmar Senha */}
          {formData.newPassword && (
            <div className="modal-form-group">
              <label className="modal-form-label">
                <Lock className="w-4 h-4 inline mr-2" />
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`modal-form-input ${
                  errors.confirmPassword ? 'error' : ''
                }`}
                placeholder="Confirme sua nova senha"
              />
              {errors.confirmPassword && <p className="modal-error-message">{errors.confirmPassword}</p>}
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="modal-btn modal-btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="modal-btn modal-btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <div className="modal-spinner mr-2"></div>
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
  )
}