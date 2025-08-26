'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar se o usuário está logado
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true'
    
    if (isLoggedIn) {
      // Se estiver logado, redirecionar para o dashboard
      router.push('/admin/dashboard')
    } else {
      // Se não estiver logado, redirecionar para o login
      router.push('/admin/login')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  )
}
