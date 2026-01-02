/**
 * SerpAPI Integration - Google Shopping
 * 
 * Provides access to 100+ stores including:
 * - Meijer, Publix, HEB, Aldi, Trader Joe's
 * - Nordstrom, Macy's, Kohl's, JCPenney
 * - PetSmart, Petco, Chewy
 * - Office Depot, Staples
 * - GameStop, Dick's Sporting Goods
 * - And many more regional/specialty stores!
 * 
 * API Docs: https://serpapi.com/google-shopping-api
 */

import { logger } from "./logger"

const log = logger.child({ module: "serpapi" })

const SERPAPI_KEY = process.env.SERPAPI_KEY || ""
const SERPAPI_BASE = "https://serpapi.com/search.json"

// ============================================
// Types
// ============================================

export interface GoogleShoppingProduct {
  id: string
  title: string
  link: string
  source: string  // Store name (Meijer, Target, etc.)
  price: number
  originalPrice?: number
  currency: string
  thumbnail: string
  rating?: number
  reviews?: number
  delivery?: string
  badge?: string  // "Sale", "Low Price", etc.
}

export interface GoogleShoppingResult {
  products: GoogleShoppingProduct[]
  totalResults: number
  query: string
  filters: {
    stores: string[]
    priceRanges: string[]
  }
}

// ============================================
// Google Shopping Search
// ============================================

export async function searchGoogleShopping(
  query: string,
  options: {
    location?: string
    minPrice?: number
    maxPrice?: number
    store?: string  // Filter by specific store
    sortBy?: "relevance" | "price_low" | "price_high" | "review"
  } = {}
): Promise<GoogleShoppingResult> {
  if (!SERPAPI_KEY) {
    log.warn("SerpAPI key not configured")
    return { products: [], totalResults: 0, query, filters: { stores: [], priceRanges: [] } }
  }

  try {
    log.info("Searching Google Shopping", { query, options })

    const params = new URLSearchParams({
      api_key: SERPAPI_KEY,
      engine: "google_shopping",
      q: query,
      location: options.location || "United States",
      hl: "en",
      gl: "us",
    })

    // Add price filter
    if (options.minPrice !== undefined || options.maxPrice !== undefined) {
      const min = options.minPrice || 0
      const max = options.maxPrice || 999999
      params.append("tbs", `mr:1,price:1,ppr_min:${min},ppr_max:${max}`)
    }

    // Add sorting
    if (options.sortBy) {
      const sortMap = {
        relevance: "",
        price_low: "p_ord:p",
        price_high: "p_ord:pd",
        review: "p_ord:rv",
      }
      if (sortMap[options.sortBy]) {
        params.append("tbs", sortMap[options.sortBy])
      }
    }

    const response = await fetch(`${SERPAPI_BASE}?${params}`)

    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.status}`)
    }

    const data = await response.json()

    // Parse shopping results
    const shoppingResults = data.shopping_results || []
    const inlineProducts = data.inline_shopping_results || []
    const allProducts = [...shoppingResults, ...inlineProducts]

    const products: GoogleShoppingProduct[] = allProducts.map((item: any, index: number) => ({
      id: `gshop-${item.product_id || item.position || index}`,
      title: item.title,
      link: item.link || item.product_link,
      source: item.source || item.seller || "Unknown Store",
      price: parsePrice(item.price || item.extracted_price),
      originalPrice: item.original_price ? parsePrice(item.original_price) : undefined,
      currency: "USD",
      thumbnail: item.thumbnail,
      rating: item.rating,
      reviews: item.reviews,
      delivery: item.delivery || item.shipping,
      badge: item.badge || item.tag,
    }))

    // Filter by store if specified
    let filteredProducts = products
    if (options.store) {
      filteredProducts = products.filter(p => 
        p.source.toLowerCase().includes(options.store!.toLowerCase())
      )
    }

    // Extract available stores for filtering
    const stores = [...new Set(products.map(p => p.source))].sort()

    log.info("Google Shopping results", { 
      count: filteredProducts.length,
      stores: stores.length,
    })

    return {
      products: filteredProducts,
      totalResults: filteredProducts.length,
      query,
      filters: {
        stores,
        priceRanges: ["Under $25", "$25-$50", "$50-$100", "$100-$200", "Over $200"],
      },
    }
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return { products: [], totalResults: 0, query, filters: { stores: [], priceRanges: [] } }
  }
}

// ============================================
// Store-Specific Searches
// ============================================

export async function searchMeijer(query: string): Promise<GoogleShoppingProduct[]> {
  const result = await searchGoogleShopping(`${query} site:meijer.com`, { store: "Meijer" })
  return result.products
}

export async function searchByStore(
  query: string, 
  storeName: string
): Promise<GoogleShoppingProduct[]> {
  const result = await searchGoogleShopping(query, { store: storeName })
  return result.products
}

// ============================================
// Local Store Search (by location)
// ============================================

export async function searchLocalStores(
  query: string,
  zipCode: string
): Promise<GoogleShoppingResult> {
  // Convert zip to location name for better results
  return searchGoogleShopping(query, {
    location: `${zipCode}, United States`,
  })
}

// ============================================
// Price Comparison via Google Shopping
// ============================================

export async function comparePricesGoogle(
  query: string
): Promise<{
  store: string
  price: number
  url: string
  rating?: number
  delivery?: string
}[]> {
  const result = await searchGoogleShopping(query, { sortBy: "price_low" })
  
  // Group by store and get lowest price from each
  const storeMap = new Map<string, GoogleShoppingProduct>()
  
  for (const product of result.products) {
    const existing = storeMap.get(product.source)
    if (!existing || product.price < existing.price) {
      storeMap.set(product.source, product)
    }
  }

  return Array.from(storeMap.values())
    .map(p => ({
      store: p.source,
      price: p.price,
      url: p.link,
      rating: p.rating,
      delivery: p.delivery,
    }))
    .sort((a, b) => a.price - b.price)
}

// ============================================
// Google Shopping Deals
// ============================================

export async function getGoogleShoppingDeals(
  category?: string
): Promise<GoogleShoppingProduct[]> {
  const queries = category 
    ? [`${category} deals`, `${category} sale`]
    : ["best deals today", "clearance sale", "flash sale"]

  const allDeals: GoogleShoppingProduct[] = []

  for (const query of queries) {
    const result = await searchGoogleShopping(query, { sortBy: "relevance" })
    
    // Filter for products with discounts
    const deals = result.products.filter(p => 
      p.originalPrice && p.price < p.originalPrice ||
      p.badge?.toLowerCase().includes("sale") ||
      p.badge?.toLowerCase().includes("deal")
    )
    
    allDeals.push(...deals)
  }

  // Remove duplicates
  const seen = new Set<string>()
  return allDeals.filter(p => {
    if (seen.has(p.id)) return false
    seen.add(p.id)
    return true
  })
}

// ============================================
// Trending Products
// ============================================

export async function getTrendingProducts(
  category?: string
): Promise<GoogleShoppingProduct[]> {
  const query = category 
    ? `best selling ${category} 2024`
    : "trending products 2024"

  const result = await searchGoogleShopping(query, { sortBy: "review" })
  return result.products.slice(0, 20)
}

// ============================================
// SerpAPI Status Check
// ============================================

export function isSerpApiConfigured(): boolean {
  return !!SERPAPI_KEY
}

export function getSerpApiKeyPreview(): string {
  if (!SERPAPI_KEY) return ""
  return SERPAPI_KEY.slice(0, 8) + "..." + SERPAPI_KEY.slice(-4)
}

// ============================================
// Available Store Categories (via Google Shopping)
// ============================================

export const GOOGLE_SHOPPING_STORES = {
  grocery: [
    "Meijer", "Kroger", "Publix", "HEB", "Aldi", "Trader Joe's",
    "Whole Foods", "Safeway", "Albertsons", "Food Lion", "Giant",
    "Wegmans", "ShopRite", "Stop & Shop", "Hannaford",
  ],
  department: [
    "Macy's", "Nordstrom", "Kohl's", "JCPenney", "Dillard's",
    "Belk", "Von Maur", "Neiman Marcus", "Saks Fifth Avenue",
  ],
  discount: [
    "TJ Maxx", "Marshalls", "Ross", "Burlington", "Big Lots",
    "Dollar General", "Dollar Tree", "Five Below", "Ollie's",
  ],
  pets: [
    "PetSmart", "Petco", "Chewy", "Pet Supplies Plus",
  ],
  office: [
    "Staples", "Office Depot", "Office Max",
  ],
  sports: [
    "Dick's Sporting Goods", "Academy Sports", "REI", "Bass Pro Shops",
    "Cabela's", "Scheels", "Big 5 Sporting Goods",
  ],
  electronics: [
    "Best Buy", "Newegg", "B&H Photo", "Micro Center", "Fry's",
  ],
  home: [
    "Home Depot", "Lowe's", "Menards", "Ace Hardware", 
    "Wayfair", "Overstock", "Bed Bath & Beyond",
  ],
  beauty: [
    "Sephora", "Ulta", "Sally Beauty", "Bluemercury",
  ],
  pharmacy: [
    "CVS", "Walgreens", "Rite Aid", "Walmart Pharmacy",
  ],
}

// ============================================
// Helper Functions
// ============================================

function parsePrice(price: any): number {
  if (typeof price === "number") return price
  if (!price) return 0
  const cleaned = String(price).replace(/[^0-9.]/g, "")
  return parseFloat(cleaned) || 0
}
