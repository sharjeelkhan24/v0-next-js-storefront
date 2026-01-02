import { type NextRequest, NextResponse } from "next/server"
import { findBestMatches } from "@/lib/lead-matching"
import { mockProperty } from "@/lib/property-data"

/**
 * API route for AI-powered lead matching
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { buyer, properties } = body

    console.log("[v0] Lead matching request:", { buyerId: buyer?.id, propertyCount: properties?.length })

    if (!buyer) {
      return NextResponse.json({ success: false, error: "Buyer profile is required" }, { status: 400 })
    }

    // If specific properties provided, match against those
    // Otherwise use mock property for demo
    const propertiesToMatch = properties && properties.length > 0 ? properties : [mockProperty]

    const matches = await findBestMatches(buyer, propertiesToMatch)

    console.log("[v0] Found matches:", matches.length)

    return NextResponse.json({
      success: true,
      data: matches,
      count: matches.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error in lead matching:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to match leads",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
