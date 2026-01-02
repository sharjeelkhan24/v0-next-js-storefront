/**
 * Checkout API
 * 
 * Creates orders and handles Stripe payment
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { cookies } from "next/headers"
import Stripe from "stripe"
import { authOptions } from "@/lib/auth"
import * as cartRepo from "@/lib/db/repositories/cart-repo"
import * as orderRepo from "@/lib/db/repositories/order-repo"
import * as userRepo from "@/lib/db/repositories/user-repo"
import { logger } from "@/lib/logger"
import { z } from "zod"
import type { Address } from "@/lib/db/schema"

const log = logger.child({ module: "checkout-api" })

// Initialize Stripe
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null

// ============================================
// Validation Schemas
// ============================================

const AddressSchema = z.object({
  name: z.string().min(1),
  street: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(5),
  country: z.string().default("US"),
  phone: z.string().optional(),
})

const CheckoutSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema.optional(),
  sameAsShipping: z.boolean().default(true),
  notes: z.string().optional(),
})

// ============================================
// POST - Create Checkout Session
// ============================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("cart_session")?.value

    if (!sessionId && !session?.user?.id) {
      return NextResponse.json(
        { error: "No cart found" },
        { status: 400 }
      )
    }

    // Get cart
    let cart = session?.user?.id
      ? await cartRepo.getCartByUser(session.user.id)
      : await cartRepo.getCartBySession(sessionId!)

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }

    // Validate checkout data
    const body = await request.json()
    const validation = CheckoutSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid checkout data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const checkoutData = validation.data
    
    // Prepare addresses
    const shippingAddress: Address = {
      id: `addr_${Date.now()}`,
      type: "shipping",
      name: checkoutData.shippingAddress.name,
      street: checkoutData.shippingAddress.street,
      street2: checkoutData.shippingAddress.street2,
      city: checkoutData.shippingAddress.city,
      state: checkoutData.shippingAddress.state,
      zipCode: checkoutData.shippingAddress.zipCode,
      country: checkoutData.shippingAddress.country,
      phone: checkoutData.shippingAddress.phone,
      isDefault: false,
    }

    const billingAddress: Address = checkoutData.sameAsShipping
      ? { ...shippingAddress, type: "billing", id: `addr_${Date.now()}_billing` }
      : {
          id: `addr_${Date.now()}_billing`,
          type: "billing",
          name: checkoutData.billingAddress!.name,
          street: checkoutData.billingAddress!.street,
          street2: checkoutData.billingAddress!.street2,
          city: checkoutData.billingAddress!.city,
          state: checkoutData.billingAddress!.state,
          zipCode: checkoutData.billingAddress!.zipCode,
          country: checkoutData.billingAddress!.country,
          phone: checkoutData.billingAddress!.phone,
          isDefault: false,
        }

    // Calculate tax rate based on state
    const taxRate = calculateTaxRate(shippingAddress.state)
    const tax = Math.round(cart.subtotal * taxRate * 100) / 100

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.thumbnail,
      productUrl: item.product.sourceUrl,
      store: item.product.store || item.product.source,
      quantity: item.quantity,
      unitPrice: item.price,
      totalPrice: item.price * item.quantity,
    }))

    // Create Stripe Payment Intent if Stripe is configured
    let stripePaymentIntentId: string | undefined

    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(cart.total * 100), // Convert to cents
        currency: "usd",
        metadata: {
          cartId: cart.id,
          customerEmail: checkoutData.email,
        },
      })
      stripePaymentIntentId = paymentIntent.id

      log.info("Stripe payment intent created", { 
        paymentIntentId: paymentIntent.id,
        amount: cart.total 
      })
    }

    // Create order
    const order = await orderRepo.createOrder({
      userId: session?.user?.id || `guest_${sessionId}`,
      customerEmail: checkoutData.email,
      customerName: checkoutData.name,
      customerPhone: checkoutData.phone,
      items: orderItems,
      shippingAddress,
      billingAddress,
      subtotal: cart.subtotal,
      tax,
      taxRate,
      shipping: cart.shipping,
      discount: cart.discount,
      couponCode: cart.couponCode,
      couponDiscount: cart.couponDiscount,
      customerNotes: checkoutData.notes,
      stripePaymentIntentId,
    })

    // Update user stats if logged in
    if (session?.user?.id) {
      const savings = orderItems.reduce((sum, item) => {
        const product = cart.items.find(ci => ci.productId === item.productId)?.product
        if (product?.originalPrice) {
          return sum + (product.originalPrice - item.unitPrice) * item.quantity
        }
        return sum
      }, 0)

      await userRepo.updateUserStats(session.user.id, order.total, savings)
    }

    log.info("Order created", { 
      orderId: order.id,
      orderNumber: order.orderNumber,
      total: order.total,
      userId: session?.user?.id
    })

    // Clear cart after successful order creation
    await cartRepo.clearCart(cart.id)

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
      stripeClientSecret: stripe 
        ? (await stripe.paymentIntents.retrieve(stripePaymentIntentId!)).client_secret
        : null,
      requiresPayment: !!stripe,
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Checkout failed" },
      { status: 500 }
    )
  }
}

// ============================================
// Helper Functions
// ============================================

function calculateTaxRate(state: string): number {
  // US state sales tax rates (simplified)
  const taxRates: Record<string, number> = {
    CA: 0.0725,
    NY: 0.08,
    TX: 0.0625,
    FL: 0.06,
    IL: 0.0625,
    PA: 0.06,
    OH: 0.0575,
    GA: 0.04,
    NC: 0.0475,
    MI: 0.06,
    // Add more states as needed
  }

  return taxRates[state.toUpperCase()] || 0.07  // Default 7%
}
