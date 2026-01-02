/**
 * Property data types and mock data for real estate listings
 * Prepared for future MLS API integration
 */

export interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  squareFeet: number
  lotSize: string
  yearBuilt: number
  propertyType: "Single Family" | "Condo" | "Townhouse" | "Multi-Family"
  status: "For Sale" | "Pending" | "Sold"
  description: string
  features: string[]
  images: string[]
  coordinates: {
    lat: number
    lng: number
  }
  agent: {
    name: string
    phone: string
    email: string
    photo: string
    license: string
  }
  listingDate: string
  mlsNumber?: string // For future MLS integration
}

// Mock property data - will be replaced with MLS API data
export const mockProperty: Property = {
  id: "1",
  title: "Stunning Modern Architectural Masterpiece",
  address: "2847 Oakwood Boulevard",
  city: "San Francisco",
  state: "CA",
  zipCode: "94110",
  price: 2850000,
  bedrooms: 4,
  bathrooms: 3.5,
  squareFeet: 3200,
  lotSize: "0.25 acres",
  yearBuilt: 2021,
  propertyType: "Single Family",
  status: "For Sale",
  description:
    "Experience luxury living in this breathtaking contemporary home featuring floor-to-ceiling windows, open-concept design, and premium finishes throughout. The chef's kitchen boasts top-of-the-line appliances, custom cabinetry, and a spacious island perfect for entertaining. The primary suite offers a spa-like bathroom and walk-in closet. Enjoy the beautifully landscaped backyard with outdoor kitchen and fire pit.",
  features: [
    "Smart home technology",
    "Hardwood floors",
    "Gourmet kitchen",
    "Walk-in closets",
    "Central air conditioning",
    "Two-car garage",
    "Outdoor entertainment area",
    "Energy-efficient windows",
    "Security system",
    "Landscaped yard",
  ],
  images: [
    "/modern-home-exterior.jpg",
    "/modern-kitchen-interior.jpg",
    "/luxury-living-room.jpg",
    "/master-bedroom-suite.jpg",
    "/outdoor-patio-space.jpg",
  ],
  coordinates: {
    lat: 37.7749,
    lng: -122.4194,
  },
  agent: {
    name: "Sarah Mitchell",
    phone: "(415) 555-0123",
    email: "sarah.mitchell@realestate.com",
    photo: "/agent-photo.jpg",
    license: "CA DRE #01234567",
  },
  listingDate: "2025-01-15",
  mlsNumber: "MLS-2025-001234",
}

/**
 * Format price as currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(num)
}
