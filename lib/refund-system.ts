/**
 * Refund and Return Management System
 */

export type RefundStatus = "requested" | "approved" | "processing" | "completed" | "rejected"
export type RefundReason = "defective" | "not-as-described" | "changed-mind" | "wrong-item" | "other"

export interface RefundRequest {
  id: string
  orderId: string
  orderNumber: string
  customerName: string
  customerEmail: string
  reason: RefundReason
  reasonDetails: string
  status: RefundStatus
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
  refundAmount: number
  restockingFee: number
  netRefund: number
  requestedAt: Date
  processedAt?: Date
  processedBy?: string
  notes?: string
}

// Mock refund requests
export const mockRefunds: RefundRequest[] = [
  {
    id: "REF-001",
    orderId: "1",
    orderNumber: "ORD-2025-001",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    reason: "defective",
    reasonDetails: "Laptop screen flickering",
    status: "approved",
    items: [
      {
        id: "item-1",
        name: "Dell XPS 15 AI-Powered Laptop",
        price: 1299.99,
        quantity: 1,
      },
    ],
    refundAmount: 1299.99,
    restockingFee: 0, // No restocking fee for defective items
    netRefund: 1299.99,
    requestedAt: new Date("2025-01-18T10:00:00"),
    processedAt: new Date("2025-01-19T14:30:00"),
    processedBy: "admin@irishtripplets.com",
  },
  {
    id: "REF-002",
    orderId: "4",
    orderNumber: "ORD-2025-004",
    customerName: "Emily Rodriguez",
    customerEmail: "emily.r@example.com",
    reason: "changed-mind",
    reasonDetails: "Ordered wrong model",
    status: "processing",
    items: [
      {
        id: "item-8",
        name: "Raspberry Pi 5 Starter Kit",
        price: 149.99,
        quantity: 1,
      },
    ],
    refundAmount: 149.99,
    restockingFee: 14.99, // 10% restocking fee
    netRefund: 135.0,
    requestedAt: new Date("2025-01-21T16:20:00"),
  },
]

/**
 * Calculate refund amount with fees
 */
export function calculateRefundAmount(
  itemTotal: number,
  reason: RefundReason,
): {
  refundAmount: number
  restockingFee: number
  netRefund: number
} {
  let restockingFee = 0

  // Apply restocking fee based on reason
  if (reason === "changed-mind") {
    restockingFee = itemTotal * 0.1 // 10% restocking fee
  } else if (reason === "wrong-item") {
    restockingFee = 0 // No fee for our mistake
  } else if (reason === "defective" || reason === "not-as-described") {
    restockingFee = 0 // No fee for defective/misrepresented items
  } else {
    restockingFee = itemTotal * 0.15 // 15% for other reasons
  }

  const netRefund = itemTotal - restockingFee

  return {
    refundAmount: Math.round(itemTotal * 100) / 100,
    restockingFee: Math.round(restockingFee * 100) / 100,
    netRefund: Math.round(netRefund * 100) / 100,
  }
}

/**
 * Process refund request
 */
export function processRefund(
  refundId: string,
  status: RefundStatus,
  processedBy: string,
  notes?: string,
): RefundRequest | null {
  const refund = mockRefunds.find((r) => r.id === refundId)

  if (!refund) return null

  refund.status = status
  refund.processedAt = new Date()
  refund.processedBy = processedBy
  if (notes) refund.notes = notes

  return refund
}
