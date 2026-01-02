/**
 * Inventory Sync Service
 * 
 * Automatically syncs product data from external APIs
 * - Updates prices
 * - Checks stock availability
 * - Logs sync history
 * - Triggers price alerts
 */

import { logger } from "../logger"
import { collections, generateId } from "./client"
import * as productRepo from "./repositories/product-repo"
import type { Product, InventorySync, PriceAlert } from "./schema"
import { searchAmazon, getAmazonProduct, isApiConfigured } from "../product-api"

const log = logger.child({ module: "inventory-sync" })

// ============================================
// Configuration
// ============================================

const SYNC_BATCH_SIZE = 50
const SYNC_INTERVAL_HOURS = 6
const PRICE_CHANGE_THRESHOLD = 0.01  // 1% minimum change to record

// ============================================
// Main Sync Functions
// ============================================

/**
 * Sync a single product with its source
 */
export async function syncProduct(product: Product): Promise<InventorySync> {
  const start = Date.now()
  const syncId = generateId()
  
  try {
    log.info("Syncing product", { productId: product.id, source: product.source })

    let newPrice: number | null = null
    let newStock: boolean | null = null

    // Fetch latest data based on source
    switch (product.source) {
      case "amazon":
        const amazonData = await fetchAmazonProductData(product.sourceId)
        if (amazonData) {
          newPrice = amazonData.price
          newStock = amazonData.inStock
        }
        break
        
      case "walmart":
        const walmartData = await fetchWalmartProductData(product.sourceId)
        if (walmartData) {
          newPrice = walmartData.price
          newStock = walmartData.inStock
        }
        break
        
      // Add more sources as needed
      default:
        log.warn("Unknown product source", { source: product.source })
    }

    // Calculate changes
    const priceChanged = newPrice !== null && 
      Math.abs(newPrice - product.price) / product.price > PRICE_CHANGE_THRESHOLD
    const stockChanged = newStock !== null && newStock !== product.inventory.inStock
    const priceChangePercent = priceChanged && newPrice 
      ? ((newPrice - product.price) / product.price) * 100 
      : undefined

    // Update product if changes detected
    if (priceChanged && newPrice !== null) {
      await productRepo.updateProductPrice(product.id, newPrice, product.source)
      
      // Check for price alerts
      if (newPrice < product.price) {
        await checkPriceAlerts(product.id, newPrice)
      }
    }

    if (stockChanged && newStock !== null) {
      await productRepo.updateProductInventory(product.id, newStock)
    }

    // Log sync result
    const syncResult: InventorySync = {
      id: syncId,
      productId: product.id,
      source: product.source,
      sourceProductId: product.sourceId,
      currentPrice: newPrice ?? product.price,
      currentStock: newStock ?? product.inventory.inStock,
      previousPrice: product.price,
      previousStock: product.inventory.inStock,
      priceChanged,
      stockChanged,
      priceChangePercent,
      status: "success",
      syncedAt: new Date(),
      nextSyncAt: new Date(Date.now() + SYNC_INTERVAL_HOURS * 60 * 60 * 1000),
      duration: Date.now() - start,
    }

    await productRepo.logInventorySync(syncResult)

    log.info("Product synced", { 
      productId: product.id, 
      priceChanged, 
      stockChanged,
      duration: syncResult.duration 
    })

    return syncResult

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    
    const syncResult: InventorySync = {
      id: syncId,
      productId: product.id,
      source: product.source,
      sourceProductId: product.sourceId,
      currentPrice: product.price,
      currentStock: product.inventory.inStock,
      priceChanged: false,
      stockChanged: false,
      status: "failed",
      errorMessage,
      syncedAt: new Date(),
      nextSyncAt: new Date(Date.now() + 60 * 60 * 1000), // Retry in 1 hour
      duration: Date.now() - start,
    }

    await productRepo.logInventorySync(syncResult)

    log.error("Product sync failed", { productId: product.id, error: errorMessage })
    return syncResult
  }
}

/**
 * Sync all products that need updating
 */
export async function syncAllProducts(): Promise<{
  total: number
  success: number
  failed: number
  priceChanges: number
  stockChanges: number
}> {
  log.info("Starting full inventory sync")
  const start = Date.now()

  const products = await productRepo.getProductsNeedingSync(SYNC_BATCH_SIZE)
  
  let success = 0
  let failed = 0
  let priceChanges = 0
  let stockChanges = 0

  for (const product of products) {
    const result = await syncProduct(product)
    
    if (result.status === "success") {
      success++
      if (result.priceChanged) priceChanges++
      if (result.stockChanged) stockChanges++
    } else {
      failed++
    }

    // Add small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const duration = Date.now() - start
  log.info("Inventory sync completed", { 
    total: products.length,
    success,
    failed,
    priceChanges,
    stockChanges,
    duration
  })

  return { total: products.length, success, failed, priceChanges, stockChanges }
}

/**
 * Force sync specific products
 */
export async function forceSyncProducts(productIds: string[]): Promise<InventorySync[]> {
  const results: InventorySync[] = []

  for (const id of productIds) {
    const product = await productRepo.getProductById(id)
    if (product) {
      const result = await syncProduct(product)
      results.push(result)
    }
  }

  return results
}

// ============================================
// Source-Specific Fetchers
// ============================================

async function fetchAmazonProductData(asin: string): Promise<{
  price: number
  inStock: boolean
  title?: string
  image?: string
} | null> {
  if (!isApiConfigured()) {
    return null
  }

  try {
    const product = await getAmazonProduct(asin)
    if (product) {
      return {
        price: product.price,
        inStock: product.inStock,
        title: product.name,
        image: product.image,
      }
    }
  } catch (error) {
    log.error("Failed to fetch Amazon product", { asin, error })
  }

  return null
}

async function fetchWalmartProductData(itemId: string): Promise<{
  price: number
  inStock: boolean
} | null> {
  // Walmart API integration
  // For now, return null - implement when Walmart API is subscribed
  return null
}

// ============================================
// Price Alerts
// ============================================

async function checkPriceAlerts(productId: string, newPrice: number): Promise<void> {
  const col = await collections.priceAlerts()
  
  // Find all active alerts for this product where target price is met
  const alerts = await col.find({
    productId,
    isActive: true,
    isTriggered: false,
    targetPrice: { $gte: newPrice },
  }).toArray() as PriceAlert[]

  if (alerts.length === 0) return

  log.info("Price alerts triggered", { productId, newPrice, alertCount: alerts.length })

  // Update alerts as triggered
  await col.updateMany(
    { id: { $in: alerts.map(a => a.id) } },
    { 
      $set: { 
        isTriggered: true, 
        triggeredAt: new Date(),
        currentPrice: newPrice,
      } 
    }
  )

  // Queue notifications (in a real system, this would be async)
  for (const alert of alerts) {
    await queuePriceAlertNotification(alert, newPrice)
  }
}

async function queuePriceAlertNotification(
  alert: PriceAlert, 
  newPrice: number
): Promise<void> {
  const notificationsCol = await collections.notifications()
  
  await notificationsCol.insertOne({
    id: generateId(),
    userId: alert.userId,
    type: "price_alert",
    title: "Price Drop Alert!",
    message: `A product you're watching dropped to $${newPrice.toFixed(2)}`,
    data: {
      productId: alert.productId,
      targetPrice: alert.targetPrice,
      newPrice,
      alertId: alert.id,
    },
    isRead: false,
    createdAt: new Date(),
  })
}

// ============================================
// Price Alert Management
// ============================================

export async function createPriceAlert(
  userId: string,
  productId: string,
  targetPrice: number
): Promise<PriceAlert> {
  const col = await collections.priceAlerts()
  const product = await productRepo.getProductById(productId)
  
  const alert: PriceAlert = {
    id: generateId(),
    userId,
    productId,
    targetPrice,
    currentPrice: product?.price || 0,
    isTriggered: false,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    isActive: true,
  }

  await col.insertOne(alert as any)
  log.info("Price alert created", { userId, productId, targetPrice })
  
  return alert
}

export async function getUserPriceAlerts(userId: string): Promise<PriceAlert[]> {
  const col = await collections.priceAlerts()
  return col.find({ userId, isActive: true }).toArray() as Promise<PriceAlert[]>
}

export async function deletePriceAlert(alertId: string, userId: string): Promise<boolean> {
  const col = await collections.priceAlerts()
  const result = await col.deleteOne({ id: alertId, userId })
  return result.deletedCount > 0
}

// ============================================
// Sync Status & History
// ============================================

export async function getSyncStatus(): Promise<{
  lastSyncAt: Date | null
  nextSyncAt: Date | null
  productsToSync: number
  recentSyncs: number
  failedSyncs: number
}> {
  const syncCol = await collections.inventorySync()
  const productCol = await collections.products()
  
  const [lastSync, productsToSync, recentStats] = await Promise.all([
    syncCol.findOne({}, { sort: { syncedAt: -1 } }),
    productCol.countDocuments({
      isActive: true,
      lastSyncedAt: { $lt: new Date(Date.now() - SYNC_INTERVAL_HOURS * 60 * 60 * 1000) },
    }),
    syncCol.aggregate([
      { $match: { syncedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } },
      { $group: { 
        _id: "$status", 
        count: { $sum: 1 } 
      }},
    ]).toArray(),
  ])

  const stats = recentStats.reduce((acc: any, item: any) => {
    acc[item._id] = item.count
    return acc
  }, {})

  return {
    lastSyncAt: lastSync?.syncedAt || null,
    nextSyncAt: lastSync?.nextSyncAt || null,
    productsToSync,
    recentSyncs: stats.success || 0,
    failedSyncs: stats.failed || 0,
  }
}

export async function getSyncHistory(
  productId?: string,
  limit: number = 50
): Promise<InventorySync[]> {
  const col = await collections.inventorySync()
  
  const filter = productId ? { productId } : {}
  
  return col
    .find(filter)
    .sort({ syncedAt: -1 })
    .limit(limit)
    .toArray() as Promise<InventorySync[]>
}

// ============================================
// Import Products from API
// ============================================

export async function importProductsFromSearch(
  query: string,
  source: "amazon" | "walmart" | "ebay" = "amazon"
): Promise<number> {
  log.info("Importing products from search", { query, source })

  try {
    const result = await searchAmazon(query, 1)
    
    if (!result.products.length) {
      return 0
    }

    const productsToCreate = result.products.map(p => ({
      source: source as Product["source"],
      sourceId: p.asin || p.id,
      sourceUrl: p.storeUrl,
      name: p.name,
      brand: p.brand,
      description: p.description,
      category: p.category,
      images: p.images,
      price: p.price,
      originalPrice: p.originalPrice,
      rating: p.rating,
      reviewCount: p.reviewCount,
      features: p.features,
      inStock: p.inStock,
    }))

    const count = await productRepo.bulkCreateProducts(productsToCreate)
    log.info("Products imported", { query, source, count })
    
    return count
  } catch (error) {
    log.error("Failed to import products", { query, source, error })
    return 0
  }
}
