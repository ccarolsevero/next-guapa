'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, Users, Calendar, Scissors, DollarSign, BarChart3, Settings, 
  LogOut, Menu, X, ShoppingBag, Package, ChevronDown, User, Globe
} from 'lucide-react'
import { ToastProvider } from '@/contexts/ToastContext'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const loggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    setIsLoggedIn(loggedIn)
    
    if (!loggedIn && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn')
    setIsLoggedIn(false)
    router.push('/admin/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Agendamentos', href: '/admin/agendamentos', icon: Calendar },
    { name: 'Clientes', href: '/admin/clientes', icon: Users },
    { name: 'Serviços', href: '/admin/servicos', icon: Scissors },
    { name: 'Pacotes', href: '/admin/pacotes', icon: Package },
    { name: 'Produtos', href: '/admin/produtos', icon: ShoppingBag },
    { name: 'Pedidos', href: '/admin/pedidos', icon: Package },
    { name: 'Comandas', href: '/admin/comandas', icon: Package },
    { name: 'Financeiro', href: '/admin/financeiro', icon: DollarSign },
    { name: 'Relatórios', href: '/admin/relatorios', icon: BarChart3 },
    { name: 'Editar Site', href: '/admin/editar-site', icon: Globe },
    { name: 'Configurações', href: '/admin/configuracoes', icon: Settings },
  ]

  if (!isLoggedIn || pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 shadow-lg" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#e6d1b8' }}>
            <h1 className="text-xl font-light" style={{ color: '#d34d4c' }}>Espaço Guapa</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6" style={{ color: '#d34d4c' }} />
            </button>
          </div>
          <nav className="p-6 space-y-2">
            {navigation.map((item) => {
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
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
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
              {navigation.map((item) => {
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
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                style={{ color: '#d34d4c' }}
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="ml-4 lg:ml-0 text-lg font-medium" style={{ color: '#d34d4c' }}>
                {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="w-4 h-4 mr-2" />
                Admin
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm transition-colors"
                style={{ color: '#d34d4c' }}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
    </ToastProvider>
  )
}


