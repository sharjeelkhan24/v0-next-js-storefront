"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { DashboardProductCard } from "@/components/dashboard-product-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { filterProductsByCategory, type ProductCategory, type DashboardProduct } from "@/lib/dashboard-products"
import { Search, Filter, RefreshCw, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type FilterOption = ProductCategory | "all"

interface AmazonBestSellerResponse {
  products: DashboardProduct[]
  lastUpdated: string
  source: string
}

/**
 * Fetcher function for SWR
 * Handles API calls with proper error handling
 */
const fetcher = async (url: string): Promise<AmazonBestSellerResponse> => {
  console.log("[v0] Fetching data from:", url)
  const res = await fetch(url)

  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || "Failed to fetch data")
  }

  return res.json()
}

/**
 * Product Dashboard Page
 * Main dashboard view with filtering, search, and real-time Amazon data
 * Built with Next.js 16, TypeScript, Tailwind CSS, and SWR
 * Automatically refreshes prices every 6 hours
 */
export default function DashboardPage() {
  const [selectedCategory, setSelectedCategory] = useState<FilterOption>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const { data, error, isLoading, mutate } = useSWR<AmazonBestSellerResponse>("/api/amazon/bestsellers", fetcher, {
    refreshInterval: 6 * 60 * 60 * 1000, // Refresh every 6 hours (21600000ms)
    revalidateOnFocus: false, // Don't refetch on window focus
    revalidateOnReconnect: true, // Refetch when reconnecting
    dedupingInterval: 5000, // Dedupe requests within 5 seconds
  })

  const products = data?.products || []

  // Filter and search logic with memoization for performance
  const filteredProducts = useMemo(() => {
    let filtered = filterProductsByCategory(products, selectedCategory)

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [products, selectedCategory, searchQuery])

  // Category filter options
  const categories: { value: FilterOption; label: string }[] = [
    { value: "all", label: "All Products" },
    { value: "AI-PCs", label: "AI-PCs" },
    { value: "SSDs", label: "SSDs" },
    { value: "IoT", label: "IoT Devices" },
  ]

  const handleRefresh = () => {
    console.log("[v0] Manual refresh triggered")
    mutate()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-balance">Product Dashboard</h1>
              <p className="text-muted-foreground mt-1">Live Amazon Best Sellers - Auto-refreshes every 6 hours</p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="gap-2 bg-transparent"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filteredProducts.length}</span>
                <span>products found</span>
              </div>
            </div>
          </div>
          {data?.lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              Last updated: {new Date(data.lastUpdated).toLocaleString()}
            </p>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load products: {error.message}. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters Section */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filter by category:</span>
            </div>
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="transition-all"
                disabled={isLoading}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {isLoading && !data && (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-12 w-12 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Loading Amazon Best Sellers...</p>
            </div>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <DashboardProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          !isLoading &&
          !error && (
            // Empty state
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <Package className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
            </div>
          )
        )}
      </main>
    </div>
  )
}

function Package({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  )
}
