'use client'

import React, { createContext, useContext } from 'react'
import toast, { Toaster } from 'react-hot-toast'

interface ToastContextType {
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showSuccess = (title: string, message?: string) => {
    toast.success(
      <div className="relative">
        <div className="font-medium">{title}</div>
        {message && <div className="text-sm opacity-90 mt-1">{message}</div>}
        <button
          onClick={() => toast.dismiss()}
          className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
          style={{ marginTop: '-8px', marginRight: '-8px' }}
        >
          ✕
        </button>
      </div>,
      {
        duration: 5000,
        style: {
          background: 'rgba(245, 240, 232, 0.95)',
          border: '1px solid #e6d1b8',
          color: '#022b28',
          borderRadius: '8px',
          padding: '16px',
          maxWidth: '400px'
        }
      }
    )
  }

  const showError = (title: string, message?: string) => {
    toast.error(
      <div className="relative">
        <div className="font-medium">{title}</div>
        {message && <div className="text-sm opacity-90 mt-1">{message}</div>}
        <button
          onClick={() => toast.dismiss()}
          className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
          style={{ marginTop: '-8px', marginRight: '-8px' }}
        >
          ✕
        </button>
      </div>,
      {
        duration: 7000,
        style: {
          background: 'rgba(245, 240, 232, 0.95)',
          border: '1px solid #e6d1b8',
          color: '#d34d4c',
          borderRadius: '8px',
          padding: '16px',
          maxWidth: '400px'
        }
      }
    )
  }

  const showWarning = (title: string, message?: string) => {
    toast(
      <div className="relative">
        <div className="font-medium">{title}</div>
        {message && <div className="text-sm opacity-90 mt-1">{message}</div>}
        <button
          onClick={() => toast.dismiss()}
          className="absolute top-0 right-0 text-gray-400 hover:text-gray-600 transition-colors"
          style={{ marginTop: '-8px', marginRight: '-8px' }}
        >
          ✕
        </button>
      </div>,
      {
        duration: 6000,
        icon: '⚠️',
        style: {
          background: 'rgba(245, 240, 232, 0.95)',
          border: '1px solid #e6d1b8',
          color: '#f59e0b',
          borderRadius: '8px',
          padding: '16px',
          maxWidth: '400px'
        }
      }
    )
  }

  const showInfo = (title: string, message?: string) => {
    toast(
      <div>
        <div className="font-medium">{title}</div>
        {message && <div className="text-sm opacity-90">{message}</div>}
      </div>,
      {
        duration: 5000,
        icon: 'ℹ️',
        style: {
          background: 'rgba(245, 240, 232, 0.95)',
          border: '1px solid #e6d1b8',
          color: '#3b82f6',
          borderRadius: '8px',
          padding: '16px',
          maxWidth: '400px'
        }
      }
    )
  }

  return (
    <ToastContext.Provider value={{
      showSuccess,
      showError,
      showWarning,
      showInfo
    }}>
      {children}
      
      <Toaster
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            background: 'rgba(245, 240, 232, 0.95)',
            border: '1px solid #e6d1b8',
            color: '#022b28',
            borderRadius: '8px',
            padding: '16px',
            maxWidth: '400px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
          }
        }}
      />
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider')
  }
  return context
}
