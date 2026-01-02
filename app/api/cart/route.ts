/**
 * Cart API
 * 
 * Shopping cart operations with database persistence
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { cookies } from "next/headers"
import { authOptions } from "@/lib/auth"
import * as cartRepo from "@/lib/db/repositories/cart-repo"
import * as productRepo from "@/lib/db/repositories/product-repo"
import { logger } from "@/lib/logger"
import { z } from "zod"

const log = logger.child({ module: "cart-api" })

// ============================================
// Validation Schemas
// ============================================

const AddItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
})

const UpdateItemSchema = z.object({
  itemId: z.string().min(1),
  quantity: z.number().int().min(0),
})

const CouponSchema = z.object({
  code: z.string().min(1),
})

// ============================================
// Helpers
// ============================================

async function getSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get("cart_session")?.value
  
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`
  }
  
  return sessionId
}

function setSessionCookie(sessionId: string, response: NextResponse): NextResponse {
  response.cookies.set("cart_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })
  return response
}

// ============================================
// GET - Get Cart
// ============================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionId = await getSessionId()
    
    // Get or create cart
    const cart = await cartRepo.getOrCreateCart(
      sessionId,
      session?.user?.id
    )

    // Optionally refresh prices
    const { searchParams } = new URL(request.url)
    if (searchParams.get("refresh") === "true") {
      const refreshedCart = await cartRepo.refreshCartPrices(
        cart.id,
        productRepo.getProductById
      )
      if (refreshedCart) {
        const response = NextResponse.json({ 
          success: true, 
          cart: refreshedCart,
          pricesUpdated: true,
        })
        return setSessionCookie(sessionId, response)
      }
    }

    const response = NextResponse.json({ success: true, cart })
    return setSessionCookie(sessionId, response)

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to get cart" },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Add Item to Cart
// ============================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionId = await getSessionId()
    
    const body = await request.json()
    const validation = AddItemSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { productId, quantity } = validation.data

    // Get product
    const product = await productRepo.getProductById(productId)
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    if (!product.inventory.inStock) {
      return NextResponse.json(
        { error: "Product is out of stock" },
        { status: 400 }
      )
    }

    // Get or create cart
    const cart = await cartRepo.getOrCreateCart(
      sessionId,
      session?.user?.id
    )

    // Add item
    const updatedCart = await cartRepo.addToCart(cart.id, product, quantity)
    
    if (!updatedCart) {
      return NextResponse.json(
        { error: "Failed to add item to cart" },
        { status: 500 }
      )
    }

    log.info("Item added to cart", { 
      cartId: cart.id, 
      productId, 
      quantity,
      userId: session?.user?.id 
    })

    const response = NextResponse.json({ 
      success: true, 
      cart: updatedCart,
      message: "Item added to cart",
    })
    return setSessionCookie(sessionId, response)

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to add item to cart" },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH - Update Cart Item or Apply Coupon
// ============================================

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionId = await getSessionId()
    
    const body = await request.json()
    const action = body.action || "updateItem"

    // Get cart
    let cart = session?.user?.id
      ? await cartRepo.getCartByUser(session.user.id)
      : await cartRepo.getCartBySession(sessionId)

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      )
    }

    let updatedCart

    switch (action) {
      case "updateItem":
        const updateValidation = UpdateItemSchema.safeParse(body)
        if (!updateValidation.success) {
          return NextResponse.json(
            { error: "Invalid request", details: updateValidation.error.issues },
            { status: 400 }
          )
        }
        
        updatedCart = await cartRepo.updateCartItemQuantity(
          cart.id,
          updateValidation.data.itemId,
          updateValidation.data.quantity
        )
        
        log.info("Cart item updated", { 
          cartId: cart.id, 
          itemId: updateValidation.data.itemId,
          quantity: updateValidation.data.quantity
        })
        break

      case "applyCoupon":
        const couponValidation = CouponSchema.safeParse(body)
        if (!couponValidation.success) {
          return NextResponse.json(
            { error: "Invalid coupon code" },
            { status: 400 }
          )
        }

        // TODO: Validate coupon from database
        // For now, apply a test discount
        const code = couponValidation.data.code.toUpperCase()
        let discount = 0
        
        if (code === "SAVE10") discount = 10
        else if (code === "SAVE20") discount = 20
        else if (code === "FREESHIP") discount = cart.shipping
        else {
          return NextResponse.json(
            { error: "Invalid coupon code" },
            { status: 400 }
          )
        }

        updatedCart = await cartRepo.applyCoupon(cart.id, code, discount)
        
        log.info("Coupon applied", { cartId: cart.id, code, discount })
        break

      case "removeCoupon":
        updatedCart = await cartRepo.removeCoupon(cart.id)
        log.info("Coupon removed", { cartId: cart.id })
        break

      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        )
    }

    if (!updatedCart) {
      return NextResponse.json(
        { error: "Failed to update cart" },
        { status: 500 }
      )
    }

    const response = NextResponse.json({ success: true, cart: updatedCart })
    return setSessionCookie(sessionId, response)

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to update cart" },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Remove Item or Clear Cart
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const sessionId = await getSessionId()
    
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    const clearAll = searchParams.get("clear") === "true"

    // Get cart
    let cart = session?.user?.id
      ? await cartRepo.getCartByUser(session.user.id)
      : await cartRepo.getCartBySession(sessionId)

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      )
    }

    let updatedCart

    if (clearAll) {
      updatedCart = await cartRepo.clearCart(cart.id)
      log.info("Cart cleared", { cartId: cart.id })
    } else if (itemId) {
      updatedCart = await cartRepo.removeFromCart(cart.id, itemId)
      log.info("Item removed from cart", { cartId: cart.id, itemId })
    } else {
      return NextResponse.json(
        { error: "Specify itemId or clear=true" },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ success: true, cart: updatedCart })
    return setSessionCookie(sessionId, response)

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to update cart" },
      { status: 500 }
    )
  }
}
