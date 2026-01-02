import { NextResponse } from "next"
import { products } from "@/lib/products"

/**
 * Product API Route
 * GET /api/products - Returns all products with last updated timestamp
 * Built with Next.js 16, TypeScript, and proper error handling
 */

// In-memory cache for last updated timestamp
let lastUpdated = new Date().toISOString()

/**
 * GET handler - Fetch all products
 * Returns products array with metadata including last updated timestamp
 */
export async function GET() {
  try {
    console.log("[v0] GET /api/products - Fetching products")

    // Simulate price fluctuations (±5%) to demonstrate live updates
    const updatedProducts = products.map((product) => {
      const priceVariation = 1 + (Math.random() * 0.1 - 0.05) // ±5%
      return {
        ...product,
        price: Math.round(product.price * priceVariation * 100) / 100,
      }
    })

    console.log("[v0] Successfully fetched", updatedProducts.length, "products")

    return NextResponse.json({
      products: updatedProducts,
      lastUpdated,
      source: "IrishTripplets Store",
      count: updatedProducts.length,
    })
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

/**
 * POST handler - Refresh product data
 * Updates the last updated timestamp
 * Called by Vercel Cron Job every 6 hours
 */
export async function POST() {
  try {
    console.log("[v0] POST /api/products - Refreshing product data")

    // Update the last updated timestamp
    lastUpdated = new Date().toISOString()

    console.log("[v0] Product data refreshed at:", lastUpdated)

    return NextResponse.json({
      success: true,
      message: "Product data refreshed successfully",
      lastUpdated,
    })
  } catch (error) {
    console.error("[v0] Error refreshing products:", error)
    return NextResponse.json(
      {
        error: "Failed to refresh products",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
