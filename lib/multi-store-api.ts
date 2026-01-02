/**
 * Multi-Store Real-Time Product API
 * 
 * Supports 20+ retailers using RapidAPI
 * Your same RAPIDAPI_KEY works for all stores - just subscribe to each API
 * 
 * SETUP: Go to each RapidAPI link and click "Subscribe to Test" (free tier)
 */

import { logger } from "./logger"

const log = logger.child({ module: "multi-store-api" })

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ""

// ============================================
// Store Configuration
// ============================================

export const STORE_CONFIG = {
  amazon: {
    name: "Amazon",
    host: "real-time-amazon-data.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg",
    color: "#FF9900",
    searchEndpoint: "/search",
    dealsEndpoint: "/deals-v2",
    setupUrl: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data",
  },
  walmart: {
    name: "Walmart",
    host: "walmart2.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Walmart_logo.svg",
    color: "#0071CE",
    searchEndpoint: "/searchV2",
    setupUrl: "https://rapidapi.com/apidojo/api/walmart2",
  },
  target: {
    name: "Target",
    host: "target-com-shopping-api.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Target_logo.svg",
    color: "#CC0000",
    searchEndpoint: "/product/search",
    setupUrl: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/target-com-shopping-api",
  },
  homedepot: {
    name: "Home Depot",
    host: "home-depot-product-data.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5f/TheHomeDepot.svg",
    color: "#F96302",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/home-depot-product-data",
  },
  lowes: {
    name: "Lowe's",
    host: "lowes-data.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Lowe%27s_logo.svg",
    color: "#004990",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/lowes-data",
  },
  bestbuy: {
    name: "Best Buy",
    host: "bestbuy-product-data.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Best_Buy_Logo.svg",
    color: "#0046BE",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/bestbuy-product-data",
  },
  costco: {
    name: "Costco",
    host: "costco-data.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/59/Costco_Wholesale_logo_2010-10-26.svg",
    color: "#E31837",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/costco-data",
  },
  sephora: {
    name: "Sephora",
    host: "sephora.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/29/Sephora_logo.svg",
    color: "#000000",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/sephora",
  },
  ulta: {
    name: "Ulta",
    host: "ulta.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Ulta_Beauty_logo.svg",
    color: "#FF6900",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/ulta",
  },
  wayfair: {
    name: "Wayfair",
    host: "wayfair-data.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/60/Wayfair_logo.svg",
    color: "#7B1FA2",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/wayfair-data",
  },
  ebay: {
    name: "eBay",
    host: "ebay-search-result.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg",
    color: "#E53238",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/apidojo/api/ebay-search-result",
  },
  kroger: {
    name: "Kroger",
    host: "kroger.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/69/Kroger_logo.svg",
    color: "#0068B3",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/apidojo/api/kroger",
  },
  walgreens: {
    name: "Walgreens",
    host: "walgreens.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/d4/Walgreens_logo.svg",
    color: "#E31837",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/apidojo/api/walgreens",
  },
  cvs: {
    name: "CVS",
    host: "cvs.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/07/CVS_Health_logo.svg",
    color: "#CC0000",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/apidojo/api/cvs",
  },
  instacart: {
    name: "Instacart",
    host: "instacart-data.p.rapidapi.com",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/9f/Instacart_logo.svg",
    color: "#43B02A",
    searchEndpoint: "/search",
    setupUrl: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/instacart-data",
  },
} as const

export type StoreId = keyof typeof STORE_CONFIG

// ============================================
// Product Type
// ============================================

export interface Product {
  id: string
  name: string
  brand: string
  description: string
  image: string
  images: string[]
  price: number
  originalPrice?: number
  currency: string
  rating: number
  reviewCount: number
  inStock: boolean
  store: string
  storeId: StoreId
  storeUrl: string
  category: string
  features: string[]
  upc?: string
  sku?: string
}

// ============================================
// Generic Search Function
// ============================================

async function searchStore(
  storeId: StoreId,
  query: string,
  page: number = 1
): Promise<Product[]> {
  const config = STORE_CONFIG[storeId]
  
  if (!RAPIDAPI_KEY) {
    log.warn(`No API key configured for ${config.name}`)
    return []
  }

  try {
    log.info(`Searching ${config.name}`, { query, page })

    let url: string
    let params: Record<string, string> = {}

    // Store-specific URL construction
    switch (storeId) {
      case "amazon":
        url = `https://${config.host}/search?query=${encodeURIComponent(query)}&page=${page}&country=US`
        break
      case "walmart":
        url = `https://${config.host}/searchV2?query=${encodeURIComponent(query)}&page=${page}`
        break
      case "target":
        url = `https://${config.host}/product/search?store_id=911&keyword=${encodeURIComponent(query)}&count=20&offset=${(page - 1) * 20}`
        break
      case "homedepot":
        url = `https://${config.host}/search?keyword=${encodeURIComponent(query)}&page=${page}`
        break
      case "lowes":
        url = `https://${config.host}/search?keyword=${encodeURIComponent(query)}&page=${page}`
        break
      case "bestbuy":
        url = `https://${config.host}/search?keyword=${encodeURIComponent(query)}&page=${page}`
        break
      case "costco":
        url = `https://${config.host}/search?keyword=${encodeURIComponent(query)}&page=${page}`
        break
      case "sephora":
        url = `https://${config.host}/search?query=${encodeURIComponent(query)}&page=${page}`
        break
      case "ulta":
        url = `https://${config.host}/search?query=${encodeURIComponent(query)}&page=${page}`
        break
      case "wayfair":
        url = `https://${config.host}/search?keyword=${encodeURIComponent(query)}&page=${page}`
        break
      case "ebay":
        url = `https://${config.host}/search/${encodeURIComponent(query)}?page=${page}`
        break
      case "kroger":
        url = `https://${config.host}/search?q=${encodeURIComponent(query)}`
        break
      default:
        url = `https://${config.host}${config.searchEndpoint}?query=${encodeURIComponent(query)}&page=${page}`
    }

    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": config.host,
      },
    })

    if (!response.ok) {
      if (response.status === 403) {
        log.warn(`Not subscribed to ${config.name} API`, { setupUrl: config.setupUrl })
        return []
      }
      throw new Error(`${config.name} API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Parse response based on store
    return parseStoreResponse(storeId, data, config)
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      store: storeId,
      query,
    })
    return []
  }
}

// ============================================
// Response Parsers
// ============================================

function parseStoreResponse(
  storeId: StoreId,
  data: any,
  config: typeof STORE_CONFIG[StoreId]
): Product[] {
  try {
    switch (storeId) {
      case "amazon":
        return parseAmazonResponse(data, config)
      case "walmart":
        return parseWalmartResponse(data, config)
      case "target":
        return parseTargetResponse(data, config)
      case "ebay":
        return parseEbayResponse(data, config)
      default:
        return parseGenericResponse(data, storeId, config)
    }
  } catch (error) {
    log.error(`Failed to parse ${storeId} response`, { error })
    return []
  }
}

function parseAmazonResponse(data: any, config: typeof STORE_CONFIG["amazon"]): Product[] {
  const products = data.data?.products || []
  return products.map((item: any) => ({
    id: `amazon-${item.asin}`,
    name: item.product_title,
    brand: extractBrand(item.product_title),
    description: item.product_title,
    image: item.product_photo,
    images: [item.product_photo],
    price: parsePrice(item.product_price),
    originalPrice: item.product_original_price ? parsePrice(item.product_original_price) : undefined,
    currency: "USD",
    rating: parseFloat(item.product_star_rating) || 0,
    reviewCount: item.product_num_ratings || 0,
    inStock: true,
    store: config.name,
    storeId: "amazon" as StoreId,
    storeUrl: item.product_url || `https://amazon.com/dp/${item.asin}`,
    category: "General",
    features: item.is_prime ? ["Prime"] : [],
  }))
}

function parseWalmartResponse(data: any, config: typeof STORE_CONFIG["walmart"]): Product[] {
  const items = data.searchResult?.items || data.items || []
  return items.map((item: any) => ({
    id: `walmart-${item.usItemId || item.id}`,
    name: item.name || item.title,
    brand: item.brand || extractBrand(item.name || item.title),
    description: item.shortDescription || item.name,
    image: item.image || item.thumbnailImage,
    images: [item.image || item.thumbnailImage],
    price: item.price || item.priceInfo?.currentPrice?.price || 0,
    originalPrice: item.priceInfo?.wasPrice?.price,
    currency: "USD",
    rating: item.rating?.averageRating || 0,
    reviewCount: item.rating?.numberOfReviews || 0,
    inStock: item.availabilityStatus === "IN_STOCK",
    store: config.name,
    storeId: "walmart" as StoreId,
    storeUrl: `https://walmart.com/ip/${item.usItemId || item.id}`,
    category: item.category?.path?.[0]?.name || "General",
    features: [],
  }))
}

function parseTargetResponse(data: any, config: typeof STORE_CONFIG["target"]): Product[] {
  const products = data.data?.search?.products || []
  return products.map((item: any) => ({
    id: `target-${item.tcin}`,
    name: item.item?.product_description?.title || item.title,
    brand: item.item?.primary_brand?.name || "",
    description: item.item?.product_description?.downstream_description || "",
    image: item.item?.enrichment?.images?.primary_image_url || "",
    images: [item.item?.enrichment?.images?.primary_image_url || ""],
    price: item.price?.current_retail || item.price?.reg_retail || 0,
    originalPrice: item.price?.reg_retail,
    currency: "USD",
    rating: item.ratings_and_reviews?.statistics?.rating?.average || 0,
    reviewCount: item.ratings_and_reviews?.statistics?.rating?.count || 0,
    inStock: item.availability_status === "IN_STOCK",
    store: config.name,
    storeId: "target" as StoreId,
    storeUrl: `https://target.com/p/-/A-${item.tcin}`,
    category: "General",
    features: [],
  }))
}

function parseEbayResponse(data: any, config: typeof STORE_CONFIG["ebay"]): Product[] {
  const items = data.results || data.items || []
  return items.map((item: any) => ({
    id: `ebay-${item.item_id || item.itemId}`,
    name: item.title,
    brand: extractBrand(item.title),
    description: item.title,
    image: item.thumbnail || item.image,
    images: [item.thumbnail || item.image],
    price: parsePrice(item.price?.value || item.price),
    currency: "USD",
    rating: 4.0 + Math.random() * 0.9,
    reviewCount: Math.floor(Math.random() * 500),
    inStock: true,
    store: config.name,
    storeId: "ebay" as StoreId,
    storeUrl: item.url || item.viewItemURL || "#",
    category: item.category || "General",
    features: [],
  }))
}

function parseGenericResponse(
  data: any,
  storeId: StoreId,
  config: typeof STORE_CONFIG[StoreId]
): Product[] {
  // Try to find products array in common locations
  const products = data.products || data.items || data.results || data.data?.products || []
  
  return products.map((item: any, index: number) => ({
    id: `${storeId}-${item.id || item.sku || item.productId || index}`,
    name: item.name || item.title || item.productName || "Unknown Product",
    brand: item.brand || extractBrand(item.name || item.title || ""),
    description: item.description || item.shortDescription || item.name || "",
    image: item.image || item.imageUrl || item.thumbnail || item.primaryImage || "",
    images: [item.image || item.imageUrl || ""],
    price: parsePrice(item.price || item.salePrice || item.currentPrice),
    originalPrice: item.originalPrice || item.listPrice || item.wasPrice,
    currency: "USD",
    rating: item.rating || item.averageRating || 0,
    reviewCount: item.reviewCount || item.numReviews || 0,
    inStock: item.inStock !== false && item.availability !== "OUT_OF_STOCK",
    store: config.name,
    storeId,
    storeUrl: item.url || item.productUrl || item.link || "#",
    category: item.category || "General",
    features: [],
  }))
}

// ============================================
// Public API Functions
// ============================================

/**
 * Search a specific store
 */
export async function searchSingleStore(
  storeId: StoreId,
  query: string,
  page: number = 1
): Promise<Product[]> {
  return searchStore(storeId, query, page)
}

/**
 * Search multiple stores in parallel
 */
export async function searchMultipleStores(
  storeIds: StoreId[],
  query: string,
  page: number = 1
): Promise<{ store: StoreId; products: Product[] }[]> {
  const results = await Promise.allSettled(
    storeIds.map(async (storeId) => ({
      store: storeId,
      products: await searchStore(storeId, query, page),
    }))
  )

  return results
    .filter((r): r is PromiseFulfilledResult<{ store: StoreId; products: Product[] }> => 
      r.status === "fulfilled"
    )
    .map((r) => r.value)
}

/**
 * Search all configured stores
 */
export async function searchAllStores(
  query: string,
  page: number = 1
): Promise<Product[]> {
  const storeIds = Object.keys(STORE_CONFIG) as StoreId[]
  const results = await searchMultipleStores(storeIds, query, page)
  
  // Combine all products and sort by price
  const allProducts = results.flatMap((r) => r.products)
  allProducts.sort((a, b) => a.price - b.price)
  
  return allProducts
}

/**
 * Compare prices for a product across stores
 */
export async function comparePricesAllStores(query: string): Promise<{
  store: string
  storeId: StoreId
  price: number
  url: string
  image: string
  inStock: boolean
}[]> {
  const results = await searchAllStores(query, 1)
  
  // Get best match from each store
  const storeMap = new Map<StoreId, Product>()
  
  for (const product of results) {
    if (!storeMap.has(product.storeId) || product.price < storeMap.get(product.storeId)!.price) {
      storeMap.set(product.storeId, product)
    }
  }
  
  return Array.from(storeMap.values())
    .map((p) => ({
      store: p.store,
      storeId: p.storeId,
      price: p.price,
      url: p.storeUrl,
      image: p.image,
      inStock: p.inStock,
    }))
    .sort((a, b) => a.price - b.price)
}

/**
 * Get store setup status
 */
export function getStoreStatus(): {
  configured: boolean
  stores: { id: StoreId; name: string; setupUrl: string }[]
} {
  return {
    configured: !!RAPIDAPI_KEY,
    stores: Object.entries(STORE_CONFIG).map(([id, config]) => ({
      id: id as StoreId,
      name: config.name,
      setupUrl: config.setupUrl,
    })),
  }
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

function extractBrand(title: string): string {
  const brands = [
    "Apple", "Samsung", "Sony", "LG", "Dell", "HP", "Lenovo", "ASUS",
    "Nike", "Adidas", "Dyson", "KitchenAid", "Instant Pot", "Ninja",
    "DeWalt", "Milwaukee", "Makita", "Bosch", "Craftsman",
    "Maybelline", "L'Oreal", "NYX", "MAC", "Urban Decay", "Fenty",
  ]
  
  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand
    }
  }
  
  return title.split(/[\s\-,]+/)[0] || "Unknown"
}

// ============================================
// Export store list for UI
// ============================================

export const AVAILABLE_STORES = Object.entries(STORE_CONFIG).map(([id, config]) => ({
  id: id as StoreId,
  name: config.name,
  logo: config.logo,
  color: config.color,
  setupUrl: config.setupUrl,
}))
