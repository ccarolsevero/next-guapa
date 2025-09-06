'use client'
import { useState, useEffect } from 'react'
import { Bell, Calendar, ShoppingCart, X } from 'lucide-react'

interface NotificationAlertProps {
  notification: {
    id: string
    type: 'appointment' | 'product_reservation'
    title: string
    message: string
    time: string
  }
  onClose: () => void
}

export default function NotificationAlert({ notification, onClose }: NotificationAlertProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Mostrar o alerta após um pequeno delay
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const getIcon = () => {
    switch (notification.type) {
      case 'appointment':
        return <Calendar className="w-5 h-5 text-blue-500" />
      case 'product_reservation':
        return <ShoppingCart className="w-5 h-5 text-green-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'appointment':
        return 'bg-blue-50 border-blue-200'
      case 'product_reservation':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full mx-4 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`${getBgColor()} border rounded-lg shadow-lg p-4`}>
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-900">
              {notification.title}
            </h4>
            <p className="text-sm text-gray-700 mt-1">
              {notification.message}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(notification.time).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
