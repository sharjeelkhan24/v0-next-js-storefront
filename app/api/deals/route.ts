import { NextResponse } from "next"
import { getAllDeals, getActiveDeals, getAllDealCriteria } from "@/lib/deal-monitor"

/**
 * Deals API Route
 * GET /api/deals - Get all detected deals and criteria
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    console.log(`[v0] GET /api/deals - Fetching ${activeOnly ? "active" : "all"} deals`)

    const deals = activeOnly ? getActiveDeals() : getAllDeals()
    const criteria = getAllDealCriteria()

    return NextResponse.json({
      deals,
      criteria,
      count: deals.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error fetching deals:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch deals",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
