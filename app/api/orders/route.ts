import { NextResponse } from "next/server"
import { z } from "zod"
import { CartItemSchema, CustomerInfoSchema, validateRequest, formatZodError } from "@/lib/validation-schemas"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "orders" })

// In-memory orders storage for v0 preview
const ordersStore: any[] = []

// Order creation schema
const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1, "At least one item required"),
  customerInfo: CustomerInfoSchema,
  shippingAddress: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: z.string().length(2),
    zip: z.string().regex(/^\d{5}(-\d{4})?$/),
    country: z.string().length(2).default("US"),
  }).optional(),
  paymentIntentId: z.string().optional(),
  notes: z.string().max(500).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate request
    const validation = validateRequest(CreateOrderSchema, body)
    
    if (!validation.success) {
      log.warn("Order validation failed", { errors: validation.error.issues })
      return NextResponse.json(
        { success: false, error: "Validation failed", ...formatZodError(validation.error) },
        { status: 400 }
      )
    }

    const newOrder = {
      _id: `order-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      ...validation.data,
      status: "pending",
      createdAt: new Date(),
    }

    ordersStore.push(newOrder)
    
    log.info("Order created", { 
      orderId: newOrder._id, 
      itemCount: validation.data.items.length,
      email: validation.data.customerInfo.email
    })

    return NextResponse.json({
      success: true,
      orderId: newOrder._id,
    })
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      action: "create-order",
    })
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const allOrders = ordersStore
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)

    log.debug("Fetched orders", { count: allOrders.length })
    
    return NextResponse.json({ success: true, orders: allOrders })
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      action: "fetch-orders",
    })
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}
