import { type NextRequest, NextResponse } from "next/server"
import { scrapeAllAuctions } from "@/lib/auction-scraper"
import { analyzeVehicleBatch } from "@/lib/arbitrage-engine"

/**
 * Auction Analysis API Route
 * GET /api/auctions/analyze - Analyze all auction vehicles with AI arbitrage engine
 */
export async function GET(request: NextRequest) {
  console.log("[v0] Auction analysis request received")

  try {
    // Scrape all auction data
    const vehicles = await scrapeAllAuctions()

    // Analyze with AI arbitrage engine
    const analyses = await analyzeVehicleBatch(vehicles)

    // Combine vehicle data with analysis
    const analyzedVehicles = vehicles.map((vehicle) => {
      const analysis = analyses.find((a) => a.vehicleId === vehicle.id)
      return {
        ...vehicle,
        arbitrageScore: analysis?.arbitrageScore,
        profitPotential: analysis?.profitPotential,
        repairCostEstimate: analysis?.repairCostEstimate,
        marketDemandScore: analysis?.marketDemandScore,
        analysis,
      }
    })

    // Sort by arbitrage score
    analyzedVehicles.sort((a, b) => (b.arbitrageScore || 0) - (a.arbitrageScore || 0))

    return NextResponse.json(
      {
        success: true,
        count: analyzedVehicles.length,
        vehicles: analyzedVehicles,
        topOpportunities: analyzedVehicles.slice(0, 5),
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error analyzing auctions:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze auction data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
