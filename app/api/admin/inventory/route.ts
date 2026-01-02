/**
 * Inventory Sync API
 * 
 * Endpoints for triggering and monitoring inventory sync
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { 
  syncAllProducts, 
  forceSyncProducts, 
  getSyncStatus, 
  getSyncHistory,
  importProductsFromSearch,
} from "@/lib/db/inventory-sync"
import { logger } from "@/lib/logger"

const log = logger.child({ module: "inventory-sync-api" })

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
// GET - Sync Status & History
// ============================================

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("productId")
    const limit = parseInt(searchParams.get("limit") || "50")

    const [status, history] = await Promise.all([
      getSyncStatus(),
      getSyncHistory(productId || undefined, limit),
    ])

    return NextResponse.json({
      success: true,
      status,
      history,
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to fetch sync status" },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Trigger Sync
// ============================================

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    const action = body.action || "sync"

    switch (action) {
      case "syncAll":
        log.info("Full inventory sync triggered", { admin: auth.user.email })
        const allResult = await syncAllProducts()
        return NextResponse.json({
          success: true,
          action: "syncAll",
          result: allResult,
        })

      case "syncProducts":
        if (!body.productIds || !Array.isArray(body.productIds)) {
          return NextResponse.json(
            { error: "productIds array is required" },
            { status: 400 }
          )
        }
        log.info("Selective product sync triggered", { 
          admin: auth.user.email,
          count: body.productIds.length 
        })
        const selectiveResult = await forceSyncProducts(body.productIds)
        return NextResponse.json({
          success: true,
          action: "syncProducts",
          results: selectiveResult,
        })

      case "import":
        if (!body.query) {
          return NextResponse.json(
            { error: "query is required for import" },
            { status: 400 }
          )
        }
        const source = body.source || "amazon"
        log.info("Product import triggered", { 
          admin: auth.user.email,
          query: body.query,
          source 
        })
        const importCount = await importProductsFromSearch(body.query, source)
        return NextResponse.json({
          success: true,
          action: "import",
          imported: importCount,
          query: body.query,
          source,
        })

      default:
        return NextResponse.json(
          { error: "Invalid action. Use: syncAll, syncProducts, import" },
          { status: 400 }
        )
    }

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Sync operation failed" },
      { status: 500 }
    )
  }
}
