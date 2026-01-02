/**
 * Admin Products API
 * 
 * Full CRUD operations for products
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as productRepo from "@/lib/db/repositories/product-repo"
import { importProductsFromSearch, forceSyncProducts } from "@/lib/db/inventory-sync"
import { logger } from "@/lib/logger"
import { z } from "zod"

const log = logger.child({ module: "admin-products-api" })

// ============================================
// Validation Schemas
// ============================================

const ProductCreateSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  description: z.string(),
  category: z.string(),
  images: z.array(z.string().url()),
  price: z.number().positive(),
  originalPrice: z.number().positive().optional(),
  source: z.enum(["amazon", "walmart", "ebay", "target", "google", "manual"]).default("manual"),
  sourceId: z.string().optional(),
  sourceUrl: z.string().url().optional(),
  features: z.array(z.string()).optional(),
  inStock: z.boolean().default(true),
})

const ProductUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  features: z.array(z.string()).optional(),
})

const ImportSchema = z.object({
  query: z.string().min(1),
  source: z.enum(["amazon", "walmart", "ebay"]).default("amazon"),
})

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
// GET - List Products
// ============================================

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    
    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      source: searchParams.get("source") || undefined,
      inStock: searchParams.get("inStock") === "true" ? true : 
               searchParams.get("inStock") === "false" ? false : undefined,
      isFeatured: searchParams.get("isFeatured") === "true" ? true : undefined,
      isOnSale: searchParams.get("isOnSale") === "true" ? true : undefined,
      sortBy: searchParams.get("sortBy") as any || "createdAt",
      sortOrder: searchParams.get("sortOrder") as any || "desc",
    }

    const result = await productRepo.getProducts(options)
    const stats = await productRepo.getProductStats()

    return NextResponse.json({
      success: true,
      products: result.products,
      total: result.total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(result.total / options.limit),
      stats,
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create Product or Import
// ============================================

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    
    // Check if this is an import request
    if (body.action === "import") {
      const validation = ImportSchema.safeParse(body)
      if (!validation.success) {
        return NextResponse.json(
          { error: "Invalid import parameters", details: validation.error.issues },
          { status: 400 }
        )
      }

      const { query, source } = validation.data
      const count = await importProductsFromSearch(query, source)

      log.info("Products imported", { 
        admin: auth.user.email, 
        query, 
        source, 
        count 
      })

      return NextResponse.json({
        success: true,
        message: `Imported ${count} products`,
        count,
      })
    }

    // Regular product creation
    const validation = ProductCreateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid product data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const data = validation.data
    const product = await productRepo.createProduct({
      source: data.source,
      sourceId: data.sourceId || `manual-${Date.now()}`,
      sourceUrl: data.sourceUrl || "",
      name: data.name,
      brand: data.brand,
      description: data.description,
      category: data.category,
      images: data.images,
      price: data.price,
      originalPrice: data.originalPrice,
      features: data.features,
      inStock: data.inStock,
    })

    log.info("Product created", { 
      admin: auth.user.email, 
      productId: product.id,
      name: product.name 
    })

    return NextResponse.json({
      success: true,
      product,
    }, { status: 201 })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH - Update Product
// ============================================

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("id")
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Handle bulk featured update
    if (body.action === "setFeatured" && Array.isArray(body.ids)) {
      const count = await productRepo.setFeatured(body.ids, body.featured ?? true)
      
      log.info("Products featured status updated", { 
        admin: auth.user.email,
        count,
        featured: body.featured 
      })

      return NextResponse.json({ success: true, count })
    }

    // Handle sync request
    if (body.action === "sync") {
      const ids = body.ids || [productId]
      const results = await forceSyncProducts(ids)
      
      log.info("Products synced", { 
        admin: auth.user.email,
        count: results.length 
      })

      return NextResponse.json({ success: true, results })
    }

    // Regular update
    const validation = ProductUpdateSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid update data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const product = await productRepo.updateProduct(productId, validation.data)
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    log.info("Product updated", { 
      admin: auth.user.email,
      productId,
      updates: Object.keys(validation.data) 
    })

    return NextResponse.json({ success: true, product })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Delete Product
// ============================================

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get("id")
    const hard = searchParams.get("hard") === "true"
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      )
    }

    let success: boolean
    if (hard) {
      success = await productRepo.hardDeleteProduct(productId)
    } else {
      success = await productRepo.deleteProduct(productId)
    }
    
    if (!success) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      )
    }

    log.info("Product deleted", { 
      admin: auth.user.email,
      productId,
      hard 
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
