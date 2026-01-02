/**
 * Admin Dashboard API
 * 
 * Statistics and overview for admin dashboard
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as orderRepo from "@/lib/db/repositories/order-repo"
import * as productRepo from "@/lib/db/repositories/product-repo"
import { getUsers } from "@/lib/db/repositories/user-repo"
import { getSyncStatus, getSyncHistory } from "@/lib/db/inventory-sync"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "admin-dashboard-api" })

// ============================================
// Auth Helper
// ============================================

async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }
  
  if ((session.user as any).role !== "admin") {
    return { error: "Forbidden - Admin access required", status: 403 }
  }
  
  return { user: session.user }
}

// ============================================
// GET - Dashboard Stats
// ============================================

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const section = searchParams.get("section") || "all"
    const days = parseInt(searchParams.get("days") || "30")

    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days)

    const response: any = {}

    // Order Stats
    if (section === "all" || section === "orders") {
      const orderStats = await orderRepo.getOrderStats(dateFrom)
      const dailySales = await orderRepo.getDailySales(days)
      const recentOrders = await orderRepo.getRecentOrders(5)

      response.orders = {
        stats: orderStats,
        dailySales,
        recent: recentOrders,
      }
    }

    // Product Stats
    if (section === "all" || section === "products") {
      const productStats = await productRepo.getProductStats()
      const featuredProducts = await productRepo.getFeaturedProducts(5)
      const deals = await productRepo.getDeals(5)

      response.products = {
        stats: productStats,
        featured: featuredProducts,
        deals,
      }
    }

    // User Stats
    if (section === "all" || section === "users") {
      const [allUsers, admins, recentUsers] = await Promise.all([
        getUsers({ limit: 1 }),
        getUsers({ role: "admin", limit: 1 }),
        getUsers({ limit: 5, sortBy: "createdAt", sortOrder: "desc" }),
      ])

      response.users = {
        total: allUsers.total,
        admins: admins.total,
        recent: recentUsers.users.map(u => {
          const { passwordHash, ...safe } = u as any
          return safe
        }),
      }
    }

    // Inventory Sync Stats
    if (section === "all" || section === "inventory") {
      const syncStatus = await getSyncStatus()
      const recentSyncs = await getSyncHistory(undefined, 10)

      response.inventory = {
        status: syncStatus,
        recentSyncs,
      }
    }

    // Summary (quick overview numbers)
    if (section === "all" || section === "summary") {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const todayStats = await orderRepo.getOrderStats(today)
      const productStats = await productRepo.getProductStats()

      response.summary = {
        todayOrders: todayStats.totalOrders,
        todayRevenue: todayStats.totalRevenue,
        totalProducts: productStats.active,
        productsInStock: productStats.inStock,
        productsOnSale: productStats.onSale,
        pendingOrders: todayStats.byStatus?.pending || 0,
        processingOrders: todayStats.byStatus?.processing || 0,
      }
    }

    return NextResponse.json({
      success: true,
      data: response,
      generatedAt: new Date().toISOString(),
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to fetch dashboard data" },
      { status: 500 }
    )
  }
}
