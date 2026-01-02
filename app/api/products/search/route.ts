import { type NextRequest, NextResponse } from "next/server"
import { searchAllStores, searchAmazon, isApiConfigured } from "@/lib/product-api"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "product-search" })

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q") || searchParams.get("query") || ""
  const store = searchParams.get("store") || "all"
  const page = parseInt(searchParams.get("page") || "1")

  if (!query) {
    return NextResponse.json({
      success: false,
      error: "Query parameter required",
      products: [],
    }, { status: 400 })
  }

  try {
    log.info("Searching products", { query, store, page })

    // Check API configuration
    if (!isApiConfigured()) {
      return NextResponse.json({
        success: false,
        error: "API not configured",
        message: "Add RAPIDAPI_KEY to .env.local to enable product search",
        products: [],
      }, { status: 503 })
    }

    // Search based on store selection
    let result
    if (store === "amazon") {
      result = await searchAmazon(query, page)
    } else {
      result = await searchAllStores(query, page)
    }

    log.info("Search completed", { count: result.products.length })

    return NextResponse.json({
      success: true,
      products: result.products,
      count: result.products.length,
      totalResults: result.totalResults,
      page: result.page,
      hasMore: result.hasMore,
      source: result.source,
    })
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({ 
      success: false, 
      error: "Search failed",
      message: error instanceof Error ? error.message : "Unknown error",
      products: [],
    }, { status: 500 })
  }
}
