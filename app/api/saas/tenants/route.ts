import { type NextRequest, NextResponse } from "next/server"
import { getAllTenants, getTenantById, type Tenant } from "@/lib/tenant-management"

/**
 * GET /api/saas/tenants
 * Retrieve all tenants or a specific tenant by ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get("id")

    console.log("[v0] Fetching tenants", tenantId ? `(ID: ${tenantId})` : "(all)")

    if (tenantId) {
      const tenant = getTenantById(tenantId)
      if (!tenant) {
        return NextResponse.json({ error: "Tenant not found" }, { status: 404 })
      }
      return NextResponse.json({ tenant })
    }

    const tenants = getAllTenants()
    return NextResponse.json({ tenants, count: tenants.length })
  } catch (error: any) {
    console.error("[v0] Error fetching tenants:", error.message)
    return NextResponse.json({ error: "Failed to fetch tenants" }, { status: 500 })
  }
}

/**
 * POST /api/saas/tenants
 * Create a new tenant (white-label customer)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, plan, customDomain, branding } = body

    // Validate required fields
    if (!name || !email || !plan) {
      return NextResponse.json({ error: "Name, email, and plan are required" }, { status: 400 })
    }

    console.log("[v0] Creating new tenant:", name)

    // In production, this would create a tenant in the database
    // For now, return a mock response
    const newTenant: Partial<Tenant> = {
      id: `tenant_${Date.now()}`,
      name,
      email,
      plan,
      status: "trial",
      createdAt: new Date(),
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      customDomain,
      branding: branding || {
        primaryColor: "#2563eb",
        accentColor: "#f59e0b",
        companyName: name,
      },
      usage: {
        productsListed: 0,
        ordersProcessed: 0,
        apiCalls: 0,
        storageUsed: 0,
        activeUsers: 1,
      },
    }

    console.log("[v0] Tenant created successfully:", newTenant.id)

    return NextResponse.json({ tenant: newTenant, message: "Tenant created successfully" })
  } catch (error: any) {
    console.error("[v0] Error creating tenant:", error.message)
    return NextResponse.json({ error: "Failed to create tenant" }, { status: 500 })
  }
}
