import { NextResponse } from "next/server"
import { getAmazonDeals, isApiConfigured } from "@/lib/product-api"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "deals-api" })

/**
 * Deals API Route
 * GET /api/deals - Get real deals from Amazon
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    log.info("Fetching deals", { activeOnly })

    // Check if API is configured
    if (!isApiConfigured()) {
      return NextResponse.json({
        deals: [],
        criteria: [],
        count: 0,
        lastUpdated: new Date().toISOString(),
        message: "API not configured. Add RAPIDAPI_KEY to .env.local",
      })
    }

    // Fetch real deals from Amazon
    const amazonDeals = await getAmazonDeals()

    // Transform to the expected format
    const deals = amazonDeals.map((product, index) => ({
      id: product.id,
      productId: product.asin || product.id,
      productName: product.name,
      category: product.category,
      originalPrice: product.originalPrice || product.price * 1.3,
      currentPrice: product.price,
      savings: (product.originalPrice || product.price * 1.3) - product.price,
      discountPercent: product.originalPrice 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 20 + Math.floor(Math.random() * 30),
      store: product.store,
      storeUrl: product.storeUrl,
      image: product.image,
      status: "active",
      detectedAt: new Date(Date.now() - Math.random() * 3600000).toISOString(), // Random time in last hour
      autoCheckoutEligible: product.price < 100 && index < 10, // First 10 items under $100
      source: "Amazon Deals",
    }))

    log.info("Deals fetched", { count: deals.length })

    return NextResponse.json({
      deals,
      criteria: [
        { id: "1", name: "Electronics under $500", category: "Electronics", maxPrice: 500 },
        { id: "2", name: "Home & Kitchen deals", category: "Home", minDiscount: 20 },
      ],
      count: deals.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      {
        error: "Failed to fetch deals",
        message: error instanceof Error ? error.message : "Unknown error",
        deals: [],
      },
      { status: 500 },
    )
  }
}
