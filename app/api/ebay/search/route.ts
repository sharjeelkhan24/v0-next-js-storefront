import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || "electronics"
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Mock eBay products for v0 preview
    const mockProducts = [
      {
        id: "ebay-001",
        title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
        price: 349.99,
        currency: "USD",
        image: "/wireless-headphones.png",
        url: "https://ebay.com/itm/sony-headphones",
        condition: "New",
        location: "Los Angeles",
        shippingCost: "0",
        seller: "tech_deals_pro",
        source: "ebay",
      },
      {
        id: "ebay-002",
        title: "Apple Watch Series 9 GPS 45mm",
        price: 429.0,
        currency: "USD",
        image: "/smartwatch-lifestyle.png",
        url: "https://ebay.com/itm/apple-watch",
        condition: "New",
        location: "New York",
        shippingCost: "0",
        seller: "apple_authorized",
        source: "ebay",
      },
      {
        id: "ebay-003",
        title: "GoPro HERO12 Black Action Camera",
        price: 399.99,
        currency: "USD",
        image: "/action-camera.png",
        url: "https://ebay.com/itm/gopro-hero12",
        condition: "New",
        location: "Chicago",
        shippingCost: "5.99",
        seller: "camera_outlet",
        source: "ebay",
      },
      {
        id: "ebay-004",
        title: "JBL Flip 6 Portable Bluetooth Speaker",
        price: 129.95,
        currency: "USD",
        image: "/bluetooth-speaker.jpg",
        url: "https://ebay.com/itm/jbl-flip6",
        condition: "New",
        location: "Miami",
        shippingCost: "0",
        seller: "audio_warehouse",
        source: "ebay",
      },
      {
        id: "ebay-005",
        title: "Logitech G Pro X Superlight Gaming Mouse",
        price: 159.99,
        currency: "USD",
        image: "/wireless-mouse.png",
        url: "https://ebay.com/itm/logitech-mouse",
        condition: "New",
        location: "Seattle",
        shippingCost: "0",
        seller: "gaming_gear_hub",
        source: "ebay",
      },
    ]

    const products = mockProducts.slice(0, limit)

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
      total: mockProducts.length,
    })
  } catch (error: any) {
    console.error("[v0] eBay API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch eBay products",
      },
      { status: 500 },
    )
  }
}
