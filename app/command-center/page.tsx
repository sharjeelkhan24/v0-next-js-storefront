"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  DollarSign,
  Package,
  Car,
  Home,
  Zap,
  ArrowUpRight,
  Activity,
  Target,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import {
  calculateElectronicsMetrics,
  calculateCarsMetrics,
  calculateRealEstateMetrics,
  generateArbitrageOpportunities,
  generateRecentActivity,
} from "@/lib/unified-analytics"
import { getActiveDeals } from "@/lib/deal-monitor"
import { mockCraigslistCars } from "@/lib/craigslist-cars"
import { mockProperty } from "@/lib/property-data"
import { mockOrders } from "@/lib/mock-orders"

export default function CommandCenterPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Get data from all engines
  const deals = getActiveDeals()
  const cars = mockCraigslistCars
  const properties = [mockProperty]
  const orders = mockOrders

  // Calculate metrics
  const electronicsMetrics = calculateElectronicsMetrics(deals, orders)
  const carsMetrics = calculateCarsMetrics(cars, orders)
  const realEstateMetrics = calculateRealEstateMetrics(properties, orders)

  const totalRevenue = electronicsMetrics.revenue + carsMetrics.revenue + realEstateMetrics.revenue
  const totalListings =
    electronicsMetrics.activeListings + carsMetrics.activeListings + realEstateMetrics.activeListings

  // Generate AI insights
  const arbitrageOpportunities = generateArbitrageOpportunities(deals, cars, properties)
  const recentActivity = generateRecentActivity(deals, orders)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdated(new Date())
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Command Center</h1>
            <p className="text-muted-foreground mt-1">Unified dashboard across Electronics, Cars, and Real Estate</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Last updated</div>
              <div className="text-sm font-medium">{lastUpdated.toLocaleTimeString()}</div>
            </div>
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 dark:text-green-500">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalListings}</div>
              <p className="text-xs text-muted-foreground mt-1">Across all engines</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Deals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {electronicsMetrics.pendingDeals + carsMetrics.pendingDeals + realEstateMetrics.pendingDeals}
              </div>
              <p className="text-xs text-muted-foreground mt-1">AI-detected opportunities</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(
                  (electronicsMetrics.conversionRate + carsMetrics.conversionRate + realEstateMetrics.conversionRate) /
                  3
                ).toFixed(1)}
                %
              </div>
              <p className="text-xs text-muted-foreground mt-1">Platform-wide rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Engine Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Engine Performance</CardTitle>
            <CardDescription>Revenue and metrics across all three verticals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Electronics Engine */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg">
                    <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Electronics Engine</div>
                    <div className="text-sm text-muted-foreground">
                      {electronicsMetrics.activeListings} active listings
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${electronicsMetrics.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    {electronicsMetrics.conversionRate}% conversion
                  </div>
                </div>
                <Link href="/deals">
                  <Button variant="outline" size="sm">
                    View Deals
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>

              {/* Cars Engine */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-orange-500/10 rounded-lg">
                    <Car className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Car Engine</div>
                    <div className="text-sm text-muted-foreground">{carsMetrics.activeListings} active listings</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${carsMetrics.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    {carsMetrics.conversionRate}% conversion
                  </div>
                </div>
                <Link href="/cars">
                  <Button variant="outline" size="sm">
                    View Inventory
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>

              {/* Real Estate Engine */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-lg">
                    <Home className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold">Real Estate Engine</div>
                    <div className="text-sm text-muted-foreground">
                      {realEstateMetrics.activeListings} active listings
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">${realEstateMetrics.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    {realEstateMetrics.conversionRate}% conversion
                  </div>
                </div>
                <Link href="/property/1">
                  <Button variant="outline" size="sm">
                    View Properties
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for detailed views */}
        <Tabs defaultValue="arbitrage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="arbitrage">AI Arbitrage</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="arbitrage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>AI Arbitrage Opportunities</CardTitle>
                <CardDescription>Undervalued assets detected across all engines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {arbitrageOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <img
                        src={opp.image || "/placeholder.svg"}
                        alt={opp.title}
                        className="h-16 w-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="font-semibold">{opp.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Current: ${opp.currentPrice.toLocaleString()} → Est. Value: $
                          {opp.estimatedValue.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600 dark:text-green-500">
                          +${opp.profitPotential.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">{opp.profitMargin.toFixed(1)}% margin</div>
                      </div>
                      <Badge variant="outline">{opp.confidence.toFixed(0)}% confidence</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest events across all engines</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            activity.type === "sale"
                              ? "bg-green-500/10"
                              : activity.type === "deal"
                                ? "bg-blue-500/10"
                                : activity.type === "listing"
                                  ? "bg-orange-500/10"
                                  : "bg-purple-500/10"
                          }`}
                        >
                          {activity.type === "sale" && <DollarSign className="h-4 w-4 text-green-600" />}
                          {activity.type === "deal" && <Target className="h-4 w-4 text-blue-600" />}
                          {activity.type === "listing" && <Package className="h-4 w-4 text-orange-600" />}
                          {activity.type === "inquiry" && <Activity className="h-4 w-4 text-purple-600" />}
                        </div>
                        <div>
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-xs text-muted-foreground">{activity.timestamp.toLocaleString()}</div>
                        </div>
                      </div>
                      {activity.amount && <div className="font-semibold">${activity.amount.toLocaleString()}</div>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
