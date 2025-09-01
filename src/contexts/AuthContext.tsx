'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Client {
  _id: string
  name: string
  email: string
  phone: string
  createdAt: string
}

interface AuthContextType {
  isLoggedIn: boolean
  client: Client | null
  login: (clientData: Client, token: string) => void
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há dados de autenticação no localStorage
    const checkAuth = () => {
      try {
        // Verificar se estamos no browser
        if (typeof window === 'undefined') {
          setLoading(false)
          return
        }

        const isClientLoggedIn = localStorage.getItem('isClientLoggedIn') === 'true'
        const clientData = localStorage.getItem('loggedInClient')
        const token = localStorage.getItem('clientToken')

        if (isClientLoggedIn && clientData && token) {
          const parsedClient = JSON.parse(clientData)
          setClient(parsedClient)
          setIsLoggedIn(true)
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error)
        // Limpar dados corrompidos
        if (typeof window !== 'undefined') {
          localStorage.removeItem('isClientLoggedIn')
          localStorage.removeItem('loggedInClient')
          localStorage.removeItem('clientToken')
        }
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (clientData: Client, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isClientLoggedIn', 'true')
      localStorage.setItem('clientToken', token)
      localStorage.setItem('loggedInClient', JSON.stringify(clientData))
    }
    setClient(clientData)
    setIsLoggedIn(true)
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isClientLoggedIn')
      localStorage.removeItem('clientToken')
      localStorage.removeItem('loggedInClient')
    }
    setClient(null)
    setIsLoggedIn(false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, client, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
