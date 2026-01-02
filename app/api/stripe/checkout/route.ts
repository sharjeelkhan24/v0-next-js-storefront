import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { items, customerInfo } = body

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error("[v0] Stripe checkout error: No items provided")
      return NextResponse.json({ error: "Cart items are required" }, { status: 400 })
    }

    if (!customerInfo?.email) {
      console.error("[v0] Stripe checkout error: No customer email provided")
      return NextResponse.json({ error: "Customer email is required" }, { status: 400 })
    }

    console.log("[v0] Creating Stripe checkout session for:", customerInfo.email)

    // Transform cart items to Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
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

    console.log("[v0] Stripe checkout session created:", session.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error("[v0] Stripe checkout error:", error.message)
    return NextResponse.json({ error: "Failed to create checkout session", details: error.message }, { status: 500 })
  }
}
