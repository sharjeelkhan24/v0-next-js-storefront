import { type NextRequest, NextResponse } from "next/server"
import { searchVerifiedProducts, fetchAmazonProducts, fetchGoogleShoppingProducts } from "@/lib/real-product-api"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q") || ""
  const category = searchParams.get("category") || ""

  try {
    // First try verified products
    let products = searchVerifiedProducts(query)

    // If API keys are configured, fetch real-time data
    if (process.env.RAINFOREST_API_KEY) {
      const amazonProducts = await fetchAmazonProducts(query, category)
      products = [...products, ...amazonProducts]
    }

    if (process.env.SERPAPI_KEY) {
      const googleProducts = await fetchGoogleShoppingProducts(query)
      products = [...products, ...googleProducts]
    }

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      source: process.env.RAINFOREST_API_KEY ? "live" : "verified",
    })
  } catch (error) {
    console.error("[v0] Product search error:", error)
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500 })
  }
}
