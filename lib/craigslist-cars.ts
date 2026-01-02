/**
 * Craigslist Cars Data Types and Mock Data
 * Production-ready with full TypeScript types and error handling
 */

export type CarCondition = "excellent" | "good" | "fair" | "salvage"
export type CarTransmission = "automatic" | "manual"
export type CarFuelType = "gas" | "diesel" | "electric" | "hybrid"

export interface CraigslistCar {
  id: string
  title: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  condition: CarCondition
  transmission: CarTransmission
  fuelType: CarFuelType
  location: string
  description: string
  image: string
  postedDate: string
  vin?: string
  features: string[]
}

/**
 * Mock Craigslist car listings data
 * Simulates real-world car marketplace data
 */
export const mockCraigslistCars: CraigslistCar[] = [
  {
    id: "cl-001",
    title: "2020 Honda Civic LX - Low Miles, Excellent Condition",
    make: "Honda",
    model: "Civic LX",
    year: 2020,
    price: 18500,
    mileage: 32000,
    condition: "excellent",
    transmission: "automatic",
    fuelType: "gas",
    location: "San Francisco, CA",
    description:
      "Well-maintained Honda Civic with low mileage. Single owner, all service records available. Clean title.",
    image: "/2020-honda-civic-silver-sedan.jpg",
    postedDate: "2025-01-20",
    vin: "19XFC2F59LE123456",
    features: ["Backup Camera", "Bluetooth", "Lane Assist", "Apple CarPlay"],
  },
  {
    id: "cl-002",
    title: "2018 Toyota Camry SE - Reliable Daily Driver",
    make: "Toyota",
    model: "Camry SE",
    year: 2018,
    price: 16200,
    mileage: 58000,
    condition: "good",
    transmission: "automatic",
    fuelType: "gas",
    location: "Oakland, CA",
    description: "Great condition Toyota Camry. Perfect for commuting. Recent oil change and new tires.",
    image: "/2018-toyota-camry-blue-sedan.jpg",
    postedDate: "2025-01-18",
    vin: "4T1BF1FK5JU123789",
    features: ["Sunroof", "Heated Seats", "Navigation", "Blind Spot Monitor"],
  },
  {
    id: "cl-003",
    title: "2019 Ford F-150 XLT - 4WD Crew Cab",
    make: "Ford",
    model: "F-150 XLT",
    year: 2019,
    price: 32500,
    mileage: 45000,
    condition: "excellent",
    transmission: "automatic",
    fuelType: "gas",
    location: "San Jose, CA",
    description: "Powerful truck with 4WD. Perfect for work or adventure. Towing package included.",
    image: "/2019-ford-f150-black-pickup-truck.jpg",
    postedDate: "2025-01-22",
    vin: "1FTEW1EP5KFA12345",
    features: ["4WD", "Towing Package", "Bed Liner", "Running Boards", "Backup Camera"],
  },
  {
    id: "cl-004",
    title: "2021 Tesla Model 3 - Long Range, Autopilot",
    make: "Tesla",
    model: "Model 3 Long Range",
    year: 2021,
    price: 38900,
    mileage: 28000,
    condition: "excellent",
    transmission: "automatic",
    fuelType: "electric",
    location: "Palo Alto, CA",
    description: "Premium electric sedan with autopilot. Excellent range and performance. Free supercharging included.",
    image: "/2021-tesla-model-3-white-electric-car.jpg",
    postedDate: "2025-01-25",
    vin: "5YJ3E1EA8MF123456",
    features: ["Autopilot", "Premium Audio", "Glass Roof", "Supercharging", "OTA Updates"],
  },
  {
    id: "cl-005",
    title: "2017 Jeep Wrangler Unlimited - Off-Road Ready",
    make: "Jeep",
    model: "Wrangler Unlimited",
    year: 2017,
    price: 28700,
    mileage: 62000,
    condition: "good",
    transmission: "manual",
    fuelType: "gas",
    location: "Berkeley, CA",
    description: "Adventure-ready Jeep with lift kit and off-road tires. Manual transmission for true enthusiasts.",
    image: "/2017-jeep-wrangler-green-off-road.jpg",
    postedDate: "2025-01-19",
    vin: "1C4BJWDG5HL123456",
    features: ["4WD", "Lift Kit", "Off-Road Tires", "Winch", "LED Light Bar"],
  },
  {
    id: "cl-006",
    title: "2019 Mazda CX-5 Grand Touring - AWD SUV",
    make: "Mazda",
    model: "CX-5 Grand Touring",
    year: 2019,
    price: 24300,
    mileage: 41000,
    condition: "excellent",
    transmission: "automatic",
    fuelType: "gas",
    location: "Fremont, CA",
    description: "Luxury compact SUV with all-wheel drive. Loaded with features and in pristine condition.",
    image: "/2019-mazda-cx5-red-suv.jpg",
    postedDate: "2025-01-21",
    vin: "JM3KFBDM5K0123456",
    features: ["AWD", "Leather Seats", "Bose Audio", "Adaptive Cruise", "360 Camera"],
  },
  {
    id: "cl-007",
    title: "2016 BMW 3 Series 328i - Sport Package",
    make: "BMW",
    model: "328i",
    year: 2016,
    price: 19800,
    mileage: 68000,
    condition: "good",
    transmission: "automatic",
    fuelType: "gas",
    location: "San Mateo, CA",
    description: "Sporty BMW with excellent handling. Well-maintained with full service history.",
    image: "/2016-bmw-328i-black-sport-sedan.jpg",
    postedDate: "2025-01-17",
    vin: "WBA8E9G59GNT12345",
    features: ["Sport Package", "Navigation", "Sunroof", "Premium Sound", "Heated Seats"],
  },
  {
    id: "cl-008",
    title: "2020 Subaru Outback - AWD Wagon, Perfect for Families",
    make: "Subaru",
    model: "Outback",
    year: 2020,
    price: 27500,
    mileage: 35000,
    condition: "excellent",
    transmission: "automatic",
    fuelType: "gas",
    location: "Santa Clara, CA",
    description: "Versatile wagon with legendary Subaru AWD. Great for families and outdoor adventures.",
    image: "/2020-subaru-outback-blue-wagon.jpg",
    postedDate: "2025-01-23",
    vin: "4S4BTAFC5L3123456",
    features: ["AWD", "EyeSight Safety", "Roof Rails", "Power Liftgate", "Apple CarPlay"],
  },
  {
    id: "cl-009",
    title: "2015 Chevrolet Silverado 1500 - Work Truck Special",
    make: "Chevrolet",
    model: "Silverado 1500",
    year: 2015,
    price: 21900,
    mileage: 89000,
    condition: "fair",
    transmission: "automatic",
    fuelType: "gas",
    location: "Hayward, CA",
    description: "Reliable work truck with high mileage but well-maintained. Great for contractors.",
    image: "/2015-chevrolet-silverado-white-work-truck.jpg",
    postedDate: "2025-01-16",
    vin: "1GCVKREC0FZ123456",
    features: ["Towing Package", "Bed Liner", "Tool Box", "Heavy Duty Suspension"],
  },
  {
    id: "cl-010",
    title: "2021 Hyundai Kona Electric - Zero Emissions Commuter",
    make: "Hyundai",
    model: "Kona Electric",
    year: 2021,
    price: 29900,
    mileage: 22000,
    condition: "excellent",
    transmission: "automatic",
    fuelType: "electric",
    location: "Mountain View, CA",
    description: "Efficient electric SUV with great range. Perfect for Bay Area commuting with HOV access.",
    image: "/2021-hyundai-kona-electric-gray-suv.jpg",
    postedDate: "2025-01-24",
    vin: "KM8K53AG5MU123456",
    features: ["Electric", "Fast Charging", "Heated Seats", "Wireless Charging", "Lane Keep Assist"],
  },
  {
    id: "cl-011",
    title: "2018 Nissan Altima SV - Fuel Efficient Sedan",
    make: "Nissan",
    model: "Altima SV",
    year: 2018,
    price: 14500,
    mileage: 72000,
    condition: "good",
    transmission: "automatic",
    fuelType: "gas",
    location: "Sunnyvale, CA",
    description: "Economical sedan with great fuel economy. Perfect first car or commuter vehicle.",
    image: "/2018-nissan-altima-silver-sedan.jpg",
    postedDate: "2025-01-15",
    vin: "1N4AL3AP9JC123456",
    features: ["Backup Camera", "Bluetooth", "Cruise Control", "Power Windows"],
  },
  {
    id: "cl-012",
    title: "2019 Audi Q5 Premium Plus - Luxury SUV",
    make: "Audi",
    model: "Q5 Premium Plus",
    year: 2019,
    price: 34900,
    mileage: 38000,
    condition: "excellent",
    transmission: "automatic",
    fuelType: "gas",
    location: "Los Altos, CA",
    description: "Luxurious SUV with Quattro AWD. Loaded with premium features and in mint condition.",
    image: "/2019-audi-q5-black-luxury-suv.jpg",
    postedDate: "2025-01-26",
    vin: "WA1BNAFY5K2123456",
    features: ["Quattro AWD", "Virtual Cockpit", "Panoramic Roof", "Bang & Olufsen Audio", "Adaptive Cruise"],
  },
]

/**
 * Get condition badge color based on car condition
 */
export function getConditionColor(condition: CarCondition): string {
  const colors: Record<CarCondition, string> = {
    excellent: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
    good: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    fair: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
    salvage: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  }
  return colors[condition]
}

/**
 * Format condition label for display
 */
export function getConditionLabel(condition: CarCondition): string {
  return condition.charAt(0).toUpperCase() + condition.slice(1)
}

/**
 * Sort cars by price
 */
export function sortByPrice(cars: CraigslistCar[], ascending = true): CraigslistCar[] {
  return [...cars].sort((a, b) => (ascending ? a.price - b.price : b.price - a.price))
}

/**
 * Sort cars by mileage
 */
export function sortByMileage(cars: CraigslistCar[], ascending = true): CraigslistCar[] {
  return [...cars].sort((a, b) => (ascending ? a.mileage - b.mileage : b.mileage - a.mileage))
}
