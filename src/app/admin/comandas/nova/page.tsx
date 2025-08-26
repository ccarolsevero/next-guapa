'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Search, 
  User, 
  Calendar,
  Play,
  Check
} from 'lucide-react'

// Mock data para agendamentos disponíveis
const mockAppointments = [
  {
    id: 1,
    clientName: "Maria Silva",
    clientPhone: "(11) 99999-1234",
    professionalName: "Ana Carolina",
    serviceName: "Corte Feminino",
    date: "2024-01-15",
    time: "14:00",
    duration: 60,
    status: "confirmado",
    price: 45.00
  },
  {
    id: 2,
    clientName: "Joana Costa",
    clientPhone: "(11) 99999-5678",
    professionalName: "Mariana Silva",
    serviceName: "Coloração",
    date: "2024-01-15",
    time: "15:30",
    duration: 120,
    status: "confirmado",
    price: 80.00
  },
  {
    id: 3,
    clientName: "Fernanda Santos",
    clientPhone: "(11) 99999-9012",
    professionalName: "Juliana Costa",
    serviceName: "Maquiagem Social",
    date: "2024-01-15",
    time: "16:00",
    duration: 60,
    status: "confirmado",
    price: 80.00
  }
]

export default function NovaComandaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)

  const filteredAppointments = mockAppointments.filter(appointment => {
    const matchesSearch = appointment.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.professionalName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch && appointment.status === 'confirmado'
  })

  const startComanda = async (appointment: any) => {
    // Simular criação da comanda
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirecionar para a comanda criada
    router.push(`/admin/comandas/${appointment.id}`)
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link 
                href="/admin/comandas" 
                className="flex items-center text-gray-600 hover:text-black mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <h1 className="text-2xl font-light text-gray-900">Nova Comanda</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 border border-gray-100">
          <h2 className="text-xl font-medium text-gray-900 mb-6">Selecionar Agendamento</h2>
          <p className="text-gray-600 mb-6">
            Escolha um agendamento confirmado para iniciar uma nova comanda.
          </p>

          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente ou profissional..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 bg-white text-black focus:ring-0 focus:border-black transition-colors"
                style={{ color: '#000000' }}
              />
            </div>
          </div>

          {/* Lista de Agendamentos */}
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="border border-gray-200 p-6 hover:border-black transition-colors cursor-pointer"
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 text-gray-400 mr-2" />
                      <h3 className="font-medium text-gray-900">{appointment.clientName}</h3>
                      <span className="text-sm text-gray-500 ml-2">({appointment.clientPhone})</span>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {appointment.date} às {appointment.time} ({appointment.duration} min)
                      </div>
                      <div>Profissional: {appointment.professionalName}</div>
                      <div>Serviço: {appointment.serviceName}</div>
                      <div className="font-medium text-gray-900">R$ {appointment.price.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      startComanda(appointment)
                    }}
                    className="ml-4 bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors font-medium tracking-wide flex items-center"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Comanda
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum agendamento encontrado</h3>
              <p className="text-gray-600">
                Não há agendamentos confirmados que correspondam à busca.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
