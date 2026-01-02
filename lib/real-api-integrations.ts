/**
 * Real Product API Integrations
 * 
 * This module integrates with real product data APIs to fetch
 * actual products, prices, and images from major retailers.
 * 
 * Supported APIs:
 * - RapidAPI Real-Time Amazon Data
 * - RapidAPI Walmart Data
 * - RapidAPI Target Data
 * - eBay Browse API
 * 
 * Required Environment Variables:
 * - RAPIDAPI_KEY: Your RapidAPI key (get from rapidapi.com)
 * - EBAY_APP_ID: eBay Developer App ID (optional)
 */

import { logger } from "./logger"

const log = logger.child({ module: "real-product-api" })

// ============================================
// Types
// ============================================

export interface RealProduct {
  id: string
  asin?: string // Amazon Standard Identification Number
  upc?: string // Universal Product Code
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
  storeUrl: string
  category: string
  features?: string[]
  lastUpdated: Date
}

export interface StorePrice {
  store: string
  price: number
  url: string
  inStock: boolean
  shipping?: string
  deliveryDate?: string
}

export interface ProductSearchResult {
  products: RealProduct[]
  totalResults: number
  page: number
  hasMore: boolean
}

// ============================================
// RapidAPI Configuration
// ============================================

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ""
const RAPIDAPI_HOST_AMAZON = "real-time-amazon-data.p.rapidapi.com"
const RAPIDAPI_HOST_WALMART = "walmart2.p.rapidapi.com"

const rapidApiHeaders = {
  "X-RapidAPI-Key": RAPIDAPI_KEY,
}

// ============================================
// Amazon API Integration
// ============================================

interface AmazonSearchResponse {
  status: string
  data: {
    products: Array<{
      asin: string
      product_title: string
      product_price: string
      product_original_price?: string
      product_star_rating: string
      product_num_ratings: number
      product_url: string
      product_photo: string
      is_prime: boolean
      climate_pledge_friendly: boolean
      sales_volume?: string
      delivery?: string
    }>
    total_products: number
  }
}

export async function searchAmazon(
  query: string,
  page: number = 1,
  category?: string
): Promise<ProductSearchResult> {
  if (!RAPIDAPI_KEY) {
    log.warn("RAPIDAPI_KEY not configured, using demo data")
    return { products: [], totalResults: 0, page, hasMore: false }
  }

  try {
    log.info("Searching Amazon", { query, page, category })

    const params = new URLSearchParams({
      query,
      page: page.toString(),
      country: "US",
      sort_by: "RELEVANCE",
      product_condition: "ALL",
    })

    if (category) {
      params.append("category_id", category)
    }

    const response = await fetch(
      `https://${RAPIDAPI_HOST_AMAZON}/search?${params}`,
      {
        headers: {
          ...rapidApiHeaders,
          "X-RapidAPI-Host": RAPIDAPI_HOST_AMAZON,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Amazon API error: ${response.status}`)
    }

    const data: AmazonSearchResponse = await response.json()

    const products: RealProduct[] = data.data.products.map((item) => ({
      id: `amazon-${item.asin}`,
      asin: item.asin,
      name: item.product_title,
      brand: extractBrand(item.product_title),
      description: item.product_title,
      image: item.product_photo,
      images: [item.product_photo],
      price: parsePrice(item.product_price),
      originalPrice: item.product_original_price
        ? parsePrice(item.product_original_price)
        : undefined,
      currency: "USD",
      rating: parseFloat(item.product_star_rating) || 0,
      reviewCount: item.product_num_ratings || 0,
      inStock: true,
      store: "Amazon",
      storeUrl: item.product_url,
      category: category || "General",
      features: item.is_prime ? ["Prime Eligible"] : [],
      lastUpdated: new Date(),
    }))

    log.info("Amazon search completed", { resultCount: products.length })

    return {
      products,
      totalResults: data.data.total_products,
      page,
      hasMore: products.length === 20,
    }
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      action: "amazon-search",
      query,
    })
    return { products: [], totalResults: 0, page, hasMore: false }
  }
}

export async function getAmazonProductDetails(asin: string): Promise<RealProduct | null> {
  if (!RAPIDAPI_KEY) {
    log.warn("RAPIDAPI_KEY not configured")
    return null
  }

  try {
    log.info("Fetching Amazon product details", { asin })

    const response = await fetch(
      `https://${RAPIDAPI_HOST_AMAZON}/product-details?asin=${asin}&country=US`,
      {
        headers: {
          ...rapidApiHeaders,
          "X-RapidAPI-Host": RAPIDAPI_HOST_AMAZON,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Amazon API error: ${response.status}`)
    }

    const data = await response.json()
    const item = data.data

    return {
      id: `amazon-${asin}`,
      asin,
      name: item.product_title,
      brand: item.product_byline || extractBrand(item.product_title),
      description: item.product_description || item.about_product?.join(" ") || "",
      image: item.product_photo,
      images: item.product_photos || [item.product_photo],
      price: parsePrice(item.product_price),
      originalPrice: item.product_original_price
        ? parsePrice(item.product_original_price)
        : undefined,
      currency: "USD",
      rating: parseFloat(item.product_star_rating) || 0,
      reviewCount: item.product_num_ratings || 0,
      inStock: item.is_available || true,
      store: "Amazon",
      storeUrl: `https://www.amazon.com/dp/${asin}`,
      category: item.category_path?.[0] || "General",
      features: item.about_product || [],
      lastUpdated: new Date(),
    }
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      action: "amazon-product-details",
      asin,
    })
    return null
  }
}

// ============================================
// Walmart API Integration
// ============================================

export async function searchWalmart(
  query: string,
  page: number = 1
): Promise<ProductSearchResult> {
  if (!RAPIDAPI_KEY) {
    log.warn("RAPIDAPI_KEY not configured")
    return { products: [], totalResults: 0, page, hasMore: false }
  }

  try {
    log.info("Searching Walmart", { query, page })

    const response = await fetch(
      `https://${RAPIDAPI_HOST_WALMART}/searchV2?query=${encodeURIComponent(query)}&page=${page}`,
      {
        headers: {
          ...rapidApiHeaders,
          "X-RapidAPI-Host": RAPIDAPI_HOST_WALMART,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Walmart API error: ${response.status}`)
    }

    const data = await response.json()

    const products: RealProduct[] = (data.searchResult?.products || []).map(
      (item: any) => ({
        id: `walmart-${item.usItemId}`,
        upc: item.upc,
        name: item.name,
        brand: item.brand || extractBrand(item.name),
        description: item.shortDescription || item.name,
        image: item.image,
        images: item.imageInfo?.allImages?.map((img: any) => img.url) || [item.image],
        price: item.price || item.priceInfo?.currentPrice?.price || 0,
        originalPrice: item.priceInfo?.wasPrice?.price,
        currency: "USD",
        rating: item.rating?.averageRating || 0,
        reviewCount: item.rating?.numberOfReviews || 0,
        inStock: item.availabilityStatus === "IN_STOCK",
        store: "Walmart",
        storeUrl: `https://www.walmart.com/ip/${item.usItemId}`,
        category: item.category?.path?.[0]?.name || "General",
        features: [],
        lastUpdated: new Date(),
      })
    )

    log.info("Walmart search completed", { resultCount: products.length })

    return {
      products,
      totalResults: data.searchResult?.totalCount || 0,
      page,
      hasMore: products.length > 0,
    }
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      action: "walmart-search",
      query,
    })
    return { products: [], totalResults: 0, page, hasMore: false }
  }
}

// ============================================
// eBay API Integration
// ============================================

const EBAY_APP_ID = process.env.EBAY_APP_ID || ""

export async function searchEbay(
  query: string,
  page: number = 1
): Promise<ProductSearchResult> {
  if (!EBAY_APP_ID) {
    log.warn("EBAY_APP_ID not configured")
    return { products: [], totalResults: 0, page, hasMore: false }
  }

  try {
    log.info("Searching eBay", { query, page })

    const response = await fetch(
      `https://svcs.ebay.com/services/search/FindingService/v1?` +
        new URLSearchParams({
          "OPERATION-NAME": "findItemsByKeywords",
          "SERVICE-VERSION": "1.0.0",
          "SECURITY-APPNAME": EBAY_APP_ID,
          "RESPONSE-DATA-FORMAT": "JSON",
          keywords: query,
          "paginationInput.entriesPerPage": "20",
          "paginationInput.pageNumber": page.toString(),
          "sortOrder": "BestMatch",
        })
    )

    if (!response.ok) {
      throw new Error(`eBay API error: ${response.status}`)
    }

    const data = await response.json()
    const items = data.findItemsByKeywordsResponse?.[0]?.searchResult?.[0]?.item || []

    const products: RealProduct[] = items.map((item: any) => ({
      id: `ebay-${item.itemId[0]}`,
      name: item.title[0],
      brand: extractBrand(item.title[0]),
      description: item.title[0],
      image: item.galleryURL?.[0] || "",
      images: [item.galleryURL?.[0] || ""],
      price: parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || "0"),
      currency: item.sellingStatus?.[0]?.currentPrice?.[0]?.["@currencyId"] || "USD",
      rating: 0, // eBay doesn't provide ratings in search
      reviewCount: 0,
      inStock: true,
      store: "eBay",
      storeUrl: item.viewItemURL?.[0] || "",
      category: item.primaryCategory?.[0]?.categoryName?.[0] || "General",
      features: [],
      lastUpdated: new Date(),
    }))

    const totalResults = parseInt(
      data.findItemsByKeywordsResponse?.[0]?.paginationOutput?.[0]?.totalEntries?.[0] || "0"
    )

    log.info("eBay search completed", { resultCount: products.length })

    return {
      products,
      totalResults,
      page,
      hasMore: products.length === 20,
    }
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      action: "ebay-search",
      query,
    })
    return { products: [], totalResults: 0, page, hasMore: false }
  }
}

// ============================================
// Multi-Store Price Comparison
// ============================================

export async function compareprices(
  query: string,
  productName?: string
): Promise<StorePrice[]> {
  log.info("Comparing prices across stores", { query })

  const results: StorePrice[] = []

  // Search all stores in parallel
  const [amazonResults, walmartResults, ebayResults] = await Promise.all([
    searchAmazon(query, 1),
    searchWalmart(query, 1),
    searchEbay(query, 1),
  ])

  // Find best matching product from each store
  const searchTerm = (productName || query).toLowerCase()

  const findBestMatch = (products: RealProduct[]) => {
    return products.find((p) =>
      p.name.toLowerCase().includes(searchTerm) ||
      searchTerm.includes(p.name.toLowerCase().slice(0, 20))
    ) || products[0]
  }

  if (amazonResults.products.length > 0) {
    const match = findBestMatch(amazonResults.products)
    results.push({
      store: "Amazon",
      price: match.price,
      url: match.storeUrl,
      inStock: match.inStock,
      shipping: "Free with Prime",
    })
  }

  if (walmartResults.products.length > 0) {
    const match = findBestMatch(walmartResults.products)
    results.push({
      store: "Walmart",
      price: match.price,
      url: match.storeUrl,
      inStock: match.inStock,
      shipping: "Free shipping on orders $35+",
    })
  }

  if (ebayResults.products.length > 0) {
    const match = findBestMatch(ebayResults.products)
    results.push({
      store: "eBay",
      price: match.price,
      url: match.storeUrl,
      inStock: match.inStock,
      shipping: "Varies by seller",
    })
  }

  // Sort by price
  results.sort((a, b) => a.price - b.price)

  log.info("Price comparison completed", { storeCount: results.length })

  return results
}

// ============================================
// Unified Search Across All Stores
// ============================================

export async function searchAllStores(
  query: string,
  page: number = 1
): Promise<ProductSearchResult> {
  log.info("Searching all stores", { query, page })

  // Search all stores in parallel
  const [amazonResults, walmartResults, ebayResults] = await Promise.all([
    searchAmazon(query, page),
    searchWalmart(query, page),
    searchEbay(query, page),
  ])

  // Combine and deduplicate results
  const allProducts = [
    ...amazonResults.products,
    ...walmartResults.products,
    ...ebayResults.products,
  ]

  // Sort by best price
  allProducts.sort((a, b) => a.price - b.price)

  const totalResults =
    amazonResults.totalResults +
    walmartResults.totalResults +
    ebayResults.totalResults

  return {
    products: allProducts,
    totalResults,
    page,
    hasMore:
      amazonResults.hasMore || walmartResults.hasMore || ebayResults.hasMore,
  }
}

// ============================================
// Trending/Bestseller Products
// ============================================

export async function getBestsellers(category?: string): Promise<RealProduct[]> {
  if (!RAPIDAPI_KEY) {
    log.warn("RAPIDAPI_KEY not configured")
    return []
  }

  try {
    log.info("Fetching bestsellers", { category })

    const response = await fetch(
      `https://${RAPIDAPI_HOST_AMAZON}/best-sellers?category=${category || "aps"}&type=BEST_SELLERS&page=1&country=US`,
      {
        headers: {
          ...rapidApiHeaders,
          "X-RapidAPI-Host": RAPIDAPI_HOST_AMAZON,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Amazon API error: ${response.status}`)
    }

    const data = await response.json()

    const products: RealProduct[] = (data.data?.best_sellers || []).map(
      (item: any) => ({
        id: `amazon-${item.asin}`,
        asin: item.asin,
        name: item.product_title,
        brand: extractBrand(item.product_title),
        description: item.product_title,
        image: item.product_photo,
        images: [item.product_photo],
        price: parsePrice(item.product_price),
        currency: "USD",
        rating: parseFloat(item.product_star_rating) || 0,
        reviewCount: item.product_num_ratings || 0,
        inStock: true,
        store: "Amazon",
        storeUrl: item.product_url,
        category: category || "Bestsellers",
        features: ["Bestseller"],
        lastUpdated: new Date(),
      })
    )

    log.info("Fetched bestsellers", { count: products.length })
    return products
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      action: "get-bestsellers",
      category,
    })
    return []
  }
}

export async function getDeals(): Promise<RealProduct[]> {
  if (!RAPIDAPI_KEY) {
    log.warn("RAPIDAPI_KEY not configured")
    return []
  }

  try {
    log.info("Fetching deals")

    const response = await fetch(
      `https://${RAPIDAPI_HOST_AMAZON}/deals-v2?country=US&min_product_star_rating=ALL&price_range=ALL`,
      {
        headers: {
          ...rapidApiHeaders,
          "X-RapidAPI-Host": RAPIDAPI_HOST_AMAZON,
        },
      }
    )

    if (!response.ok) {
      throw new Error(`Amazon API error: ${response.status}`)
    }

    const data = await response.json()

    const products: RealProduct[] = (data.data?.deals || []).slice(0, 20).map(
      (item: any) => ({
        id: `amazon-deal-${item.deal_id}`,
        asin: item.product_asin,
        name: item.deal_title,
        brand: extractBrand(item.deal_title),
        description: item.deal_title,
        image: item.deal_photo,
        images: [item.deal_photo],
        price: parsePrice(item.deal_price?.amount),
        originalPrice: parsePrice(item.list_price?.amount),
        currency: "USD",
        rating: 0,
        reviewCount: 0,
        inStock: true,
        store: "Amazon",
        storeUrl: `https://www.amazon.com/dp/${item.product_asin}`,
        category: "Deals",
        features: ["Deal", `${item.savings_percentage}% off`],
        lastUpdated: new Date(),
      })
    )

    log.info("Fetched deals", { count: products.length })
    return products
  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)), {
      action: "get-deals",
    })
    return []
  }
}

// ============================================
// Helper Functions
// ============================================

function parsePrice(priceStr: string | number | undefined): number {
  if (typeof priceStr === "number") return priceStr
  if (!priceStr) return 0
  const cleaned = priceStr.replace(/[^0-9.]/g, "")
  return parseFloat(cleaned) || 0
}

function extractBrand(title: string): string {
  // Common patterns: "Brand Name Product..." or just first word
  const words = title.split(/[\s\-–,]+/)
  const commonBrands = [
    "Apple", "Samsung", "Sony", "LG", "Dell", "HP", "Lenovo", "ASUS",
    "Acer", "Microsoft", "Google", "Amazon", "Anker", "Bose", "JBL",
    "Nike", "Adidas", "Under Armour", "Dyson", "Ninja", "KitchenAid",
    "Instant Pot", "Cuisinart", "Philips", "Panasonic", "Canon", "Nikon",
    "GoPro", "Fitbit", "Garmin", "Logitech", "Razer", "Corsair"
  ]
  
  for (const brand of commonBrands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      return brand
    }
  }
  
  return words[0] || "Unknown"
}

// ============================================
// API Status Check
// ============================================

export function getApiStatus(): {
  amazon: boolean
  walmart: boolean
  ebay: boolean
  configured: boolean
} {
  return {
    amazon: !!RAPIDAPI_KEY,
    walmart: !!RAPIDAPI_KEY,
    ebay: !!EBAY_APP_ID,
    configured: !!RAPIDAPI_KEY || !!EBAY_APP_ID,
  }
}
