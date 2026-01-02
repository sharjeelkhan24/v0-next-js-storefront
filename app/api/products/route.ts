import { type NextRequest, NextResponse } from "next/server"
import {
  searchAllStores,
  searchAmazon,
  searchWalmart,
  searchEbay,
  getAmazonDeals,
  getAmazonBestsellers,
  getFeaturedProducts,
  isApiConfigured,
} from "@/lib/product-api"
import { 
  searchGoogleShopping, 
  getGoogleShoppingDeals,
  isSerpApiConfigured,
} from "@/lib/serpapi"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "products-route" })

export const dynamic = "force-dynamic"
export const revalidate = 300 // 5 minutes

/**
 * GET /api/products
 * 
 * Query Parameters:
 * - type: "search" | "deals" | "bestsellers" | "featured" | "all" (default: "featured")
 * - query: Search query (required for type=search)
 * - page: Page number (default: 1)
 * - store: "amazon" | "walmart" | "ebay" | "google" | "all" (default: "all")
 * - category: Category filter
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const type = searchParams.get("type") || "featured"
  const query = searchParams.get("query") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const store = searchParams.get("store") || "all"
  const category = searchParams.get("category") || undefined

  // Check API configuration
  const rapidApiConfigured = isApiConfigured()
  const serpApiConfigured = isSerpApiConfigured()

  if (!rapidApiConfigured && !serpApiConfigured) {
    log.warn("No APIs configured")
    return NextResponse.json({
      success: false,
      error: "API_NOT_CONFIGURED",
      message: "Please configure RAPIDAPI_KEY or SERPAPI_KEY to fetch real products.",
      setupGuide: {
        step1: "RapidAPI: Go to https://rapidapi.com and subscribe to store APIs",
        step2: "SerpAPI: Go to https://serpapi.com for Google Shopping access",
        step3: "Add keys to .env.local: RAPIDAPI_KEY=xxx and/or SERPAPI_KEY=xxx",
        step4: "Restart the development server",
      },
      products: [],
      apiStatus: { rapidapi: false, serpapi: false },
    }, { status: 503 })
  }

  try {
    log.info("Products API request", { type, query, page, store })

    let result: any

    switch (type) {
      case "search":
        if (!query) {
          return NextResponse.json({
            success: false,
            error: "MISSING_QUERY",
            message: "Search query is required",
          }, { status: 400 })
        }

        // Combine results from both APIs
        const searchResults: any[] = []

        if (rapidApiConfigured && (store === "all" || ["amazon", "walmart", "ebay"].includes(store))) {
          if (store === "amazon" || store === "all") {
            const amazonResult = await searchAmazon(query, page, category)
            searchResults.push(...amazonResult.products)
          }
          if (store === "walmart" || store === "all") {
            try {
              const walmartResult = await searchWalmart(query, page)
              searchResults.push(...walmartResult.products)
            } catch (e) { /* Walmart API not subscribed */ }
          }
          if (store === "ebay" || store === "all") {
            try {
              const ebayResult = await searchEbay(query, page)
              searchResults.push(...ebayResult.products)
            } catch (e) { /* eBay API not subscribed */ }
          }
        }

        if (serpApiConfigured && (store === "all" || store === "google")) {
          const googleResult = await searchGoogleShopping(query)
          const googleProducts = googleResult.products.map(p => ({
            id: p.id,
            name: p.title,
            brand: p.source,
            description: p.title,
            image: p.thumbnail,
            images: [p.thumbnail],
            price: p.price,
            originalPrice: p.originalPrice,
            currency: "USD",
            rating: p.rating || 0,
            reviewCount: p.reviews || 0,
            inStock: true,
            store: p.source,
            storeUrl: p.link,
            category: "General",
            features: p.badge ? [p.badge] : [],
          }))
          searchResults.push(...googleProducts)
        }

        // Sort by price
        searchResults.sort((a, b) => a.price - b.price)

        result = {
          products: searchResults,
          totalResults: searchResults.length,
          source: "Multi-Store Search",
        }
        break

      case "deals":
        const allDeals: any[] = []
        
        if (rapidApiConfigured) {
          const amazonDeals = await getAmazonDeals()
          allDeals.push(...amazonDeals)
        }
        
        if (serpApiConfigured) {
          const googleDeals = await getGoogleShoppingDeals(category)
          const formattedGoogleDeals = googleDeals.map(p => ({
            id: p.id,
            name: p.title,
            brand: p.source,
            description: p.title,
            image: p.thumbnail,
            images: [p.thumbnail],
            price: p.price,
            originalPrice: p.originalPrice || p.price * 1.3,
            currency: "USD",
            rating: p.rating || 4.0,
            reviewCount: p.reviews || 0,
            inStock: true,
            store: p.source,
            storeUrl: p.link,
            category: "Deals",
            features: p.badge ? [p.badge, "Deal"] : ["Deal"],
          }))
          allDeals.push(...formattedGoogleDeals)
        }

        result = {
          products: allDeals,
          totalResults: allDeals.length,
          source: "All Deals",
        }
        break

      case "bestsellers":
        const bestsellers = rapidApiConfigured 
          ? await getAmazonBestsellers(category)
          : []
        result = {
          products: bestsellers,
          totalResults: bestsellers.length,
          source: "Amazon Bestsellers",
        }
        break

      case "featured":
      default:
        const allFeatured: any[] = []
        let deals: any[] = []
        let bestsellers2: any[] = []

        if (rapidApiConfigured) {
          const featured = await getFeaturedProducts()
          deals = featured.deals
          bestsellers2 = featured.bestsellers
          allFeatured.push(...featured.deals, ...featured.bestsellers)
        }

        if (serpApiConfigured) {
          const googleDeals = await getGoogleShoppingDeals()
          const formattedDeals = googleDeals.slice(0, 10).map(p => ({
            id: p.id,
            name: p.title,
            brand: p.source,
            description: p.title,
            image: p.thumbnail,
            images: [p.thumbnail],
            price: p.price,
            originalPrice: p.originalPrice,
            currency: "USD",
            rating: p.rating || 4.0,
            reviewCount: p.reviews || 0,
            inStock: true,
            store: p.source,
            storeUrl: p.link,
            category: "Deals",
            features: p.badge ? [p.badge] : [],
          }))
          allFeatured.push(...formattedDeals)
        }

        result = {
          products: allFeatured,
          deals,
          bestsellers: bestsellers2,
          totalResults: allFeatured.length,
          source: "Featured Products",
        }
        break
    }

    log.info("Products fetched successfully", { 
      count: result.products?.length || 0,
      source: result.source,
    })

    return NextResponse.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString(),
      apiStatus: {
        rapidapi: rapidApiConfigured,
        serpapi: serpApiConfigured,
      },
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    log.exception(error instanceof Error ? error : new Error(message))

    return NextResponse.json({
      success: false,
      error: "FETCH_ERROR",
      message: "Failed to fetch products. Please try again.",
      details: message,
      products: [],
    }, { status: 500 })
  }
}
