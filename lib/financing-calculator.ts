/**
 * Financing and Warranty Calculator
 * Calculates profit from financing, warranties, and insurance upsells
 */

export interface FinancingOption {
  term: number // months
  apr: number // annual percentage rate
  monthlyPayment: number
  totalInterest: number
  totalCost: number
  dealerProfit: number // profit from financing
}

export interface WarrantyOption {
  name: string
  coverage: string
  term: number // months
  cost: number
  dealerProfit: number
}

export interface InsuranceOption {
  type: string
  monthlyCost: number
  dealerCommission: number
}

/**
 * Calculate financing options and dealer profit
 */
export function calculateFinancing(vehiclePrice: number, downPayment = 0): FinancingOption[] {
  const loanAmount = vehiclePrice - downPayment
  const options: FinancingOption[] = []

  // Different term options with varying APRs
  const terms = [
    { months: 36, apr: 4.99 },
    { months: 48, apr: 5.49 },
    { months: 60, apr: 5.99 },
    { months: 72, apr: 6.49 },
  ]

  for (const { months, apr } of terms) {
    const monthlyRate = apr / 100 / 12
    const monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    const totalCost = monthlyPayment * months
    const totalInterest = totalCost - loanAmount

    // Dealer typically earns 1-2% of loan amount as financing profit
    const dealerProfit = loanAmount * 0.015

    options.push({
      term: months,
      apr,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      dealerProfit: Math.round(dealerProfit * 100) / 100,
    })
  }

  return options
}

/**
 * Get warranty options with dealer profit
 */
export function getWarrantyOptions(vehiclePrice: number): WarrantyOption[] {
  return [
    {
      name: "Basic Powertrain",
      coverage: "Engine, transmission, drivetrain",
      term: 36,
      cost: 1200,
      dealerProfit: 600, // 50% markup
    },
    {
      name: "Premium Coverage",
      coverage: "Powertrain + electrical + A/C",
      term: 48,
      cost: 2400,
      dealerProfit: 1200,
    },
    {
      name: "Platinum Bumper-to-Bumper",
      coverage: "Comprehensive coverage",
      term: 60,
      cost: 3800,
      dealerProfit: 1900,
    },
  ]
}

/**
 * Get insurance options with dealer commission
 */
export function getInsuranceOptions(): InsuranceOption[] {
  return [
    {
      type: "GAP Insurance",
      monthlyCost: 25,
      dealerCommission: 400, // One-time commission
    },
    {
      type: "Tire & Wheel Protection",
      monthlyCost: 15,
      dealerCommission: 250,
    },
    {
      type: "Paint Protection",
      monthlyCost: 20,
      dealerCommission: 350,
    },
  ]
}

/**
 * Calculate total profit from all upsells
 */
export function calculateTotalProfit(
  vehicleProfit: number,
  financing?: FinancingOption,
  warranty?: WarrantyOption,
  insurance?: InsuranceOption[],
): number {
  let total = vehicleProfit

  if (financing) {
    total += financing.dealerProfit
  }

  if (warranty) {
    total += warranty.dealerProfit
  }

  if (insurance) {
    total += insurance.reduce((sum, ins) => sum + ins.dealerCommission, 0)
  }

  return Math.round(total * 100) / 100
}
