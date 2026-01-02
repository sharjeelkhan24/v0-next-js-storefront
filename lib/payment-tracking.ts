/**
 * Payment Flow and Transaction Tracking System
 * Tracks where money goes and how it's distributed
 */

export interface PaymentBreakdown {
  orderId: string
  totalAmount: number
  breakdown: {
    productCost: number
    shipping: number
    tax: number
    platformFee: number
    paymentProcessingFee: number
  }
  distribution: {
    toSupplier: number // Money going to source (Amazon, eBay, etc.)
    toShipping: number
    toStripe: number // Payment processor fee
    toPlatform: number // IrishTripplets platform fee
    netProfit: number // What the store keeps
  }
  paymentMethod: "credit_card" | "debit_card" | "paypal"
  paymentProcessor: "stripe" | "paypal"
  transactionId: string
  status: "pending" | "processing" | "completed" | "failed" | "refunded"
  createdAt: Date
  completedAt?: Date
}

/**
 * Calculate payment breakdown and distribution
 */
export function calculatePaymentFlow(orderTotal: number, sourceCost: number, category: string): PaymentBreakdown {
  // Calculate components
  const shipping = 5.99
  const tax = orderTotal * 0.08 // 8% sales tax
  const platformFee = sourceCost * 0.03 // 3% platform fee to Amazon/eBay
  const paymentProcessingFee = orderTotal * 0.029 + 0.3 // Stripe fee: 2.9% + $0.30

  const productCost = orderTotal - shipping - tax

  // Distribution
  const toSupplier = sourceCost // Cost paid to Amazon/eBay
  const toShipping = shipping // Shipping carrier
  const toStripe = paymentProcessingFee // Payment processor
  const toPlatform = platformFee // Platform fees

  // Net profit = what customer paid - all costs
  const netProfit = orderTotal - toSupplier - toShipping - toStripe - toPlatform - tax

  return {
    orderId: `ORD-${Date.now()}`,
    totalAmount: Math.round(orderTotal * 100) / 100,
    breakdown: {
      productCost: Math.round(productCost * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      platformFee: Math.round(platformFee * 100) / 100,
      paymentProcessingFee: Math.round(paymentProcessingFee * 100) / 100,
    },
    distribution: {
      toSupplier: Math.round(toSupplier * 100) / 100,
      toShipping: Math.round(toShipping * 100) / 100,
      toStripe: Math.round(toStripe * 100) / 100,
      toPlatform: Math.round(toPlatform * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
    },
    paymentMethod: "credit_card",
    paymentProcessor: "stripe",
    transactionId: `txn_${Date.now()}`,
    status: "completed",
    createdAt: new Date(),
    completedAt: new Date(),
  }
}

/**
 * Get transaction audit trail
 */
export interface TransactionAudit {
  id: string
  orderId: string
  action: string
  amount: number
  from: string
  to: string
  timestamp: Date
  status: string
  reference: string
}

export function generateTransactionAudit(payment: PaymentBreakdown): TransactionAudit[] {
  const audit: TransactionAudit[] = []

  // Customer payment
  audit.push({
    id: `audit_${Date.now()}_1`,
    orderId: payment.orderId,
    action: "Payment Received",
    amount: payment.totalAmount,
    from: "Customer",
    to: "IrishTripplets (Stripe)",
    timestamp: payment.createdAt,
    status: "completed",
    reference: payment.transactionId,
  })

  // Payment to supplier
  audit.push({
    id: `audit_${Date.now()}_2`,
    orderId: payment.orderId,
    action: "Supplier Payment",
    amount: payment.distribution.toSupplier,
    from: "IrishTripplets",
    to: "Supplier (Amazon/eBay)",
    timestamp: new Date(payment.createdAt.getTime() + 1000),
    status: "completed",
    reference: `sup_${payment.transactionId}`,
  })

  // Stripe fee
  audit.push({
    id: `audit_${Date.now()}_3`,
    orderId: payment.orderId,
    action: "Processing Fee",
    amount: payment.distribution.toStripe,
    from: "IrishTripplets",
    to: "Stripe",
    timestamp: new Date(payment.createdAt.getTime() + 2000),
    status: "completed",
    reference: `fee_${payment.transactionId}`,
  })

  // Net profit retained
  audit.push({
    id: `audit_${Date.now()}_4`,
    orderId: payment.orderId,
    action: "Net Profit",
    amount: payment.distribution.netProfit,
    from: "Transaction",
    to: "IrishTripplets Revenue",
    timestamp: new Date(payment.createdAt.getTime() + 3000),
    status: "completed",
    reference: `profit_${payment.transactionId}`,
  })

  return audit
}
