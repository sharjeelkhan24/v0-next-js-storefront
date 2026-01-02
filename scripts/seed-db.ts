/**
 * Database Seed Script
 * 
 * Creates initial data including admin user and sample products
 * Run with: pnpm db:seed
 */

import { getDb, collections, generateId } from "../lib/db/client"
import * as userRepo from "../lib/db/repositories/user-repo"
import * as productRepo from "../lib/db/repositories/product-repo"
import * as couponRepo from "../lib/db/repositories/coupon-repo"
import { importProductsFromSearch } from "../lib/db/inventory-sync"

async function seed() {
  console.log("🌱 Starting database seed...")

  try {
    // Test connection
    const db = await getDb()
    console.log("✅ Database connected")

    // Create admin user
    console.log("\n📝 Creating admin user...")
    const existingAdmin = await userRepo.getUserByEmail("admin@faircart.com")
    
    if (!existingAdmin) {
      const admin = await userRepo.createUser({
        email: "admin@faircart.com",
        password: "admin123456",  // Change this in production!
        name: "Admin User",
        role: "admin",
      })
      console.log(`✅ Admin user created: ${admin.email}`)
    } else {
      console.log("ℹ️  Admin user already exists")
    }

    // Create test customer
    console.log("\n📝 Creating test customer...")
    const existingCustomer = await userRepo.getUserByEmail("customer@test.com")
    
    if (!existingCustomer) {
      const customer = await userRepo.createUser({
        email: "customer@test.com",
        password: "customer123",
        name: "Test Customer",
        role: "customer",
      })
      console.log(`✅ Test customer created: ${customer.email}`)
    } else {
      console.log("ℹ️  Test customer already exists")
    }

    // Create sample coupons
    console.log("\n🎟️  Creating sample coupons...")
    const coupons = [
      { code: "SAVE10", type: "percentage" as const, value: 10, validDays: 90 },
      { code: "SAVE20", type: "percentage" as const, value: 20, minOrderAmount: 50, validDays: 30 },
      { code: "FLAT15", type: "fixed" as const, value: 15, minOrderAmount: 75, validDays: 60 },
      { code: "FREESHIP", type: "freeShipping" as const, value: 5.99, validDays: 365 },
    ]

    for (const c of coupons) {
      const existing = await couponRepo.getCouponByCode(c.code)
      if (!existing) {
        const validUntil = new Date()
        validUntil.setDate(validUntil.getDate() + c.validDays)
        
        await couponRepo.createCoupon({
          code: c.code,
          type: c.type,
          value: c.value,
          minOrderAmount: c.minOrderAmount,
          validUntil,
        })
        console.log(`✅ Coupon created: ${c.code}`)
      } else {
        console.log(`ℹ️  Coupon ${c.code} already exists`)
      }
    }

    // Import sample products from Amazon
    console.log("\n📦 Importing sample products...")
    const searchQueries = [
      "wireless headphones",
      "laptop stand",
      "mechanical keyboard",
      "usb hub",
    ]

    for (const query of searchQueries) {
      console.log(`   Importing: ${query}...`)
      try {
        const count = await importProductsFromSearch(query, "amazon")
        console.log(`   ✅ Imported ${count} products for "${query}"`)
      } catch (error) {
        console.log(`   ⚠️  Failed to import "${query}" - API may not be configured`)
      }
    }

    // Get product stats
    const stats = await productRepo.getProductStats()
    console.log(`\n📊 Product Stats:`)
    console.log(`   Total: ${stats.total}`)
    console.log(`   Active: ${stats.active}`)
    console.log(`   In Stock: ${stats.inStock}`)

    console.log("\n✅ Database seed completed!")
    console.log("\n📌 Login Credentials:")
    console.log("   Admin: admin@faircart.com / admin123456")
    console.log("   Customer: customer@test.com / customer123")
    
    process.exit(0)

  } catch (error) {
    console.error("❌ Seed failed:", error)
    process.exit(1)
  }
}

seed()
