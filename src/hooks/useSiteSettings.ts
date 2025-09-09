import { useState, useEffect } from 'react'

interface SiteSettings {
  nomeSalao: string
  emailContato: string
  telefone: string
  whatsapp: string
  endereco: string
  horariosFuncionamento: Array<{
    dia: string
    ativo: boolean
    horaInicio: string
    horaFim: string
  }>
  politicaCancelamento?: string
  politicaReagendamento?: string
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/site-settings')
        
        if (!response.ok) {
          throw new Error('Erro ao carregar configurações do site')
        }
        
        const data = await response.json()
        setSettings(data)
      } catch (err) {
        console.error('Erro ao buscar configurações do site:', err)
        setError(err instanceof Error ? err.message : 'Erro desconhecido')
        
        // Configurações padrão em caso de erro
        setSettings({
          nomeSalao: 'Espaço Guapa',
          emailContato: 'contato@espacoguapa.com',
          telefone: '(11) 99999-9999',
          whatsapp: '5519991531394',
          endereco: 'Rua Doutor Gonçalves da Cunha, 682 - Centro, Leme - SP',
          horariosFuncionamento: [
            { dia: 'Segunda-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
            { dia: 'Terça-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
            { dia: 'Quarta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
            { dia: 'Quinta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
            { dia: 'Sexta-feira', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
            { dia: 'Sábado', ativo: true, horaInicio: '09:00', horaFim: '18:00' },
            { dia: 'Domingo', ativo: false, horaInicio: '09:00', horaFim: '18:00' }
          ]
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  return { settings, loading, error }
}
