export interface Coupon {
  code: string
  type: "percentage" | "fixed"
  value: number
  minPurchase: number
  expiresAt: Date
  usedCount: number
  maxUses: number
  active: boolean
}

export const activeCoupons: Coupon[] = [
  {
    code: "WELCOME10",
    type: "percentage",
    value: 10,
    minPurchase: 50,
    expiresAt: new Date("2025-12-31"),
    usedCount: 0,
    maxUses: 1000,
    active: true,
  },
  {
    code: "SAVE25",
    type: "fixed",
    value: 25,
    minPurchase: 100,
    expiresAt: new Date("2025-12-31"),
    usedCount: 0,
    maxUses: 500,
    active: true,
  },
  {
    code: "BIGDEAL50",
    type: "fixed",
    value: 50,
    minPurchase: 200,
    expiresAt: new Date("2025-12-31"),
    usedCount: 0,
    maxUses: 100,
    active: true,
  },
]

export function validateCoupon(code: string, cartTotal: number): { valid: boolean; discount: number; message: string } {
  const coupon = activeCoupons.find((c) => c.code === code.toUpperCase())

  if (!coupon) {
    return { valid: false, discount: 0, message: "Invalid coupon code" }
  }

  if (!coupon.active) {
    return { valid: false, discount: 0, message: "This coupon is no longer active" }
  }

  if (new Date() > coupon.expiresAt) {
    return { valid: false, discount: 0, message: "This coupon has expired" }
  }

  if (coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discount: 0, message: "This coupon has reached its usage limit" }
  }

  if (cartTotal < coupon.minPurchase) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum purchase of $${coupon.minPurchase} required`,
    }
  }

  const discount = coupon.type === "percentage" ? (cartTotal * coupon.value) / 100 : coupon.value

  return {
    valid: true,
    discount,
    message: `Coupon applied! You saved $${discount.toFixed(2)}`,
  }
}

export function calculateRewardDiscount(points: number): number {
  // 100 points = $1
  return points / 100
}

export function calculateEarnedPoints(purchaseAmount: number): number {
  // Earn 1 point per dollar spent
  return Math.floor(purchaseAmount)
}
