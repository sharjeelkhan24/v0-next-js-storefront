/**
 * Stripe Webhook Handler
 * 
 * Processes Stripe events for payment confirmations
 */

import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import * as orderRepo from "@/lib/db/repositories/order-repo"
import { collections } from "@/lib/db/client"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "stripe-webhook" })

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" })
  : null

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ""

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    )
  }

  try {
    const body = await request.text()
    const signature = request.headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      log.error("Webhook signature verification failed", { error: err })
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 }
      )
    }

    log.info("Stripe webhook received", { type: event.type })

    switch (event.type) {
      case "payment_intent.succeeded":
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
        break

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent)
        break

      case "charge.refunded":
        await handleRefund(event.data.object as Stripe.Charge)
        break

      case "charge.dispute.created":
        await handleDispute(event.data.object as Stripe.Dispute)
        break

      default:
        log.info("Unhandled webhook event", { type: event.type })
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}

// ============================================
// Event Handlers
// ============================================

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { id: paymentIntentId, metadata } = paymentIntent

  log.info("Payment succeeded", { paymentIntentId })

  // Find order by payment intent ID
  const ordersCol = await collections.orders()
  const order = await ordersCol.findOne({
    "payment.stripePaymentIntentId": paymentIntentId,
  })

  if (!order) {
    log.error("Order not found for payment intent", { paymentIntentId })
    return
  }

  // Update order status
  await orderRepo.updatePaymentStatus(
    order.id,
    "completed",
    paymentIntent.latest_charge as string
  )

  // Send confirmation email (placeholder)
  await sendOrderConfirmationEmail(order.customerEmail, order.orderNumber)

  log.info("Order payment completed", { 
    orderId: order.id, 
    orderNumber: order.orderNumber 
  })
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const { id: paymentIntentId, last_payment_error } = paymentIntent

  log.warn("Payment failed", { 
    paymentIntentId,
    error: last_payment_error?.message 
  })

  // Find and update order
  const ordersCol = await collections.orders()
  const order = await ordersCol.findOne({
    "payment.stripePaymentIntentId": paymentIntentId,
  })

  if (order) {
    await orderRepo.updatePaymentStatus(order.id, "failed")
    
    // Send payment failed email
    await sendPaymentFailedEmail(
      order.customerEmail, 
      order.orderNumber,
      last_payment_error?.message || "Payment could not be processed"
    )
  }
}

async function handleRefund(charge: Stripe.Charge) {
  const { payment_intent, amount_refunded } = charge

  log.info("Refund processed", { 
    paymentIntentId: payment_intent,
    amountRefunded: amount_refunded / 100 
  })

  // Find and update order
  const ordersCol = await collections.orders()
  const order = await ordersCol.findOne({
    "payment.stripePaymentIntentId": payment_intent,
  })

  if (order) {
    await orderRepo.processRefund(
      order.id,
      amount_refunded / 100,
      "Refunded via Stripe"
    )

    // Send refund confirmation email
    await sendRefundEmail(
      order.customerEmail,
      order.orderNumber,
      amount_refunded / 100
    )
  }
}

async function handleDispute(dispute: Stripe.Dispute) {
  log.warn("Dispute created", { 
    disputeId: dispute.id,
    reason: dispute.reason,
    amount: dispute.amount / 100
  })

  // Log dispute for admin review
  const adminLogsCol = await collections.adminLogs()
  await adminLogsCol.insertOne({
    id: `dispute_${dispute.id}`,
    adminId: "system",
    adminEmail: "system@faircart.com",
    action: "dispute_created",
    resource: "order",
    resourceId: dispute.payment_intent as string,
    details: {
      disputeId: dispute.id,
      reason: dispute.reason,
      amount: dispute.amount / 100,
      status: dispute.status,
    },
    ip: "system",
    userAgent: "stripe-webhook",
    timestamp: new Date(),
  })
}

// ============================================
// Email Placeholders (implement with your email service)
// ============================================

async function sendOrderConfirmationEmail(email: string, orderNumber: string) {
  log.info("Sending order confirmation email", { email, orderNumber })
  // TODO: Implement with SendGrid, SES, or other email service
}

async function sendPaymentFailedEmail(email: string, orderNumber: string, reason: string) {
  log.info("Sending payment failed email", { email, orderNumber, reason })
  // TODO: Implement
}

async function sendRefundEmail(email: string, orderNumber: string, amount: number) {
  log.info("Sending refund email", { email, orderNumber, amount })
  // TODO: Implement
}
