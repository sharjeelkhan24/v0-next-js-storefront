/**
 * Cart Repository
 * 
 * CRUD operations for shopping carts
 */

import { collections, generateId } from "../client"
import type { Cart, CartItem, Product } from "../schema"
import { logger } from "../../logger"

const log = logger.child({ module: "cart-repo" })

// Cart expiration time (7 days for guest carts)
const CART_EXPIRY_DAYS = 7

// ============================================
// Create / Get
// ============================================

export async function getOrCreateCart(
  sessionId: string,
  userId?: string
): Promise<Cart> {
  const col = await collections.carts()
  
  // Try to find existing cart
  const filter: any = userId ? { userId } : { sessionId, userId: { $exists: false } }
  let cart = await col.findOne(filter) as Cart | null

  if (cart) {
    return cart
  }

  // Create new cart
  const now = new Date()
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + CART_EXPIRY_DAYS)

  cart = {
    id: generateId(),
    userId,
    sessionId,
    items: [],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    currency: "USD",
    createdAt: now,
    updatedAt: now,
    expiresAt,
  }

  await col.insertOne(cart as any)
  log.info("Cart created", { cartId: cart.id, userId, sessionId })
  
  return cart
}

export async function getCartById(id: string): Promise<Cart | null> {
  const col = await collections.carts()
  return col.findOne({ id }) as Promise<Cart | null>
}

export async function getCartByUser(userId: string): Promise<Cart | null> {
  const col = await collections.carts()
  return col.findOne({ userId }) as Promise<Cart | null>
}

export async function getCartBySession(sessionId: string): Promise<Cart | null> {
  const col = await collections.carts()
  return col.findOne({ sessionId, userId: { $exists: false } }) as Promise<Cart | null>
}

// ============================================
// Cart Items
// ============================================

export async function addToCart(
  cartId: string,
  product: Product,
  quantity: number = 1
): Promise<Cart | null> {
  const col = await collections.carts()
  
  const cart = await col.findOne({ id: cartId }) as Cart | null
  if (!cart) return null

  // Check if item already exists
  const existingIndex = cart.items.findIndex(item => item.productId === product.id)
  
  const now = new Date()
  
  if (existingIndex >= 0) {
    // Update quantity
    cart.items[existingIndex].quantity += quantity
    cart.items[existingIndex].price = product.price  // Update to current price
  } else {
    // Add new item
    const cartItem: CartItem = {
      id: generateId(),
      productId: product.id,
      product,
      quantity,
      price: product.price,
      addedAt: now,
    }
    cart.items.push(cartItem)
  }

  // Recalculate totals
  const totals = calculateCartTotals(cart.items, cart.couponDiscount)
  
  const result = await col.findOneAndUpdate(
    { id: cartId },
    { 
      $set: { 
        items: cart.items,
        ...totals,
        updatedAt: now,
      } 
    },
    { returnDocument: "after" }
  )

  log.info("Item added to cart", { cartId, productId: product.id, quantity })
  return result as Cart | null
}

export async function updateCartItemQuantity(
  cartId: string,
  itemId: string,
  quantity: number
): Promise<Cart | null> {
  const col = await collections.carts()
  
  const cart = await col.findOne({ id: cartId }) as Cart | null
  if (!cart) return null

  const itemIndex = cart.items.findIndex(item => item.id === itemId)
  if (itemIndex < 0) return cart

  if (quantity <= 0) {
    // Remove item
    cart.items.splice(itemIndex, 1)
  } else {
    cart.items[itemIndex].quantity = quantity
  }

  const totals = calculateCartTotals(cart.items, cart.couponDiscount)

  const result = await col.findOneAndUpdate(
    { id: cartId },
    { 
      $set: { 
        items: cart.items,
        ...totals,
        updatedAt: new Date(),
      } 
    },
    { returnDocument: "after" }
  )

  log.info("Cart item quantity updated", { cartId, itemId, quantity })
  return result as Cart | null
}

export async function removeFromCart(
  cartId: string,
  itemId: string
): Promise<Cart | null> {
  return updateCartItemQuantity(cartId, itemId, 0)
}

export async function clearCart(cartId: string): Promise<Cart | null> {
  const col = await collections.carts()
  
  const result = await col.findOneAndUpdate(
    { id: cartId },
    { 
      $set: { 
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: 0,
        couponCode: undefined,
        couponDiscount: undefined,
        updatedAt: new Date(),
      } 
    },
    { returnDocument: "after" }
  )

  log.info("Cart cleared", { cartId })
  return result as Cart | null
}

// ============================================
// Coupon
// ============================================

export async function applyCoupon(
  cartId: string,
  couponCode: string,
  discount: number
): Promise<Cart | null> {
  const col = await collections.carts()
  
  const cart = await col.findOne({ id: cartId }) as Cart | null
  if (!cart) return null

  const totals = calculateCartTotals(cart.items, discount)

  const result = await col.findOneAndUpdate(
    { id: cartId },
    { 
      $set: { 
        couponCode,
        couponDiscount: discount,
        ...totals,
        updatedAt: new Date(),
      } 
    },
    { returnDocument: "after" }
  )

  log.info("Coupon applied to cart", { cartId, couponCode, discount })
  return result as Cart | null
}

export async function removeCoupon(cartId: string): Promise<Cart | null> {
  const col = await collections.carts()
  
  const cart = await col.findOne({ id: cartId }) as Cart | null
  if (!cart) return null

  const totals = calculateCartTotals(cart.items, 0)

  const result = await col.findOneAndUpdate(
    { id: cartId },
    { 
      $set: { 
        couponCode: undefined,
        couponDiscount: undefined,
        ...totals,
        updatedAt: new Date(),
      },
      $unset: {
        couponCode: "",
        couponDiscount: "",
      }
    },
    { returnDocument: "after" }
  )

  log.info("Coupon removed from cart", { cartId })
  return result as Cart | null
}

// ============================================
// Merge Carts (Guest to User)
// ============================================

export async function mergeCarts(
  guestSessionId: string,
  userId: string
): Promise<Cart | null> {
  const col = await collections.carts()
  
  const [guestCart, userCart] = await Promise.all([
    col.findOne({ sessionId: guestSessionId, userId: { $exists: false } }) as Promise<Cart | null>,
    col.findOne({ userId }) as Promise<Cart | null>,
  ])

  if (!guestCart) {
    return userCart
  }

  if (!userCart) {
    // Convert guest cart to user cart
    const result = await col.findOneAndUpdate(
      { id: guestCart.id },
      { 
        $set: { 
          userId,
          updatedAt: new Date(),
        } 
      },
      { returnDocument: "after" }
    )
    log.info("Guest cart converted to user cart", { cartId: guestCart.id, userId })
    return result as Cart | null
  }

  // Merge items from guest cart to user cart
  for (const guestItem of guestCart.items) {
    const existingIndex = userCart.items.findIndex(
      item => item.productId === guestItem.productId
    )
    
    if (existingIndex >= 0) {
      userCart.items[existingIndex].quantity += guestItem.quantity
    } else {
      userCart.items.push(guestItem)
    }
  }

  const totals = calculateCartTotals(userCart.items, userCart.couponDiscount)

  // Update user cart
  const result = await col.findOneAndUpdate(
    { id: userCart.id },
    { 
      $set: { 
        items: userCart.items,
        ...totals,
        updatedAt: new Date(),
      } 
    },
    { returnDocument: "after" }
  )

  // Delete guest cart
  await col.deleteOne({ id: guestCart.id })

  log.info("Carts merged", { 
    guestCartId: guestCart.id, 
    userCartId: userCart.id, 
    userId,
    itemCount: userCart.items.length 
  })
  
  return result as Cart | null
}

// ============================================
// Delete
// ============================================

export async function deleteCart(id: string): Promise<boolean> {
  const col = await collections.carts()
  const result = await col.deleteOne({ id })
  return result.deletedCount > 0
}

// ============================================
// Helpers
// ============================================

function calculateCartTotals(
  items: CartItem[],
  couponDiscount?: number
): {
  subtotal: number
  tax: number
  shipping: number
  discount: number
  total: number
} {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  
  const taxRate = 0.08  // 8% tax
  const tax = subtotal * taxRate
  
  // Free shipping over $35
  const shipping = subtotal >= 35 ? 0 : 5.99
  
  const discount = couponDiscount || 0
  
  const total = Math.max(0, subtotal + tax + shipping - discount)

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

// ============================================
// Refresh Cart Prices
// ============================================

export async function refreshCartPrices(
  cartId: string,
  getProductById: (id: string) => Promise<Product | null>
): Promise<Cart | null> {
  const col = await collections.carts()
  
  const cart = await col.findOne({ id: cartId }) as Cart | null
  if (!cart) return null

  let pricesChanged = false

  for (const item of cart.items) {
    const product = await getProductById(item.productId)
    if (product && product.price !== item.price) {
      item.price = product.price
      item.product = product
      pricesChanged = true
    }
  }

  if (!pricesChanged) {
    return cart
  }

  const totals = calculateCartTotals(cart.items, cart.couponDiscount)

  const result = await col.findOneAndUpdate(
    { id: cartId },
    { 
      $set: { 
        items: cart.items,
        ...totals,
        updatedAt: new Date(),
      } 
    },
    { returnDocument: "after" }
  )

  log.info("Cart prices refreshed", { cartId, pricesChanged })
  return result as Cart | null
}
