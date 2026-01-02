import { NextResponse } from "next"
import { initializeDefaultCriteria } from "@/lib/deal-monitor"

/**
 * Cron Job: Monitor Deals
 * Runs every hour to check for new deals
 * Called by Vercel Cron
 */

export async function GET(request: Request) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.log("[v0] Unauthorized cron request")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Cron job: Starting deal monitoring")

    // Initialize default criteria if needed
    initializeDefaultCriteria()

    // Fetch products from various sources
    const [productsRes, amazonRes] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/products`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/amazon/bestsellers`),
    ])

    const productsData = await productsRes.json()
    const amazonData = await amazonRes.json()

    // Combine all products
    const allProducts = [
      ...productsData.products.map((p: any) => ({ ...p, source: "IrishTripplets" })),
      ...amazonData.products.map((p: any) => ({ ...p, source: "Amazon" })),
    ]

    // Monitor for deals
    const monitorRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/deals/monitor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products: allProducts }),
    })

    const monitorData = await monitorRes.json()

    console.log(`[v0] Cron job complete: ${monitorData.dealsDetected} deals detected`)

    return NextResponse.json({
      success: true,
      dealsDetected: monitorData.dealsDetected,
      pricesTracked: monitorData.pricesTracked,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return NextResponse.json(
      {
        error: "Cron job failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
