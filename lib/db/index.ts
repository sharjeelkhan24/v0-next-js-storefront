/**
 * Database Module Index
 * 
 * Central export for all database operations
 */

// Client & Connection
export {
  getDb,
  getCollection,
  collections,
  toObjectId,
  generateId,
  generateOrderNumber,
  checkDbHealth,
  closeConnection,
} from "./client"

// Schema Types
export type {
  User,
  Address,
  Product,
  PriceHistoryEntry,
  Cart,
  CartItem,
  Order,
  OrderItem,
  InventorySync,
  PriceAlert,
  Coupon,
  AnalyticsEvent,
  DailySales,
  AdminLog,
  Notification,
} from "./schema"

// Repositories
export * as userRepo from "./repositories/user-repo"
export * as productRepo from "./repositories/product-repo"
export * as orderRepo from "./repositories/order-repo"
export * as cartRepo from "./repositories/cart-repo"
export * as couponRepo from "./repositories/coupon-repo"

// Inventory Sync
export {
  syncProduct,
  syncAllProducts,
  forceSyncProducts,
  getSyncStatus,
  getSyncHistory,
  importProductsFromSearch,
  createPriceAlert,
  getUserPriceAlerts,
  deletePriceAlert,
} from "./inventory-sync"
