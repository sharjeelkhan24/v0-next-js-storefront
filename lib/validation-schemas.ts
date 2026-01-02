/**
 * Zod Validation Schemas for API Routes
 * Centralized validation schemas for all API endpoints
 */

import { z } from "zod"

// ============================================
// Common Schemas
// ============================================

export const EmailSchema = z.string().email("Invalid email address")

export const PhoneSchema = z.string().regex(
  /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  "Invalid phone number"
).optional()

export const USStateSchema = z.string().length(2, "State must be 2 characters").toUpperCase()

export const ZipCodeSchema = z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code")

export const MoneySchema = z.number().positive("Amount must be positive").multipleOf(0.01)

export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

// ============================================
// Dealer License Schemas
// ============================================

export const DealerLicenseRequestSchema = z.object({
  licenseNumber: z
    .string()
    .min(6, "License number too short")
    .max(12, "License number too long")
    .regex(/^[A-Z0-9]+$/, "License number must contain only uppercase letters and numbers"),
  state: USStateSchema,
  dealerName: z
    .string()
    .min(2, "Dealer name too short")
    .max(100, "Dealer name too long")
    .trim(),
  email: EmailSchema.optional(),
})

export type DealerLicenseRequest = z.infer<typeof DealerLicenseRequestSchema>

// ============================================
// Stripe/Checkout Schemas
// ============================================

export const CartItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  price: MoneySchema,
  quantity: z.number().int().positive().max(99),
  image: z.string().url().optional(),
})

export const CustomerInfoSchema = z.object({
  email: EmailSchema,
  name: z.string().min(1).max(100).optional(),
  phone: PhoneSchema,
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  zip: ZipCodeSchema.optional(),
})

export const CheckoutRequestSchema = z.object({
  items: z.array(CartItemSchema).min(1, "Cart cannot be empty"),
  customerInfo: CustomerInfoSchema,
})

export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>

// ============================================
// Product Schemas
// ============================================

export const ProductSearchSchema = z.object({
  query: z.string().max(200).optional(),
  category: z.string().max(50).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  store: z.string().max(50).optional(),
  sortBy: z.enum(["price", "rating", "name", "newest"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
}).merge(PaginationSchema)

export type ProductSearchParams = z.infer<typeof ProductSearchSchema>

// ============================================
// Order Schemas
// ============================================

export const OrderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
])

export const CreateOrderSchema = z.object({
  items: z.array(CartItemSchema).min(1),
  customerInfo: CustomerInfoSchema,
  shippingAddress: z.object({
    line1: z.string().min(1).max(200),
    line2: z.string().max(200).optional(),
    city: z.string().min(1).max(100),
    state: USStateSchema,
    zip: ZipCodeSchema,
    country: z.string().length(2).default("US"),
  }),
  paymentIntentId: z.string().optional(),
})

export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>

// ============================================
// Auction Schemas
// ============================================

export const BidRequestSchema = z.object({
  auctionId: z.string().min(1),
  vehicleId: z.string().min(1),
  amount: MoneySchema.refine((val) => val >= 100, "Minimum bid is $100"),
  maxAutoBid: MoneySchema.optional(),
  userId: z.string().min(1),
})

export type BidRequest = z.infer<typeof BidRequestSchema>

export const AuctionAnalyzeSchema = z.object({
  vehicleId: z.string().min(1),
  make: z.string().min(1).max(50),
  model: z.string().min(1).max(50),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  mileage: z.number().int().nonnegative(),
  currentBid: MoneySchema,
})

export type AuctionAnalyzeRequest = z.infer<typeof AuctionAnalyzeSchema>

// ============================================
// SaaS/Tenant Schemas
// ============================================

export const CreateTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  email: EmailSchema,
  plan: z.enum(["free", "starter", "pro", "enterprise"]),
})

export type CreateTenantRequest = z.infer<typeof CreateTenantSchema>

export const SubscriptionSchema = z.object({
  tenantId: z.string().min(1),
  plan: z.enum(["free", "starter", "pro", "enterprise"]),
  billingCycle: z.enum(["monthly", "yearly"]),
})

export type SubscriptionRequest = z.infer<typeof SubscriptionSchema>

// ============================================
// Commission Schemas
// ============================================

export const CommissionCalculateSchema = z.object({
  salePrice: MoneySchema,
  productCategory: z.string().min(1).max(50),
  sellerTier: z.enum(["standard", "premium", "enterprise"]).optional(),
  promoCode: z.string().max(20).optional(),
})

export type CommissionCalculateRequest = z.infer<typeof CommissionCalculateSchema>

// ============================================
// Lead Matching Schemas
// ============================================

export const LeadMatchSchema = z.object({
  leadId: z.string().min(1).optional(),
  criteria: z.object({
    propertyType: z.enum(["house", "condo", "apartment", "land", "commercial"]).optional(),
    minPrice: MoneySchema.optional(),
    maxPrice: MoneySchema.optional(),
    minBedrooms: z.number().int().nonnegative().max(20).optional(),
    maxBedrooms: z.number().int().nonnegative().max(20).optional(),
    location: z.string().max(100).optional(),
    radius: z.number().positive().max(100).optional(), // miles
  }),
})

export type LeadMatchRequest = z.infer<typeof LeadMatchSchema>

// ============================================
// Voice/Transcribe Schemas
// ============================================

export const TranscribeResponseSchema = z.object({
  text: z.string(),
  confidence: z.number().min(0).max(1).optional(),
  language: z.string().optional(),
})

// ============================================
// Validation Helper
// ============================================

/**
 * Validate request body with a Zod schema
 * Returns { success: true, data } or { success: false, error }
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, error: result.error }
}

/**
 * Format Zod errors for API response
 */
export function formatZodError(error: z.ZodError): { message: string; errors: Record<string, string[]> } {
  const errors: Record<string, string[]> = {}
  
  for (const issue of error.issues) {
    const path = issue.path.join(".") || "root"
    if (!errors[path]) {
      errors[path] = []
    }
    errors[path].push(issue.message)
  }

  return {
    message: "Validation failed",
    errors,
  }
}
