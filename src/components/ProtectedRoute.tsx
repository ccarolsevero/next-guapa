'use client'

import { useEmployeeAuth } from '@/hooks/useEmployeeAuth'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  requiredPermission?: string
  fallbackMessage?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredPermission,
  fallbackMessage = 'Você não tem permissão para acessar esta página'
}: ProtectedRouteProps) {
  const { professional, loading, hasPermission } = useEmployeeAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !professional) {
      // Se não está logado, redirecionar para login
      router.push('/admin/login')
    }
  }, [professional, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!professional) {
    return null // Será redirecionado pelo useEffect
  }

  // Se há uma permissão específica requerida
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 mb-6">
            {fallbackMessage}
          </p>
          <button
            onClick={() => router.back()}
            className="bg-[#D15556] text-white px-6 py-2 rounded-lg hover:bg-[#c04546] transition-colors"
          >
            Voltar
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
