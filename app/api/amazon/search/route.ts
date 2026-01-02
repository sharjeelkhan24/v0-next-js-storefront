import { NextResponse } from "next/server"

// Amazon Product Search API (Mock Implementation)
// Returns mock product data for development and testing
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || "electronics"
    const category = searchParams.get("category") || "All"

    console.log(`[v0] Amazon search: query="${query}", category="${category}"`)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Mock Amazon product data
    const mockProducts = [
      {
        id: "B09G9FPHY6",
        title: `${query} - Premium Wireless Headphones`,
        price: 299.99,
        currency: "USD",
        image: "/wireless-headphones.png",
        url: "#",
        condition: "New",
        features: [
          "Active Noise Cancellation",
          "30-hour battery life",
          "Premium sound quality",
          "Comfortable over-ear design",
        ],
        source: "amazon",
        rating: 4.5,
        reviews: 1234,
      },
      {
        id: "B08N5WRWNW",
        title: `${query} - Smart Watch Pro`,
        price: 399.99,
        currency: "USD",
        image: "/smartwatch-lifestyle.png",
        url: "#",
        condition: "New",
        features: ["Heart rate monitoring", "GPS tracking", "Water resistant", "7-day battery life"],
        source: "amazon",
        rating: 4.7,
        reviews: 2341,
      },
      {
        id: "B0BDJ7CQWX",
        title: `${query} - 4K Action Camera`,
        price: 249.99,
        currency: "USD",
        image: "/action-camera.png",
        url: "#",
        condition: "New",
        features: ["4K video recording", "Waterproof up to 30m", "Image stabilization", "Wide angle lens"],
        source: "amazon",
        rating: 4.3,
        reviews: 876,
      },
      {
        id: "B09V3KXJPB",
        title: `${query} - Portable Bluetooth Speaker`,
        price: 79.99,
        currency: "USD",
        image: "/bluetooth-speaker.jpg",
        url: "#",
        condition: "New",
        features: ["360-degree sound", "12-hour battery", "IPX7 waterproof", "USB-C charging"],
        source: "amazon",
        rating: 4.6,
        reviews: 3421,
      },
      {
        id: "B0B7CPSN6K",
        title: `${query} - Gaming Keyboard RGB`,
        price: 129.99,
        currency: "USD",
        image: "/gaming-keyboard.png",
        url: "#",
        condition: "New",
        features: ["Mechanical switches", "RGB backlighting", "Programmable keys", "Wrist rest included"],
        source: "amazon",
        rating: 4.4,
        reviews: 1567,
      },
      {
        id: "B09JQMJHXY",
        title: `${query} - Wireless Mouse Ergonomic`,
        price: 49.99,
        currency: "USD",
        image: "/wireless-mouse.png",
        url: "#",
        condition: "New",
        features: ["Ergonomic design", "6 programmable buttons", "Long battery life", "Adjustable DPI"],
        source: "amazon",
        rating: 4.5,
        reviews: 2109,
      },
      {
        id: "B0BSHF7WHW",
        title: `${query} - USB-C Hub Multiport`,
        price: 39.99,
        currency: "USD",
        image: "/usb-hub.png",
        url: "#",
        condition: "New",
        features: ["7-in-1 connectivity", "4K HDMI output", "100W power delivery", "Aluminum construction"],
        source: "amazon",
        rating: 4.2,
        reviews: 892,
      },
      {
        id: "B09BKNRJJF",
        title: `${query} - Laptop Stand Adjustable`,
        price: 34.99,
        currency: "USD",
        image: "/laptop-stand.png",
        url: "#",
        condition: "New",
        features: ["6 height adjustments", "Aluminum alloy", "Heat dissipation", "Fits 10-17 inch laptops"],
        source: "amazon",
        rating: 4.7,
        reviews: 4532,
      },
    ]

    return NextResponse.json({
      success: true,
      products: mockProducts,
      count: mockProducts.length,
      query,
      category,
    })
  } catch (error: any) {
    console.error("[v0] Amazon search error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to search Amazon products",
      },
      { status: 500 },
    )
  }
}
