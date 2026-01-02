import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { comparePrices, isApiConfigured } from "@/lib/product-api"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "price-compare-api" })

const CompareParamsSchema = z.object({
  query: z.string().min(1, "Query is required"),
  productName: z.string().optional(),
})

/**
 * GET /api/products/compare
 * Compare prices across Amazon, Walmart, eBay for a specific product
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params = CompareParamsSchema.safeParse({
      query: searchParams.get("query"),
      productName: searchParams.get("productName") || undefined,
    })

    if (!params.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: params.error.issues },
        { status: 400 }
      )
    }

    const { query } = params.data
    
    // Check API status
    if (!isApiConfigured()) {
      return NextResponse.json({
        error: "API_NOT_CONFIGURED",
        message: "Please configure RAPIDAPI_KEY in your environment variables",
        prices: [],
      }, { status: 503 })
    }

    log.info("Comparing prices", { query })

    const prices = await comparePrices(query)

    if (prices.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No prices found for this product",
        prices: [],
        query,
      })
    }

    // Calculate savings
    const lowestPrice = prices[0].price
    const highestPrice = prices[prices.length - 1]?.price || lowestPrice
    const potentialSavings = highestPrice - lowestPrice

    return NextResponse.json({
      success: true,
      prices,
      summary: {
        lowestPrice,
        highestPrice,
        potentialSavings,
        bestStore: prices[0].store,
        storesCompared: prices.length,
      },
      query,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      action: "compare-prices",
    })
    return NextResponse.json(
      { error: "Failed to compare prices", prices: [] },
      { status: 500 }
    )
  }
}
