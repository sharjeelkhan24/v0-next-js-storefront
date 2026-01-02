/**
 * User Orders API
 * 
 * Customer-facing order endpoints
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as orderRepo from "@/lib/db/repositories/order-repo"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "user-orders-api" })

// ============================================
// GET - Get User's Orders
// ============================================

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in to view orders" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    
    // Single order request
    const orderId = searchParams.get("id")
    if (orderId) {
      const order = await orderRepo.getOrderById(orderId)
      
      if (!order) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        )
      }

      // Verify order belongs to user
      if (order.userId !== session.user.id && !order.userId.startsWith("guest_")) {
        return NextResponse.json(
          { error: "Order not found" },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, order })
    }

    // List user's orders
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "10")

    const result = await orderRepo.getOrdersByUser(session.user.id, { page, limit })

    return NextResponse.json({
      success: true,
      orders: result.orders,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
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
// POST - Request Order Cancellation
// ============================================

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Please sign in" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { orderId, reason } = body

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    const order = await orderRepo.getOrderById(orderId)
    
    if (!order || order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    // Only allow cancellation for pending/confirmed orders
    if (!["pending", "confirmed"].includes(order.status)) {
      return NextResponse.json(
        { error: "This order cannot be cancelled" },
        { status: 400 }
      )
    }

    const cancelledOrder = await orderRepo.cancelOrder(
      orderId,
      reason || "Cancelled by customer"
    )

    log.info("Order cancelled by customer", { 
      orderId, 
      userId: session.user.id,
      reason 
    })

    return NextResponse.json({
      success: true,
      order: cancelledOrder,
      message: "Order has been cancelled",
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to cancel order" },
      { status: 500 }
    )
  }
}
