"use client"

import { useState, useCallback, useMemo } from "react"
import type { Product } from "./useProducts"
import type { Customer } from "@/app/_types"

export interface CartItem extends Product {
  quantity: number
}

export function useCartState() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)

  const addToCart = useCallback((product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setCartOpen(true)
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }, [])

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      })
    )
  }, [])

  const clearCart = useCallback(() => {
    setCart([])
  }, [])

  // Computed values
  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  )

  const cartSavings = useMemo(
    () => cart.reduce((sum, item) => sum + (item.savings || 0) * item.quantity, 0),
    [cart]
  )

  const memberDiscount = useMemo(
    () => (customer?.isMember ? cartTotal * 0.05 : 0),
    [customer?.isMember, cartTotal]
  )

  const finalTotal = useMemo(
    () => cartTotal - memberDiscount,
    [cartTotal, memberDiscount]
  )

  const itemCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  )

  return {
    cart,
    cartOpen,
    setCartOpen,
    customer,
    setCustomer,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartSavings,
    memberDiscount,
    finalTotal,
    itemCount,
  }
}
