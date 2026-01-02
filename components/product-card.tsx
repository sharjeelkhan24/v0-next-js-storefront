"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/lib/cart-context"
import type { Product } from "@/lib/products"
import { ShoppingCart } from "lucide-react"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
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

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1 text-balance">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2">
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
          <span className="text-xs text-muted-foreground">(click to edit)</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={handleAddToCart} className="w-full" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  )
}
