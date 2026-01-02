"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, ChevronUp, type LucideIcon } from "lucide-react"
import { ProductCard } from "./ProductCard"
import type { Product } from "@/app/_hooks/useProducts"

interface DealSectionProps {
  title: string
  products: Product[]
  icon: LucideIcon
  iconColor: string
  badgeColor: string
  badgeText?: string
  initialShowCount?: number
  onAddToCart: (product: Product) => void
  onViewDetails: (product: Product) => void
}

export function DealSection({
  title,
  products,
  icon: Icon,
  iconColor,
  badgeColor,
  badgeText,
  initialShowCount = 6,
  onAddToCart,
  onViewDetails,
}: DealSectionProps) {
  const [showAll, setShowAll] = useState(false)

  if (products.length === 0) return null

  const displayedProducts = showAll ? products : products.slice(0, initialShowCount)
  const hasMore = products.length > initialShowCount

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-6 h-6 ${iconColor}`} />
          <h2 className="text-xl font-bold">{title}</h2>
          {badgeText && (
            <Badge className={badgeColor}>
              {badgeText}
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">({products.length})</span>
        </div>
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(!showAll)}
            className="text-primary"
          >
            {showAll ? (
              <>
                Show Less <ChevronUp className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                View All <ChevronDown className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {displayedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={onAddToCart}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    </section>
  )
}
