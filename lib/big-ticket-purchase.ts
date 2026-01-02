export interface VerifiedBuyer {
  id: string
  email: string
  name: string
  phone: string
  verified: boolean
  idVerified: boolean
  addressVerified: boolean
  incomeVerified: boolean
  creditScore?: number
}

export interface CarPurchaseProcess {
  step: "registration" | "vehicle-inspection" | "financing" | "shipping" | "title-transfer" | "completed"
  vehicleId: string
  buyerId: string
  inspectionReport?: {
    mechanicalCondition: string
    bodyCondition: string
    mileageVerified: boolean
    accidentHistory: string
    estimatedValue: number
  }
  financing?: {
    loanApproved: boolean
    lender: string
    downPayment: number
    monthlyPayment: number
    interestRate: number
  }
  shipping: {
    method: "pickup" | "enclosed-transport" | "open-transport" | "drive-away"
    carrier?: string
    estimatedDelivery?: string
    cost: number
    insurance: number
    trackingNumber?: string
  }
  titleTransfer: {
    currentOwner: string
    dmvState: string
    titleStatus: "clean" | "salvage" | "rebuilt"
    lienStatus: "clear" | "has-lien"
    transferFee: number
    expectedCompletionDays: number
  }
}

export interface HousePurchaseProcess {
  step: "registration" | "pre-approval" | "inspection" | "escrow" | "title-insurance" | "closing" | "completed"
  propertyId: string
  buyerId: string
  preApproval?: {
    approved: boolean
    lender: string
    maxLoanAmount: number
    downPaymentPercent: number
    interestRate: number
  }
  inspection?: {
    inspectorName: string
    inspectionDate: string
    structuralIssues: string[]
    estimatedRepairCost: number
    passed: boolean
  }
  escrow: {
    company: string
    escrowNumber: string
    depositAmount: number
    closingDate: string
    earnestMoney: number
  }
  titleInsurance: {
    company: string
    policyNumber: string
    cost: number
    coverageAmount: number
  }
  closing: {
    closingCosts: number
    propertyTax: number
    hoa?: number
    homeownersInsurance: number
    totalDue: number
  }
}

// Car Transport Companies
export const CAR_TRANSPORT_COMPANIES = [
  {
    name: "Montway Auto Transport",
    rating: 4.8,
    openTransport: { basePrice: 450, perMile: 0.6 },
    enclosedTransport: { basePrice: 900, perMile: 1.2 },
    insurance: 100000,
    deliveryDays: "5-7",
  },
  {
    name: "Sherpa Auto Transport",
    rating: 4.7,
    openTransport: { basePrice: 425, perMile: 0.55 },
    enclosedTransport: { basePrice: 850, perMile: 1.15 },
    insurance: 100000,
    deliveryDays: "4-6",
  },
  {
    name: "AmeriFreight",
    rating: 4.6,
    openTransport: { basePrice: 475, perMile: 0.65 },
    enclosedTransport: { basePrice: 950, perMile: 1.25 },
    insurance: 250000,
    deliveryDays: "6-8",
  },
]

// Escrow & Title Companies
export const TITLE_COMPANIES = [
  {
    name: "First American Title",
    rating: 4.9,
    titleSearchFee: 250,
    titleInsuranceCost: 0.005, // 0.5% of property value
    escrowFee: 0.002, // 0.2% of property value
    avgClosingDays: 30,
  },
  {
    name: "Fidelity National Title",
    rating: 4.8,
    titleSearchFee: 275,
    titleInsuranceCost: 0.0048,
    escrowFee: 0.0022,
    avgClosingDays: 28,
  },
  {
    name: "Old Republic Title",
    rating: 4.7,
    titleSearchFee: 225,
    titleInsuranceCost: 0.0052,
    escrowFee: 0.0018,
    avgClosingDays: 32,
  },
]

export function calculateCarShippingCost(
  distance: number,
  method: "open" | "enclosed",
): {
  company: string
  cost: number
  insurance: number
  deliveryDays: string
  total: number
} {
  const bestCompany = CAR_TRANSPORT_COMPANIES[0]
  const transportType = method === "enclosed" ? bestCompany.enclosedTransport : bestCompany.openTransport
  const transportCost = transportType.basePrice + distance * transportType.perMile
  const insuranceCost = 150

  return {
    company: bestCompany.name,
    cost: Math.round(transportCost),
    insurance: insuranceCost,
    deliveryDays: bestCompany.deliveryDays,
    total: Math.round(transportCost + insuranceCost),
  }
}

export function calculateHouseClosingCosts(propertyPrice: number): {
  titleSearch: number
  titleInsurance: number
  escrowFee: number
  inspectionFee: number
  appraisalFee: number
  lenderFees: number
  recordingFees: number
  total: number
} {
  const titleCompany = TITLE_COMPANIES[0]

  return {
    titleSearch: titleCompany.titleSearchFee,
    titleInsurance: Math.round(propertyPrice * titleCompany.titleInsuranceCost),
    escrowFee: Math.round(propertyPrice * titleCompany.escrowFee),
    inspectionFee: 500,
    appraisalFee: 450,
    lenderFees: Math.round(propertyPrice * 0.01), // 1% origination
    recordingFees: 125,
    total: 0, // Will be calculated
  }
}

export function initializeCarPurchase(vehicleId: string, buyerId: string): CarPurchaseProcess {
  return {
    step: "registration",
    vehicleId,
    buyerId,
    shipping: {
      method: "open-transport",
      cost: 0,
      insurance: 0,
    },
    titleTransfer: {
      currentOwner: "Verified Seller",
      dmvState: "TX",
      titleStatus: "clean",
      lienStatus: "clear",
      transferFee: 75,
      expectedCompletionDays: 14,
    },
  }
}

export function initializeHousePurchase(propertyId: string, buyerId: string): HousePurchaseProcess {
  return {
    step: "registration",
    propertyId,
    buyerId,
    escrow: {
      company: TITLE_COMPANIES[0].name,
      escrowNumber: `ESC${Date.now()}`,
      depositAmount: 0,
      closingDate: "",
      earnestMoney: 0,
    },
    titleInsurance: {
      company: TITLE_COMPANIES[0].name,
      policyNumber: "",
      cost: 0,
      coverageAmount: 0,
    },
    closing: {
      closingCosts: 0,
      propertyTax: 0,
      homeownersInsurance: 0,
      totalDue: 0,
    },
  }
}
