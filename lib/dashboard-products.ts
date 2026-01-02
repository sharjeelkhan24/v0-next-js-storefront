/**
 * Dashboard Product Types and Mock Data
 * Production-ready with full TypeScript typing
 */

export type ProductCategory = "AI-PCs" | "SSDs" | "IoT"

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock"

export interface DashboardProduct {
  id: string
  name: string
  category: ProductCategory
  price: number
  stock: number
  stockStatus: StockStatus
  image: string
  sku: string
  lastUpdated: Date
}

/**
 * Mock data for dashboard products
 * Represents a realistic inventory of tech products
 */
export const dashboardProducts: DashboardProduct[] = [
  // AI-PCs
  {
    id: "aipc-001",
    name: "Dell XPS 15 AI Edition",
    category: "AI-PCs",
    price: 2499.99,
    stock: 45,
    stockStatus: "in-stock",
    image: "/dell-xps-laptop-ai.jpg",
    sku: "DXPS15AI",
    lastUpdated: new Date("2025-01-15"),
  },
  {
    id: "aipc-002",
    name: "HP Spectre x360 Neural",
    category: "AI-PCs",
    price: 2199.99,
    stock: 8,
    stockStatus: "low-stock",
    image: "/hp-spectre-laptop.jpg",
    sku: "HPSX360N",
    lastUpdated: new Date("2025-01-20"),
  },
  {
    id: "aipc-003",
    name: "Lenovo ThinkPad X1 Carbon AI",
    category: "AI-PCs",
    price: 2799.99,
    stock: 0,
    stockStatus: "out-of-stock",
    image: "/lenovo-thinkpad.png",
    sku: "LTX1CAI",
    lastUpdated: new Date("2025-01-18"),
  },
  {
    id: "aipc-004",
    name: "ASUS ROG Zephyrus AI Pro",
    category: "AI-PCs",
    price: 3299.99,
    stock: 22,
    stockStatus: "in-stock",
    image: "/asus-rog-gaming-laptop.jpg",
    sku: "ARZAI",
    lastUpdated: new Date("2025-01-22"),
  },
  // SSDs
  {
    id: "ssd-001",
    name: "Samsung 990 PRO 2TB NVMe",
    category: "SSDs",
    price: 189.99,
    stock: 156,
    stockStatus: "in-stock",
    image: "/samsung-ssd-drive.jpg",
    sku: "S990P2TB",
    lastUpdated: new Date("2025-01-21"),
  },
  {
    id: "ssd-002",
    name: "WD Black SN850X 4TB",
    category: "SSDs",
    price: 349.99,
    stock: 7,
    stockStatus: "low-stock",
    image: "/western-digital-ssd.jpg",
    sku: "WDSN850X4",
    lastUpdated: new Date("2025-01-19"),
  },
  {
    id: "ssd-003",
    name: "Crucial P5 Plus 1TB",
    category: "SSDs",
    price: 99.99,
    stock: 203,
    stockStatus: "in-stock",
    image: "/crucial-ssd.jpg",
    sku: "CP5P1TB",
    lastUpdated: new Date("2025-01-23"),
  },
  {
    id: "ssd-004",
    name: "Seagate FireCuda 530 2TB",
    category: "SSDs",
    price: 229.99,
    stock: 0,
    stockStatus: "out-of-stock",
    image: "/seagate-ssd.jpg",
    sku: "SFC5302TB",
    lastUpdated: new Date("2025-01-17"),
  },
  // IoT Devices
  {
    id: "iot-001",
    name: "Raspberry Pi 5 8GB Kit",
    category: "IoT",
    price: 129.99,
    stock: 89,
    stockStatus: "in-stock",
    image: "/raspberry-pi-board.jpg",
    sku: "RPI58GB",
    lastUpdated: new Date("2025-01-24"),
  },
  {
    id: "iot-002",
    name: "Arduino Portenta H7",
    category: "IoT",
    price: 99.99,
    stock: 5,
    stockStatus: "low-stock",
    image: "/arduino-board.jpg",
    sku: "APH7",
    lastUpdated: new Date("2025-01-16"),
  },
  {
    id: "iot-003",
    name: "ESP32-S3 DevKit",
    category: "IoT",
    price: 24.99,
    stock: 342,
    stockStatus: "in-stock",
    image: "/esp32-development-board.jpg",
    sku: "ESP32S3DK",
    lastUpdated: new Date("2025-01-25"),
  },
  {
    id: "iot-004",
    name: "NVIDIA Jetson Orin Nano",
    category: "IoT",
    price: 499.99,
    stock: 12,
    stockStatus: "in-stock",
    image: "/nvidia-jetson-board.jpg",
    sku: "NJON",
    lastUpdated: new Date("2025-01-20"),
  },
]

/**
 * Get stock status badge color
 * @param status - The stock status
 * @returns Tailwind color classes for the badge
 */
export function getStockStatusColor(status: StockStatus): string {
  switch (status) {
    case "in-stock":
      return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
    case "low-stock":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20"
    case "out-of-stock":
      return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20"
    default:
      return "bg-muted text-muted-foreground"
  }
}

/**
 * Get stock status label
 * @param status - The stock status
 * @returns Human-readable label
 */
export function getStockStatusLabel(status: StockStatus): string {
  switch (status) {
    case "in-stock":
      return "In Stock"
    case "low-stock":
      return "Low Stock"
    case "out-of-stock":
      return "Out of Stock"
    default:
      return "Unknown"
  }
}

/**
 * Filter products by category
 * @param products - Array of products to filter
 * @param category - Category to filter by, or "all" for no filter
 * @returns Filtered products array
 */
export function filterProductsByCategory(
  products: DashboardProduct[],
  category: ProductCategory | "all",
): DashboardProduct[] {
  if (category === "all") {
    return products
  }
  return products.filter((product) => product.category === category)
}
