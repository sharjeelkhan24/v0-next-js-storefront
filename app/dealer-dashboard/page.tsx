"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, DollarSign, Car, Target, Zap, RefreshCw, Calculator, ShieldCheck, CreditCard } from "lucide-react"
import type { AuctionVehicle } from "@/lib/auction-scraper"
import type { ArbitrageAnalysis } from "@/lib/arbitrage-engine"
import type { CraigslistCar } from "@/lib/craigslist-cars"
import { mockCraigslistCars } from "@/lib/craigslist-cars"
import {
  calculateFinancing,
  getWarrantyOptions,
  getInsuranceOptions,
  calculateTotalProfit,
  type FinancingOption,
  type WarrantyOption,
} from "@/lib/financing-calculator"
import Image from "next/image"

interface AnalyzedVehicle extends AuctionVehicle {
  analysis?: ArbitrageAnalysis
}

interface InventoryStats {
  totalVehicles: number
  auctionVehicles: number
  privateListings: number
  avgArbitrageScore: number
  totalProfitPotential: number
  topOpportunities: number
}

export default function DealerDashboardPage() {
  const [auctionVehicles, setAuctionVehicles] = useState<AnalyzedVehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicle, setSelectedVehicle] = useState<AnalyzedVehicle | CraigslistCar | null>(null)
  const [showCalculator, setShowCalculator] = useState(false)

  useEffect(() => {
    loadInventory()
  }, [])

  async function loadInventory() {
    setLoading(true)
    try {
      // Load auction vehicles with analysis
      const response = await fetch("/api/auctions/analyze")
      const data = await response.json()

      if (data.success) {
        setAuctionVehicles(data.vehicles)
      }
    } catch (error) {
      console.error("[v0] Error loading inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate inventory stats
  const stats: InventoryStats = {
    totalVehicles: auctionVehicles.length + mockCraigslistCars.length,
    auctionVehicles: auctionVehicles.length,
    privateListings: mockCraigslistCars.length,
    avgArbitrageScore:
      auctionVehicles.reduce((sum, v) => sum + (v.analysis?.arbitrageScore || 0), 0) / auctionVehicles.length || 0,
    totalProfitPotential: auctionVehicles.reduce((sum, v) => sum + (v.analysis?.profitPotential || 0), 0),
    topOpportunities: auctionVehicles.filter((v) => v.analysis && v.analysis.arbitrageScore >= 70).length,
  }

  // Get top acquisition recommendations
  const topRecommendations = auctionVehicles
    .filter((v) => v.analysis && v.analysis.arbitrageScore >= 70)
    .sort((a, b) => (b.analysis?.arbitrageScore || 0) - (a.analysis?.arbitrageScore || 0))
    .slice(0, 5)

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <Skeleton className="h-12 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
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
              <h1 className="text-3xl font-bold text-balance">Dealer Dashboard</h1>
              <p className="text-muted-foreground mt-1">Inventory aggregation & profit analysis</p>
            </div>

            <div className="flex gap-2">
              <Button onClick={loadInventory} variant="outline" size="sm" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
              <Button size="sm" className="gap-2" onClick={() => setShowCalculator(!showCalculator)}>
                <Calculator className="h-4 w-4" />
                Profit Calculator
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Inventory</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                {stats.auctionVehicles} auction + {stats.privateListings} private
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Arbitrage Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(stats.avgArbitrageScore)}/100</div>
              <p className="text-xs text-muted-foreground">Across analyzed vehicles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Potential</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Math.round(stats.totalProfitPotential).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">From current opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hot Opportunities</CardTitle>
              <Zap className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.topOpportunities}</div>
              <p className="text-xs text-muted-foreground">Score 70+ vehicles</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="recommendations" className="space-y-6">
          <TabsList>
            <TabsTrigger value="recommendations">Top Recommendations</TabsTrigger>
            <TabsTrigger value="auction">Auction Inventory</TabsTrigger>
            <TabsTrigger value="private">Private Listings</TabsTrigger>
            <TabsTrigger value="calculator">Profit Calculator</TabsTrigger>
          </TabsList>

          {/* Top Recommendations */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Acquisition Recommendations
                </CardTitle>
                <CardDescription>AI-scored vehicles with highest profit potential</CardDescription>
              </CardHeader>
              <CardContent>
                {topRecommendations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No high-scoring opportunities available</p>
                ) : (
                  <div className="space-y-4">
                    {topRecommendations.map((vehicle, index) => (
                      <div
                        key={vehicle.id}
                        className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-lg">
                          #{index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </h3>
                              <p className="text-sm text-muted-foreground">{vehicle.location}</p>
                            </div>
                            <Badge
                              className={
                                vehicle.analysis!.arbitrageScore >= 80
                                  ? "bg-green-500"
                                  : vehicle.analysis!.arbitrageScore >= 70
                                    ? "bg-yellow-500"
                                    : "bg-orange-500"
                              }
                            >
                              Score: {vehicle.analysis!.arbitrageScore}/100
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">Current Bid</p>
                              <p className="font-semibold">${vehicle.currentBid.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Profit Potential</p>
                              <p className="font-semibold text-green-600">
                                ${vehicle.analysis!.profitPotential.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Repair Cost</p>
                              <p className="font-semibold">${vehicle.analysis!.repairCostEstimate.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Max Bid</p>
                              <p className="font-semibold">${vehicle.analysis!.recommendedMaxBid.toLocaleString()}</p>
                            </div>
                          </div>

                          <div className="mt-3 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedVehicle(vehicle)}>
                              View Details
                            </Button>
                            <Button size="sm" className="gap-2">
                              <Zap className="h-4 w-4" />
                              Auto-Bid
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auction Inventory */}
          <TabsContent value="auction">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctionVehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden">
                  <div className="relative h-48 bg-muted">
                    <Image
                      src={vehicle.images[0] || "/placeholder.svg"}
                      alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </CardTitle>
                    <CardDescription>{vehicle.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Bid:</span>
                        <span className="font-semibold">${vehicle.currentBid.toLocaleString()}</span>
                      </div>
                      {vehicle.analysis && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Profit Potential:</span>
                            <span className="font-semibold text-green-600">
                              ${vehicle.analysis.profitPotential.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Score:</span>
                            <Badge variant="outline">{vehicle.analysis.arbitrageScore}/100</Badge>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Private Listings */}
          <TabsContent value="private">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockCraigslistCars.slice(0, 9).map((car) => (
                <Card key={car.id} className="overflow-hidden">
                  <div className="relative h-48 bg-muted">
                    <Image
                      src={car.imageUrl || "/placeholder.svg"}
                      alt={`${car.year} ${car.make} ${car.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {car.year} {car.make} {car.model}
                    </CardTitle>
                    <CardDescription>{car.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-semibold">${car.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mileage:</span>
                        <span className="font-semibold">{car.mileage.toLocaleString()} mi</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Condition:</span>
                        <Badge variant="outline">{car.condition}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Profit Calculator */}
          <TabsContent value="calculator">
            <ProfitCalculator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function ProfitCalculator() {
  const [vehiclePrice, setVehiclePrice] = useState(25000)
  const [vehicleCost, setVehicleCost] = useState(20000)
  const [downPayment, setDownPayment] = useState(5000)
  const [selectedFinancing, setSelectedFinancing] = useState<FinancingOption | null>(null)
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyOption | null>(null)
  const [selectedInsurance, setSelectedInsurance] = useState<string[]>([])

  const vehicleProfit = vehiclePrice - vehicleCost
  const financingOptions = calculateFinancing(vehiclePrice, downPayment)
  const warrantyOptions = getWarrantyOptions(vehiclePrice)
  const insuranceOptions = getInsuranceOptions()

  const selectedInsuranceItems = insuranceOptions.filter((ins) => selectedInsurance.includes(ins.type))

  const totalProfit = calculateTotalProfit(
    vehicleProfit,
    selectedFinancing || undefined,
    selectedWarranty || undefined,
    selectedInsuranceItems,
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Section */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehicle Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sale Price</label>
              <input
                type="number"
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Acquisition Cost</label>
              <input
                type="number"
                value={vehicleCost}
                onChange={(e) => setVehicleCost(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Down Payment</label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
              />
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-lg font-semibold">
                <span>Base Vehicle Profit:</span>
                <span className="text-green-600">${vehicleProfit.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Financing Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {financingOptions.map((option) => (
              <div
                key={option.term}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedFinancing?.term === option.term ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                }`}
                onClick={() => setSelectedFinancing(option)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">
                      {option.term} months @ {option.apr}% APR
                    </p>
                    <p className="text-sm text-muted-foreground">${option.monthlyPayment}/mo</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    +${option.dealerProfit.toLocaleString()}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Warranty Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {warrantyOptions.map((option) => (
              <div
                key={option.name}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedWarranty?.name === option.name ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                }`}
                onClick={() => setSelectedWarranty(option)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{option.name}</p>
                    <p className="text-sm text-muted-foreground">{option.coverage}</p>
                    <p className="text-sm text-muted-foreground">
                      {option.term} months - ${option.cost}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    +${option.dealerProfit.toLocaleString()}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Insurance Add-ons</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insuranceOptions.map((option) => (
              <div
                key={option.type}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedInsurance.includes(option.type) ? "border-primary bg-primary/5" : "hover:bg-accent/50"
                }`}
                onClick={() => {
                  if (selectedInsurance.includes(option.type)) {
                    setSelectedInsurance(selectedInsurance.filter((t) => t !== option.type))
                  } else {
                    setSelectedInsurance([...selectedInsurance, option.type])
                  }
                }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{option.type}</p>
                    <p className="text-sm text-muted-foreground">${option.monthlyCost}/mo</p>
                  </div>
                  <Badge variant="outline" className="text-green-600">
                    +${option.dealerCommission.toLocaleString()}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Summary Section */}
      <div>
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Profit Summary
            </CardTitle>
            <CardDescription>Total profit from all revenue streams</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vehicle Sale Profit:</span>
                <span className="font-semibold">${vehicleProfit.toLocaleString()}</span>
              </div>

              {selectedFinancing && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Financing Profit:</span>
                  <span className="font-semibold text-green-600">
                    +${selectedFinancing.dealerProfit.toLocaleString()}
                  </span>
                </div>
              )}

              {selectedWarranty && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Warranty Profit:</span>
                  <span className="font-semibold text-green-600">
                    +${selectedWarranty.dealerProfit.toLocaleString()}
                  </span>
                </div>
              )}

              {selectedInsuranceItems.map((ins) => (
                <div key={ins.type} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{ins.type}:</span>
                  <span className="font-semibold text-green-600">+${ins.dealerCommission.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Profit:</span>
                <span className="text-2xl font-bold text-green-600">${totalProfit.toLocaleString()}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {Math.round((totalProfit / vehiclePrice) * 100)}% profit margin on sale price
              </p>
            </div>

            <div className="pt-4 border-t space-y-2 text-sm">
              <p className="font-semibold">Breakdown:</p>
              <div className="space-y-1 text-muted-foreground">
                <p>• Base profit: {Math.round((vehicleProfit / totalProfit) * 100)}%</p>
                {selectedFinancing && (
                  <p>• Financing: {Math.round((selectedFinancing.dealerProfit / totalProfit) * 100)}%</p>
                )}
                {selectedWarranty && (
                  <p>• Warranty: {Math.round((selectedWarranty.dealerProfit / totalProfit) * 100)}%</p>
                )}
                {selectedInsuranceItems.length > 0 && (
                  <p>
                    • Insurance:{" "}
                    {Math.round(
                      (selectedInsuranceItems.reduce((sum, ins) => sum + ins.dealerCommission, 0) / totalProfit) * 100,
                    )}
                    %
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
