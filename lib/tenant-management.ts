import { generateText } from "ai"

/**
 * Tenant Management System
 * Handles multi-tenant architecture for white-label platform licensing
 */

export interface Tenant {
  id: string
  name: string
  slug: string // Subdomain or custom domain
  email: string
  plan: "starter" | "professional" | "enterprise"
  status: "active" | "trial" | "suspended" | "canceled"
  createdAt: Date
  trialEndsAt?: Date
  subscriptionId?: string
  customDomain?: string
  branding: TenantBranding
  usage: TenantUsage
  limits: TenantLimits
}

export interface TenantBranding {
  logo?: string
  primaryColor: string
  accentColor: string
  companyName: string
  customCSS?: string
}

export interface TenantUsage {
  productsListed: number
  ordersProcessed: number
  apiCalls: number
  storageUsed: number // in MB
  activeUsers: number
}

export interface TenantLimits {
  maxProducts: number
  maxOrders: number
  maxApiCalls: number
  maxStorage: number // in MB
  maxUsers: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  interval: "month" | "year"
  features: string[]
  limits: TenantLimits
  stripePriceId: string
}

// Subscription plans configuration
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 99,
    interval: "month",
    stripePriceId: "price_starter_monthly",
    features: [
      "Up to 100 products",
      "500 orders/month",
      "10,000 API calls/month",
      "5GB storage",
      "2 team members",
      "Email support",
      "Basic analytics",
    ],
    limits: {
      maxProducts: 100,
      maxOrders: 500,
      maxApiCalls: 10000,
      maxStorage: 5120, // 5GB in MB
      maxUsers: 2,
    },
  },
  {
    id: "professional",
    name: "Professional",
    price: 299,
    interval: "month",
    stripePriceId: "price_professional_monthly",
    features: [
      "Up to 1,000 products",
      "5,000 orders/month",
      "100,000 API calls/month",
      "50GB storage",
      "10 team members",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
      "API access",
    ],
    limits: {
      maxProducts: 1000,
      maxOrders: 5000,
      maxApiCalls: 100000,
      maxStorage: 51200, // 50GB in MB
      maxUsers: 10,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 999,
    interval: "month",
    stripePriceId: "price_enterprise_monthly",
    features: [
      "Unlimited products",
      "Unlimited orders",
      "Unlimited API calls",
      "500GB storage",
      "Unlimited team members",
      "24/7 dedicated support",
      "Custom analytics",
      "Full white-label",
      "Custom domain",
      "SLA guarantee",
      "Dedicated account manager",
    ],
    limits: {
      maxProducts: -1, // -1 = unlimited
      maxOrders: -1,
      maxApiCalls: -1,
      maxStorage: 512000, // 500GB in MB
      maxUsers: -1,
    },
  },
]

// Mock tenant data for demonstration
export const MOCK_TENANTS: Tenant[] = [
  {
    id: "tenant_1",
    name: "AutoDealer Pro",
    slug: "autodealer-pro",
    email: "admin@autodealer.com",
    plan: "professional",
    status: "active",
    createdAt: new Date("2024-01-15"),
    subscriptionId: "sub_autodealer123",
    customDomain: "autodealer.com",
    branding: {
      logo: "/auto-dealer-logo.jpg",
      primaryColor: "#2563eb",
      accentColor: "#f59e0b",
      companyName: "AutoDealer Pro",
    },
    usage: {
      productsListed: 450,
      ordersProcessed: 2340,
      apiCalls: 45600,
      storageUsed: 12800,
      activeUsers: 7,
    },
    limits: SUBSCRIPTION_PLANS[1].limits,
  },
  {
    id: "tenant_2",
    name: "Elite Realty",
    slug: "elite-realty",
    email: "contact@eliterealty.com",
    plan: "enterprise",
    status: "active",
    createdAt: new Date("2023-11-20"),
    subscriptionId: "sub_eliterealty456",
    customDomain: "eliterealty.com",
    branding: {
      logo: "/real-estate-logo.png",
      primaryColor: "#059669",
      accentColor: "#dc2626",
      companyName: "Elite Realty",
    },
    usage: {
      productsListed: 3200,
      ordersProcessed: 8900,
      apiCalls: 234000,
      storageUsed: 89600,
      activeUsers: 24,
    },
    limits: SUBSCRIPTION_PLANS[2].limits,
  },
  {
    id: "tenant_3",
    name: "TechGadgets Store",
    slug: "techgadgets",
    email: "hello@techgadgets.com",
    plan: "starter",
    status: "trial",
    createdAt: new Date("2025-01-10"),
    trialEndsAt: new Date("2025-02-10"),
    branding: {
      logo: "/tech-store-logo.png",
      primaryColor: "#7c3aed",
      accentColor: "#ec4899",
      companyName: "TechGadgets Store",
    },
    usage: {
      productsListed: 45,
      ordersProcessed: 120,
      apiCalls: 3400,
      storageUsed: 1200,
      activeUsers: 2,
    },
    limits: SUBSCRIPTION_PLANS[0].limits,
  },
]

/**
 * Get tenant by ID
 */
export function getTenantById(tenantId: string): Tenant | undefined {
  console.log(`[v0] Fetching tenant: ${tenantId}`)
  return MOCK_TENANTS.find((t) => t.id === tenantId)
}

/**
 * Get all tenants
 */
export function getAllTenants(): Tenant[] {
  console.log("[v0] Fetching all tenants")
  return MOCK_TENANTS
}

/**
 * Calculate usage percentage for a tenant
 */
export function calculateUsagePercentage(tenant: Tenant): {
  products: number
  orders: number
  apiCalls: number
  storage: number
  users: number
} {
  const limits = tenant.limits

  return {
    products: limits.maxProducts === -1 ? 0 : (tenant.usage.productsListed / limits.maxProducts) * 100,
    orders: limits.maxOrders === -1 ? 0 : (tenant.usage.ordersProcessed / limits.maxOrders) * 100,
    apiCalls: limits.maxApiCalls === -1 ? 0 : (tenant.usage.apiCalls / limits.maxApiCalls) * 100,
    storage: limits.maxStorage === -1 ? 0 : (tenant.usage.storageUsed / limits.maxStorage) * 100,
    users: limits.maxUsers === -1 ? 0 : (tenant.usage.activeUsers / limits.maxUsers) * 100,
  }
}

/**
 * Check if tenant is approaching limits
 */
export function checkLimitWarnings(tenant: Tenant): {
  hasWarnings: boolean
  warnings: string[]
} {
  const usage = calculateUsagePercentage(tenant)
  const warnings: string[] = []

  if (usage.products > 80) warnings.push("Product limit approaching (>80%)")
  if (usage.orders > 80) warnings.push("Order limit approaching (>80%)")
  if (usage.apiCalls > 80) warnings.push("API call limit approaching (>80%)")
  if (usage.storage > 80) warnings.push("Storage limit approaching (>80%)")
  if (usage.users > 80) warnings.push("User limit approaching (>80%)")

  return {
    hasWarnings: warnings.length > 0,
    warnings,
  }
}

/**
 * Generate revenue projection for a tenant
 */
export async function generateRevenueProjection(tenant: Tenant): Promise<string> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Analyze this SaaS tenant's usage and provide a brief revenue projection:
      
      Tenant: ${tenant.name}
      Plan: ${tenant.plan} ($${SUBSCRIPTION_PLANS.find((p) => p.id === tenant.plan)?.price}/month)
      Products Listed: ${tenant.usage.productsListed}
      Orders Processed: ${tenant.usage.ordersProcessed}
      API Calls: ${tenant.usage.apiCalls}
      Active Users: ${tenant.usage.activeUsers}
      
      Provide a 2-3 sentence projection about their growth trajectory and potential upgrade opportunities.`,
    })

    return text
  } catch (error) {
    console.error("[v0] Error generating revenue projection:", error)
    return "Unable to generate projection at this time."
  }
}
