"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DollarSign,
  TrendingUp,
  Home,
  Calendar,
  Target,
  ArrowRight,
  CheckCircle2,
  Clock,
  Calculator,
} from "lucide-react"
import type { ClosingDeal } from "@/lib/commission-calculator"
import { calculatePipelineValue, estimateClosingProbability, formatCurrency } from "@/lib/commission-calculator"

// Mock closing deals data
const mockDeals: ClosingDeal[] = [
  {
    id: "1",
    propertyId: "prop-1",
    buyerId: "buyer-1",
    propertyAddress: "2847 Oakwood Blvd, San Francisco, CA",
    salePrice: 2850000,
    status: "under-contract",
    commissionRate: 3,
    estimatedCloseDate: "2025-02-15",
    commission: {
      salePrice: 2850000,
      commissionRate: 3,
      totalCommission: 85500,
      agentSplit: 70,
      agentEarnings: 59850,
      brokerageFee: 25650,
      estimatedClosingCosts: 85500,
      netProceeds: -25650,
    },
    timeline: {
      leadDate: "2025-01-05",
      showingDate: "2025-01-08",
      offerDate: "2025-01-12",
      contractDate: "2025-01-15",
    },
    notes: ["Pre-approved buyer", "Cash offer accepted", "Inspection scheduled for next week"],
  },
  {
    id: "2",
    propertyId: "prop-2",
    buyerId: "buyer-2",
    propertyAddress: "1523 Market Street, San Francisco, CA",
    salePrice: 1250000,
    status: "offer-made",
    commissionRate: 3,
    estimatedCloseDate: "2025-02-28",
    commission: {
      salePrice: 1250000,
      commissionRate: 3,
      totalCommission: 37500,
      agentSplit: 70,
      agentEarnings: 26250,
      brokerageFee: 11250,
      estimatedClosingCosts: 37500,
      netProceeds: -11250,
    },
    timeline: {
      leadDate: "2025-01-18",
      showingDate: "2025-01-20",
      offerDate: "2025-01-22",
    },
    notes: ["Multiple offers expected", "Buyer needs financing approval"],
  },
  {
    id: "3",
    propertyId: "prop-3",
    buyerId: "buyer-3",
    propertyAddress: "789 Valencia Street, San Francisco, CA",
    salePrice: 950000,
    status: "showing-scheduled",
    commissionRate: 3,
    estimatedCloseDate: "2025-03-15",
    commission: {
      salePrice: 950000,
      commissionRate: 3,
      totalCommission: 28500,
      agentSplit: 70,
      agentEarnings: 19950,
      brokerageFee: 8550,
      estimatedClosingCosts: 28500,
      netProceeds: -8550,
    },
    timeline: {
      leadDate: "2025-01-22",
      showingDate: "2025-01-26",
    },
    notes: ["First-time buyer", "Showing scheduled for this weekend"],
  },
]

export default function RealEstatePipelinePage() {
  const [deals] = useState<ClosingDeal[]>(mockDeals)
  const [commissionCalc, setCommissionCalc] = useState({
    salePrice: 1000000,
    commissionRate: 3,
    agentSplit: 70,
  })

  const pipelineStats = useMemo(() => calculatePipelineValue(deals), [deals])

  const weightedPipelineValue = useMemo(() => {
    return deals.reduce((sum, deal) => {
      const probability = estimateClosingProbability(deal.status) / 100
      return sum + deal.commission.agentEarnings * probability
    }, 0)
  }, [deals])

  const calculatedCommission = useMemo(() => {
    const total = (commissionCalc.salePrice * commissionCalc.commissionRate) / 100
    const agent = (total * commissionCalc.agentSplit) / 100
    const brokerage = total - agent
    return { total, agent, brokerage }
  }, [commissionCalc])

  const getStatusColor = (status: ClosingDeal["status"]) => {
    const colors: Record<ClosingDeal["status"], string> = {
      lead: "bg-muted text-muted-foreground",
      "showing-scheduled": "bg-blue-500/10 text-blue-500",
      "offer-made": "bg-yellow-500/10 text-yellow-500",
      "under-contract": "bg-purple-500/10 text-purple-500",
      inspection: "bg-orange-500/10 text-orange-500",
      appraisal: "bg-cyan-500/10 text-cyan-500",
      closing: "bg-green-500/10 text-green-500",
      closed: "bg-primary/10 text-primary",
    }
    return colors[status] || "bg-muted"
  }

  const getStatusLabel = (status: ClosingDeal["status"]) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Real Estate Pipeline</h1>
          <p className="text-muted-foreground mt-1">Track deals, calculate commissions, and manage closings</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Pipeline Overview Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Pipeline Value</p>
                  <p className="mt-1 text-2xl font-bold">{formatCurrency(pipelineStats.totalValue)}</p>
                </div>
                <DollarSign className="text-muted-foreground size-8" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Expected Commission</p>
                  <p className="mt-1 text-2xl font-bold">{formatCurrency(weightedPipelineValue)}</p>
                </div>
                <TrendingUp className="text-muted-foreground size-8" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Deals</p>
                  <p className="mt-1 text-2xl font-bold">{deals.length}</p>
                </div>
                <Home className="text-muted-foreground size-8" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Avg Days to Close</p>
                  <p className="mt-1 text-2xl font-bold">{pipelineStats.averageDaysToClose || "N/A"}</p>
                </div>
                <Calendar className="text-muted-foreground size-8" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Active Deals Pipeline */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Deals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <Card key={deal.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="mb-2 flex items-center gap-2">
                              <Badge className={getStatusColor(deal.status)}>{getStatusLabel(deal.status)}</Badge>
                              <Badge variant="outline" className="gap-1">
                                <Target className="size-3" />
                                {estimateClosingProbability(deal.status)}% probability
                              </Badge>
                            </div>
                            <h3 className="font-semibold">{deal.propertyAddress}</h3>
                            <div className="mt-2 flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                Sale Price:{" "}
                                <span className="font-semibold text-foreground">{formatCurrency(deal.salePrice)}</span>
                              </span>
                              <span className="text-muted-foreground">
                                Commission:{" "}
                                <span className="font-semibold text-primary">
                                  {formatCurrency(deal.commission.agentEarnings)}
                                </span>
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="size-4" />
                              Est. Close: {new Date(deal.estimatedCloseDate).toLocaleDateString()}
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <ArrowRight className="size-4" />
                          </Button>
                        </div>

                        {deal.notes.length > 0 && (
                          <div className="mt-3 space-y-1 border-t pt-3">
                            {deal.notes.map((note, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                                <span className="text-muted-foreground">{note}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commission Calculator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="size-5" />
                  Commission Calculator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="salePrice">Sale Price</Label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={commissionCalc.salePrice}
                    onChange={(e) =>
                      setCommissionCalc({
                        ...commissionCalc,
                        salePrice: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                  <Input
                    id="commissionRate"
                    type="number"
                    step="0.1"
                    value={commissionCalc.commissionRate}
                    onChange={(e) =>
                      setCommissionCalc({
                        ...commissionCalc,
                        commissionRate: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agentSplit">Agent Split (%)</Label>
                  <Input
                    id="agentSplit"
                    type="number"
                    value={commissionCalc.agentSplit}
                    onChange={(e) =>
                      setCommissionCalc({
                        ...commissionCalc,
                        agentSplit: Number(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-3 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Total Commission</span>
                    <span className="font-semibold">{formatCurrency(calculatedCommission.total)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Agent Earnings</span>
                    <span className="font-semibold text-primary">{formatCurrency(calculatedCommission.agent)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-sm">Brokerage Fee</span>
                    <span className="text-muted-foreground font-medium">
                      {formatCurrency(calculatedCommission.brokerage)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
