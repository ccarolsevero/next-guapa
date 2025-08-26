'use client'
import Link from 'next/link'
import { useState } from 'react'
import { Users, Calendar, DollarSign, TrendingUp, Star, Clock, MapPin, Phone, User, Package, Scissors, ChevronDown, ChevronUp } from 'lucide-react'

// Mock data
const stats = [
  {
    name: 'Agendamentos Hoje',
    value: '12',
    change: '+2',
    changeType: 'increase',
    icon: Calendar
  },
  {
    name: 'Clientes Ativos',
    value: '156',
    change: '+8',
    changeType: 'increase',
    icon: Users
  },
  {
    name: 'Faturamento Mensal',
    value: 'R$ 15.420',
    change: '+12%',
    changeType: 'increase',
    icon: DollarSign
  },
  {
    name: 'Avaliação Média',
    value: '4.8',
    change: '+0.2',
    changeType: 'increase',
    icon: Star
  }
]

const recentAppointments = [
  {
    id: 1,
    clientName: 'Maria Silva',
    service: 'Corte + Hidratação',
    time: '14:00',
    professional: 'Ana Carolina',
    status: 'confirmado'
  },
  {
    id: 2,
    clientName: 'João Santos',
    service: 'Barba',
    time: '15:30',
    professional: 'Carlos Eduardo',
    status: 'pendente'
  },
  {
    id: 3,
    clientName: 'Ana Costa',
    service: 'Coloração',
    time: '16:00',
    professional: 'Mariana Silva',
    status: 'confirmado'
  },
  {
    id: 4,
    clientName: 'Pedro Oliveira',
    service: 'Corte',
    time: '17:30',
    professional: 'Carlos Eduardo',
    status: 'confirmado'
  }
]

const topServices = [
  { name: 'Corte Feminino', bookings: 45, revenue: 2250 },
  { name: 'Coloração', bookings: 32, revenue: 2560 },
  { name: 'Hidratação', bookings: 28, revenue: 1400 },
  { name: 'Barba', bookings: 25, revenue: 750 }
]

const vipClients = [
  { name: 'Maria Silva', visits: 15, totalSpent: 1200, lastVisit: '2 dias atrás' },
  { name: 'Ana Costa', visits: 12, totalSpent: 980, lastVisit: '1 semana atrás' },
  { name: 'João Santos', visits: 10, totalSpent: 750, lastVisit: '3 dias atrás' }
]

// Mock data para comissionamento por profissional
const professionalCommissions = [
  {
    id: 1,
    name: 'Bruna',
    role: 'Cabeleireira Visagista',
    avatar: '/avatar-bruna.jpg',
    services: {
      total: 2840.00,
      count: 23,
      items: [
        { name: 'Corte Feminino', count: 8, revenue: 1056.00 },
        { name: 'Coloração', count: 6, revenue: 1152.00 },
        { name: 'Hidratação', count: 5, revenue: 600.00 },
        { name: 'Back To Natural', count: 4, revenue: 32.00 }
      ]
    },
    products: {
      total: 420.00,
      count: 12,
      items: [
        { name: 'Shampoo Keune', count: 5, revenue: 225.00 },
        { name: 'Condicionador Keune', count: 4, revenue: 168.00 },
        { name: 'Máscara Keune', count: 3, revenue: 195.00 }
      ]
    },
    commission: {
      services: 568.00, // 20% de comissão sobre serviços
      products: 84.00,  // 20% de comissão sobre produtos
      total: 652.00
    }
  },
  {
    id: 2,
    name: 'Cicera Canovas',
    role: 'Tricoterapeuta',
    avatar: '/avatar-cicera.jpg',
    services: {
      total: 1860.00,
      count: 18,
      items: [
        { name: 'Tratamento Keune SPA', count: 8, revenue: 960.00 },
        { name: 'Tratamento Reconstrução', count: 5, revenue: 700.00 },
        { name: 'Tratamento Nutrição', count: 3, revenue: 390.00 },
        { name: 'Avaliação Capilar', count: 2, revenue: 120.00 }
      ]
    },
    products: {
      total: 280.00,
      count: 8,
      items: [
        { name: 'Tratamento Keune', count: 4, revenue: 160.00 },
        { name: 'Óleo Capilar', count: 2, revenue: 90.00 },
        { name: 'Protetor Térmico', count: 2, revenue: 76.00 }
      ]
    },
    commission: {
      services: 372.00, // 20% de comissão sobre serviços
      products: 56.00,  // 20% de comissão sobre produtos
      total: 428.00
    }
  }
]

export default function DashboardPage() {
  const [expandedProfessional, setExpandedProfessional] = useState<number | null>(null)

  const toggleProfessional = (id: number) => {
    setExpandedProfessional(expandedProfessional === id ? null : id)
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bem-vindo ao painel administrativo do Espaço Guapa</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white border border-gray-100 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-light text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-[#EED7B6] rounded-none flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-[#D15556]" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-600 ml-1">vs mês passado</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-medium text-gray-900">Agendamentos Recentes</h2>
              <Link href="/admin/agendamentos" className="text-[#D15556] hover:text-[#c04546] transition-colors text-sm font-medium">
                Ver todos
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-100 hover:border-[#EED7B6] transition-colors">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{appointment.clientName}</h3>
                    <p className="text-sm text-gray-600">{appointment.service}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {appointment.time} • {appointment.professional}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-none ${
                      appointment.status === 'confirmado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                    <Link href={`/admin/agendamentos/${appointment.id}`} className="text-[#D15556] hover:text-[#c04546] transition-colors">
                      <span className="text-xs font-medium">Ver</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-medium text-gray-900">Serviços Mais Populares</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topServices.map((service, index) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-8 h-8 bg-[#EED7B6] text-[#D15556] text-sm font-medium flex items-center justify-center mr-4">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-medium text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600">{service.bookings} agendamentos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-[#D15556]">R$ {service.revenue}</p>
                    <p className="text-sm text-gray-600">faturamento</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* VIP Clients */}
      <div className="mt-8 bg-white border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-medium text-gray-900">Clientes VIP</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vipClients.map((client) => (
              <div key={client.name} className="text-center p-4 border border-gray-100 hover:border-[#EED7B6] transition-colors">
                <div className="w-16 h-16 bg-[#EED7B6] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-[#D15556]" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{client.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>{client.visits} visitas</p>
                  <p>R$ {client.totalSpent} gastos</p>
                  <p>Última visita: {client.lastVisit}</p>
                </div>
                <Link href="/admin/clientes" className="mt-4 inline-block text-[#D15556] hover:text-[#c04546] transition-colors text-sm font-medium">
                  Ver perfil
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comissionamento por Profissional */}
      <div className="mt-8 bg-white border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-medium text-gray-900">Comissionamento por Profissional</h2>
          <p className="text-sm text-gray-600 mt-1">Vendas e comissões do mês atual</p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {professionalCommissions.map((professional) => (
              <div key={professional.id} className="border border-gray-100 rounded-lg">
                {/* Header do Profissional */}
                <div 
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleProfessional(professional.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-[#EED7B6] rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-[#D15556]" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{professional.name}</h3>
                        <p className="text-sm text-gray-600">{professional.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Comissão Total</p>
                        <p className="text-lg font-medium text-[#D15556]">R$ {professional.commission.total.toFixed(2)}</p>
                      </div>
                      {expandedProfessional === professional.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Detalhes Expandidos */}
                {expandedProfessional === professional.id && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Serviços */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900 flex items-center">
                            <Scissors className="w-4 h-4 mr-2" />
                            Serviços
                          </h4>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="font-medium text-[#D15556]">R$ {professional.services.total.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          {professional.services.items.map((service, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{service.name} ({service.count}x)</span>
                              <span className="font-medium">R$ {service.revenue.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-medium border-t pt-2">
                          <span>Comissão (20%):</span>
                          <span className="text-[#D15556]">R$ {professional.commission.services.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Produtos */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-gray-900 flex items-center">
                            <Package className="w-4 h-4 mr-2" />
                            Produtos
                          </h4>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Total</p>
                            <p className="font-medium text-[#D15556]">R$ {professional.products.total.toFixed(2)}</p>
                          </div>
                        </div>
                        <div className="space-y-2 mb-4">
                          {professional.products.items.map((product, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{product.name} ({product.count}x)</span>
                              <span className="font-medium">R$ {product.revenue.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between text-sm font-medium border-t pt-2">
                          <span>Comissão (20%):</span>
                          <span className="text-[#D15556]">R$ {professional.commission.products.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Resumo Total */}
                    <div className="mt-4 p-4 bg-[#EED7B6]/20 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Total de Vendas</p>
                          <p className="text-lg font-medium text-gray-900">
                            R$ {(professional.services.total + professional.products.total).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total de Itens</p>
                          <p className="text-lg font-medium text-gray-900">
                            {professional.services.count + professional.products.count}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Comissão Total</p>
                          <p className="text-lg font-medium text-[#D15556]">
                            R$ {professional.commission.total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-medium text-gray-900">Ações Rápidas</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/agendamentos/novo" className="flex flex-col items-center p-4 border border-gray-100 hover:border-[#D15556] hover:bg-[#EED7B6]/10 transition-colors text-center">
              <Calendar className="w-8 h-8 text-[#D15556] mb-2" />
              <span className="text-sm font-medium text-gray-900">Novo Agendamento</span>
            </Link>
            <Link href="/admin/clientes/novo" className="flex flex-col items-center p-4 border border-gray-100 hover:border-[#D15556] hover:bg-[#EED7B6]/10 transition-colors text-center">
              <Users className="w-8 h-8 text-[#D15556] mb-2" />
              <span className="text-sm font-medium text-gray-900">Novo Cliente</span>
            </Link>
            <Link href="/admin/comandas/nova" className="flex flex-col items-center p-4 border border-gray-100 hover:border-[#D15556] hover:bg-[#EED7B6]/10 transition-colors text-center">
              <DollarSign className="w-8 h-8 text-[#D15556] mb-2" />
              <span className="text-sm font-medium text-gray-900">Nova Comanda</span>
            </Link>
            <Link href="/admin/produtos" className="flex flex-col items-center p-4 border border-gray-100 hover:border-[#D15556] hover:bg-[#EED7B6]/10 transition-colors text-center">
              <TrendingUp className="w-8 h-8 text-[#D15556] mb-2" />
              <span className="text-sm font-medium text-gray-900">Gerenciar Produtos</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
