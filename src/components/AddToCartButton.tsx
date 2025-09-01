'use client'

import { useState } from 'react'
import { useCart } from '@/contexts/CartContext'
import { useToast } from '@/contexts/ToastContext'
import { ShoppingCart, Check } from 'lucide-react'

interface Product {
  _id: string
  name: string
  price: number
  description: string
  imageUrl?: string
  stock: number
  discount?: number
  originalPrice?: number
  isActive: boolean
}

interface AddToCartButtonProps {
  product: Product
  className?: string
  variant?: 'default' | 'small' | 'icon'
}

export default function AddToCartButton({ product, className = '', variant = 'default' }: AddToCartButtonProps) {
  const { addItem, isInCart, getItemQuantity } = useCart()
  const { showSuccess } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = async () => {
    console.log('Botão clicado!', product)
    
    setIsAdding(true)
    
    try {
      // Simular delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500))
      
      addItem({
        _id: product._id,
        name: product.name,
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl,
        stock: product.stock,
        discount: product.discount,
        originalPrice: product.originalPrice
      })

      showSuccess('Produto adicionado!', `${product.name} foi adicionado ao carrinho`)
    } catch (error) {
      console.error('Erro ao adicionar produto:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const isInCartItem = isInCart(product._id)
  const quantity = getItemQuantity(product._id)
  const isOutOfStock = !product.isActive || (product.stock !== undefined && product.stock <= 0)
  const isMaxQuantity = product.stock !== undefined && quantity >= product.stock

  // Debug logs
  console.log('Product debug:', {
    id: product._id,
    name: product.name,
    isActive: product.isActive,
    stock: product.stock,
    isOutOfStock,
    isMaxQuantity,
    quantity,
    isInCartItem
  })

  if (variant === 'icon') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isAdding || isOutOfStock || isMaxQuantity}
        className={`relative p-2 rounded-full transition-all duration-200 ${
          isOutOfStock || isMaxQuantity
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isInCartItem
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-[#d34d4c] text-white hover:bg-[#b83e3d]'
        } ${className}`}
        title={isOutOfStock ? 'Produto indisponível' : isMaxQuantity ? 'Quantidade máxima atingida' : 'Adicionar ao carrinho'}
      >
        {isAdding ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
        ) : isInCartItem ? (
          <Check className="w-4 h-4" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        {quantity > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {quantity}
          </span>
        )}
      </button>
    )
  }

  if (variant === 'small') {
    return (
      <button
        onClick={handleAddToCart}
        disabled={isAdding || isOutOfStock || isMaxQuantity}
        className={`px-3 py-1 text-sm rounded transition-all duration-200 ${
          isOutOfStock || isMaxQuantity
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isInCartItem
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-[#d34d4c] text-white hover:bg-[#b83e3d]'
        } ${className}`}
      >
        {isAdding ? (
          <div className="flex items-center space-x-1">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" />
            <span>Adicionando...</span>
          </div>
        ) : isInCartItem ? (
          <div className="flex items-center space-x-1">
            <Check className="w-3 h-3" />
            <span>No carrinho ({quantity})</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1">
            <ShoppingCart className="w-3 h-3" />
            <span>Adicionar</span>
          </div>
        )}
      </button>
    )
  }

  return (
                    <button
                  onClick={() => {
                    console.log('Botão clicado!')
                    handleAddToCart()
                  }}
                  disabled={isAdding || isOutOfStock || isMaxQuantity}
                  className={`px-4 py-2 rounded-lg transition-all duration-200 font-medium relative z-50 ${
                    isOutOfStock || isMaxQuantity
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : isInCartItem
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-[#d34d4c] text-white hover:bg-[#b83e3d]'
                  } ${className}`}
                  style={{ 
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 9999
                  }}
                >
      {isAdding ? (
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
          <span>Adicionando...</span>
        </div>
      ) : isInCartItem ? (
        <div className="flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>No carrinho ({quantity})</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <ShoppingCart className="w-4 h-4" />
          <span>Adicionar ao Carrinho</span>
        </div>
      )}
    </button>
  )
}
