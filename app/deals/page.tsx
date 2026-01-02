"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { Zap, TrendingDown, ShoppingCart, AlertCircle, Clock, DollarSign, Percent, RefreshCw } from "lucide-react"
import Image from "next/image"
import type { Deal, DealCriteria } from "@/lib/deal-monitor"

interface DealsResponse {
  deals: Deal[]
  criteria: DealCriteria[]
  count: number
  lastUpdated: string
}

export default function DealsPage() {
  const [data, setData] = useState<DealsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingDeal, setProcessingDeal] = useState<string | null>(null)

  const fetchDeals = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("[v0] Fetching deals...")

      const response = await fetch("/api/deals?active=true")
      if (!response.ok) throw new Error("Failed to fetch deals")

      const data = await response.json()
      setData(data)
      console.log(`[v0] Loaded ${data.count} deals`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load deals"
      setError(message)
      console.error("[v0] Error fetching deals:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoCheckout = async (deal: Deal) => {
    try {
      setProcessingDeal(deal.id)
      console.log(`[v0] Initiating auto-checkout for deal ${deal.id}`)

      const response = await fetch("/api/deals/auto-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealId: deal.id,
          productId: deal.productId,
          price: deal.currentPrice,
          quantity: 1,
        }),
      })

      const result = await response.json()

      if (result.success) {
        console.log(`[v0] Auto-checkout successful: ${result.orderId}`)
        // Refresh deals to update status
        await fetchDeals()
        // In production, redirect to confirmation page
        // window.location.href = result.checkoutUrl
      } else {
        throw new Error(result.message)
      }
    } catch (err) {
      console.error("[v0] Auto-checkout error:", err)
      alert(err instanceof Error ? err.message : "Auto-checkout failed")
    } finally {
      setProcessingDeal(null)
    }
  }

  useEffect(() => {
    fetchDeals()
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDeals, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const activeDeals = data?.deals.filter((d) => d.status === "active") || []
  const autoCheckoutDeals = activeDeals.filter((d) => d.autoCheckoutEligible)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 text-balance flex items-center gap-3">
              <Zap className="h-10 w-10 text-primary" />
              Hot Deals & Price Alerts
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered deal detection across electronics, cars, and real estate
            </p>
            {data?.lastUpdated && (
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDeals}
            disabled={loading}
            className="gap-2 self-start bg-transparent"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-500" />
                Active Deals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeDeals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Detected in last 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Auto-Checkout Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{autoCheckoutDeals.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Eligible for instant purchase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Total Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${activeDeals.reduce((sum, deal) => sum + deal.savings, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Potential savings available</p>
            </CardContent>
          </Card>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && !data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-48 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Deals Grid */}
        {!loading && activeDeals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeDeals.map((deal) => (
              <Card key={deal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full bg-white">
                    <img
                      src={deal.image || `https://via.placeholder.com/400x300?text=${encodeURIComponent(deal.productName.slice(0, 20))}`}
                      alt={deal.productName}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://via.placeholder.com/400x300/f0f0f0/333?text=Deal`
                      }}
                    />
                    {deal.autoCheckoutEligible && (
                      <Badge className="absolute top-2 right-2 bg-primary">
                        <Zap className="h-3 w-3 mr-1" />
                        Auto-Checkout
                      </Badge>
                    )}
                    <Badge className="absolute top-2 left-2 bg-green-500">
                      <Percent className="h-3 w-3 mr-1" />
                      {deal.discountPercent.toFixed(0)}% OFF
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <Badge variant="outline" className="mb-2">
                    {deal.category}
                  </Badge>
                  <CardTitle className="text-lg mb-2 line-clamp-2">{deal.productName}</CardTitle>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-2xl font-bold text-green-500">${deal.currentPrice.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground line-through">${deal.originalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-500">
                    <TrendingDown className="h-4 w-4" />
                    Save ${deal.savings.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    Detected {new Date(deal.detectedAt).toLocaleTimeString()}
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                  {deal.autoCheckoutEligible ? (
                    <Button
                      className="w-full gap-2"
                      onClick={() => handleAutoCheckout(deal)}
                      disabled={processingDeal === deal.id}
                    >
                      {processingDeal === deal.id ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4" />
                          Auto-Checkout Now
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button className="w-full gap-2 bg-transparent" variant="outline">
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && activeDeals.length === 0 && (
          <Card className="p-12 text-center">
            <TrendingDown className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Active Deals</h3>
            <p className="text-muted-foreground mb-4">
              Our AI is constantly monitoring for price drops and hot deals. Check back soon!
            </p>
            <Button onClick={fetchDeals} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Deals
            </Button>
          </Card>
        )}
      </main>
    </div>
  )
}
