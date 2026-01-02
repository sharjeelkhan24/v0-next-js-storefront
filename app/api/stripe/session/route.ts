import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null

export async function GET(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get("session_id")

    if (!sessionId) {
      console.error("[v0] Session retrieval error: No session_id provided")
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    console.log("[v0] Retrieving Stripe session:", sessionId)

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer"],
    })

    console.log("[v0] Stripe session retrieved successfully")

    return NextResponse.json({
      session: {
        id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
        customer_email: session.customer_email,
        payment_status: session.payment_status,
        metadata: session.metadata,
        line_items: session.line_items?.data,
      },
    })
  } catch (error: any) {
    console.error("[v0] Session retrieval error:", error.message)
    return NextResponse.json({ error: "Failed to retrieve session", details: error.message }, { status: 500 })
  }
}
