import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { CheckoutRequestSchema, validateRequest, formatZodError } from "@/lib/validation-schemas"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "stripe-checkout" })

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      log.error("Stripe not configured - missing STRIPE_SECRET_KEY")
      return NextResponse.json({ error: "Payment service not configured" }, { status: 500 })
    }

    const body = await request.json()
    
    // Validate request with Zod
    const validation = validateRequest(CheckoutRequestSchema, body)
    
    if (!validation.success) {
      log.warn("Checkout validation failed", { errors: validation.error.issues })
      return NextResponse.json(
        { error: "Validation failed", ...formatZodError(validation.error) },
        { status: 400 }
      )
    }

    const { items, customerInfo } = validation.data
    
    log.info("Creating Stripe checkout session", { 
      email: customerInfo.email,
      itemCount: items.length,
      total: items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    })

    // Transform cart items to Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          description: item.description || undefined,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/checkout?canceled=true`,
      customer_email: customerInfo.email,
      metadata: {
        customerName: customerInfo.name || "",
        customerPhone: customerInfo.phone || "",
        customerAddress: customerInfo.address || "",
        customerCity: customerInfo.city || "",
        customerZip: customerInfo.zip || "",
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "IT", "ES"],
      },
    })

    log.info("Stripe checkout session created", { sessionId: session.id })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      action: "create-checkout-session",
    })
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    )
  }
}
