'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Star, MessageSquare, CheckCircle, Heart } from 'lucide-react'

// Mock data para dados do atendimento
const mockAppointmentData = {
  id: 1,
  clientName: 'Maria Silva',
  professionalName: 'Ana Carolina',
  serviceName: 'Corte Feminino + Hidratação',
  date: '2024-01-15',
  time: '14:00',
  total: 158.00,
  completedAt: '2024-01-15 15:30'
}

const satisfactionLevels = [
  { id: 5, label: 'Excelente', emoji: '😍', description: 'Superou todas as expectativas' },
  { id: 4, label: 'Muito Bom', emoji: '😊', description: 'Ficou muito satisfeita' },
  { id: 3, label: 'Bom', emoji: '🙂', description: 'Atendeu às expectativas' },
  { id: 2, label: 'Regular', emoji: '😐', description: 'Poderia ser melhor' },
  { id: 1, label: 'Ruim', emoji: '😞', description: 'Não ficou satisfeita' }
]

const ratingCategories = [
  { id: 'service_quality', label: 'Qualidade do Serviço', icon: Scissors },
  { id: 'professional_attention', label: 'Atenção da Profissional', icon: Heart },
  { id: 'environment', label: 'Ambiente do Salão', icon: Home },
  { id: 'value_for_money', label: 'Custo-Benefício', icon: DollarSign },
  { id: 'overall_experience', label: 'Experiência Geral', icon: Star }
]

export default function AvaliacaoPage() {
  const params = useParams()
  const token = params.token

  const [appointment, setAppointment] = useState(mockAppointmentData)
  const [ratings, setRatings] = useState({
    overall: 0,
    service_quality: 0,
    professional_attention: 0,
    environment: 0,
    value_for_money: 0,
    overall_experience: 0
  })
  const [comment, setComment] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Em produção, aqui seria feita uma chamada para a API
    // para buscar os dados do atendimento usando o token
    // setAppointment(response.data)
  }, [token])

  const handleRating = (category: string, rating: number) => {
    setRatings(prev => ({ ...prev, [category]: rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Em produção, aqui seria feita a chamada para a API
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsSubmitted(true)
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getAverageRating = () => {
    const values = Object.values(ratings).filter(v => v > 0)
    return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Avaliação Enviada!
          </h1>
          <p className="text-gray-600 mb-6">
            Obrigada por avaliar nosso atendimento! Sua opinião é muito importante para continuarmos melhorando nossos serviços.
          </p>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              <strong>Atendimento:</strong> {appointment.serviceName}<br />
              <strong>Profissional:</strong> {appointment.professionalName}<br />
              <strong>Data:</strong> {new Date(appointment.date).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">💇‍♀️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Como foi seu atendimento?
          </h1>
          <p className="text-gray-600">
            Conte-nos sobre sua experiência no Espaço Guapa
          </p>
        </div>

        {/* Informações do Atendimento */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Detalhes do Atendimento</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Cliente:</span>
              <p className="font-medium">{appointment.clientName}</p>
            </div>
            <div>
              <span className="text-gray-600">Profissional:</span>
              <p className="font-medium">{appointment.professionalName}</p>
            </div>
            <div>
              <span className="text-gray-600">Serviço:</span>
              <p className="font-medium">{appointment.serviceName}</p>
            </div>
            <div>
              <span className="text-gray-600">Data:</span>
              <p className="font-medium">{new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}</p>
            </div>
          </div>
        </div>

        {/* Formulário de Avaliação */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avaliação Geral */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Qual sua avaliação geral do atendimento?
            </h3>
            <div className="flex justify-center space-x-4">
              {satisfactionLevels.map(level => (
                <button
                  key={level.id}
                  type="button"
                  onClick={() => handleRating('overall', level.id)}
                  className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                    ratings.overall === level.id
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }`}
                >
                  <span className="text-3xl mb-2">{level.emoji}</span>
                  <span className="font-medium text-gray-900">{level.label}</span>
                  <span className="text-xs text-gray-600 text-center mt-1">{level.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Avaliações Específicas */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Avalie aspectos específicos (opcional)
            </h3>
            <div className="space-y-6">
              {ratingCategories.map(category => (
                <div key={category.id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center mb-3">
                    <category.icon className="w-5 h-5 text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">{category.label}</span>
                  </div>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRating(category.id, star)}
                        className={`text-2xl transition-colors ${
                          ratings[category.id as keyof typeof ratings] >= star
                            ? 'text-yellow-400'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comentário */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Comentários (opcional)
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              placeholder="Conte-nos mais sobre sua experiência, sugestões de melhoria, ou qualquer outro comentário..."
            />
          </div>

          {/* Botão de Envio */}
          <div className="text-center">
            <button
              type="submit"
              disabled={ratings.overall === 0 || isLoading}
              className="bg-pink-600 text-white px-8 py-4 rounded-lg hover:bg-pink-700 transition-colors font-semibold text-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center mx-auto"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Enviar Avaliação
                </>
              )}
            </button>
            <p className="text-sm text-gray-500 mt-2">
              Sua avaliação será anônima e usada apenas para melhorar nossos serviços
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Espaço Guapa - Transformando vidas através da beleza</p>
          <p className="text-sm mt-1">Agradecemos sua avaliação! 💜</p>
        </div>
      </div>
    </div>
  )
}
