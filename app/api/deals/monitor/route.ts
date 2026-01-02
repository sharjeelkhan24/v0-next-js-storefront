import { NextResponse } from "next"
import { trackPrice, matchesDealCriteria, addDetectedDeal, getAveragePrice, type Deal } from "@/lib/deal-monitor"

/**
 * Deal Monitor API Route
 * POST /api/deals/monitor - Analyze products and detect deals
 * Production-ready with proper error handling and logging
 */

interface MonitorRequest {
  products: Array<{
    id: string
    name: string
    price: number
    category: string
    image: string
    source: string
  }>
}

interface MonitorResponse {
  dealsDetected: number
  deals: Deal[]
  pricesTracked: number
}

export async function POST(request: Request) {
  try {
    console.log("[v0] POST /api/deals/monitor - Starting deal monitoring")

    const body: MonitorRequest = await request.json()
    const { products } = body

    if (!products || !Array.isArray(products)) {
      return NextResponse.json({ error: "Invalid products array" }, { status: 400 })
    }

    const detectedDeals: Deal[] = []
    let pricesTracked = 0

    // Analyze each product
    for (const product of products) {
      // Track price history
      trackPrice(product.id, product.price, product.source)
      pricesTracked++

      // Check if it matches any deal criteria
      const matchedCriteria = matchesDealCriteria(product)

      if (matchedCriteria) {
        const avgPrice = getAveragePrice(product.id)
        const originalPrice = avgPrice > 0 ? avgPrice : product.price * 1.25 // Estimate if no history
        const discountPercent = ((originalPrice - product.price) / originalPrice) * 100
        const savings = originalPrice - product.price

        const deal = addDetectedDeal({
          productId: product.id,
          productName: product.name,
          currentPrice: product.price,
          originalPrice,
          discountPercent,
          savings,
          image: product.image,
          category: product.category,
          source: product.source,
          detectedAt: new Date(),
          autoCheckoutEligible: matchedCriteria.autoCheckout,
          status: "active",
        })

        detectedDeals.push(deal)
        console.log(`[v0] Deal detected: ${product.name} - ${discountPercent.toFixed(1)}% off`)
      }
    }

    const response: MonitorResponse = {
      dealsDetected: detectedDeals.length,
      deals: detectedDeals,
      pricesTracked,
    }

    console.log(`[v0] Monitoring complete: ${detectedDeals.length} deals detected, ${pricesTracked} prices tracked`)

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Error monitoring deals:", error)
    return NextResponse.json(
      {
        error: "Failed to monitor deals",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
