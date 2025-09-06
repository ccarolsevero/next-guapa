'use client'

import { useState, useEffect } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { X, Plus, Minus, ShoppingCart, Package } from 'lucide-react'
import LoginModal from './LoginModal'

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const { state, removeItem, updateQuantity, clearCart } = useCart()
  const { showSuccess, showError } = useToast()
  const [isReserving, setIsReserving] = useState(false)
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [clientData, setClientData] = useState<any>(null)

  // Verificar se o usuário está logado
  useEffect(() => {
    const token = localStorage.getItem('clientToken')
    const data = localStorage.getItem('clientData')
    
    if (token && data) {
      try {
        setClientData(JSON.parse(data))
      } catch (error) {
        console.error('Erro ao parsear dados do cliente:', error)
        localStorage.removeItem('clientToken')
        localStorage.removeItem('clientData')
      }
    }
  }, [])

  const handleReserve = async () => {
    if (state.items.length === 0) return

    // Verificar se o usuário está logado
    if (!clientData) {
      setIsLoginModalOpen(true)
      return
    }

    setIsReserving(true)
    try {
      // Dados do pedido
      const orderData = {
        customerInfo: {
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          address: clientData.address || '',
          notes: clientData.notes || ''
        },
        items: state.items.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.discount ? item.price * (1 - item.discount / 100) : item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          discount: item.discount,
          originalPrice: item.originalPrice
        })),
        total: state.total,
        paymentMethod: 'cash',
        notes: 'Pedido realizado online'
      }

      console.log('Dados do pedido sendo enviados:', orderData)

      // Criar pedido real com dados do cliente logado
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('clientToken')}`
        },
        body: JSON.stringify(orderData)
      })

      if (response.ok) {
        const result = await response.json()
        showSuccess(
          'Pedido realizado com sucesso!',
          `Número do pedido: ${result.order.orderNumber}. Em breve você receberá uma mensagem de confirmação.`
        )
        clearCart()
        onClose()
      } else {
        const error = await response.json()
        showError('Erro ao realizar pedido', error.message || 'Tente novamente')
      }
    } catch (error) {
      console.error('Erro ao realizar pedido:', error)
      showError('Erro ao processar o pedido', 'Tente novamente')
    } finally {
      setIsReserving(false)
    }
  }

  const handleLoginSuccess = () => {
    // Recarregar dados do cliente após login
    const data = localStorage.getItem('clientData')
    if (data) {
      setClientData(JSON.parse(data))
    }
  }

  if (!isOpen) return null

  return (
    <div className="cart-modal-container">
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
      
      {/* Overlay */}
      <div 
        className="cart-modal-overlay"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="cart-modal-content">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="modal-header">
            <h2 className="text-lg font-semibold text-gray-900">Carrinho de Compras</h2>
            <button
              onClick={onClose}
              className="modal-close-btn"
              aria-label="Fechar carrinho"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto modal-body">
            {state.items.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Seu carrinho está vazio</p>
                <p className="text-sm text-gray-400 mt-2">Adicione produtos para começar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {state.items.map((item) => {
                  const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
                  return (
                    <div key={item._id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img 
                            src={item.imageUrl} 
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 mr-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate mb-1">
                          {item.name}
                        </h3>
                        <div className="flex flex-col space-y-1">
                          {item.discount && item.discount > 0 ? (
                            <>
                              <span className="text-sm line-through text-gray-400">
                                R$ {item.originalPrice?.toFixed(2) || item.price.toFixed(2)}
                              </span>
                              <div className="flex items-center space-x-1">
                                <span className="text-sm font-medium text-red-600">
                                  R$ {finalPrice.toFixed(2)}
                                </span>
                                <span className="text-xs text-red-600 font-medium">
                                  -{item.discount}%
                                </span>
                              </div>
                            </>
                          ) : (
                            <span className="text-sm font-medium text-gray-900">
                              R$ {item.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Estoque: {item.stock} unidades
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 rounded-full border border-[#d34d4c] flex items-center justify-center hover:bg-[#d34d4c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-[#d34d4c] transition-colors"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="w-8 h-8 rounded-full border border-[#d34d4c] flex items-center justify-center hover:bg-[#d34d4c] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed text-[#d34d4c] transition-colors"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item._id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        aria-label="Remover item"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.items.length > 0 && (
            <div className="border-t modal-body space-y-4">
              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-900">Total:</span>
                <span className="text-xl font-bold text-gray-900">
                  R$ {state.total.toFixed(2)}
                </span>
              </div>

              {/* Reserve Button */}
              <button
                onClick={handleReserve}
                disabled={isReserving}
                className="modal-btn modal-btn-primary modal-btn-full flex items-center justify-center space-x-2"
              >
                {isReserving ? (
                  <>
                    <div className="modal-spinner"></div>
                    <span>Reservando...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Reservar Produtos</span>
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Os produtos serão reservados para retirada na loja
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
