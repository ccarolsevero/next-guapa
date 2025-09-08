import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface Professional {
  _id: string
  name: string
  username: string
  role: 'admin' | 'professional'
  canAccessFinancial: boolean
  canAccessSiteEdit: boolean
  canAccessGoals: boolean
  canAccessReports: boolean
  isActive: boolean
}

interface AuthContextType {
  professional: Professional | null
  token: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function EmployeeAuthProvider({ children }: { children: ReactNode }) {
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há token salvo no localStorage
    const savedToken = localStorage.getItem('employeeToken')
    if (savedToken) {
      setToken(savedToken)
      verifyToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await fetch('/api/employee-auth/me', {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfessional(data.professional)
      } else {
        // Token inválido, remover do localStorage
        localStorage.removeItem('employeeToken')
        setToken(null)
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error)
      localStorage.removeItem('employeeToken')
      setToken(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/employee-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const data = await response.json()
        setToken(data.token)
        setProfessional(data.professional)
        localStorage.setItem('employeeToken', data.token)
        return true
      } else {
        const error = await response.json()
        alert(error.error || 'Erro no login')
        return false
      }
    } catch (error) {
      console.error('Erro no login:', error)
      alert('Erro no login')
      return false
    }
  }

  const logout = () => {
    setProfessional(null)
    setToken(null)
    localStorage.removeItem('employeeToken')
  }

  const hasPermission = (permission: string): boolean => {
    if (!professional) return false
    
    // Admin tem acesso a tudo
    if (professional.role === 'admin') return true
    
    // Verificar permissões específicas
    switch (permission) {
      case 'financial':
        return professional.canAccessFinancial
      case 'siteEdit':
        return professional.canAccessSiteEdit
      case 'goals':
        return professional.canAccessGoals
      case 'reports':
        return professional.canAccessReports
      default:
        return false
    }
  }

  return (
    <AuthContext.Provider value={{
      professional,
      token,
      login,
      logout,
      loading,
      hasPermission
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useEmployeeAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useEmployeeAuth deve ser usado dentro de um EmployeeAuthProvider')
  }
  return context
}
