import { type NextRequest, NextResponse } from "next/server"
import { calculateCommission } from "@/lib/commission-calculator"

/**
 * API route for commission calculation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { salePrice, commissionRate = 3, agentSplit = 70 } = body

    console.log("[v0] Calculating commission:", { salePrice, commissionRate, agentSplit })

    if (!salePrice || salePrice <= 0) {
      return NextResponse.json({ success: false, error: "Valid sale price is required" }, { status: 400 })
    }

    const commission = calculateCommission(salePrice, commissionRate, agentSplit)

    return NextResponse.json({
      success: true,
      data: commission,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[v0] Error calculating commission:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to calculate commission",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}
