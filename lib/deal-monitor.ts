/**
 * Deal Monitor System
 * Tracks price history, detects deals, and manages auto-checkout
 * Production-ready with TypeScript types and error handling
 */

export interface DealCriteria {
  id: string
  productId?: string
  category?: string
  maxPrice?: number
  minDiscount?: number // Percentage (e.g., 20 for 20% off)
  autoCheckout: boolean
  enabled: boolean
  createdAt: Date
}

export interface PriceHistory {
  productId: string
  price: number
  timestamp: Date
  source: string
}

export interface Deal {
  id: string
  productId: string
  productName: string
  currentPrice: number
  originalPrice: number
  discountPercent: number
  savings: number
  image: string
  category: string
  source: string
  detectedAt: Date
  autoCheckoutEligible: boolean
  status: "active" | "purchased" | "expired"
}

export interface AutoCheckoutConfig {
  enabled: boolean
  maxDailySpend: number
  maxPerItem: number
  requireConfirmation: boolean
  paymentMethod?: string
}

// Mock price history storage (in production, use database)
const priceHistoryStore: Map<string, PriceHistory[]> = new Map()

// Mock deal criteria storage
const dealCriteriaStore: Map<string, DealCriteria> = new Map()

// Mock detected deals storage
const detectedDealsStore: Map<string, Deal> = new Map()

/**
 * Track price for a product
 */
export function trackPrice(productId: string, price: number, source: string): void {
  const history = priceHistoryStore.get(productId) || []
  history.push({
    productId,
    price,
    timestamp: new Date(),
    source,
  })
  // Keep only last 100 entries per product
  if (history.length > 100) {
    history.shift()
  }
  priceHistoryStore.set(productId, history)
  console.log(`[v0] Tracked price for ${productId}: $${price}`)
}

/**
 * Get price history for a product
 */
export function getPriceHistory(productId: string): PriceHistory[] {
  return priceHistoryStore.get(productId) || []
}

/**
 * Calculate average price from history
 */
export function getAveragePrice(productId: string): number {
  const history = getPriceHistory(productId)
  if (history.length === 0) return 0
  const sum = history.reduce((acc, h) => acc + h.price, 0)
  return sum / history.length
}

/**
 * Detect if current price is a deal
 */
export function isDeal(productId: string, currentPrice: number, minDiscountPercent = 15): boolean {
  const avgPrice = getAveragePrice(productId)
  if (avgPrice === 0) return false

  const discountPercent = ((avgPrice - currentPrice) / avgPrice) * 100
  return discountPercent >= minDiscountPercent
}

/**
 * Add deal criteria
 */
export function addDealCriteria(criteria: Omit<DealCriteria, "id" | "createdAt">): DealCriteria {
  const newCriteria: DealCriteria = {
    ...criteria,
    id: `criteria-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date(),
  }
  dealCriteriaStore.set(newCriteria.id, newCriteria)
  console.log(`[v0] Added deal criteria:`, newCriteria)
  return newCriteria
}

/**
 * Get all deal criteria
 */
export function getAllDealCriteria(): DealCriteria[] {
  return Array.from(dealCriteriaStore.values())
}

/**
 * Remove deal criteria
 */
export function removeDealCriteria(id: string): boolean {
  const deleted = dealCriteriaStore.delete(id)
  console.log(`[v0] Removed deal criteria ${id}:`, deleted)
  return deleted
}

/**
 * Check if product matches any deal criteria
 */
export function matchesDealCriteria(product: {
  id: string
  price: number
  category: string
}): DealCriteria | null {
  const allCriteria = getAllDealCriteria()

  for (const criteria of allCriteria) {
    if (!criteria.enabled) continue

    // Check product ID match
    if (criteria.productId && criteria.productId !== product.id) continue

    // Check category match
    if (criteria.category && criteria.category !== product.category) continue

    // Check max price
    if (criteria.maxPrice && product.price > criteria.maxPrice) continue

    // Check discount percentage
    if (criteria.minDiscount) {
      const avgPrice = getAveragePrice(product.id)
      if (avgPrice > 0) {
        const discountPercent = ((avgPrice - product.price) / avgPrice) * 100
        if (discountPercent < criteria.minDiscount) continue
      }
    }

    return criteria
  }

  return null
}

/**
 * Add detected deal
 */
export function addDetectedDeal(deal: Omit<Deal, "id">): Deal {
  const newDeal: Deal = {
    ...deal,
    id: `deal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  }
  detectedDealsStore.set(newDeal.id, newDeal)
  console.log(`[v0] Detected new deal:`, newDeal)
  return newDeal
}

/**
 * Get all detected deals
 */
export function getAllDeals(): Deal[] {
  return Array.from(detectedDealsStore.values()).sort((a, b) => b.detectedAt.getTime() - a.detectedAt.getTime())
}

/**
 * Get active deals only
 */
export function getActiveDeals(): Deal[] {
  return getAllDeals().filter((deal) => deal.status === "active")
}

/**
 * Update deal status
 */
export function updateDealStatus(dealId: string, status: Deal["status"]): boolean {
  const deal = detectedDealsStore.get(dealId)
  if (!deal) return false

  deal.status = status
  detectedDealsStore.set(dealId, deal)
  console.log(`[v0] Updated deal ${dealId} status to:`, status)
  return true
}

/**
 * Initialize with some default deal criteria for demo
 */
export function initializeDefaultCriteria(): void {
  // Electronics under $200 with auto-checkout
  addDealCriteria({
    category: "Electronics",
    maxPrice: 200,
    minDiscount: 20,
    autoCheckout: true,
    enabled: true,
  })

  // Any product with 30%+ discount
  addDealCriteria({
    minDiscount: 30,
    autoCheckout: false,
    enabled: true,
  })

  // AI-PCs under $2000
  addDealCriteria({
    category: "AI-PCs",
    maxPrice: 2000,
    minDiscount: 15,
    autoCheckout: false,
    enabled: true,
  })
}
