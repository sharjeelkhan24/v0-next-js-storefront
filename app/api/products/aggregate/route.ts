import { NextResponse } from "next/server"

// Aggregate products from multiple sources
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || "electronics"
    const sources = searchParams.get("sources")?.split(",") || ["amazon", "ebay"]

    const results = await Promise.allSettled([
      sources.includes("amazon")
        ? fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/amazon/search?q=${query}`).then(
            (res) => res.json(),
          )
        : Promise.resolve({ success: false, products: [] }),
      sources.includes("ebay")
        ? fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/ebay/search?q=${query}`).then(
            (res) => res.json(),
          )
        : Promise.resolve({ success: false, products: [] }),
    ])

    const allProducts = results
      .filter((result) => result.status === "fulfilled")
      .flatMap((result: any) => result.value?.products || [])

    // Sort by price (lowest first)
    allProducts.sort((a, b) => a.price - b.price)

    return NextResponse.json({
      success: true,
      products: allProducts,
      count: allProducts.length,
      sources: {
        amazon: results[0].status === "fulfilled" && (results[0] as any).value?.success,
        ebay: results[1].status === "fulfilled" && (results[1] as any).value?.success,
      },
    })
  } catch (error: any) {
    console.error("[v0] Aggregate API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to aggregate products",
      },
      { status: 500 },
    )
  }
}
