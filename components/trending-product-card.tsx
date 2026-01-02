"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/lib/cart-context"
import type { TrendingProduct } from "@/lib/trending-products"
import { ShoppingCart, Star } from "lucide-react"

interface TrendingProductCardProps {
  product: TrendingProduct
}

export function TrendingProductCard({ product }: TrendingProductCardProps) {
  const { addItem } = useCart()
  const [customPrice, setCustomPrice] = useState(product.price.toString())
  const [isEditing, setIsEditing] = useState(false)

  const handleAddToCart = () => {
    const price = Number.parseFloat(customPrice) || product.price
    addItem({
      id: product.id,
      name: product.name,
      price: price,
      image: product.image,
    })
  }

  const badgeVariants = {
    New: "bg-emerald-500 hover:bg-emerald-600",
    Hot: "bg-rose-500 hover:bg-rose-600",
    Limited: "bg-amber-500 hover:bg-amber-600",
    Bestseller: "bg-blue-500 hover:bg-blue-600",
  }

  const finalPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price

  return (
    <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50">
      <div className="relative aspect-square overflow-hidden bg-muted/30">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.badge && (
          <Badge className={`absolute top-3 right-3 ${badgeVariants[product.badge]} text-white border-0 shadow-lg`}>
            {product.badge}
          </Badge>
        )}
        {product.discount && (
          <Badge className="absolute top-3 left-3 bg-background text-foreground border-border shadow-lg">
            -{product.discount}%
          </Badge>
        )}
      </div>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg text-balance leading-tight">{product.name}</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">{product.description}</p>
        <div className="flex items-center gap-1 mb-3">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span className="text-sm font-medium">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews} reviews)</span>
        </div>
        <div className="flex items-center gap-2">
          {product.discount ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  className="h-8 w-24"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xl font-bold hover:text-accent transition-colors"
                >
                  ${finalPrice.toFixed(2)}
                </button>
              )}
            </div>
          ) : (
            <>
              {isEditing ? (
                <Input
                  type="number"
                  step="0.01"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  className="h-8 w-24"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xl font-bold hover:text-accent transition-colors"
                >
                  ${Number.parseFloat(customPrice).toFixed(2)}
                </button>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button onClick={handleAddToCart} className="w-full" size="default">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
