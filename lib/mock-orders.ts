export type FulfillmentStatus = "pending" | "placed" | "shipped"

export interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  sourceUrl: string
  image: string
}

export interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  total: number
  status: FulfillmentStatus
  items: OrderItem[]
  createdAt: Date
  shippingAddress: {
    street: string
    city: string
    state: string
    zip: string
  }
}

// Mock orders data with source URLs
export const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2025-001",
    customerName: "John Smith",
    customerEmail: "john.smith@example.com",
    total: 1299.99,
    status: "shipped",
    createdAt: new Date("2025-01-15T10:30:00"),
    shippingAddress: {
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zip: "94102",
    },
    items: [
      {
        id: "item-1",
        name: "Dell XPS 15 AI-Powered Laptop",
        price: 1299.99,
        quantity: 1,
        sourceUrl: "https://www.amazon.com/dp/B0EXAMPLE1",
        image: "/dell-xps-laptop-ai.jpg",
      },
    ],
  },
  {
    id: "2",
    orderNumber: "ORD-2025-002",
    customerName: "Sarah Johnson",
    customerEmail: "sarah.j@example.com",
    total: 899.98,
    status: "placed",
    createdAt: new Date("2025-01-16T14:20:00"),
    shippingAddress: {
      street: "456 Oak Ave",
      city: "Austin",
      state: "TX",
      zip: "78701",
    },
    items: [
      {
        id: "item-2",
        name: "Samsung 990 PRO 2TB NVMe SSD",
        price: 199.99,
        quantity: 2,
        sourceUrl: "https://www.ebay.com/itm/EXAMPLE2",
        image: "/samsung-ssd-drive.jpg",
      },
      {
        id: "item-3",
        name: "Crucial P5 Plus 1TB SSD",
        price: 149.99,
        quantity: 1,
        sourceUrl: "https://www.amazon.com/dp/B0EXAMPLE3",
        image: "/crucial-ssd.jpg",
      },
      {
        id: "item-4",
        name: "WD Black SN850X 2TB",
        price: 349.99,
        quantity: 1,
        sourceUrl: "https://www.amazon.com/dp/B0EXAMPLE4",
        image: "/western-digital-ssd.jpg",
      },
    ],
  },
  {
    id: "3",
    orderNumber: "ORD-2025-003",
    customerName: "Michael Chen",
    customerEmail: "m.chen@example.com",
    total: 2599.97,
    status: "pending",
    createdAt: new Date("2025-01-17T09:15:00"),
    shippingAddress: {
      street: "789 Pine Rd",
      city: "Seattle",
      state: "WA",
      zip: "98101",
    },
    items: [
      {
        id: "item-5",
        name: "HP Spectre x360 AI PC",
        price: 1799.99,
        quantity: 1,
        sourceUrl: "https://www.amazon.com/dp/B0EXAMPLE5",
        image: "/hp-spectre-laptop.jpg",
      },
      {
        id: "item-6",
        name: "Lenovo ThinkPad X1 Carbon",
        price: 1599.99,
        quantity: 1,
        sourceUrl: "https://www.ebay.com/itm/EXAMPLE6",
        image: "/lenovo-thinkpad.png",
      },
      {
        id: "item-7",
        name: "Samsung 980 PRO 1TB",
        price: 199.99,
        quantity: 1,
        sourceUrl: "https://www.amazon.com/dp/B0EXAMPLE7",
        image: "/samsung-ssd-drive.jpg",
      },
    ],
  },
  {
    id: "4",
    orderNumber: "ORD-2025-004",
    customerName: "Emily Rodriguez",
    customerEmail: "emily.r@example.com",
    total: 449.97,
    status: "shipped",
    createdAt: new Date("2025-01-18T16:45:00"),
    shippingAddress: {
      street: "321 Elm St",
      city: "Boston",
      state: "MA",
      zip: "02101",
    },
    items: [
      {
        id: "item-8",
        name: "Raspberry Pi 5 Starter Kit",
        price: 149.99,
        quantity: 3,
        sourceUrl: "https://www.amazon.com/dp/B0EXAMPLE8",
        image: "/raspberry-pi-kit.jpg",
      },
    ],
  },
  {
    id: "5",
    orderNumber: "ORD-2025-005",
    customerName: "David Park",
    customerEmail: "david.park@example.com",
    total: 1899.96,
    status: "placed",
    createdAt: new Date("2025-01-19T11:30:00"),
    shippingAddress: {
      street: "555 Maple Dr",
      city: "Denver",
      state: "CO",
      zip: "80201",
    },
    items: [
      {
        id: "item-9",
        name: "ASUS ROG Zephyrus Gaming Laptop",
        price: 1899.99,
        quantity: 1,
        sourceUrl: "https://www.ebay.com/itm/EXAMPLE9",
        image: "/asus-rog-gaming-laptop.jpg",
      },
    ],
  },
  {
    id: "6",
    orderNumber: "ORD-2025-006",
    customerName: "Lisa Anderson",
    customerEmail: "lisa.a@example.com",
    total: 599.94,
    status: "pending",
    createdAt: new Date("2025-01-20T13:20:00"),
    shippingAddress: {
      street: "888 Cedar Ln",
      city: "Portland",
      state: "OR",
      zip: "97201",
    },
    items: [
      {
        id: "item-10",
        name: "Arduino IoT Starter Bundle",
        price: 99.99,
        quantity: 2,
        sourceUrl: "https://www.amazon.com/dp/B0EXAMPLE10",
        image: "/arduino-iot-kit.jpg",
      },
      {
        id: "item-11",
        name: "ESP32 Development Board Pack",
        price: 79.99,
        quantity: 3,
        sourceUrl: "https://www.amazon.com/dp/B0EXAMPLE11",
        image: "/esp32-dev-board.jpg",
      },
      {
        id: "item-12",
        name: "Zigbee Smart Home Hub",
        price: 159.99,
        quantity: 1,
        sourceUrl: "https://www.ebay.com/itm/EXAMPLE12",
        image: "/smart-home-hub.png",
      },
    ],
  },
]
