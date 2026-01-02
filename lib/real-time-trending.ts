import type { FairCartProduct } from "./faircart-inventory"

export interface TrendingSession {
  products: FairCartProduct[]
  expiresAt: Date
  timeRemaining: number
}

// Simulated real-time trending products (in production, fetch from Amazon API, Google Trends, etc.)
export async function fetchRealTimeTrending(allProducts: FairCartProduct[]): Promise<FairCartProduct[]> {
  // In production, this would fetch from:
  // - Amazon Best Sellers API
  // - Google Trends API
  // - Social media trending APIs
  // For now, we'll simulate by picking high-value arbitrage products

  const highArbitrageProducts = allProducts
    .filter((p) => p.savings > 30 && p.savingsPercent >= 20)
    .sort((a, b) => b.savings - a.savings)
    .slice(0, 12)

  // Shuffle to simulate changing trends
  return highArbitrageProducts.sort(() => Math.random() - 0.5).slice(0, 8)
}

export function createTrendingSession(products: FairCartProduct[]): TrendingSession {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000) // 30 minutes

  return {
    products,
    expiresAt,
    timeRemaining: 30 * 60 * 1000,
  }
}

export function formatTimeRemaining(milliseconds: number): string {
  const minutes = Math.floor(milliseconds / 60000)
  const seconds = Math.floor((milliseconds % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}
