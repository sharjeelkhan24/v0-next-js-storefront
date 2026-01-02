/**
 * Coupon Repository
 * 
 * CRUD operations for coupons/promo codes
 */

import { collections, generateId } from "../client"
import type { Coupon } from "../schema"
import { logger } from "../../logger"

const log = logger.child({ module: "coupon-repo" })

// ============================================
// Create
// ============================================

export async function createCoupon(data: {
  code: string
  type: "percentage" | "fixed" | "freeShipping"
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  maxUses?: number
  usesPerUser?: number
  validFrom?: Date
  validUntil: Date
  applicableCategories?: string[]
  applicableProducts?: string[]
  excludedProducts?: string[]
}): Promise<Coupon> {
  const col = await collections.coupons()
  
  const now = new Date()
  const coupon: Coupon = {
    id: generateId(),
    code: data.code.toUpperCase(),
    type: data.type,
    value: data.value,
    minOrderAmount: data.minOrderAmount,
    maxDiscount: data.maxDiscount,
    maxUses: data.maxUses,
    usesPerUser: data.usesPerUser || 1,
    validFrom: data.validFrom || now,
    validUntil: data.validUntil,
    isActive: true,
    applicableProducts: data.applicableProducts,
    applicableCategories: data.applicableCategories,
    excludedProducts: data.excludedProducts,
    usedCount: 0,
    usedBy: [],
    createdAt: now,
    updatedAt: now,
  }

  await col.insertOne(coupon as any)
  log.info("Coupon created", { code: coupon.code, type: coupon.type })
  
  return coupon
}

// ============================================
// Read
// ============================================

export async function getCouponById(id: string): Promise<Coupon | null> {
  const col = await collections.coupons()
  return col.findOne({ id }) as Promise<Coupon | null>
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  const col = await collections.coupons()
  return col.findOne({ code: code.toUpperCase() }) as Promise<Coupon | null>
}

export async function getCoupons(options?: {
  page?: number
  limit?: number
  isActive?: boolean
}): Promise<{ coupons: Coupon[]; total: number }> {
  const col = await collections.coupons()
  
  const page = options?.page || 1
  const limit = options?.limit || 20
  const skip = (page - 1) * limit

  const filter: any = {}
  if (options?.isActive !== undefined) {
    filter.isActive = options.isActive
  }

  const [coupons, total] = await Promise.all([
    col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    col.countDocuments(filter),
  ])

  return { coupons: coupons as Coupon[], total }
}

// ============================================
// Validate Coupon
// ============================================

export async function validateCoupon(
  code: string,
  userId?: string,
  orderAmount?: number,
  productIds?: string[],
  categories?: string[]
): Promise<{
  valid: boolean
  coupon?: Coupon
  discount?: number
  error?: string
}> {
  const coupon = await getCouponByCode(code)

  if (!coupon) {
    return { valid: false, error: "Coupon not found" }
  }

  if (!coupon.isActive) {
    return { valid: false, error: "Coupon is no longer active" }
  }

  const now = new Date()
  if (now < coupon.validFrom) {
    return { valid: false, error: "Coupon is not yet valid" }
  }

  if (now > coupon.validUntil) {
    return { valid: false, error: "Coupon has expired" }
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, error: "Coupon usage limit reached" }
  }

  if (userId && coupon.usesPerUser) {
    const userUses = coupon.usedBy.filter(id => id === userId).length
    if (userUses >= coupon.usesPerUser) {
      return { valid: false, error: "You have already used this coupon" }
    }
  }

  if (coupon.minOrderAmount && orderAmount && orderAmount < coupon.minOrderAmount) {
    return { 
      valid: false, 
      error: `Minimum order amount is $${coupon.minOrderAmount.toFixed(2)}` 
    }
  }

  // Check product restrictions
  if (coupon.applicableProducts?.length && productIds) {
    const hasApplicable = productIds.some(id => 
      coupon.applicableProducts!.includes(id)
    )
    if (!hasApplicable) {
      return { valid: false, error: "Coupon not applicable to these products" }
    }
  }

  if (coupon.excludedProducts?.length && productIds) {
    const allExcluded = productIds.every(id => 
      coupon.excludedProducts!.includes(id)
    )
    if (allExcluded) {
      return { valid: false, error: "Coupon not applicable to these products" }
    }
  }

  // Check category restrictions
  if (coupon.applicableCategories?.length && categories) {
    const hasApplicable = categories.some(cat => 
      coupon.applicableCategories!.includes(cat)
    )
    if (!hasApplicable) {
      return { valid: false, error: "Coupon not applicable to these categories" }
    }
  }

  // Calculate discount
  let discount = 0
  if (orderAmount) {
    switch (coupon.type) {
      case "percentage":
        discount = orderAmount * (coupon.value / 100)
        break
      case "fixed":
        discount = coupon.value
        break
      case "freeShipping":
        discount = 5.99  // Standard shipping cost
        break
    }

    // Apply max discount cap
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }

    // Don't exceed order amount
    if (discount > orderAmount) {
      discount = orderAmount
    }
  }

  return {
    valid: true,
    coupon,
    discount: Math.round(discount * 100) / 100,
  }
}

// ============================================
// Use Coupon
// ============================================

export async function useCoupon(
  code: string,
  userId: string
): Promise<boolean> {
  const col = await collections.coupons()
  
  const result = await col.updateOne(
    { code: code.toUpperCase() },
    {
      $inc: { usedCount: 1 },
      $push: { usedBy: userId },
      $set: { updatedAt: new Date() },
    }
  )

  if (result.modifiedCount > 0) {
    log.info("Coupon used", { code, userId })
    return true
  }
  
  return false
}

// ============================================
// Update
// ============================================

export async function updateCoupon(
  id: string,
  updates: Partial<Pick<Coupon, 
    "value" | "minOrderAmount" | "maxDiscount" | "maxUses" | 
    "validFrom" | "validUntil" | "isActive"
  >>
): Promise<Coupon | null> {
  const col = await collections.coupons()
  
  const result = await col.findOneAndUpdate(
    { id },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" }
  )

  if (result) {
    log.info("Coupon updated", { id, updates: Object.keys(updates) })
  }
  
  return result as Coupon | null
}

export async function deactivateCoupon(id: string): Promise<boolean> {
  const col = await collections.coupons()
  
  const result = await col.updateOne(
    { id },
    { $set: { isActive: false, updatedAt: new Date() } }
  )

  if (result.modifiedCount > 0) {
    log.info("Coupon deactivated", { id })
    return true
  }
  
  return false
}

// ============================================
// Delete
// ============================================

export async function deleteCoupon(id: string): Promise<boolean> {
  const col = await collections.coupons()
  
  const result = await col.deleteOne({ id })
  
  if (result.deletedCount > 0) {
    log.info("Coupon deleted", { id })
    return true
  }
  
  return false
}

// ============================================
// Stats
// ============================================

export async function getCouponStats(): Promise<{
  total: number
  active: number
  expired: number
  totalUsage: number
}> {
  const col = await collections.coupons()
  const now = new Date()

  const [total, active, usageAgg] = await Promise.all([
    col.countDocuments({}),
    col.countDocuments({ isActive: true, validUntil: { $gte: now } }),
    col.aggregate([
      { $group: { _id: null, totalUsage: { $sum: "$usedCount" } } },
    ]).toArray(),
  ])

  const expired = await col.countDocuments({ 
    $or: [
      { isActive: false },
      { validUntil: { $lt: now } },
    ],
  })

  return {
    total,
    active,
    expired,
    totalUsage: usageAgg[0]?.totalUsage || 0,
  }
}
