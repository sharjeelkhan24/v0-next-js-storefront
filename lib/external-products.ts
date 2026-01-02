// Helper functions for fetching products from external APIs

export interface ExternalProduct {
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

export async function searchAmazonProducts(query: string): Promise<ExternalProduct[]> {
  try {
    const response = await fetch(`/api/amazon/search?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    return data.success ? data.products : []
  } catch (error) {
    console.error("Failed to search Amazon:", error)
    return []
  }
}

export async function searchEbayProducts(query: string): Promise<ExternalProduct[]> {
  try {
    const response = await fetch(`/api/ebay/search?q=${encodeURIComponent(query)}`)
    const data = await response.json()
    return data.success ? data.products : []
  } catch (error) {
    console.error("Failed to search eBay:", error)
    return []
  }
}

export async function searchAllProducts(query: string, sources?: string[]): Promise<ExternalProduct[]> {
  try {
    const sourcesParam = sources ? `&sources=${sources.join(",")}` : ""
    const response = await fetch(`/api/products/aggregate?q=${encodeURIComponent(query)}${sourcesParam}`)
    const data = await response.json()
    return data.success ? data.products : []
  } catch (error) {
    console.error("Failed to search all products:", error)
    return []
  }
}
