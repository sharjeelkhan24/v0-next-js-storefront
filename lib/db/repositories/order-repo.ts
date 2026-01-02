/**
 * Order Repository
 * 
 * CRUD operations for orders
 */

import { collections, generateId, generateOrderNumber } from "../client"
import type { Order, OrderItem, Address } from "../schema"
import { logger } from "../../logger"

const log = logger.child({ module: "order-repo" })

// ============================================
// Create
// ============================================

export async function createOrder(data: {
  userId: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  items: Omit<OrderItem, "id">[]
  shippingAddress: Address
  billingAddress: Address
  subtotal: number
  tax: number
  taxRate: number
  shipping: number
  discount?: number
  couponCode?: string
  couponDiscount?: number
  customerNotes?: string
  stripePaymentIntentId?: string
}): Promise<Order> {
  const col = await collections.orders()
  
  const now = new Date()
  const order: Order = {
    id: generateId(),
    orderNumber: generateOrderNumber(),
    userId: data.userId,
    customerEmail: data.customerEmail,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    items: data.items.map(item => ({ ...item, id: generateId() })),
    shippingAddress: data.shippingAddress,
    billingAddress: data.billingAddress,
    subtotal: data.subtotal,
    tax: data.tax,
    taxRate: data.taxRate,
    shipping: data.shipping,
    discount: data.discount || 0,
    total: data.subtotal + data.tax + data.shipping - (data.discount || 0),
    currency: "USD",
    couponCode: data.couponCode,
    couponDiscount: data.couponDiscount,
    payment: {
      method: "card",
      status: "pending",
      stripePaymentIntentId: data.stripePaymentIntentId,
    },
    fulfillment: {
      status: "pending",
    },
    status: "pending",
    customerNotes: data.customerNotes,
    createdAt: now,
    updatedAt: now,
  }

  await col.insertOne(order as any)
  log.info("Order created", { orderId: order.id, orderNumber: order.orderNumber })
  
  return order
}

// ============================================
// Read
// ============================================

export async function getOrderById(id: string): Promise<Order | null> {
  const col = await collections.orders()
  return col.findOne({ id }) as Promise<Order | null>
}

export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const col = await collections.orders()
  return col.findOne({ orderNumber }) as Promise<Order | null>
}

export async function getOrdersByUser(
  userId: string,
  options?: { page?: number; limit?: number }
): Promise<{ orders: Order[]; total: number }> {
  const col = await collections.orders()
  
  const page = options?.page || 1
  const limit = options?.limit || 10
  const skip = (page - 1) * limit

  const [orders, total] = await Promise.all([
    col.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    col.countDocuments({ userId }),
  ])

  return { orders: orders as Order[], total }
}

export async function getOrders(options: {
  page?: number
  limit?: number
  status?: Order["status"]
  paymentStatus?: Order["payment"]["status"]
  fulfillmentStatus?: Order["fulfillment"]["status"]
  search?: string
  dateFrom?: Date
  dateTo?: Date
  sortBy?: string
  sortOrder?: "asc" | "desc"
}): Promise<{ orders: Order[]; total: number }> {
  const col = await collections.orders()
  
  const page = options.page || 1
  const limit = Math.min(options.limit || 20, 100)
  const skip = (page - 1) * limit

  const filter: any = {}
  
  if (options.status) {
    filter.status = options.status
  }
  
  if (options.paymentStatus) {
    filter["payment.status"] = options.paymentStatus
  }
  
  if (options.fulfillmentStatus) {
    filter["fulfillment.status"] = options.fulfillmentStatus
  }
  
  if (options.search) {
    filter.$or = [
      { orderNumber: { $regex: options.search, $options: "i" } },
      { customerEmail: { $regex: options.search, $options: "i" } },
      { customerName: { $regex: options.search, $options: "i" } },
    ]
  }
  
  if (options.dateFrom || options.dateTo) {
    filter.createdAt = {}
    if (options.dateFrom) filter.createdAt.$gte = options.dateFrom
    if (options.dateTo) filter.createdAt.$lte = options.dateTo
  }

  const sort: any = {}
  sort[options.sortBy || "createdAt"] = options.sortOrder === "asc" ? 1 : -1

  const [orders, total] = await Promise.all([
    col.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
    col.countDocuments(filter),
  ])

  return { orders: orders as Order[], total }
}

// ============================================
// Update
// ============================================

export async function updateOrderStatus(
  id: string,
  status: Order["status"],
  internalNotes?: string
): Promise<Order | null> {
  const col = await collections.orders()
  
  const updates: any = {
    status,
    updatedAt: new Date(),
  }
  
  if (internalNotes) {
    updates.internalNotes = internalNotes
  }
  
  if (status === "cancelled") {
    updates.cancelledAt = new Date()
  }

  const result = await col.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: "after" }
  )

  if (result) {
    log.info("Order status updated", { orderId: id, status })
  }
  
  return result as Order | null
}

export async function updatePaymentStatus(
  id: string,
  paymentStatus: Order["payment"]["status"],
  chargeId?: string
): Promise<Order | null> {
  const col = await collections.orders()
  
  const updates: any = {
    "payment.status": paymentStatus,
    updatedAt: new Date(),
  }
  
  if (chargeId) {
    updates["payment.stripeChargeId"] = chargeId
  }
  
  if (paymentStatus === "completed") {
    updates["payment.paidAt"] = new Date()
    updates.status = "confirmed"
  }

  const result = await col.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: "after" }
  )

  if (result) {
    log.info("Payment status updated", { orderId: id, paymentStatus })
  }
  
  return result as Order | null
}

export async function updateFulfillmentStatus(
  id: string,
  status: Order["fulfillment"]["status"],
  trackingInfo?: {
    carrier?: string
    trackingNumber?: string
    trackingUrl?: string
  }
): Promise<Order | null> {
  const col = await collections.orders()
  
  const updates: any = {
    "fulfillment.status": status,
    updatedAt: new Date(),
  }
  
  if (trackingInfo?.carrier) {
    updates["fulfillment.carrier"] = trackingInfo.carrier
  }
  if (trackingInfo?.trackingNumber) {
    updates["fulfillment.trackingNumber"] = trackingInfo.trackingNumber
  }
  if (trackingInfo?.trackingUrl) {
    updates["fulfillment.trackingUrl"] = trackingInfo.trackingUrl
  }
  
  if (status === "shipped") {
    updates["fulfillment.shippedAt"] = new Date()
    updates.status = "shipped"
  }
  
  if (status === "delivered") {
    updates["fulfillment.deliveredAt"] = new Date()
    updates.status = "delivered"
  }

  const result = await col.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: "after" }
  )

  if (result) {
    log.info("Fulfillment status updated", { orderId: id, status })
  }
  
  return result as Order | null
}

export async function addOrderNote(
  id: string,
  note: string,
  isInternal: boolean = true
): Promise<boolean> {
  const col = await collections.orders()
  
  const field = isInternal ? "internalNotes" : "customerNotes"
  
  const result = await col.updateOne(
    { id },
    { 
      $set: { 
        [field]: note,
        updatedAt: new Date() 
      } 
    }
  )

  return result.modifiedCount > 0
}

export async function processRefund(
  id: string,
  amount: number,
  reason: string
): Promise<Order | null> {
  const col = await collections.orders()
  
  const updates = {
    "payment.status": "refunded",
    "payment.refundedAt": new Date(),
    "payment.refundAmount": amount,
    "payment.refundReason": reason,
    status: "refunded",
    updatedAt: new Date(),
  }

  const result = await col.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: "after" }
  )

  if (result) {
    log.info("Order refunded", { orderId: id, amount, reason })
  }
  
  return result as Order | null
}

// ============================================
// Cancel
// ============================================

export async function cancelOrder(
  id: string,
  reason: string
): Promise<Order | null> {
  const col = await collections.orders()
  
  const order = await col.findOne({ id }) as Order | null
  if (!order) return null
  
  // Only allow cancellation for certain statuses
  if (!["pending", "confirmed", "processing"].includes(order.status)) {
    throw new Error(`Cannot cancel order with status: ${order.status}`)
  }

  const updates = {
    status: "cancelled" as const,
    cancelledAt: new Date(),
    cancelReason: reason,
    "fulfillment.status": "cancelled" as const,
    updatedAt: new Date(),
  }

  const result = await col.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: "after" }
  )

  if (result) {
    log.info("Order cancelled", { orderId: id, reason })
  }
  
  return result as Order | null
}

// ============================================
// Analytics
// ============================================

export async function getOrderStats(dateFrom?: Date, dateTo?: Date): Promise<{
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  byStatus: Record<string, number>
  byPaymentStatus: Record<string, number>
}> {
  const col = await collections.orders()
  
  const filter: any = {}
  if (dateFrom || dateTo) {
    filter.createdAt = {}
    if (dateFrom) filter.createdAt.$gte = dateFrom
    if (dateTo) filter.createdAt.$lte = dateTo
  }

  const [
    totalOrders,
    revenueAgg,
    byStatusAgg,
    byPaymentAgg,
  ] = await Promise.all([
    col.countDocuments(filter),
    col.aggregate([
      { $match: { ...filter, "payment.status": "completed" } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]).toArray(),
    col.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]).toArray(),
    col.aggregate([
      { $match: filter },
      { $group: { _id: "$payment.status", count: { $sum: 1 } } },
    ]).toArray(),
  ])

  const totalRevenue = revenueAgg[0]?.total || 0
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const byStatus: Record<string, number> = {}
  byStatusAgg.forEach((item: any) => {
    byStatus[item._id] = item.count
  })

  const byPaymentStatus: Record<string, number> = {}
  byPaymentAgg.forEach((item: any) => {
    byPaymentStatus[item._id] = item.count
  })

  return {
    totalOrders,
    totalRevenue,
    averageOrderValue,
    byStatus,
    byPaymentStatus,
  }
}

export async function getDailySales(days: number = 30): Promise<{
  date: string
  orders: number
  revenue: number
}[]> {
  const col = await collections.orders()
  
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const result = await col.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        "payment.status": "completed",
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 },
        revenue: { $sum: "$total" },
      },
    },
    { $sort: { _id: 1 } },
  ]).toArray()

  return result.map((item: any) => ({
    date: item._id,
    orders: item.orders,
    revenue: item.revenue,
  }))
}

export async function getRecentOrders(limit: number = 10): Promise<Order[]> {
  const col = await collections.orders()
  
  return col
    .find({})
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray() as Promise<Order[]>
}
