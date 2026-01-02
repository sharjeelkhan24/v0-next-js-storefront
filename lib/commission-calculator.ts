/**
 * Commission calculator and closing pipeline tracker
 */

export interface CommissionBreakdown {
  salePrice: number
  commissionRate: number // Percentage (e.g., 3 for 3%)
  totalCommission: number
  agentSplit: number // Percentage of commission agent receives
  agentEarnings: number
  brokerageFee: number
  estimatedClosingCosts: number
  netProceeds: number
}

export interface ClosingDeal {
  id: string
  propertyId: string
  buyerId: string
  propertyAddress: string
  salePrice: number
  status:
    | "lead"
    | "showing-scheduled"
    | "offer-made"
    | "under-contract"
    | "inspection"
    | "appraisal"
    | "closing"
    | "closed"
  commissionRate: number
  estimatedCloseDate: string
  actualCloseDate?: string
  commission: CommissionBreakdown
  timeline: {
    leadDate: string
    showingDate?: string
    offerDate?: string
    contractDate?: string
    inspectionDate?: string
    appraisalDate?: string
    closingDate?: string
  }
  notes: string[]
}

/**
 * Calculate commission breakdown for a real estate transaction
 */
export function calculateCommission(salePrice: number, commissionRate = 3, agentSplit = 70): CommissionBreakdown {
  console.log("[v0] Calculating commission:", { salePrice, commissionRate, agentSplit })

  const totalCommission = (salePrice * commissionRate) / 100
  const agentEarnings = (totalCommission * agentSplit) / 100
  const brokerageFee = totalCommission - agentEarnings

  // Estimate closing costs (typically 2-5% of sale price)
  const estimatedClosingCosts = salePrice * 0.03

  const netProceeds = agentEarnings - estimatedClosingCosts

  return {
    salePrice,
    commissionRate,
    totalCommission,
    agentSplit,
    agentEarnings,
    brokerageFee,
    estimatedClosingCosts,
    netProceeds,
  }
}

/**
 * Calculate total pipeline value
 */
export function calculatePipelineValue(deals: ClosingDeal[]): {
  totalValue: number
  totalCommission: number
  dealsByStage: Record<string, number>
  averageDaysToClose: number
} {
  const totalValue = deals.reduce((sum, deal) => sum + deal.salePrice, 0)
  const totalCommission = deals.reduce((sum, deal) => sum + deal.commission.agentEarnings, 0)

  const dealsByStage = deals.reduce(
    (acc, deal) => {
      acc[deal.status] = (acc[deal.status] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate average days to close for closed deals
  const closedDeals = deals.filter((d) => d.status === "closed" && d.actualCloseDate)
  const averageDaysToClose =
    closedDeals.length > 0
      ? closedDeals.reduce((sum, deal) => {
          const leadDate = new Date(deal.timeline.leadDate)
          const closeDate = new Date(deal.actualCloseDate!)
          const days = Math.floor((closeDate.getTime() - leadDate.getTime()) / (1000 * 60 * 60 * 24))
          return sum + days
        }, 0) / closedDeals.length
      : 0

  return {
    totalValue,
    totalCommission,
    dealsByStage,
    averageDaysToClose: Math.round(averageDaysToClose),
  }
}

/**
 * Estimate probability of closing based on current stage
 */
export function estimateClosingProbability(status: ClosingDeal["status"]): number {
  const probabilities: Record<ClosingDeal["status"], number> = {
    lead: 10,
    "showing-scheduled": 25,
    "offer-made": 50,
    "under-contract": 75,
    inspection: 80,
    appraisal: 85,
    closing: 95,
    closed: 100,
  }

  return probabilities[status] || 0
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
