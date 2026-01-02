/**
 * Product Repository
 * 
 * CRUD operations for products with inventory sync
 */

import { collections, generateId } from "../client"
import type { Product, InventorySync, PriceHistoryEntry } from "../schema"
import { logger } from "../../logger"

const log = logger.child({ module: "product-repo" })

// ============================================
// Create
// ============================================

export async function createProduct(data: {
  source: Product["source"]
  sourceId: string
  sourceUrl: string
  name: string
  brand: string
  description: string
  category: string
  images: string[]
  price: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  features?: string[]
  inStock?: boolean
}): Promise<Product> {
  const col = await collections.products()
  
  const now = new Date()
  const product: Product = {
    id: generateId(),
    source: data.source,
    sourceId: data.sourceId,
    sourceUrl: data.sourceUrl,
    name: data.name,
    brand: data.brand,
    description: data.description,
    category: data.category,
    subcategory: undefined,
    tags: [],
    images: data.images,
    thumbnail: data.images[0] || "",
    price: data.price,
    originalPrice: data.originalPrice,
    currency: "USD",
    priceHistory: [{ price: data.price, date: now, source: data.source }],
    inventory: {
      inStock: data.inStock ?? true,
      lowStockThreshold: 5,
      lastChecked: now,
    },
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    shipping: {
      freeShipping: data.price > 35,
      estimatedDays: 3,
    },
    features: data.features || [],
    isActive: true,
    isFeatured: false,
    isOnSale: !!data.originalPrice && data.price < data.originalPrice,
    lastSyncedAt: now,
    syncFrequency: 6,  // hours
    createdAt: now,
    updatedAt: now,
  }

  // Upsert - update if exists, insert if not
  await col.updateOne(
    { sourceId: data.sourceId, source: data.source },
    { $setOnInsert: product },
    { upsert: true }
  )

  log.info("Product created/updated", { productId: product.id, name: product.name })
  return product
}

export async function bulkCreateProducts(products: Parameters<typeof createProduct>[0][]): Promise<number> {
  const col = await collections.products()
  
  const now = new Date()
  const bulkOps = products.map(data => ({
    updateOne: {
      filter: { sourceId: data.sourceId, source: data.source },
      update: {
        $setOnInsert: {
          id: generateId(),
          source: data.source,
          sourceId: data.sourceId,
          sourceUrl: data.sourceUrl,
          name: data.name,
          brand: data.brand,
          description: data.description,
          category: data.category,
          tags: [],
          images: data.images,
          thumbnail: data.images[0] || "",
          price: data.price,
          originalPrice: data.originalPrice,
          currency: "USD",
          priceHistory: [{ price: data.price, date: now, source: data.source }],
          inventory: {
            inStock: data.inStock ?? true,
            lowStockThreshold: 5,
            lastChecked: now,
          },
          rating: data.rating || 0,
          reviewCount: data.reviewCount || 0,
          shipping: { freeShipping: data.price > 35, estimatedDays: 3 },
          features: data.features || [],
          isActive: true,
          isFeatured: false,
          isOnSale: !!data.originalPrice && data.price < data.originalPrice,
          lastSyncedAt: now,
          syncFrequency: 6,
          createdAt: now,
          updatedAt: now,
        },
      },
      upsert: true,
    },
  }))

  const result = await col.bulkWrite(bulkOps)
  log.info("Bulk products created", { inserted: result.upsertedCount, modified: result.modifiedCount })
  
  return result.upsertedCount
}

// ============================================
// Read
// ============================================

export async function getProductById(id: string): Promise<Product | null> {
  const col = await collections.products()
  return col.findOne({ id, isActive: true }) as Promise<Product | null>
}

export async function getProductBySourceId(
  source: string,
  sourceId: string
): Promise<Product | null> {
  const col = await collections.products()
  return col.findOne({ source, sourceId }) as Promise<Product | null>
}

export async function getProducts(options: {
  page?: number
  limit?: number
  category?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  isFeatured?: boolean
  isOnSale?: boolean
  source?: string
  sortBy?: "price" | "rating" | "createdAt" | "name"
  sortOrder?: "asc" | "desc"
}): Promise<{ products: Product[]; total: number }> {
  const col = await collections.products()
  
  const page = options.page || 1
  const limit = Math.min(options.limit || 20, 100)
  const skip = (page - 1) * limit

  const filter: any = { isActive: true }
  
  if (options.category) {
    filter.category = options.category
  }
  
  if (options.search) {
    filter.$text = { $search: options.search }
  }
  
  if (options.minPrice !== undefined) {
    filter.price = { ...filter.price, $gte: options.minPrice }
  }
  
  if (options.maxPrice !== undefined) {
    filter.price = { ...filter.price, $lte: options.maxPrice }
  }
  
  if (options.inStock !== undefined) {
    filter["inventory.inStock"] = options.inStock
  }
  
  if (options.isFeatured !== undefined) {
    filter.isFeatured = options.isFeatured
  }
  
  if (options.isOnSale !== undefined) {
    filter.isOnSale = options.isOnSale
  }
  
  if (options.source) {
    filter.source = options.source
  }

  const sort: any = {}
  const sortField = options.sortBy || "createdAt"
  sort[sortField] = options.sortOrder === "asc" ? 1 : -1

  const [products, total] = await Promise.all([
    col.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
    col.countDocuments(filter),
  ])

  return { products: products as Product[], total }
}

export async function getFeaturedProducts(limit: number = 20): Promise<Product[]> {
  const col = await collections.products()
  
  return col
    .find({ isActive: true, isFeatured: true, "inventory.inStock": true })
    .sort({ rating: -1 })
    .limit(limit)
    .toArray() as Promise<Product[]>
}

export async function getDeals(limit: number = 20): Promise<Product[]> {
  const col = await collections.products()
  
  return col
    .find({ 
      isActive: true, 
      isOnSale: true, 
      "inventory.inStock": true,
      originalPrice: { $exists: true }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray() as Promise<Product[]>
}

export async function getProductsNeedingSync(limit: number = 100): Promise<Product[]> {
  const col = await collections.products()
  
  const cutoff = new Date()
  cutoff.setHours(cutoff.getHours() - 6)  // Products not synced in 6 hours
  
  return col
    .find({ 
      isActive: true,
      lastSyncedAt: { $lt: cutoff }
    })
    .sort({ lastSyncedAt: 1 })
    .limit(limit)
    .toArray() as Promise<Product[]>
}

// ============================================
// Update
// ============================================

export async function updateProduct(
  id: string,
  updates: Partial<Pick<Product, 
    "name" | "description" | "category" | "tags" | "images" | 
    "isActive" | "isFeatured" | "shipping" | "features"
  >>
): Promise<Product | null> {
  const col = await collections.products()
  
  const result = await col.findOneAndUpdate(
    { id },
    { $set: { ...updates, updatedAt: new Date() } },
    { returnDocument: "after" }
  )

  if (result) {
    log.info("Product updated", { productId: id })
  }
  
  return result as Product | null
}

export async function updateProductPrice(
  id: string,
  newPrice: number,
  source: string
): Promise<{ product: Product | null; priceChanged: boolean }> {
  const col = await collections.products()
  
  const product = await col.findOne({ id }) as Product | null
  if (!product) {
    return { product: null, priceChanged: false }
  }

  const priceChanged = product.price !== newPrice
  const now = new Date()

  const updates: any = {
    updatedAt: now,
    lastSyncedAt: now,
    "inventory.lastChecked": now,
  }

  if (priceChanged) {
    updates.price = newPrice
    updates.isOnSale = product.originalPrice ? newPrice < product.originalPrice : false
  }

  // Add to price history if changed
  const updateOp: any = { $set: updates }
  if (priceChanged) {
    updateOp.$push = {
      priceHistory: {
        $each: [{ price: newPrice, date: now, source }],
        $slice: -30,  // Keep last 30 entries
      },
    }
  }

  const result = await col.findOneAndUpdate(
    { id },
    updateOp,
    { returnDocument: "after" }
  )

  if (priceChanged) {
    log.info("Product price updated", { 
      productId: id, 
      oldPrice: product.price, 
      newPrice,
      change: ((newPrice - product.price) / product.price * 100).toFixed(2) + "%"
    })
  }

  return { product: result as Product | null, priceChanged }
}

export async function updateProductInventory(
  id: string,
  inStock: boolean,
  quantity?: number
): Promise<boolean> {
  const col = await collections.products()
  
  const updates: any = {
    "inventory.inStock": inStock,
    "inventory.lastChecked": new Date(),
    updatedAt: new Date(),
  }
  
  if (quantity !== undefined) {
    updates["inventory.quantity"] = quantity
  }

  const result = await col.updateOne({ id }, { $set: updates })
  
  if (result.modifiedCount > 0) {
    log.info("Product inventory updated", { productId: id, inStock, quantity })
    return true
  }
  
  return false
}

export async function setFeatured(ids: string[], featured: boolean): Promise<number> {
  const col = await collections.products()
  
  const result = await col.updateMany(
    { id: { $in: ids } },
    { $set: { isFeatured: featured, updatedAt: new Date() } }
  )

  log.info("Products featured status updated", { count: result.modifiedCount, featured })
  return result.modifiedCount
}

// ============================================
// Delete
// ============================================

export async function deleteProduct(id: string): Promise<boolean> {
  const col = await collections.products()
  
  // Soft delete
  const result = await col.updateOne(
    { id },
    { $set: { isActive: false, updatedAt: new Date() } }
  )

  if (result.modifiedCount > 0) {
    log.info("Product deactivated", { productId: id })
    return true
  }
  
  return false
}

export async function hardDeleteProduct(id: string): Promise<boolean> {
  const col = await collections.products()
  
  const result = await col.deleteOne({ id })
  
  if (result.deletedCount > 0) {
    log.info("Product permanently deleted", { productId: id })
    return true
  }
  
  return false
}

// ============================================
// Inventory Sync Logging
// ============================================

export async function logInventorySync(sync: Omit<InventorySync, "_id">): Promise<void> {
  const col = await collections.inventorySync()
  await col.insertOne(sync as any)
}

export async function getInventorySyncHistory(
  productId: string,
  limit: number = 10
): Promise<InventorySync[]> {
  const col = await collections.inventorySync()
  
  return col
    .find({ productId })
    .sort({ syncedAt: -1 })
    .limit(limit)
    .toArray() as Promise<InventorySync[]>
}

// ============================================
// Analytics
// ============================================

export async function getProductStats(): Promise<{
  total: number
  active: number
  inStock: number
  onSale: number
  bySource: Record<string, number>
  byCategory: Record<string, number>
}> {
  const col = await collections.products()
  
  const [
    total,
    active,
    inStock,
    onSale,
    bySourceAgg,
    byCategoryAgg,
  ] = await Promise.all([
    col.countDocuments({}),
    col.countDocuments({ isActive: true }),
    col.countDocuments({ isActive: true, "inventory.inStock": true }),
    col.countDocuments({ isActive: true, isOnSale: true }),
    col.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$source", count: { $sum: 1 } } },
    ]).toArray(),
    col.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]).toArray(),
  ])

  const bySource: Record<string, number> = {}
  bySourceAgg.forEach((item: any) => {
    bySource[item._id] = item.count
  })

  const byCategory: Record<string, number> = {}
  byCategoryAgg.forEach((item: any) => {
    byCategory[item._id] = item.count
  })

  return { total, active, inStock, onSale, bySource, byCategory }
}
