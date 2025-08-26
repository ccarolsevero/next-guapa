'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Star,
  User,
  Scissors,
  ShoppingBag
} from 'lucide-react'

// Mock data para histórico de atendimentos
const mockHistory = [
  {
    id: 1,
    date: '2024-01-15',
    time: '14:00',
    professionalName: 'Ana Carolina',
    services: [
      { name: 'Corte Feminino', price: 45.00, quantity: 1 },
      { name: 'Hidratação', price: 50.00, quantity: 1 }
    ],
    products: [
      { name: 'Shampoo Profissional', price: 35.00, quantity: 1 },
      { name: 'Máscara Hidratante', price: 28.00, quantity: 1 }
    ],
    total: 158.00,
    paymentMethod: 'PIX',
    satisfaction: 5,
    observations: 'Cliente solicitou corte longo com camadas. Ficou muito satisfeita com o resultado.',
    nextAppointment: '2024-02-15 14:00'
  },
  {
    id: 2,
    date: '2023-12-15',
    time: '14:00',
    professionalName: 'Ana Carolina',
    services: [
      { name: 'Coloração', price: 80.00, quantity: 1 }
    ],
    products: [
      { name: 'Óleo Capilar', price: 45.00, quantity: 1 }
    ],
    total: 125.00,
    paymentMethod: 'Cartão de Crédito',
    satisfaction: 4,
    observations: 'Coloração castanha com mechas. Cliente gostou do resultado.',
    nextAppointment: '2024-01-15 14:00'
  },
  {
    id: 3,
    date: '2023-11-15',
    time: '15:00',
    professionalName: 'Mariana Silva',
    services: [
      { name: 'Corte Feminino', price: 45.00, quantity: 1 },
      { name: 'Botox Capilar', price: 120.00, quantity: 1 }
    ],
    products: [],
    total: 165.00,
    paymentMethod: 'Dinheiro',
    satisfaction: 5,
    observations: 'Tratamento para cabelo danificado. Excelente resultado.',
    nextAppointment: '2023-12-15 14:00'
  }
]

export default function HistoricoClientePage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id

  const [client, setClient] = useState({
    id: clientId,
    name: 'Maria Silva',
    phone: '(11) 99999-1234',
    email: 'maria@email.com',
    address: 'Rua das Flores, 123 - Centro',
    totalVisits: 12,
    totalSpent: 2450.00,
    lastVisit: '2024-01-15'
  })

  const [history, setHistory] = useState(mockHistory)
  const [selectedVisit, setSelectedVisit] = useState<any>(null)

  const getTotalRevenue = () => history.reduce((sum, visit) => sum + visit.total, 0)
  const getAverageSatisfaction = () => {
    const total = history.reduce((sum, visit) => sum + visit.satisfaction, 0)
    return total / history.length
  }

  const getPaymentMethodStats = () => {
    const stats: { [key: string]: number } = {}
    history.forEach(visit => {
      stats[visit.paymentMethod] = (stats[visit.paymentMethod] || 0) + 1
    })
    return stats
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link 
                href={`/admin/clientes/${clientId}`}
                className="flex items-center text-gray-600 hover:text-black mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </Link>
              <div>
                <h1 className="text-2xl font-light text-gray-900">Histórico da Cliente</h1>
                <p className="text-sm text-gray-600">{client.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-gray-50 border border-gray-100">
                <Calendar className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Visitas</p>
                <p className="text-2xl font-light text-gray-900">{client.totalVisits}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-50 border border-green-100">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Gasto</p>
                <p className="text-2xl font-light text-gray-900">R$ {client.totalSpent.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-50 border border-blue-100">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                <p className="text-2xl font-light text-gray-900">{getAverageSatisfaction().toFixed(1)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-orange-50 border border-orange-100">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Última Visita</p>
                <p className="text-2xl font-light text-gray-900">{new Date(client.lastVisit).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Histórico de Atendimentos */}
        <div className="bg-white border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-medium text-gray-900">Histórico de Atendimentos</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviços/Produtos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pagamento
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satisfação
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(visit.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-gray-500">{visit.time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{visit.professionalName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-gray-500">
                          <Scissors className="w-3 h-3 mr-1" />
                          {visit.services.length} serviço(s)
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <ShoppingBag className="w-3 h-3 mr-1" />
                          {visit.products.length} produto(s)
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      R$ {visit.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{visit.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="ml-1 text-sm text-gray-900">{visit.satisfaction}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <button
                        onClick={() => setSelectedVisit(visit)}
                        className="text-black hover:text-gray-600 transition-colors"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Detalhes do Atendimento</h3>
                <button
                  onClick={() => setSelectedVisit(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Informações Gerais</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Data:</span>
                    <p className="font-medium">{new Date(selectedVisit.date).toLocaleDateString('pt-BR')} às {selectedVisit.time}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Profissional:</span>
                    <p className="font-medium">{selectedVisit.professionalName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Pagamento:</span>
                    <p className="font-medium">{selectedVisit.paymentMethod}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Satisfação:</span>
                    <p className="font-medium">{selectedVisit.satisfaction}/5</p>
                  </div>
                </div>
              </div>

              {selectedVisit.services.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Serviços Realizados</h4>
                  <div className="space-y-2">
                    {selectedVisit.services.map((service: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{service.name} (x{service.quantity})</span>
                        <span>R$ {(service.price * service.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedVisit.products.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Produtos Vendidos</h4>
                  <div className="space-y-2">
                    {selectedVisit.products.map((product: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{product.name} (x{product.quantity})</span>
                        <span>R$ {(product.price * product.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-medium">
                  <span>Total:</span>
                  <span>R$ {selectedVisit.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedVisit.observations && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Observações</h4>
                  <p className="text-sm text-gray-700">{selectedVisit.observations}</p>
                </div>
              )}

              {selectedVisit.nextAppointment && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Próximo Agendamento</h4>
                  <p className="text-sm text-gray-700">{new Date(selectedVisit.nextAppointment).toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
