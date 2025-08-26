'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Edit, 
  Trash, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail,
  MapPin,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'

// Mock data
const mockAppointment = {
  id: 1,
  clientName: "Maria Silva",
  clientPhone: "(11) 99999-1234",
  clientEmail: "maria@email.com",
  clientAddress: "Rua das Flores, 123 - Centro",
  service: "Corte Feminino",
  professionalName: "Ana Carolina",
  professionalPhone: "(11) 99999-5555",
  date: "2024-01-15",
  startTime: "09:00",
  endTime: "10:00",
  duration: 60,
  status: "CONFIRMED",
  price: 45.00,
  notes: "Corte com franja, cliente gosta de camadas longas",
  paymentMethod: "PIX",
  createdAt: "2024-01-10 14:30",
  updatedAt: "2024-01-12 09:15"
}

const statusConfig = {
  SCHEDULED: {
    label: 'Agendado',
    color: 'bg-blue-100 text-blue-800',
    icon: Calendar
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  COMPLETED: {
    label: 'Concluído',
    color: 'bg-gray-100 text-gray-800',
    icon: CheckCircle
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  }
}

export default function DetalhesAgendamentoPage() {
  const router = useRouter()
  const params = useParams()
  const appointmentId = params.id

  const [appointment, setAppointment] = useState(mockAppointment)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    // Em produção, aqui seria feita a chamada para a API
    // para buscar os dados do agendamento usando o ID
    // setAppointment(response.data)
  }, [appointmentId])

  const handleDelete = async () => {
    try {
      // Em produção, aqui seria feita a chamada para a API
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push('/admin/agendamentos')
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error)
    }
  }

  const StatusIcon = statusConfig[appointment.status as keyof typeof statusConfig]?.icon || Calendar

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link 
                href="/admin/agendamentos" 
                className="flex items-center text-gray-600 hover:text-black mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-light text-gray-900">Detalhes do Agendamento</h1>
                <p className="text-sm text-gray-600">#{appointment.id}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                href={`/admin/agendamentos/${appointment.id}/editar`}
                className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors font-medium tracking-wide flex items-center"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="bg-red-600 text-white px-4 py-2 hover:bg-red-700 transition-colors font-medium tracking-wide flex items-center"
              >
                <Trash className="w-4 h-4 mr-2" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status e Resumo */}
            <div className="bg-white p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">Status e Resumo</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[appointment.status as keyof typeof statusConfig]?.color}`}>
                  <StatusIcon className="w-4 h-4 mr-1" />
                  {statusConfig[appointment.status as keyof typeof statusConfig]?.label}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Serviço</span>
                  <p className="font-medium text-gray-900">{appointment.service}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Profissional</span>
                  <p className="font-medium text-gray-900">{appointment.professionalName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Data</span>
                  <p className="font-medium text-gray-900">
                    {new Date(appointment.date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Horário</span>
                  <p className="font-medium text-gray-900">
                    {appointment.startTime} - {appointment.endTime} ({appointment.duration} min)
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Valor</span>
                  <p className="font-medium text-gray-900">R$ {appointment.price.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Forma de Pagamento</span>
                  <p className="font-medium text-gray-900">{appointment.paymentMethod}</p>
                </div>
              </div>
            </div>

            {/* Informações do Cliente */}
            <div className="bg-white p-6 border border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informações do Cliente
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600 flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    Nome
                  </span>
                  <p className="font-medium text-gray-900">{appointment.clientName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    Telefone
                  </span>
                  <p className="font-medium text-gray-900">{appointment.clientPhone}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 flex items-center">
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </span>
                  <p className="font-medium text-gray-900">{appointment.clientEmail}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Endereço
                  </span>
                  <p className="font-medium text-gray-900">{appointment.clientAddress}</p>
                </div>
              </div>
            </div>

            {/* Observações */}
            {appointment.notes && (
              <div className="bg-white p-6 border border-gray-100">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Observações</h2>
                <p className="text-gray-700">{appointment.notes}</p>
              </div>
            )}

            {/* Histórico de Alterações */}
            <div className="bg-white p-6 border border-gray-100">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Histórico</h2>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Agendamento criado em</span>
                  <span className="font-medium text-gray-900 ml-1">
                    {new Date(appointment.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Última atualização em</span>
                  <span className="font-medium text-gray-900 ml-1">
                    {new Date(appointment.updatedAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ações Rápidas */}
            <div className="bg-white p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ações Rápidas</h3>
              
              <div className="space-y-3">
                <Link
                  href={`/admin/agendamentos/${appointment.id}/editar`}
                  className="w-full bg-blue-600 text-white py-3 px-4 hover:bg-blue-700 transition-colors font-medium tracking-wide text-center block"
                >
                  Editar Agendamento
                </Link>
                
                <Link
                  href={`/admin/comandas/nova?appointment=${appointment.id}`}
                  className="w-full bg-green-600 text-white py-3 px-4 hover:bg-green-700 transition-colors font-medium tracking-wide text-center block"
                >
                  Iniciar Comanda
                </Link>
                
                <Link
                  href={`/admin/atendimentos/finalizar/${appointment.id}`}
                  className="w-full bg-purple-600 text-white py-3 px-4 hover:bg-purple-700 transition-colors font-medium tracking-wide text-center block"
                >
                  Finalizar Atendimento
                </Link>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="bg-white p-6 border border-gray-100">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Adicionais</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID do Agendamento:</span>
                  <span className="font-medium">#{appointment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Duração:</span>
                  <span className="font-medium">{appointment.duration} minutos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium text-green-600">R$ {appointment.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Confirmar Exclusão
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tem certeza que deseja excluir este agendamento?
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  <strong>Cliente:</strong> {appointment.clientName}<br />
                  <strong>Serviço:</strong> {appointment.service}<br />
                  <strong>Data:</strong> {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.startTime}
                </p>
              </div>
              
              <p className="text-gray-700 mb-6">
                Esta ação não pode ser desfeita. O agendamento será removido permanentemente.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
