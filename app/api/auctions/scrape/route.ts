import { type NextRequest, NextResponse } from "next/server"
import { scrapeAllAuctions, scrapeAuction, type AuctionSource } from "@/lib/auction-scraper"

/**
 * Auction Scraping API Route
 * GET /api/auctions/scrape - Scrape auction data from Copart, IAA, and Manheim
 */
export async function GET(request: NextRequest) {
  console.log("[v0] Auction scraping request received")

  try {
    const searchParams = request.nextUrl.searchParams
    const source = searchParams.get("source") as AuctionSource | null

    let vehicles

    if (source) {
      console.log(`[v0] Scraping specific source: ${source}`)
      vehicles = await scrapeAuction(source)
    } else {
      console.log("[v0] Scraping all auction sources")
      vehicles = await scrapeAllAuctions()
    }

    return NextResponse.json(
      {
        success: true,
        count: vehicles.length,
        source: source || "all",
        vehicles,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error scraping auctions:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to scrape auction data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
