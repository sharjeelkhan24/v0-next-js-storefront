/**
 * Admin Orders API
 * 
 * Full CRUD operations for orders
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as orderRepo from "@/lib/db/repositories/order-repo"
import { logger } from "@/lib/logger"
import { z } from "zod"

const log = logger.child({ module: "admin-orders-api" })

// ============================================
// Validation Schemas
// ============================================

const UpdateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"]),
  note: z.string().optional(),
})

const UpdateFulfillmentSchema = z.object({
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]),
  carrier: z.string().optional(),
  trackingNumber: z.string().optional(),
  trackingUrl: z.string().url().optional(),
})

const RefundSchema = z.object({
  amount: z.number().positive(),
  reason: z.string().min(1),
})

// ============================================
// Auth Helper
// ============================================

async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }
  
  if ((session.user as any).role !== "admin") {
    return { error: "Forbidden - Admin access required", status: 403 }
  }
  
  return { user: session.user }
}

// ============================================
// GET - List Orders
// ============================================

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    
    // Check for single order request
    const orderId = searchParams.get("id")
    if (orderId) {
      const order = await orderRepo.getOrderById(orderId)
      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, order })
    }

    // List orders with filters
    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      status: searchParams.get("status") as any || undefined,
      paymentStatus: searchParams.get("paymentStatus") as any || undefined,
      fulfillmentStatus: searchParams.get("fulfillmentStatus") as any || undefined,
      search: searchParams.get("search") || undefined,
      dateFrom: searchParams.get("dateFrom") ? new Date(searchParams.get("dateFrom")!) : undefined,
      dateTo: searchParams.get("dateTo") ? new Date(searchParams.get("dateTo")!) : undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") as any || "desc",
    }

    const result = await orderRepo.getOrders(options)
    const stats = await orderRepo.getOrderStats(options.dateFrom, options.dateTo)

    return NextResponse.json({
      success: true,
      orders: result.orders,
      total: result.total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(result.total / options.limit),
      stats,
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH - Update Order
// ============================================

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")
    const action = searchParams.get("action")
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    let order

    switch (action) {
      case "updateStatus":
        const statusValidation = UpdateStatusSchema.safeParse(body)
        if (!statusValidation.success) {
          return NextResponse.json(
            { error: "Invalid status data", details: statusValidation.error.issues },
            { status: 400 }
          )
        }
        order = await orderRepo.updateOrderStatus(
          orderId, 
          statusValidation.data.status,
          statusValidation.data.note
        )
        log.info("Order status updated", { 
          admin: auth.user.email, 
          orderId, 
          status: statusValidation.data.status 
        })
        break

      case "updateFulfillment":
        const fulfillmentValidation = UpdateFulfillmentSchema.safeParse(body)
        if (!fulfillmentValidation.success) {
          return NextResponse.json(
            { error: "Invalid fulfillment data", details: fulfillmentValidation.error.issues },
            { status: 400 }
          )
        }
        order = await orderRepo.updateFulfillmentStatus(
          orderId,
          fulfillmentValidation.data.status,
          {
            carrier: fulfillmentValidation.data.carrier,
            trackingNumber: fulfillmentValidation.data.trackingNumber,
            trackingUrl: fulfillmentValidation.data.trackingUrl,
          }
        )
        log.info("Order fulfillment updated", { 
          admin: auth.user.email, 
          orderId, 
          status: fulfillmentValidation.data.status 
        })
        break

      case "refund":
        const refundValidation = RefundSchema.safeParse(body)
        if (!refundValidation.success) {
          return NextResponse.json(
            { error: "Invalid refund data", details: refundValidation.error.issues },
            { status: 400 }
          )
        }
        order = await orderRepo.processRefund(
          orderId,
          refundValidation.data.amount,
          refundValidation.data.reason
        )
        log.info("Order refunded", { 
          admin: auth.user.email, 
          orderId, 
          amount: refundValidation.data.amount 
        })
        break

      case "addNote":
        if (!body.note) {
          return NextResponse.json({ error: "Note is required" }, { status: 400 })
        }
        await orderRepo.addOrderNote(orderId, body.note, body.internal !== false)
        order = await orderRepo.getOrderById(orderId)
        log.info("Order note added", { admin: auth.user.email, orderId })
        break

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: updateStatus, updateFulfillment, refund, addNote" },
          { status: 400 }
        )
    }

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, order })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Cancel Order
// ============================================

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("id")
    const reason = searchParams.get("reason") || "Cancelled by admin"
    
    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    const order = await orderRepo.cancelOrder(orderId, reason)
    
    if (!order) {
      return NextResponse.json(
        { error: "Order not found or cannot be cancelled" },
        { status: 404 }
      )
    }

    log.info("Order cancelled", { 
      admin: auth.user.email, 
      orderId, 
      reason 
    })

    return NextResponse.json({ success: true, order })

  } catch (error) {
    if (error instanceof Error && error.message.includes("Cannot cancel")) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to cancel order" },
      { status: 500 }
    )
  }
}
