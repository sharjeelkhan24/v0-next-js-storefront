"use client"

import { Button } from "@/components/ui/button"
import { ProductCard } from "./ProductCard"
import type { Product } from "@/app/_hooks/useProducts"

interface ProductGridProps {
  products: Product[]
  productsToShow: number
  onShowMore: () => void
  onAddToCart: (product: Product) => void
  onViewDetails: (product: Product) => void
}

export function ProductGrid({
  products,
  productsToShow,
  onShowMore,
  onAddToCart,
  onViewDetails,
}: ProductGridProps) {
  // Deduplicate products by ID to avoid React key warnings
  const uniqueProducts = products.filter(
    (product, index, self) => self.findIndex((p) => p.id === product.id) === index
  )
  const displayedProducts = uniqueProducts.slice(0, productsToShow)
  const hasMore = uniqueProducts.length > productsToShow

  if (uniqueProducts.length === 0) return null

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">All Products ({uniqueProducts.length})</h2>
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

      {hasMore && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={onShowMore}>
            Load More Products ({uniqueProducts.length - productsToShow} remaining)
          </Button>
        </div>
      )}
    </section>
  )
}
