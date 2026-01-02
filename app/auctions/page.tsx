"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  getAuctionSourceColor,
  getDamageTypeColor,
  type AuctionVehicle,
  type AuctionSource,
} from "@/lib/auction-scraper"
import type { ArbitrageAnalysis } from "@/lib/arbitrage-engine"
import { TrendingUp, AlertTriangle, DollarSign, Wrench, Target, Zap, RefreshCw } from "lucide-react"
import Image from "next/image"

interface AnalyzedVehicle extends AuctionVehicle {
  analysis?: ArbitrageAnalysis
}

export default function AuctionsPage() {
  const [vehicles, setVehicles] = useState<AnalyzedVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [selectedSource, setSelectedSource] = useState<AuctionSource | "all">("all")

  useEffect(() => {
    loadAuctions()
  }, [])

  async function loadAuctions() {
    setLoading(true)
    try {
      const response = await fetch("/api/auctions/scrape")
      const data = await response.json()

      if (data.success) {
        setVehicles(data.vehicles)
      }
    } catch (error) {
      console.error("[v0] Error loading auctions:", error)
    } finally {
      setLoading(false)
    }
  }

  async function analyzeAuctions() {
    setAnalyzing(true)
    try {
      const response = await fetch("/api/auctions/analyze")
      const data = await response.json()

      if (data.success) {
        setVehicles(data.vehicles)
      }
    } catch (error) {
      console.error("[v0] Error analyzing auctions:", error)
    } finally {
      setAnalyzing(false)
    }
  }

  async function startAutoBid(vehicleId: string) {
    try {
      const response = await fetch("/api/auctions/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      })

      const data = await response.json()

      if (data.success) {
        alert(
          `${data.finalResult.won ? "Won" : "Lost"} auction!\n${data.finalResult.message}\nFinal bid: $${data.finalResult.finalBid.toLocaleString()}`,
        )
      }
    } catch (error) {
      console.error("[v0] Error starting auto-bid:", error)
      alert("Failed to start automated bidding")
    }
  }

  const filteredVehicles = selectedSource === "all" ? vehicles : vehicles.filter((v) => v.source === selectedSource)

  const topOpportunities = vehicles.filter((v) => v.analysis && v.analysis.arbitrageScore >= 70).slice(0, 3)

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Auction Marketplace</h1>
              <p className="text-muted-foreground mt-1">
                {filteredVehicles.length} vehicles from Copart, IAA, and Manheim
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={loadAuctions} variant="outline" size="sm" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button onClick={analyzeAuctions} disabled={analyzing} size="sm" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                {analyzing ? "Analyzing..." : "AI Analysis"}
              </Button>
            </div>
          </div>

          {/* Source filters */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={selectedSource === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSource("all")}
            >
              All Sources
            </Button>
            <Button
              variant={selectedSource === "copart" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSource("copart")}
            >
              Copart
            </Button>
            <Button
              variant={selectedSource === "iaai" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSource("iaai")}
            >
              IAA
            </Button>
            <Button
              variant={selectedSource === "manheim" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSource("manheim")}
            >
              Manheim
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Top opportunities */}
        {topOpportunities.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              Top Arbitrage Opportunities
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {topOpportunities.map((vehicle) => (
                <Card key={vehicle.id} className="border-yellow-500/20 bg-yellow-500/5">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <CardDescription>Score: {vehicle.analysis?.arbitrageScore}/100</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Profit Potential:</span>
                        <span className="font-semibold text-green-600">
                          ${vehicle.analysis?.profitPotential.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Bid:</span>
                        <span>${vehicle.currentBid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence:</span>
                        <Badge variant="outline">{vehicle.analysis?.confidence}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Vehicle grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map((vehicle) => (
            <Card key={vehicle.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-muted">
                <Image
                  src={vehicle.images[0] || "/placeholder.svg"}
                  alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-2">
                  <Badge className={getAuctionSourceColor(vehicle.source)}>{vehicle.source.toUpperCase()}</Badge>
                  <Badge className={getDamageTypeColor(vehicle.damageType)}>
                    {vehicle.damageType.replace("-", " ")}
                  </Badge>
                </div>
                {vehicle.analysis && vehicle.analysis.arbitrageScore >= 70 && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500 text-black">
                      <Zap className="h-3 w-3 mr-1" />
                      Hot Deal
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader>
                <CardTitle className="text-lg">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </CardTitle>
                <CardDescription>{vehicle.location}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Bid</p>
                    <p className="font-semibold text-lg">${vehicle.currentBid.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Retail Value</p>
                    <p className="font-semibold text-lg">${vehicle.estimatedRetailValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Mileage</p>
                    <p className="font-semibold">{vehicle.mileage.toLocaleString()} mi</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Title</p>
                    <p className="font-semibold capitalize">{vehicle.title}</p>
                  </div>
                </div>

                {vehicle.analysis && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Arbitrage Score</span>
                      <Badge
                        variant="outline"
                        className={
                          vehicle.analysis.arbitrageScore >= 75
                            ? "border-green-500 text-green-700"
                            : vehicle.analysis.arbitrageScore >= 60
                              ? "border-yellow-500 text-yellow-700"
                              : "border-red-500 text-red-700"
                        }
                      >
                        {vehicle.analysis.arbitrageScore}/100
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-green-600" />
                        <span className="text-muted-foreground">Profit:</span>
                        <span className="font-semibold">${vehicle.analysis.profitPotential.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wrench className="h-3 w-3 text-orange-600" />
                        <span className="text-muted-foreground">Repairs:</span>
                        <span className="font-semibold">${vehicle.analysis.repairCostEstimate.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                        <span className="text-muted-foreground">Demand:</span>
                        <span className="font-semibold">{vehicle.analysis.marketDemandScore}/100</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-purple-600" />
                        <span className="text-muted-foreground">Max Bid:</span>
                        <span className="font-semibold">${vehicle.analysis.recommendedMaxBid.toLocaleString()}</span>
                      </div>
                    </div>

                    {vehicle.analysis.reasoning.length > 0 && (
                      <div className="text-xs space-y-1">
                        <p className="font-semibold text-muted-foreground">Key Points:</p>
                        <ul className="list-disc list-inside space-y-0.5 text-muted-foreground">
                          {vehicle.analysis.reasoning.slice(0, 2).map((reason, i) => (
                            <li key={i}>{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {vehicle.analysis.risks.length > 0 && (
                      <div className="flex items-start gap-1 text-xs text-orange-600">
                        <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                        <span>{vehicle.analysis.risks[0]}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                    View Details
                  </Button>
                  {vehicle.analysis && vehicle.analysis.arbitrageScore >= 60 && (
                    <Button size="sm" className="flex-1 gap-2" onClick={() => startAutoBid(vehicle.id)}>
                      <Zap className="h-4 w-4" />
                      Auto-Bid
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
