"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { DashboardProduct } from "@/lib/dashboard-products"
import { getStockStatusColor, getStockStatusLabel } from "@/lib/dashboard-products"
import { Package } from "lucide-react"

interface DashboardProductCardProps {
  product: DashboardProduct
}

/**
 * Dashboard Product Card Component
 * Displays product information with stock status in a card layout
 * Production-ready with proper error handling and accessibility
 */
export function DashboardProductCard({ product }: DashboardProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50">
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Stock status badge overlay */}
        <div className="absolute top-3 right-3">
          <Badge
            variant="outline"
            className={`${getStockStatusColor(product.stockStatus)} font-medium backdrop-blur-sm`}
          >
            {getStockStatusLabel(product.stockStatus)}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight text-balance">{product.name}</CardTitle>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Package className="h-3 w-3" />
          <span>SKU: {product.sku}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground">${product.price.toFixed(2)}</span>
        </div>

        {/* Stock information */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Stock Level:</span>
          <span className="font-semibold text-foreground">{product.stock} units</span>
        </div>

        {/* Category badge */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Category:</span>
          <Badge variant="secondary" className="font-medium">
            {product.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
