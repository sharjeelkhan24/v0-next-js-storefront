/**
 * MongoDB Database Client
 * 
 * Connection pooling and database operations
 */

import { MongoClient, Db, Collection, ObjectId } from "mongodb"
import { logger } from "../logger"
import type {
  User,
  Product,
  Cart,
  Order,
  InventorySync,
  PriceAlert,
  Coupon,
  AnalyticsEvent,
  DailySales,
  AdminLog,
  Notification,
} from "./schema"

const log = logger.child({ module: "database" })

// ============================================
// Connection Configuration
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017"
const DB_NAME = process.env.DB_NAME || "faircart"

// Connection options
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
}

// ============================================
// Global Connection (Singleton)
// ============================================

let client: MongoClient | null = null
let db: Db | null = null

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

async function getClient(): Promise<MongoClient> {
  if (client) {
    return client
  }

  // In development, use global variable to preserve connection across hot reloads
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI, options)
      global._mongoClientPromise = client.connect()
    }
    client = await global._mongoClientPromise
  } else {
    // In production, create new client
    client = new MongoClient(MONGODB_URI, options)
    await client.connect()
  }

  log.info("MongoDB connected", { database: DB_NAME })
  return client
}

export async function getDb(): Promise<Db> {
  if (db) {
    return db
  }
  
  const client = await getClient()
  db = client.db(DB_NAME)
  
  // Ensure indexes on first connection
  await ensureIndexes(db)
  
  return db
}

// ============================================
// Collection Helpers
// ============================================

export async function getCollection<T>(name: string): Promise<Collection<T>> {
  const database = await getDb()
  return database.collection<T>(name)
}

// Typed collection getters
export const collections = {
  users: () => getCollection<User>("users"),
  products: () => getCollection<Product>("products"),
  carts: () => getCollection<Cart>("carts"),
  orders: () => getCollection<Order>("orders"),
  inventorySync: () => getCollection<InventorySync>("inventory_sync"),
  priceAlerts: () => getCollection<PriceAlert>("price_alerts"),
  coupons: () => getCollection<Coupon>("coupons"),
  analytics: () => getCollection<AnalyticsEvent>("analytics"),
  dailySales: () => getCollection<DailySales>("daily_sales"),
  adminLogs: () => getCollection<AdminLog>("admin_logs"),
  notifications: () => getCollection<Notification>("notifications"),
}

// ============================================
// Index Creation
// ============================================

async function ensureIndexes(db: Db): Promise<void> {
  try {
    // Users indexes
    await db.collection("users").createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { "providers.google": 1 }, sparse: true },
      { key: { role: 1 } },
      { key: { createdAt: -1 } },
    ])

    // Products indexes
    await db.collection("products").createIndexes([
      { key: { sourceId: 1, source: 1 }, unique: true },
      { key: { name: "text", brand: "text", description: "text" } },
      { key: { category: 1 } },
      { key: { price: 1 } },
      { key: { rating: -1 } },
      { key: { isActive: 1, isFeatured: 1 } },
      { key: { lastSyncedAt: 1 } },
      { key: { "inventory.inStock": 1 } },
    ])

    // Carts indexes
    await db.collection("carts").createIndexes([
      { key: { userId: 1 }, sparse: true },
      { key: { sessionId: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },  // TTL index
    ])

    // Orders indexes
    await db.collection("orders").createIndexes([
      { key: { orderNumber: 1 }, unique: true },
      { key: { userId: 1 } },
      { key: { status: 1 } },
      { key: { createdAt: -1 } },
      { key: { "payment.status": 1 } },
      { key: { "fulfillment.status": 1 } },
    ])

    // Inventory sync indexes
    await db.collection("inventory_sync").createIndexes([
      { key: { productId: 1 } },
      { key: { nextSyncAt: 1 } },
      { key: { status: 1 } },
    ])

    // Price alerts indexes
    await db.collection("price_alerts").createIndexes([
      { key: { userId: 1 } },
      { key: { productId: 1 } },
      { key: { isActive: 1, isTriggered: 1 } },
    ])

    // Coupons indexes
    await db.collection("coupons").createIndexes([
      { key: { code: 1 }, unique: true },
      { key: { isActive: 1, validFrom: 1, validUntil: 1 } },
    ])

    // Analytics indexes
    await db.collection("analytics").createIndexes([
      { key: { type: 1, timestamp: -1 } },
      { key: { userId: 1 }, sparse: true },
      { key: { sessionId: 1 } },
      { key: { timestamp: -1 } },
    ])

    // Daily sales indexes
    await db.collection("daily_sales").createIndexes([
      { key: { date: 1 }, unique: true },
    ])

    // Admin logs indexes
    await db.collection("admin_logs").createIndexes([
      { key: { adminId: 1 } },
      { key: { action: 1 } },
      { key: { timestamp: -1 } },
    ])

    // Notifications indexes
    await db.collection("notifications").createIndexes([
      { key: { userId: 1, isRead: 1 } },
      { key: { createdAt: -1 } },
    ])

    log.info("Database indexes ensured")
  } catch (error) {
    log.error("Failed to create indexes", { error })
  }
}

// ============================================
// Helper Functions
// ============================================

export function toObjectId(id: string): ObjectId {
  return new ObjectId(id)
}

export function generateId(): string {
  return new ObjectId().toHexString()
}

export function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${year}-${random}`
}

// ============================================
// Health Check
// ============================================

export async function checkDbHealth(): Promise<{
  connected: boolean
  latency: number
  error?: string
}> {
  const start = Date.now()
  
  try {
    const database = await getDb()
    await database.command({ ping: 1 })
    
    return {
      connected: true,
      latency: Date.now() - start,
    }
  } catch (error) {
    return {
      connected: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// ============================================
// Graceful Shutdown
// ============================================

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close()
    client = null
    db = null
    log.info("MongoDB connection closed")
  }
}

// Handle process termination
if (typeof process !== "undefined") {
  process.on("SIGINT", closeConnection)
  process.on("SIGTERM", closeConnection)
}
