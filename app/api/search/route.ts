import { type NextRequest, NextResponse } from "next/server"
import { searchAmazon, searchWalmart, searchEbay, isApiConfigured } from "@/lib/product-api"
import { searchGoogleShopping, isSerpApiConfigured, type GoogleShoppingProduct } from "@/lib/serpapi"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "unified-search" })

/**
 * GET /api/search
 * 
 * Unified search across ALL stores:
 * - Amazon, Walmart, eBay, Target (via RapidAPI)
 * - 100+ stores including Meijer, Kroger, etc. (via SerpAPI/Google Shopping)
 * 
 * Query params:
 * - q: Search query (required)
 * - store: Filter by store name (optional)
 * - source: "rapidapi" | "google" | "all" (default: "all")
 * - sort: "price_low" | "price_high" | "relevance" (default: "relevance")
 * - minPrice: Minimum price filter
 * - maxPrice: Maximum price filter
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const query = searchParams.get("q") || searchParams.get("query") || ""
  const store = searchParams.get("store") || undefined
  const source = searchParams.get("source") || "all"
  const sort = searchParams.get("sort") || "relevance"
  const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined
  const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined

  if (!query) {
    return NextResponse.json({
      success: false,
      error: "Search query is required",
      products: [],
    }, { status: 400 })
  }

  log.info("Unified search", { query, store, source })

  const allProducts: any[] = []
  const errors: string[] = []
  const sources: string[] = []

  try {
    // Search RapidAPI stores (Amazon, Walmart, eBay)
    if ((source === "all" || source === "rapidapi") && isApiConfigured()) {
      sources.push("RapidAPI")
      
      const [amazonResult, walmartResult, ebayResult] = await Promise.allSettled([
        searchAmazon(query, 1),
        searchWalmart(query, 1),
        searchEbay(query, 1),
      ])

      if (amazonResult.status === "fulfilled") {
        allProducts.push(...amazonResult.value.products.map(p => ({
          ...p,
          source: "rapidapi",
        })))
      }
      if (walmartResult.status === "fulfilled") {
        allProducts.push(...walmartResult.value.products.map(p => ({
          ...p,
          source: "rapidapi",
        })))
      }
      if (ebayResult.status === "fulfilled") {
        allProducts.push(...ebayResult.value.products.map(p => ({
          ...p,
          source: "rapidapi",
        })))
      }
    }

    // Search Google Shopping (100+ stores including Meijer)
    if ((source === "all" || source === "google") && isSerpApiConfigured()) {
      sources.push("Google Shopping")
      
      const googleResult = await searchGoogleShopping(query, {
        store,
        minPrice,
        maxPrice,
        sortBy: sort === "price_low" ? "price_low" : sort === "price_high" ? "price_high" : "relevance",
      })

      // Transform Google Shopping products to unified format
      const googleProducts = googleResult.products.map((p: GoogleShoppingProduct) => ({
        id: p.id,
        name: p.title,
        brand: extractBrand(p.title),
        description: p.title,
        image: p.thumbnail,
        images: [p.thumbnail],
        price: p.price,
        originalPrice: p.originalPrice,
        currency: p.currency,
        rating: p.rating || 0,
        reviewCount: p.reviews || 0,
        inStock: true,
        store: p.source,
        storeUrl: p.link,
        category: "General",
        features: p.badge ? [p.badge] : [],
        delivery: p.delivery,
        source: "google",
      }))

      allProducts.push(...googleProducts)
    }

    // Filter by store if specified
    let filteredProducts = allProducts
    if (store) {
      filteredProducts = allProducts.filter(p => 
        p.store.toLowerCase().includes(store.toLowerCase())
      )
    }

    // Filter by price
    if (minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= minPrice)
    }
    if (maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= maxPrice)
    }

    // Sort products
    if (sort === "price_low") {
      filteredProducts.sort((a, b) => a.price - b.price)
    } else if (sort === "price_high") {
      filteredProducts.sort((a, b) => b.price - a.price)
    }

    // Get unique stores for filtering
    const availableStores = [...new Set(allProducts.map(p => p.store))].sort()

    log.info("Search complete", {
      query,
      totalProducts: filteredProducts.length,
      sources,
      stores: availableStores.length,
    })

    return NextResponse.json({
      success: true,
      products: filteredProducts,
      totalResults: filteredProducts.length,
      query,
      sources,
      availableStores,
      filters: {
        store,
        minPrice,
        maxPrice,
        sort,
      },
      apiStatus: {
        rapidapi: isApiConfigured(),
        serpapi: isSerpApiConfigured(),
      },
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json({
      success: false,
      error: "Search failed",
      message: error instanceof Error ? error.message : "Unknown error",
      products: allProducts, // Return partial results
    }, { status: 500 })
  }
}

function extractBrand(title: string): string {
  const brands = [
    "Apple", "Samsung", "Sony", "LG", "Nike", "Adidas", "Dyson",
    "KitchenAid", "Ninja", "Instant Pot", "Keurig", "Cuisinart",
  ]
  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand
    }
  }
  return title.split(/[\s\-,]+/)[0] || "Unknown"
}
