import { type NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { SUBSCRIPTION_PLANS } from "@/lib/tenant-management"

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-12-18.acacia",
    })
  : null

/**
 * POST /api/saas/subscription
 * Create a Stripe subscription for a tenant
 */
export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const body = await request.json()
    const { tenantId, planId, email } = body

    // Validate required fields
    if (!tenantId || !planId || !email) {
      console.error("[v0] Subscription error: Missing required fields")
      return NextResponse.json({ error: "Tenant ID, plan ID, and email are required" }, { status: 400 })
    }

    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId)
    if (!plan) {
      console.error("[v0] Subscription error: Invalid plan ID")
      return NextResponse.json({ error: "Invalid plan ID" }, { status: 400 })
    }

    console.log("[v0] Creating Stripe subscription for tenant:", tenantId)

    // Create Stripe checkout session for subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/saas-portal?session_id={CHECKOUT_SESSION_ID}&tenant_id=${tenantId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin}/saas-portal?canceled=true`,
      metadata: {
        tenantId,
        planId,
      },
      subscription_data: {
        metadata: {
          tenantId,
          planId,
        },
      },
    })

    console.log("[v0] Stripe subscription session created:", session.id)

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error("[v0] Subscription error:", error.message)
    return NextResponse.json({ error: "Failed to create subscription", details: error.message }, { status: 500 })
  }
}

/**
 * DELETE /api/saas/subscription
 * Cancel a tenant's subscription
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const subscriptionId = searchParams.get("subscription_id")

    if (!subscriptionId) {
      return NextResponse.json({ error: "Subscription ID is required" }, { status: 400 })
    }

    console.log("[v0] Canceling subscription:", subscriptionId)

    // Cancel the subscription at period end
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    })

    console.log("[v0] Subscription canceled successfully")

    return NextResponse.json({ subscription, message: "Subscription will be canceled at period end" })
  } catch (error: any) {
    console.error("[v0] Error canceling subscription:", error.message)
    return NextResponse.json({ error: "Failed to cancel subscription" }, { status: 500 })
  }
}
