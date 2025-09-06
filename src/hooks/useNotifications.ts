import { useState, useEffect, useRef } from 'react'

interface Notification {
  id: string
  type: 'appointment' | 'product_reservation'
  title: string
  message: string
  time: string
  data: any
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  playNotificationSound: () => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export function useNotifications(): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastNotificationCount, setLastNotificationCount] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Criar elemento de áudio para notificações sonoras
  useEffect(() => {
    audioRef.current = new Audio('/notification-sound.mp3')
    audioRef.current.volume = 0.5
  }, [])

  // Função para tocar som de notificação
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(console.error)
    }
  }

  // Função para solicitar permissão de notificações
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  }

  // Função para mostrar notificação do navegador
  const showBrowserNotification = (notification: Notification) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
        requireInteraction: false
      })
    }
  }

  // Buscar notificações
  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/dashboard/notifications')
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)

        // Verificar se há novas notificações
        if (data.notifications.length > lastNotificationCount) {
          const newNotifications = data.notifications.slice(0, data.notifications.length - lastNotificationCount)
          
          // Tocar som e mostrar notificação para cada nova notificação
          newNotifications.forEach((notification: Notification) => {
            playNotificationSound()
            showBrowserNotification(notification)
          })
        }
        
        setLastNotificationCount(data.notifications.length)
      }
    } catch (error) {
      console.error('Erro ao buscar notificações:', error)
    }
  }

  // Marcar notificação como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  // Configurar polling e permissões
  useEffect(() => {
    requestNotificationPermission()
    fetchNotifications()

    // Buscar notificações a cada 10 segundos
    const interval = setInterval(fetchNotifications, 10000)

    return () => clearInterval(interval)
  }, [])

  return {
    notifications,
    unreadCount,
    playNotificationSound,
    markAsRead,
    markAllAsRead
  }
}
