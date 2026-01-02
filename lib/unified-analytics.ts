import type { Deal } from "./deal-monitor"
import type { CraigslistCar } from "./craigslist-cars"
import type { Property } from "./property-data"

/**
 * Unified Analytics System
 * Aggregates data across all three engines: Electronics, Cars, Real Estate
 */

export interface EngineMetrics {
  name: string
  revenue: number
  activeListings: number
  pendingDeals: number
  conversionRate: number
  avgTicketSize: number
  trend: "up" | "down" | "stable"
}

export interface UnifiedMetrics {
  totalRevenue: number
  totalListings: number
  totalDeals: number
  engines: {
    electronics: EngineMetrics
    cars: EngineMetrics
    realEstate: EngineMetrics
  }
  topPerformers: {
    product: string
    revenue: number
    category: string
  }[]
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: "sale" | "listing" | "deal" | "inquiry"
  title: string
  amount?: number
  timestamp: Date
  engine: "electronics" | "cars" | "realEstate"
}

export interface ArbitrageOpportunity {
  id: string
  type: "car" | "property" | "electronics"
  title: string
  currentPrice: number
  estimatedValue: number
  profitPotential: number
  profitMargin: number
  confidence: number
  source: string
  image: string
}

/**
 * Calculate electronics engine metrics
 */
export function calculateElectronicsMetrics(deals: Deal[], orders: any[]): EngineMetrics {
  const electronicsOrders = orders.filter((o) => o.items.some((i: any) => i.category === "Electronics"))
  const revenue = electronicsOrders.reduce((sum, o) => sum + o.total, 0)
  const activeDeals = deals.filter((d) => d.status === "active" && d.category === "Electronics").length

  return {
    name: "Electronics",
    revenue,
    activeListings: deals.length,
    pendingDeals: activeDeals,
    conversionRate: 12.5,
    avgTicketSize: revenue / Math.max(electronicsOrders.length, 1),
    trend: "up",
  }
}

/**
 * Calculate cars engine metrics
 */
export function calculateCarsMetrics(cars: CraigslistCar[], orders: any[]): EngineMetrics {
  const carOrders = orders.filter((o) => o.items.some((i: any) => i.category === "Automotive"))
  const revenue = carOrders.reduce((sum, o) => sum + o.total, 0)

  return {
    name: "Cars",
    revenue,
    activeListings: cars.length,
    pendingDeals: Math.floor(cars.length * 0.15),
    conversionRate: 8.3,
    avgTicketSize: revenue / Math.max(carOrders.length, 1),
    trend: "up",
  }
}

/**
 * Calculate real estate engine metrics
 */
export function calculateRealEstateMetrics(properties: Property[], orders: any[]): EngineMetrics {
  const propertyInquiries = orders.filter((o) => o.items.some((i: any) => i.category === "Real Estate"))
  const revenue = propertyInquiries.reduce((sum, o) => sum + o.total, 0)

  return {
    name: "Real Estate",
    revenue,
    activeListings: 1,
    pendingDeals: 1,
    conversionRate: 15.7,
    avgTicketSize: revenue / Math.max(propertyInquiries.length, 1),
    trend: "stable",
  }
}

/**
 * Generate AI arbitrage opportunities
 */
export function generateArbitrageOpportunities(
  deals: Deal[],
  cars: CraigslistCar[],
  properties: Property[],
): ArbitrageOpportunity[] {
  const opportunities: ArbitrageOpportunity[] = []

  // Electronics arbitrage
  deals.slice(0, 2).forEach((deal) => {
    opportunities.push({
      id: `arb-elec-${deal.id}`,
      type: "electronics",
      title: deal.productName,
      currentPrice: deal.currentPrice,
      estimatedValue: deal.originalPrice * 1.15,
      profitPotential: deal.originalPrice * 1.15 - deal.currentPrice,
      profitMargin: ((deal.originalPrice * 1.15 - deal.currentPrice) / deal.currentPrice) * 100,
      confidence: 85 + Math.random() * 10,
      source: deal.source,
      image: deal.image,
    })
  })

  // Car arbitrage
  const undervaluedCars = cars.filter((car) => car.condition === "excellent" && car.mileage < 40000).slice(0, 2)
  undervaluedCars.forEach((car) => {
    const estimatedValue = car.price * 1.25
    opportunities.push({
      id: `arb-car-${car.id}`,
      type: "car",
      title: car.title,
      currentPrice: car.price,
      estimatedValue,
      profitPotential: estimatedValue - car.price,
      profitMargin: ((estimatedValue - car.price) / car.price) * 100,
      confidence: 78 + Math.random() * 12,
      source: "Craigslist",
      image: car.image,
    })
  })

  // Real estate arbitrage
  properties.forEach((property) => {
    const estimatedValue = property.price * 1.08
    opportunities.push({
      id: `arb-prop-${property.id}`,
      type: "property",
      title: property.title,
      currentPrice: property.price,
      estimatedValue,
      profitPotential: estimatedValue - property.price,
      profitMargin: ((estimatedValue - property.price) / property.price) * 100,
      confidence: 72 + Math.random() * 8,
      source: "MLS",
      image: property.images[0],
    })
  })

  return opportunities.sort((a, b) => b.profitPotential - a.profitPotential)
}

/**
 * Generate recent activity feed
 */
export function generateRecentActivity(deals: Deal[], orders: any[]): ActivityItem[] {
  const activities: ActivityItem[] = []

  // Add recent deals
  deals.slice(0, 3).forEach((deal) => {
    activities.push({
      id: `activity-deal-${deal.id}`,
      type: "deal",
      title: `New deal detected: ${deal.productName}`,
      amount: deal.savings,
      timestamp: deal.detectedAt,
      engine: "electronics",
    })
  })

  // Add recent orders
  orders.slice(0, 3).forEach((order) => {
    activities.push({
      id: `activity-order-${order.id}`,
      type: "sale",
      title: `Order ${order.orderNumber} completed`,
      amount: order.total,
      timestamp: order.createdAt,
      engine: "electronics",
    })
  })

  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 10)
}
