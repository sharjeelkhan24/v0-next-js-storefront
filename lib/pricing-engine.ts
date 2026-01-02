/**
 * Pricing and Markup Engine
 * Automatically calculates profit margins and pricing
 */

export interface PricingConfig {
  sourceCost: number
  shippingCost: number
  platformFee: number
  markupPercentage: number
  category: "electronics" | "automotive" | "real-estate" | "other"
}

export interface PricingBreakdown {
  sourceCost: number
  shippingCost: number
  platformFee: number
  markup: number
  totalCost: number
  sellingPrice: number
  profit: number
  profitMargin: number // percentage
}

/**
 * Get default markup percentage by category
 */
export function getDefaultMarkup(category: string): number {
  const markups: Record<string, number> = {
    electronics: 15, // 15% markup on electronics
    automotive: 8, // 8% on cars (lower margin, higher volume)
    "real-estate": 3, // 3-6% commission
    accessories: 25, // 25% on accessories
    other: 20,
  }

  return markups[category] || 20
}

/**
 * Calculate pricing breakdown
 */
export function calculatePricing(config: PricingConfig): PricingBreakdown {
  const { sourceCost, shippingCost, platformFee, markupPercentage } = config

  // Total cost before markup
  const totalCost = sourceCost + shippingCost + platformFee

  // Calculate markup amount
  const markup = totalCost * (markupPercentage / 100)

  // Final selling price
  const sellingPrice = totalCost + markup

  // Profit is the markup minus any additional costs
  const profit = markup - platformFee

  // Profit margin as percentage
  const profitMargin = (profit / sellingPrice) * 100

  return {
    sourceCost: Math.round(sourceCost * 100) / 100,
    shippingCost: Math.round(shippingCost * 100) / 100,
    platformFee: Math.round(platformFee * 100) / 100,
    markup: Math.round(markup * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    sellingPrice: Math.round(sellingPrice * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    profitMargin: Math.round(profitMargin * 100) / 100,
  }
}

/**
 * Calculate pricing for a product from external source
 */
export function calculateProductPricing(amazonPrice: number, category: string, shippingCost = 5.99): PricingBreakdown {
  const markupPercentage = getDefaultMarkup(category)
  const platformFee = amazonPrice * 0.03 // 3% platform fee

  return calculatePricing({
    sourceCost: amazonPrice,
    shippingCost,
    platformFee,
    markupPercentage,
    category: category as any,
  })
}

/**
 * Bulk pricing calculator for multiple items
 */
export function calculateBulkPricing(items: Array<{ price: number; category: string }>): {
  totalRevenue: number
  totalCost: number
  totalProfit: number
  avgMargin: number
} {
  const breakdowns = items.map((item) => calculateProductPricing(item.price, item.category))

  const totalRevenue = breakdowns.reduce((sum, b) => sum + b.sellingPrice, 0)
  const totalCost = breakdowns.reduce((sum, b) => sum + b.totalCost, 0)
  const totalProfit = breakdowns.reduce((sum, b) => sum + b.profit, 0)
  const avgMargin = (totalProfit / totalRevenue) * 100

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    totalProfit: Math.round(totalProfit * 100) / 100,
    avgMargin: Math.round(avgMargin * 100) / 100,
  }
}

/**
 * Calculate flat profit margin (10-75 cents) based on item cost
 */
export function calculateFlatProfit(supplierCost: number): number {
  if (supplierCost < 5) return 0.1 // 10 cents for items under $5
  if (supplierCost < 10) return 0.25 // 25 cents for items under $10
  if (supplierCost < 20) return 0.35 // 35 cents for items under $20
  if (supplierCost < 50) return 0.5 // 50 cents for items under $50
  return 0.75 // 75 cents for items $50+
}

/**
 * Find cheapest supplier across all stores
 */
export function findCheapestSupplier(productPrices: Record<string, number>): {
  supplier: string
  cost: number
} {
  let cheapest = { supplier: "", cost: Number.POSITIVE_INFINITY }

  for (const [supplier, cost] of Object.entries(productPrices)) {
    if (cost > 0 && cost < cheapest.cost) {
      cheapest = { supplier, cost }
    }
  }

  return cheapest
}
