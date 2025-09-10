'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, Users, Calendar, Scissors, DollarSign, BarChart3, Settings, 
  LogOut, Menu, X, ShoppingBag, Package, ChevronDown, User, Globe, Target, Clock
} from 'lucide-react'
import { ToastProvider } from '@/contexts/ToastContext'
import { EmployeeAuthProvider, useEmployeeAuth } from '@/hooks/useEmployeeAuth'

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { professional, logout, hasPermission } = useEmployeeAuth()

  // Proteção de rotas - redirecionar para login se não autenticado
  useEffect(() => {
    if (pathname !== '/admin/login' && !professional) {
      router.push('/admin/login')
    }
  }, [professional, pathname, router])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, permission: null, adminOnly: false },
    { name: 'Agenda', href: '/admin/agendamentos', icon: Calendar, permission: null, adminOnly: false },
    { name: 'Horários Bloqueados', href: '/admin/horarios-bloqueados', icon: Clock, permission: null, adminOnly: true },
    { name: 'Clientes', href: '/admin/clientes', icon: Users, permission: null, adminOnly: false },
    { name: 'Serviços', href: '/admin/servicos', icon: Scissors, permission: null, adminOnly: false },
    { name: 'Pacotes', href: '/admin/pacotes', icon: Package, permission: null, adminOnly: false },
    { name: 'Produtos', href: '/admin/produtos', icon: ShoppingBag, permission: null, adminOnly: false },
    { name: 'Pedidos', href: '/admin/pedidos', icon: Package, permission: null, adminOnly: false },
    { name: 'Comandas', href: '/admin/comandas', icon: Package, permission: null, adminOnly: false },
    { name: 'Metas/Comissão', href: '/admin/metas-comissao', icon: Target, permission: 'goals', adminOnly: true },
    { name: 'Financeiro', href: '/admin/financeiro', icon: DollarSign, permission: 'financial', adminOnly: true },
    { name: 'Relatórios', href: '/admin/relatorios', icon: BarChart3, permission: 'reports', adminOnly: true },
    { name: 'Editar Site', href: '/admin/editar-site', icon: Globe, permission: 'siteEdit', adminOnly: true },
    { name: 'Configurações', href: '/admin/configuracoes', icon: Settings, permission: null, adminOnly: true },
  ]

  // Filtrar navegação baseada nas permissões e role do usuário
  const filteredNavigation = navigation.filter(item => {
    // Se é admin, tem acesso a tudo
    if (professional?.role === 'admin') {
      return !item.permission || hasPermission(item.permission)
    }
    
    // Se é professional, só tem acesso aos módulos permitidos
    if (professional?.role === 'professional') {
      return !item.adminOnly
    }
    
    // Fallback para outros casos
    return !item.permission || hasPermission(item.permission)
  })

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!professional) {
    // Redirecionar para login se não estiver autenticado
    router.push('/admin/login')
    return null
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-72 shadow-lg flex flex-col" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: '#e6d1b8' }}>
            <h1 className="text-lg font-light" style={{ color: '#d34d4c' }}>Espaço Guapa</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" style={{ color: '#d34d4c' }} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <nav className="p-4 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#D15556] text-white'
                        : 'text-gray-700 hover:bg-[#EED7B6]/50 hover:text-[#D15556]'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow shadow-lg" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
          <div className="flex items-center h-16 px-6 border-b" style={{ borderColor: '#e6d1b8' }}>
            <h1 className="text-xl font-light" style={{ color: '#d34d4c' }}>Espaço Guapa</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-6 py-6 space-y-2">
              {filteredNavigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-none transition-colors ${
                      isActive
                        ? 'bg-[#D15556] text-white'
                        : 'text-gray-700 hover:bg-[#EED7B6]/50 hover:text-[#D15556]'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 border-b" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)', borderColor: '#e6d1b8' }}>
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 mr-2"
                style={{ color: '#d34d4c' }}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-base sm:text-lg font-medium truncate" style={{ color: '#d34d4c' }}>
                {filteredNavigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <div className="hidden sm:flex items-center text-sm text-gray-700">
                <User className="w-4 h-4 mr-2" />
                <span>{professional.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm transition-colors p-2 rounded-md hover:bg-gray-100"
                style={{ color: '#d34d4c' }}
                title="Sair"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
    </ToastProvider>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <EmployeeAuthProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </EmployeeAuthProvider>
  )
}


