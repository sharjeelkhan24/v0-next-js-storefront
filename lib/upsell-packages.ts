import type { CartItem } from "./cart-context"

export interface UpsellPackage {
  id: string
  name: string
  description: string
  price: number
  category: "financing" | "warranty" | "insurance" | "moving" | "smart-home"
  dealerProfit: number
  recommended?: boolean
}

export interface MovingPackage {
  name: string
  description: string
  price: number
  dealerCommission: number
}

export interface SmartHomePackage {
  name: string
  description: string
  price: number
  dealerCommission: number
}

/**
 * Determine product category from cart items
 */
export function detectProductCategory(items: CartItem[]): "electronics" | "automotive" | "real-estate" | "mixed" {
  const hasElectronics = items.some(
    (item) =>
      item.name.toLowerCase().includes("laptop") ||
      item.name.toLowerCase().includes("phone") ||
      item.name.toLowerCase().includes("headphones") ||
      item.name.toLowerCase().includes("watch") ||
      item.name.toLowerCase().includes("camera"),
  )

  const hasAutomotive = items.some(
    (item) =>
      item.name.toLowerCase().includes("car") ||
      item.name.toLowerCase().includes("vehicle") ||
      item.name.toLowerCase().includes("truck") ||
      item.name.toLowerCase().includes("suv"),
  )

  const hasRealEstate = items.some(
    (item) =>
      item.name.toLowerCase().includes("home") ||
      item.name.toLowerCase().includes("house") ||
      item.name.toLowerCase().includes("property") ||
      item.name.toLowerCase().includes("condo"),
  )

  const categories = [hasElectronics, hasAutomotive, hasRealEstate].filter(Boolean).length

  if (categories > 1) return "mixed"
  if (hasAutomotive) return "automotive"
  if (hasRealEstate) return "real-estate"
  return "electronics"
}

/**
 * Get relevant upsell packages based on cart contents
 */
export function getRelevantUpsells(items: CartItem[], total: number): UpsellPackage[] {
  const category = detectProductCategory(items)
  const upsells: UpsellPackage[] = []

  // Electronics upsells
  if (category === "electronics" || category === "mixed") {
    upsells.push(
      {
        id: "electronics-warranty-1yr",
        name: "1-Year Extended Warranty",
        description: "Covers accidental damage, defects, and malfunctions",
        price: Math.round(total * 0.08),
        category: "warranty",
        dealerProfit: Math.round(total * 0.04),
        recommended: true,
      },
      {
        id: "electronics-warranty-2yr",
        name: "2-Year Premium Protection",
        description: "Extended coverage + theft protection",
        price: Math.round(total * 0.15),
        category: "warranty",
        dealerProfit: Math.round(total * 0.075),
      },
    )
  }

  // Automotive upsells
  if (category === "automotive" || category === "mixed") {
    upsells.push(
      {
        id: "auto-financing-60mo",
        name: "60-Month Financing (5.99% APR)",
        description: `$${Math.round((total * 1.015) / 60)}/month with approved credit`,
        price: 0, // Financing is built into payments
        category: "financing",
        dealerProfit: Math.round(total * 0.015),
        recommended: true,
      },
      {
        id: "auto-warranty-powertrain",
        name: "Powertrain Warranty (3 Years)",
        description: "Engine, transmission, drivetrain coverage",
        price: 1200,
        category: "warranty",
        dealerProfit: 600,
      },
      {
        id: "auto-warranty-premium",
        name: "Premium Coverage (4 Years)",
        description: "Powertrain + electrical + A/C",
        price: 2400,
        category: "warranty",
        dealerProfit: 1200,
        recommended: true,
      },
      {
        id: "auto-insurance-gap",
        name: "GAP Insurance",
        description: "Covers loan balance if vehicle is totaled",
        price: 600,
        category: "insurance",
        dealerProfit: 400,
      },
      {
        id: "auto-insurance-tire",
        name: "Tire & Wheel Protection",
        description: "Covers tire damage and wheel repairs",
        price: 450,
        category: "insurance",
        dealerProfit: 250,
      },
    )
  }

  // Real estate upsells
  if (category === "real-estate" || category === "mixed") {
    upsells.push(
      {
        id: "moving-basic",
        name: "Basic Moving Package",
        description: "Local moving service + packing materials",
        price: 1200,
        category: "moving",
        dealerProfit: 300,
      },
      {
        id: "moving-premium",
        name: "Premium Moving Package",
        description: "Full-service moving + packing + storage",
        price: 2800,
        category: "moving",
        dealerProfit: 700,
        recommended: true,
      },
      {
        id: "smart-home-basic",
        name: "Smart Home Starter Kit",
        description: "Smart locks, thermostat, and doorbell",
        price: 800,
        category: "smart-home",
        dealerProfit: 200,
      },
      {
        id: "smart-home-premium",
        name: "Complete Smart Home System",
        description: "Full automation with security cameras and lighting",
        price: 2400,
        category: "smart-home",
        dealerProfit: 600,
        recommended: true,
      },
      {
        id: "home-insurance",
        name: "Home Insurance Bundle",
        description: "Comprehensive home and property coverage",
        price: 150, // Monthly
        category: "insurance",
        dealerProfit: 500, // Annual commission
      },
    )
  }

  return upsells
}

/**
 * Calculate total profit from selected upsells
 */
export function calculateUpsellProfit(selectedUpsells: UpsellPackage[]): number {
  return selectedUpsells.reduce((sum, upsell) => sum + upsell.dealerProfit, 0)
}
