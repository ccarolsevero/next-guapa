'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CartProvider } from '@/contexts/CartContext'
import { ToastProvider } from '@/contexts/ToastContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import Cart from '@/components/Cart'
import CartIcon from '@/components/CartIcon'

interface LayoutPublicProps {
  children: React.ReactNode
}

function LayoutPublicContent({ children }: LayoutPublicProps) {
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { isLoggedIn, client, logout } = useAuth()





  // Função para scroll suave
  const smoothScrollTo = (elementId: string) => {
    // Verifica se estamos na página home
    if (window.location.pathname === '/') {
      const element = document.getElementById(elementId)
      if (element) {
        const offset = 200 // Altura da navbar + margem extra
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    } else {
      // Se não estamos na home, navega para a home com hash
      window.location.href = `/#${elementId}`
    }
  }



  return (
    <div className="min-h-screen relative overflow-hidden scroll-smooth" style={{ backgroundColor: '#022b28' }}>
      {/* Cart Component */}
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      {/* Header */}
      <header className="border-b border-[#e6d1b8] fixed top-0 left-0 right-0 z-50" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-2 sm:py-3 lg:py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="/assents/logonavbarg.svg" 
                  alt="Espaço Guapa" 
                  className="h-12 sm:h-16 md:h-20 lg:h-24 xl:h-[120px] w-auto transition-all duration-300"
                  style={{ 
                    filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(332deg) brightness(86%) contrast(101%)'
                  }}
                />
              </Link>
            </div>
            <nav className="hidden lg:flex space-x-6 xl:space-x-8 2xl:space-x-12">
              <button 
                onClick={() => smoothScrollTo('inicio')}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer"
              >
                Início
              </button>
              <button 
                onClick={() => smoothScrollTo('sobre')}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer"
              >
                Sobre
              </button>
              <Link 
                href="/servicos"
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium"
              >
                Serviços
              </Link>
              <Link href="/profissionais" className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium">
                Nosso Time
              </Link>
              <Link href="/produtos" className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium">
                Produtos
              </Link>
              <button 
                onClick={() => smoothScrollTo('contato')}
                className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer"
              >
                Contato
              </button>
            </nav>
            
            {/* Botão Agendar, Carrinho e Menu Mobile */}
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
              {/* Ícone do Carrinho */}
              <CartIcon onClick={() => setIsCartOpen(true)} />
              
              {isLoggedIn ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Link 
                    href="/painel-cliente"
                    className="text-[#d34d4c] font-medium text-sm hidden xl:block hover:text-[#b83e3d] transition-colors cursor-pointer"
                  >
                    Olá, {client?.name}
                  </Link>
                  <button
                    onClick={logout}
                    className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-sm"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link 
                  href="/login-cliente"
                  className="bg-[#d34d4c] text-white px-3 sm:px-4 lg:px-6 xl:px-8 py-2 lg:py-3 rounded-lg hover:bg-[#b83e3d] transition-colors font-medium tracking-wide text-sm lg:text-base"
                >
                  Agendar
                </Link>
              )}
              
              {/* Menu Mobile */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-[#d34d4c] p-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Spacer para compensar navbar fixa */}
      <div className="h-16 sm:h-20 md:h-24 lg:h-28 xl:h-32"></div>

      {/* Menu Mobile Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-16 sm:top-20 md:top-24 left-0 right-0 z-50 bg-[#f2dcbc] border-b border-[#e6d1b8] shadow-lg">
          <nav className="flex flex-col space-y-4 p-4 sm:p-6">
            <button 
              onClick={() => {
                smoothScrollTo('inicio')
                setIsMobileMenuOpen(false)
              }}
              className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer text-left py-2"
            >
              Início
            </button>
            <button 
              onClick={() => {
                smoothScrollTo('sobre')
                setIsMobileMenuOpen(false)
              }}
              className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer text-left py-2"
            >
              Sobre
            </button>
            <Link 
              href="/servicos" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-left py-2"
            >
              Serviços
            </Link>
            <Link 
              href="/profissionais" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-left py-2"
            >
              Nosso Time
            </Link>
            <Link 
              href="/produtos" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-left py-2"
            >
              Produtos
            </Link>
            <button 
              onClick={() => {
                smoothScrollTo('contato')
                setIsMobileMenuOpen(false)
              }}
              className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium cursor-pointer text-left py-2"
            >
              Contato
            </button>
            {/* Ícone do Carrinho no Mobile */}
            <div className="flex justify-center mt-4">
              <CartIcon onClick={() => {
                setIsCartOpen(true)
                setIsMobileMenuOpen(false)
              }} />
            </div>
            
            {isLoggedIn ? (
              <div className="space-y-3 mt-4">
                <Link 
                  href="/painel-cliente"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#d34d4c] font-medium text-sm text-center block hover:text-[#b83e3d] transition-colors py-2"
                >
                  Olá, {client?.name}
                </Link>
                <button
                  onClick={() => {
                    logout()
                    setIsMobileMenuOpen(false)
                  }}
                  className="text-[#d34d4c] hover:text-[#b83e3d] transition-colors font-medium text-sm w-full text-center py-2"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link 
                href="/login-cliente"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-[#d34d4c] text-white px-6 py-3 rounded-lg hover:bg-[#b83e3d] transition-colors font-medium tracking-wide text-center mt-4 block"
              >
                Agendar
              </Link>
            )}
          </nav>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Footer */}
      <footer id="footer" className="text-gray-900 py-8 md:py-16 border-t border-[#D15556] relative" style={{ backgroundColor: 'rgba(245, 240, 232, 0.95)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:gap-12">
            <div>
              <h4 className="text-lg font-medium mb-6">Links Rápidos</h4>
              <ul className="space-y-3">
                <li><Link href="/servicos" className="text-gray-600 hover:text-[#D15556] transition-all duration-300">Serviços</Link></li>
                <li><Link href="/profissionais" className="text-gray-600 hover:text-[#D15556] transition-all duration-300">Profissionais</Link></li>
                <li><Link href="/agendamento" className="text-gray-600 hover:text-[#D15556] transition-all duration-300">Agendamento</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-6">Contato</h4>
              <div className="space-y-3 text-gray-600">
                <p>Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP</p>
                <div className="flex space-x-4">
                  <a href="https://wa.me/5519991531394" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-green-500 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                  </a>
                  <a href="mailto:contato@espacoguapa.com" className="text-gray-600 hover:text-blue-500 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </a>
                  <a href="https://instagram.com/espacoguapa" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-pink-500 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-[#EED7B6] mt-6 md:mt-12 pt-4 md:pt-8 text-center text-gray-600">
            <p>&copy; 2024 Espaço Guapa. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
      </div>
    )
}

export default function LayoutPublic({ children }: LayoutPublicProps) {
  return (
    <ToastProvider>
      <CartProvider>
        <LayoutPublicContent>{children}</LayoutPublicContent>
      </CartProvider>
    </ToastProvider>
  )
}
