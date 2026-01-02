"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-context"

interface ExternalProduct {
  id: string
  title: string
  price: number
  currency: string
  image: string
  url: string
  source: "amazon" | "ebay"
  condition?: string
  features?: string[]
  seller?: string
  shippingCost?: string
}

export default function ExternalProductsPage() {
  const [query, setQuery] = useState("wireless headphones")
  const [products, setProducts] = useState<ExternalProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addItem } = useCart()

  const handleSearch = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/products/aggregate?q=${encodeURIComponent(query)}`)
      const data = await response.json()

      if (data.success) {
        setProducts(data.products)
      } else {
        setError(data.error || "Failed to fetch products")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: ExternalProduct) => {
    addItem({
      id: `${product.source}-${product.id}`,
      name: product.title,
      price: product.price,
      quantity: 1,
      image: product.image,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Search Products</h1>
        <p className="text-muted-foreground">Find products from Amazon and eBay</p>
      </div>

      <div className="flex gap-2 mb-8">
        <Input
          type="text"
          placeholder="Search for products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="flex-1"
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="mr-2 h-4 w-4" />
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg mb-6">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={`${product.source}-${product.id}`} className="flex flex-col">
            <CardHeader className="p-0">
              <div className="relative aspect-square overflow-hidden rounded-t-lg">
                <img
                  src={product.image || "/placeholder.svg"}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-2 right-2 capitalize">{product.source}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4">
              <CardTitle className="text-lg mb-2 line-clamp-2">{product.title}</CardTitle>
              <CardDescription className="space-y-1">
                {product.condition && <p className="text-sm">Condition: {product.condition}</p>}
                {product.seller && <p className="text-sm">Seller: {product.seller}</p>}
                {product.shippingCost && product.shippingCost !== "0" && (
                  <p className="text-sm">Shipping: ${product.shippingCost}</p>
                )}
              </CardDescription>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 pt-0">
              <div>
                <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">{product.currency}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={product.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button size="sm" onClick={() => handleAddToCart(product)}>
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {products.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Search for products to get started</p>
        </div>
      )}
    </div>
  )
}
