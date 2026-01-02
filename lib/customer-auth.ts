export interface Customer {
  id: string
  email: string
  name: string
  phone?: string
  password: string
  createdAt: Date
  rewardPoints: number
  totalSpent: number
  orderCount: number
}

export interface CustomerSession {
  customer: Customer
  token: string
  expiresAt: Date
}

// Mock customer database
const mockCustomers: Map<string, Customer> = new Map()

// Current session storage
let currentCustomerSession: CustomerSession | null = null

export function registerCustomer(
  email: string,
  password: string,
  name: string,
  phone?: string,
): { success: boolean; message: string; customer?: Customer } {
  if (mockCustomers.has(email)) {
    return { success: false, message: "Email already registered" }
  }

  const customer: Customer = {
    id: `cust_${Date.now()}`,
    email,
    name,
    phone,
    password, // In production, hash this
    createdAt: new Date(),
    rewardPoints: 100, // Welcome bonus
    totalSpent: 0,
    orderCount: 0,
  }

  mockCustomers.set(email, customer)
  return { success: true, message: "Account created successfully! You earned 100 welcome points!", customer }
}

export function loginCustomer(email: string, password: string): CustomerSession | null {
  const customer = mockCustomers.get(email)

  if (!customer || customer.password !== password) {
    return null
  }

  const session: CustomerSession = {
    customer,
    token: `cust_token_${customer.id}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
  }

  currentCustomerSession = session
  return session
}

export function logoutCustomer(): void {
  currentCustomerSession = null
}

export function getCurrentCustomer(): CustomerSession | null {
  if (!currentCustomerSession) return null
  if (new Date() > currentCustomerSession.expiresAt) {
    currentCustomerSession = null
    return null
  }
  return currentCustomerSession
}

export function addRewardPoints(customerId: string, points: number): void {
  for (const [, customer] of mockCustomers) {
    if (customer.id === customerId) {
      customer.rewardPoints += points
      break
    }
  }
}

export function redeemPoints(customerId: string, points: number): boolean {
  for (const [, customer] of mockCustomers) {
    if (customer.id === customerId) {
      if (customer.rewardPoints >= points) {
        customer.rewardPoints -= points
        return true
      }
      return false
    }
  }
  return false
}
