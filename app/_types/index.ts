/**
 * Types for FairCart Homepage
 */

import type { Product } from "@/app/_hooks/useProducts"

// Cart item extends product with quantity
export interface CartItem extends Product {
  quantity: number
}

// Customer type
export interface Customer {
  id: string
  email: string
  name: string
  isMember: boolean
  memberSince?: Date
  savedItems: string[]
  priceAlerts: string[]
}

// Modal state type
export interface ModalState {
  product: boolean
  login: boolean
  membership: boolean
  upload: boolean
  scan: boolean
  tracking: boolean
  priceAlert: boolean
  checkout: boolean
  info: string | null
}

// Filter state type
export interface FilterState {
  search: string
  category: string
  store: string
  region: string
}

// Hover state for retailer links
export interface HoverState {
  link: string | null
  position: { x: number; y: number }
}

// Re-export Product type
export type { Product }
