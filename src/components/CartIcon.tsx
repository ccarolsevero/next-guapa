'use client'

import { useCart } from '@/contexts/CartContext'
import { ShoppingCart } from 'lucide-react'

interface CartIconProps {
  onClick: () => void
  className?: string
}

export default function CartIcon({ onClick, className = '' }: CartIconProps) {
  const { state } = useCart()

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-[#d34d4c] hover:text-[#b83e3d] transition-colors ${className}`}
      title="Carrinho de Compras"
    >
      <ShoppingCart className="w-6 h-6" />
      {state.totalItems > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#d34d4c] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {state.totalItems > 99 ? '99+' : state.totalItems}
        </span>
      )}
    </button>
  )
}
