"use client"

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, Zap, Flame, Award, Sparkles, Store, ExternalLink } from "lucide-react"
import type { Product } from "@/app/_hooks/useProducts"

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
  onViewDetails: (product: Product) => void
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
  // Use real image or a store-specific fallback
  const productImage = product.image || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name.slice(0, 20))}`
  
  return (
    <Card
      className="group overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer bg-card"
      onClick={() => onViewDetails(product)}
    >
      <div className="relative aspect-square bg-white overflow-hidden">
        {/* Real product image from store */}
        <img
          src={productImage}
          alt={product.name}
          className="object-contain w-full h-full group-hover:scale-105 transition-transform p-2"
          loading="lazy"
          onError={(e) => {
            // Fallback to store logo if image fails
            const target = e.target as HTMLImageElement
            target.src = `https://via.placeholder.com/300x300/f0f0f0/333?text=${encodeURIComponent(product.store)}`
          }}
        />
        
        {/* Store badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs bg-white/90">
            {product.store}
          </Badge>
        </div>
        
        {/* Deal badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFlashSale && (
            <Badge className="bg-blue-600 text-white text-xs">
              <Zap className="w-3 h-3 mr-1" /> Flash Sale
            </Badge>
          )}
          {product.isHotDeal && !product.isFlashSale && (
            <Badge className="bg-red-500 text-white text-xs">
              <Flame className="w-3 h-3 mr-1" /> Hot Deal
            </Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-amber-500 text-white text-xs">
              <Award className="w-3 h-3 mr-1" /> Best Seller
            </Badge>
          )}
          {product.primeEligible && (
            <Badge className="bg-blue-800 text-white text-xs">
              Prime
            </Badge>
          )}
        </div>
        
        {/* Savings badge */}
        {product.savingsPercent > 10 && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            {product.savingsPercent}% OFF
          </div>
        )}
      </div>
      
      <CardContent className="p-3">
        {/* Brand */}
        <p className="text-xs text-muted-foreground mb-1 font-medium">{product.brand}</p>
        
        {/* Product name */}
        <h3 className="font-medium text-sm line-clamp-2 mb-1 min-h-[2.5rem]">{product.name}</h3>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-primary">${product.price.toFixed(2)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Store link */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Store className="w-3 h-3" />
          <span>From {product.store}</span>
          {product.freeShipping && (
            <Badge variant="outline" className="text-[10px] ml-auto">Free Ship</Badge>
          )}
        </div>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString()})
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90"
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(product)
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            Add
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="px-2"
            onClick={(e) => {
              e.stopPropagation()
              window.open(product.storeUrl, "_blank", "noopener,noreferrer")
            }}
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
