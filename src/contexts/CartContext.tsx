'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'

interface CartItem {
  _id: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
  stock: number
  discount?: number
  originalPrice?: number
}

interface CartState {
  items: CartItem[]
  total: number
  totalItems: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }

const initialState: CartState = {
  items: [],
  total: 0,
  totalItems: 0
}

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item._id === action.payload._id)
      
      if (existingItem) {
        // Se já existe, aumenta a quantidade (respeitando o estoque)
        const newQuantity = Math.min(existingItem.quantity + 1, existingItem.stock)
        const updatedItems = state.items.map(item =>
          item._id === action.payload._id
            ? { ...item, quantity: newQuantity }
            : item
        )
        
        return {
          ...state,
          items: updatedItems,
          total: updatedItems.reduce((sum, item) => {
            const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
            return sum + (finalPrice * item.quantity)
          }, 0),
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
      } else {
        // Se não existe, adiciona novo item
        const newItems = [...state.items, { ...action.payload, quantity: 1 }]
        
        return {
          ...state,
          items: newItems,
          total: newItems.reduce((sum, item) => {
            const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
            return sum + (finalPrice * item.quantity)
          }, 0),
          totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0)
        }
      }
    }
    
    case 'REMOVE_ITEM': {
      const updatedItems = state.items.filter(item => item._id !== action.payload)
      
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => {
          const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
          return sum + (finalPrice * item.quantity)
        }, 0),
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const updatedItems = state.items.map(item =>
        item._id === action.payload.id
          ? { ...item, quantity: Math.min(Math.max(1, action.payload.quantity), item.stock) }
          : item
      )
      
      return {
        ...state,
        items: updatedItems,
        total: updatedItems.reduce((sum, item) => {
          const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
          return sum + (finalPrice * item.quantity)
        }, 0),
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0)
      }
    }
    
    case 'CLEAR_CART': {
      return initialState
    }
    
    case 'LOAD_CART': {
      const items = action.payload
      return {
        items,
        total: items.reduce((sum, item) => {
          const finalPrice = item.discount ? item.price * (1 - item.discount / 100) : item.price
          return sum + (finalPrice * item.quantity)
        }, 0),
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0)
      }
    }
    
    default:
      return state
  }
}

interface CartContextType {
  state: CartState
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isInCart: (id: string) => boolean
  getItemQuantity: (id: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)

  // Carregar carrinho do localStorage ao inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart)
        dispatch({ type: 'LOAD_CART', payload: cartItems })
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
      }
    }
  }, [])

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items))
  }, [state.items])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    dispatch({ type: 'ADD_ITEM', payload: item })
  }

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }

  const isInCart = (id: string) => {
    return state.items.some(item => item._id === id)
  }

  const getItemQuantity = (id: string) => {
    const item = state.items.find(item => item._id === id)
    return item ? item.quantity : 0
  }

  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isInCart,
      getItemQuantity
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider')
  }
  return context
}

