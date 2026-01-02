/**
 * Database Schema & Models
 * 
 * Complete e-commerce data layer using MongoDB
 */

import { ObjectId } from "mongodb"

// ============================================
// User Schema
// ============================================

export interface User {
  _id?: ObjectId
  id: string
  email: string
  passwordHash?: string  // For email/password auth
  name: string
  phone?: string
  avatar?: string
  role: "customer" | "admin" | "vendor"
  
  // OAuth providers
  providers?: {
    google?: string
    apple?: string
    facebook?: string
  }
  
  // Addresses
  addresses: Address[]
  defaultAddressId?: string
  
  // Preferences
  preferences: {
    notifications: boolean
    newsletter: boolean
    currency: string
    language: string
  }
  
  // Membership
  membership?: {
    tier: "free" | "plus" | "premium"
    startDate: Date
    endDate?: Date
    stripeSubscriptionId?: string
  }
  
  // Stats
  stats: {
    totalOrders: number
    totalSpent: number
    savedAmount: number
    lastOrderDate?: Date
  }
  
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  isActive: boolean
  isVerified: boolean
}

export interface Address {
  id: string
  type: "shipping" | "billing"
  name: string
  street: string
  street2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  isDefault: boolean
}

// ============================================
// Product Schema (Synced from APIs)
// ============================================

export interface Product {
  _id?: ObjectId
  id: string
  
  // Source info
  source: "amazon" | "walmart" | "ebay" | "target" | "google" | "manual"
  sourceId: string  // ASIN, UPC, etc.
  sourceUrl: string
  
  // Basic info
  name: string
  brand: string
  description: string
  category: string
  subcategory?: string
  tags: string[]
  
  // Media
  images: string[]
  thumbnail: string
  
  // Pricing
  price: number
  originalPrice?: number
  currency: string
  priceHistory: PriceHistoryEntry[]
  
  // Inventory
  inventory: {
    inStock: boolean
    quantity?: number
    lowStockThreshold: number
    lastChecked: Date
  }
  
  // Ratings
  rating: number
  reviewCount: number
  
  // Shipping
  shipping: {
    freeShipping: boolean
    estimatedDays?: number
    weight?: number
    dimensions?: {
      length: number
      width: number
      height: number
    }
  }
  
  // Features
  features: string[]
  specifications?: Record<string, string>
  
  // Status
  isActive: boolean
  isFeatured: boolean
  isOnSale: boolean
  
  // Sync
  lastSyncedAt: Date
  syncFrequency: number  // hours
  
  createdAt: Date
  updatedAt: Date
}

export interface PriceHistoryEntry {
  price: number
  date: Date
  source: string
}

// ============================================
// Cart Schema
// ============================================

export interface Cart {
  _id?: ObjectId
  id: string
  userId?: string  // Optional for guest carts
  sessionId: string  // For guest users
  
  items: CartItem[]
  
  // Totals (calculated)
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
  
  // Applied offers
  couponCode?: string
  couponDiscount?: number
  
  // Metadata
  currency: string
  createdAt: Date
  updatedAt: Date
  expiresAt: Date  // Auto-delete old guest carts
}

export interface CartItem {
  id: string
  productId: string
  product: Product  // Denormalized for performance
  quantity: number
  price: number  // Price at time of adding
  addedAt: Date
}

// ============================================
// Order Schema
// ============================================

export interface Order {
  _id?: ObjectId
  id: string
  orderNumber: string  // Human readable: ORD-2024-XXXXX
  
  // Customer
  userId: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  
  // Items
  items: OrderItem[]
  
  // Addresses
  shippingAddress: Address
  billingAddress: Address
  
  // Pricing
  subtotal: number
  tax: number
  taxRate: number
  shipping: number
  discount: number
  total: number
  currency: string
  
  // Coupon
  couponCode?: string
  couponDiscount?: number
  
  // Payment
  payment: {
    method: "card" | "paypal" | "applepay" | "googlepay"
    status: "pending" | "processing" | "completed" | "failed" | "refunded"
    stripePaymentIntentId?: string
    stripeChargeId?: string
    paidAt?: Date
    refundedAt?: Date
    refundAmount?: number
    refundReason?: string
  }
  
  // Fulfillment
  fulfillment: {
    status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
    shippedAt?: Date
    deliveredAt?: Date
    estimatedDelivery?: Date
  }
  
  // Status
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
  
  // Notes
  customerNotes?: string
  internalNotes?: string
  
  // Timestamps
  createdAt: Date
  updatedAt: Date
  cancelledAt?: Date
  cancelReason?: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  productUrl: string
  store: string
  quantity: number
  unitPrice: number
  totalPrice: number
  
  // For dropshipping
  sourceOrderId?: string
  sourceOrderStatus?: string
  costPrice?: number
  profit?: number
}

// ============================================
// Inventory Sync Schema
// ============================================

export interface InventorySync {
  _id?: ObjectId
  id: string
  productId: string
  
  // Sync details
  source: string
  sourceProductId: string
  
  // Current state
  currentPrice: number
  currentStock: boolean
  
  // Previous state
  previousPrice?: number
  previousStock?: boolean
  
  // Change tracking
  priceChanged: boolean
  stockChanged: boolean
  priceChangePercent?: number
  
  // Status
  status: "success" | "failed" | "pending"
  errorMessage?: string
  
  // Timing
  syncedAt: Date
  nextSyncAt: Date
  duration: number  // ms
}

// ============================================
// Price Alert Schema
// ============================================

export interface PriceAlert {
  _id?: ObjectId
  id: string
  userId: string
  productId: string
  
  targetPrice: number
  currentPrice: number
  
  isTriggered: boolean
  triggeredAt?: Date
  notifiedAt?: Date
  
  createdAt: Date
  expiresAt: Date
  isActive: boolean
}

// ============================================
// Coupon Schema
// ============================================

export interface Coupon {
  _id?: ObjectId
  id: string
  code: string
  
  type: "percentage" | "fixed" | "freeShipping"
  value: number  // Percentage or fixed amount
  
  // Constraints
  minOrderAmount?: number
  maxDiscount?: number
  maxUses?: number
  usesPerUser?: number
  
  // Validity
  validFrom: Date
  validUntil: Date
  isActive: boolean
  
  // Restrictions
  applicableProducts?: string[]  // Product IDs
  applicableCategories?: string[]
  excludedProducts?: string[]
  
  // Usage tracking
  usedCount: number
  usedBy: string[]  // User IDs
  
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Analytics Schema
// ============================================

export interface AnalyticsEvent {
  _id?: ObjectId
  id: string
  
  type: "pageview" | "search" | "product_view" | "add_to_cart" | "checkout" | "purchase"
  
  userId?: string
  sessionId: string
  
  data: Record<string, any>
  
  // Context
  url: string
  referrer?: string
  userAgent: string
  ip?: string
  
  timestamp: Date
}

export interface DailySales {
  _id?: ObjectId
  date: string  // YYYY-MM-DD
  
  orders: number
  revenue: number
  profit: number
  averageOrderValue: number
  
  // By source
  byStore: Record<string, {
    orders: number
    revenue: number
  }>
  
  // Top products
  topProducts: {
    productId: string
    name: string
    quantity: number
    revenue: number
  }[]
}

// ============================================
// Admin Activity Log
// ============================================

export interface AdminLog {
  _id?: ObjectId
  id: string
  
  adminId: string
  adminEmail: string
  
  action: string
  resource: string
  resourceId?: string
  
  details: Record<string, any>
  
  ip: string
  userAgent: string
  
  timestamp: Date
}

// ============================================
// Notification Schema
// ============================================

export interface Notification {
  _id?: ObjectId
  id: string
  userId: string
  
  type: "order" | "price_alert" | "promo" | "system"
  title: string
  message: string
  
  data?: Record<string, any>
  
  isRead: boolean
  readAt?: Date
  
  createdAt: Date
  expiresAt?: Date
}
