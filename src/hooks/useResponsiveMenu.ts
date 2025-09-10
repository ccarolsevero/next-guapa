import { useState, useEffect, useRef } from 'react'

interface MenuDimensions {
  needsScroll: boolean
  maxHeight: string
  screenHeight: number
  menuHeight: number
  availableHeight: number
}

export function useResponsiveMenu() {
  const [dimensions, setDimensions] = useState<MenuDimensions>({
    needsScroll: false,
    maxHeight: '100vh',
    screenHeight: 0,
    menuHeight: 0,
    availableHeight: 0
  })

  useEffect(() => {
    const calculateDimensions = () => {
      const screenHeight = window.innerHeight
      
      // Altura do header (64px) + padding do menu (48px total)
      const headerHeight = 64
      const menuPadding = 48
      const availableHeight = screenHeight - headerHeight - menuPadding
      
      // Altura estimada por item do menu (incluindo espaçamento)
      const itemHeight = 48
      const estimatedMenuHeight = 14 * itemHeight // 14 itens estimados
      
      // Adicionar margem de segurança (20px)
      const needsScroll = estimatedMenuHeight > (availableHeight - 20)
      const maxHeight = needsScroll ? `${availableHeight - 20}px` : '100vh'
      
      setDimensions({
        needsScroll,
        maxHeight,
        screenHeight,
        menuHeight: estimatedMenuHeight,
        availableHeight
      })
    }

    // Calcular dimensões inicialmente
    calculateDimensions()

    // Recalcular quando a janela for redimensionada
    const handleResize = () => {
      calculateDimensions()
    }

    // Recalcular quando a orientação mudar (mobile)
    const handleOrientationChange = () => {
      setTimeout(calculateDimensions, 100) // Delay para aguardar a mudança
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return dimensions
}
