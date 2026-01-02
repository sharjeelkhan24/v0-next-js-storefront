import { type NextRequest, NextResponse } from "next/server"
import { mockAuctionVehicles } from "@/lib/auction-scraper"
import { calculateArbitrageScore } from "@/lib/arbitrage-engine"
import { createBidStrategy, monitorAndBid } from "@/lib/auto-bidding"

/**
 * Automated Bidding API Route
 * POST /api/auctions/bid - Execute automated bidding for a vehicle
 */
export async function POST(request: NextRequest) {
  console.log("[v0] Automated bidding request received")

  try {
    const body = await request.json()
    const { vehicleId } = body

    if (!vehicleId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required field: vehicleId",
        },
        { status: 400 },
      )
    }

    // Find vehicle
    const vehicle = mockAuctionVehicles.find((v) => v.id === vehicleId)

    if (!vehicle) {
      return NextResponse.json(
        {
          success: false,
          error: "Vehicle not found",
        },
        { status: 404 },
      )
    }

    console.log(`[v0] Starting automated bidding for ${vehicle.year} ${vehicle.make} ${vehicle.model}`)

    // Analyze vehicle
    const analysis = await calculateArbitrageScore(vehicle)

    // Create bid strategy
    const strategy = createBidStrategy(vehicle, analysis)

    // Execute automated bidding
    const { bids, finalResult } = await monitorAndBid(vehicle, strategy)

    return NextResponse.json(
      {
        success: true,
        vehicle: {
          id: vehicle.id,
          year: vehicle.year,
          make: vehicle.make,
          model: vehicle.model,
        },
        analysis,
        strategy,
        bids,
        finalResult,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error executing automated bid:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to execute automated bidding",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
