"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import useSWR from "swr"

// ============================================
// Types
// ============================================

export interface Product {
  id: string
  asin?: string
  upc?: string
  name: string
  brand: string
  description: string
  image: string
  images: string[]
  price: number
  originalPrice?: number
  currency: string
  rating: number
  reviewCount: number
  inStock: boolean
  store: string
  storeUrl: string
  category: string
  features: string[]
  primeEligible?: boolean
  freeShipping?: boolean
  deliveryDate?: string
  // Computed for UI
  savings: number
  savingsPercent: number
  isFlashSale: boolean
  isHotDeal: boolean
  isBestSeller: boolean
}

interface ApiResponse {
  success: boolean
  products: Product[]
  deals?: Product[]
  bestsellers?: Product[]
  totalResults: number
  source: string
  timestamp: string
  error?: string
  message?: string
  setupGuide?: Record<string, string>
}

interface FilterState {
  search: string
  category: string
  store: string
  region: string
}

// ============================================
// Fetcher with error handling
// ============================================

const fetcher = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url)
  const data = await res.json()
  
  if (!res.ok) {
    const error = new Error(data.message || "Failed to fetch products")
    ;(error as any).info = data
    throw error
  }
  
  return data
}

// ============================================
// Transform product for UI
// ============================================

function enrichProduct(product: any): Product {
  const price = product.price || 0
  const originalPrice = product.originalPrice || price * 1.15
  const savings = Math.max(0, originalPrice - price)
  const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0

  return {
    ...product,
    savings,
    savingsPercent,
    isFlashSale: savingsPercent >= 25,
    isHotDeal: savingsPercent >= 15 && product.rating >= 4,
    isBestSeller: (product.features || []).some((f: string) => 
      f.toLowerCase().includes("best seller") || f.toLowerCase().includes("#")
    ),
    reviewCount: product.reviewCount || 0,
  }
}

// ============================================
// Main Hook: useProducts
// ============================================

export function useProducts() {
  const [productsToShow, setProductsToShow] = useState(24)

  // Fetch featured products (deals + bestsellers)
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    "/api/products?type=featured",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      dedupingInterval: 60 * 1000,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  )

  // Transform products
  const products = useMemo(() => {
    if (!data?.products) return []
    return data.products.map(enrichProduct)
  }, [data?.products])

  const deals = useMemo(() => {
    if (!data?.deals) return []
    return data.deals.map(enrichProduct)
  }, [data?.deals])

  const bestsellers = useMemo(() => {
    if (!data?.bestsellers) return []
    return data.bestsellers.map(enrichProduct)
  }, [data?.bestsellers])

  // API status
  const apiConfigured = data?.success !== false || !data?.error?.includes("NOT_CONFIGURED")
  const setupGuide = (data as any)?.setupGuide

  // Static filters
  const categories = useMemo(() => [
    "All",
    "Electronics",
    "Home & Kitchen", 
    "Clothing",
    "Sports & Outdoors",
    "Beauty",
    "Toys & Games",
    "Books",
    "Automotive",
    "Health",
    "Grocery",
    "Office",
    "Pet Supplies",
  ], [])

  const regions = useMemo(() => ["All", "US"], [])

  const storesList = useMemo(() => [
    "All",
    "Amazon",
    "Walmart", 
    "eBay",
    "Target",
    "Best Buy",
  ], [])

  // Refresh
  const refreshProducts = useCallback(() => {
    mutate()
  }, [mutate])

  return {
    products,
    deals,
    bestsellers,
    isLoading,
    error: error?.message || data?.message,
    apiConfigured: !data?.error?.includes("NOT_CONFIGURED"),
    setupGuide,
    productsToShow,
    setProductsToShow,
    categories,
    regions,
    storesList,
    refreshProducts,
    lastUpdated: data?.timestamp,
  }
}

// ============================================
// Search Hook
// ============================================

export function useSearchProducts(query: string, store = "all", page = 1) {
  const shouldFetch = query.length >= 2

  const { data, error, isLoading } = useSWR<ApiResponse>(
    shouldFetch 
      ? `/api/products?type=search&query=${encodeURIComponent(query)}&store=${store}&page=${page}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30 * 1000,
    }
  )

  const products = useMemo(() => {
    if (!data?.products) return []
    return data.products.map(enrichProduct)
  }, [data?.products])

  return {
    products,
    isLoading,
    error: error?.message,
    totalResults: data?.totalResults || 0,
    hasMore: products.length >= 20,
  }
}

// ============================================
// Filter Hook
// ============================================

export function useFilteredProducts(products: Product[], filters: FilterState) {
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch = !filters.search || 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.brand.toLowerCase().includes(filters.search.toLowerCase())
      
      const matchesCategory = filters.category === "All" || 
        p.category.toLowerCase().includes(filters.category.toLowerCase())
      
      const matchesStore = filters.store === "All" || 
        p.store === filters.store

      return matchesSearch && matchesCategory && matchesStore
    })
  }, [products, filters])

  // Categorized products
  const flashSales = useMemo(
    () => products.filter((p) => p.isFlashSale),
    [products]
  )
  
  const hotDeals = useMemo(
    () => products.filter((p) => p.isHotDeal),
    [products]
  )
  
  const bestSellers = useMemo(
    () => products.filter((p) => p.isBestSeller),
    [products]
  )
  
  const budgetDeals = useMemo(
    () => products.filter((p) => p.price <= 25),
    [products]
  )

  return {
    filteredProducts,
    flashSales,
    hotDeals,
    bestSellers,
    budgetDeals,
    fairCartDeals: budgetDeals, // Alias for compatibility
  }
}

// ============================================
// Price Comparison Hook
// ============================================

export function usePriceComparison(query: string) {
  const shouldFetch = query.length >= 3

  const { data, error, isLoading } = useSWR(
    shouldFetch ? `/api/products/compare?query=${encodeURIComponent(query)}` : null,
    fetcher,
    { 
      revalidateOnFocus: false,
      dedupingInterval: 60 * 1000,
    }
  )

  return {
    prices: (data as any)?.prices || [],
    summary: (data as any)?.summary,
    isLoading,
    error: error?.message,
  }
}

// Re-export Product type
export type { Product as RealProduct }
