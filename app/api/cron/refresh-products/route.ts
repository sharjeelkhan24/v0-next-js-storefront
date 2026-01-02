import { NextResponse } from "next"

/**
 * Cron Job Route - Refresh Products
 * POST /api/cron/refresh-products
 * Called by Vercel Cron Job every 6 hours to refresh product data
 * Built with Next.js 16, TypeScript, and proper error handling
 */
export async function GET(request: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error("[v0] Unauthorized cron job attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[v0] Cron job triggered - Refreshing product data")

    // Call the products API to refresh data
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/products`, {
      method: "POST",
    })

    if (!response.ok) {
      throw new Error("Failed to refresh products")
    }

    const data = await response.json()
    console.log("[v0] Product data refreshed successfully:", data)

    return NextResponse.json({
      success: true,
      message: "Product data refreshed by cron job",
      data,
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
