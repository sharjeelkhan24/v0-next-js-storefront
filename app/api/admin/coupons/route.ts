/**
 * Admin Coupons API
 * 
 * CRUD operations for coupons
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as couponRepo from "@/lib/db/repositories/coupon-repo"
import { logger } from "@/lib/logger"
import { z } from "zod"

const log = logger.child({ module: "admin-coupons-api" })

// ============================================
// Validation Schemas
// ============================================

const CreateCouponSchema = z.object({
  code: z.string().min(3).max(20),
  type: z.enum(["percentage", "fixed", "freeShipping"]),
  value: z.number().positive(),
  minOrderAmount: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  usesPerUser: z.number().int().positive().default(1),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime(),
  applicableCategories: z.array(z.string()).optional(),
  applicableProducts: z.array(z.string()).optional(),
})

const UpdateCouponSchema = z.object({
  value: z.number().positive().optional(),
  minOrderAmount: z.number().positive().optional(),
  maxDiscount: z.number().positive().optional(),
  maxUses: z.number().int().positive().optional(),
  validFrom: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
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
// GET - List Coupons
// ============================================

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    
    // Single coupon request
    const couponId = searchParams.get("id")
    if (couponId) {
      const coupon = await couponRepo.getCouponById(couponId)
      if (!coupon) {
        return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, coupon })
    }

    // Validate coupon code
    const validateCode = searchParams.get("validate")
    if (validateCode) {
      const orderAmount = parseFloat(searchParams.get("amount") || "0")
      const result = await couponRepo.validateCoupon(
        validateCode,
        undefined,
        orderAmount
      )
      return NextResponse.json({ success: true, ...result })
    }

    // List coupons
    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      isActive: searchParams.get("active") === "true" ? true :
                searchParams.get("active") === "false" ? false : undefined,
    }

    const result = await couponRepo.getCoupons(options)
    const stats = await couponRepo.getCouponStats()

    return NextResponse.json({
      success: true,
      coupons: result.coupons,
      total: result.total,
      stats,
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to fetch coupons" },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create Coupon
// ============================================

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    
    const validation = CreateCouponSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid coupon data", details: validation.error.issues },
        { status: 400 }
      )
    }

    // Check if code already exists
    const existing = await couponRepo.getCouponByCode(validation.data.code)
    if (existing) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 409 }
      )
    }

    const coupon = await couponRepo.createCoupon({
      ...validation.data,
      validFrom: validation.data.validFrom 
        ? new Date(validation.data.validFrom) 
        : undefined,
      validUntil: new Date(validation.data.validUntil),
    })

    log.info("Coupon created", { 
      admin: auth.user.email, 
      code: coupon.code 
    })

    return NextResponse.json({ success: true, coupon }, { status: 201 })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to create coupon" },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH - Update Coupon
// ============================================

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const couponId = searchParams.get("id")
    
    if (!couponId) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    const validation = UpdateCouponSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid update data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const updates: any = { ...validation.data }
    if (updates.validFrom) updates.validFrom = new Date(updates.validFrom)
    if (updates.validUntil) updates.validUntil = new Date(updates.validUntil)

    const coupon = await couponRepo.updateCoupon(couponId, updates)
    
    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    log.info("Coupon updated", { 
      admin: auth.user.email, 
      couponId,
      updates: Object.keys(validation.data) 
    })

    return NextResponse.json({ success: true, coupon })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to update coupon" },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Delete Coupon
// ============================================

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const couponId = searchParams.get("id")
    const deactivate = searchParams.get("deactivate") === "true"
    
    if (!couponId) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      )
    }

    let success: boolean
    if (deactivate) {
      success = await couponRepo.deactivateCoupon(couponId)
    } else {
      success = await couponRepo.deleteCoupon(couponId)
    }
    
    if (!success) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    log.info("Coupon deleted/deactivated", { 
      admin: auth.user.email, 
      couponId,
      deactivate 
    })

    return NextResponse.json({ 
      success: true, 
      message: deactivate ? "Coupon deactivated" : "Coupon deleted" 
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to delete coupon" },
      { status: 500 }
    )
  }
}
