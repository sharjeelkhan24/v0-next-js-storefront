import { NextResponse } from "next"
import type { DashboardProduct } from "@/lib/dashboard-products"

/**
 * Amazon Best Sellers API Route (Mock Implementation)
 * Production-ready with proper error handling, logging, and TypeScript types
 *
 * In production, this would connect to the actual Amazon Product Advertising API
 * For now, it returns mock data that simulates Amazon Best Sellers with dynamic pricing
 */

interface AmazonBestSellerResponse {
  products: DashboardProduct[]
  lastUpdated: string
  source: string
}

/**
 * GET /api/amazon/bestsellers
 * Fetches Amazon Best Sellers data (mock implementation)
 * Returns products with randomized prices to simulate real-time price changes
 */
export async function GET() {
  try {
    console.log("[v0] Fetching Amazon Best Sellers data...")

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Mock Amazon Best Sellers data with dynamic pricing
    const mockBestSellers: DashboardProduct[] = [
      {
        id: "amz-aipc-001",
        name: "Dell XPS 15 AI Edition",
        category: "AI-PCs",
        price: generateDynamicPrice(2499.99, 0.05), // ±5% price variation
        stock: Math.floor(Math.random() * 50) + 20,
        stockStatus: "in-stock",
        image: "/dell-xps-laptop-ai.jpg",
        sku: "DXPS15AI-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-aipc-002",
        name: "HP Spectre x360 Neural",
        category: "AI-PCs",
        price: generateDynamicPrice(2199.99, 0.05),
        stock: Math.floor(Math.random() * 15) + 5,
        stockStatus: Math.random() > 0.5 ? "in-stock" : "low-stock",
        image: "/hp-spectre-laptop.jpg",
        sku: "HPSX360N-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-aipc-003",
        name: "Lenovo ThinkPad X1 Carbon AI",
        category: "AI-PCs",
        price: generateDynamicPrice(2799.99, 0.05),
        stock: Math.floor(Math.random() * 10),
        stockStatus: Math.random() > 0.7 ? "out-of-stock" : "low-stock",
        image: "/lenovo-thinkpad.png",
        sku: "LTX1CAI-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-aipc-004",
        name: "ASUS ROG Zephyrus AI Pro",
        category: "AI-PCs",
        price: generateDynamicPrice(3299.99, 0.05),
        stock: Math.floor(Math.random() * 30) + 15,
        stockStatus: "in-stock",
        image: "/asus-rog-gaming-laptop.jpg",
        sku: "ARZAI-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-ssd-001",
        name: "Samsung 990 PRO 2TB NVMe",
        category: "SSDs",
        price: generateDynamicPrice(189.99, 0.08), // SSDs have more price volatility
        stock: Math.floor(Math.random() * 200) + 100,
        stockStatus: "in-stock",
        image: "/samsung-ssd-drive.jpg",
        sku: "S990P2TB-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-ssd-002",
        name: "WD Black SN850X 4TB",
        category: "SSDs",
        price: generateDynamicPrice(349.99, 0.08),
        stock: Math.floor(Math.random() * 20) + 5,
        stockStatus: Math.random() > 0.6 ? "in-stock" : "low-stock",
        image: "/western-digital-ssd.jpg",
        sku: "WDSN850X4-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-ssd-003",
        name: "Crucial P5 Plus 1TB",
        category: "SSDs",
        price: generateDynamicPrice(99.99, 0.08),
        stock: Math.floor(Math.random() * 300) + 150,
        stockStatus: "in-stock",
        image: "/crucial-ssd.jpg",
        sku: "CP5P1TB-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-ssd-004",
        name: "Seagate FireCuda 530 2TB",
        category: "SSDs",
        price: generateDynamicPrice(229.99, 0.08),
        stock: Math.floor(Math.random() * 5),
        stockStatus: Math.random() > 0.5 ? "out-of-stock" : "low-stock",
        image: "/seagate-ssd.jpg",
        sku: "SFC5302TB-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-iot-001",
        name: "Raspberry Pi 5 8GB Kit",
        category: "IoT",
        price: generateDynamicPrice(129.99, 0.03), // IoT devices have less price variation
        stock: Math.floor(Math.random() * 100) + 50,
        stockStatus: "in-stock",
        image: "/raspberry-pi-board.jpg",
        sku: "RPI58GB-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-iot-002",
        name: "Arduino Portenta H7",
        category: "IoT",
        price: generateDynamicPrice(99.99, 0.03),
        stock: Math.floor(Math.random() * 15) + 3,
        stockStatus: Math.random() > 0.5 ? "in-stock" : "low-stock",
        image: "/arduino-board.jpg",
        sku: "APH7-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-iot-003",
        name: "ESP32-S3 DevKit",
        category: "IoT",
        price: generateDynamicPrice(24.99, 0.03),
        stock: Math.floor(Math.random() * 400) + 200,
        stockStatus: "in-stock",
        image: "/esp32-development-board.jpg",
        sku: "ESP32S3DK-AMZ",
        lastUpdated: new Date(),
      },
      {
        id: "amz-iot-004",
        name: "NVIDIA Jetson Orin Nano",
        category: "IoT",
        price: generateDynamicPrice(499.99, 0.03),
        stock: Math.floor(Math.random() * 20) + 8,
        stockStatus: "in-stock",
        image: "/nvidia-jetson-board.jpg",
        sku: "NJON-AMZ",
        lastUpdated: new Date(),
      },
    ]

    const response: AmazonBestSellerResponse = {
      products: mockBestSellers,
      lastUpdated: new Date().toISOString(),
      source: "Amazon Best Sellers (Mock API)",
    }

    console.log(`[v0] Successfully fetched ${mockBestSellers.length} products from Amazon Best Sellers`)

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600", // Cache for 6 hours
      },
    })
  } catch (error) {
    console.error("[v0] Error fetching Amazon Best Sellers:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch Amazon Best Sellers",
        message: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

/**
 * Generate dynamic price with random variation
 * Simulates real-time price changes from Amazon
 * @param basePrice - The base price
 * @param variationPercent - Maximum variation as decimal (e.g., 0.05 = ±5%)
 * @returns Price with random variation
 */
function generateDynamicPrice(basePrice: number, variationPercent: number): number {
  const variation = basePrice * variationPercent
  const randomVariation = (Math.random() - 0.5) * 2 * variation
  return Math.round((basePrice + randomVariation) * 100) / 100
}
