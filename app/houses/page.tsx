"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { MapPin, Bed, Bath, Square, Home, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Shield, FileText } from "lucide-react"
import { calculateHouseClosingCosts, TITLE_COMPANIES } from "@/lib/big-ticket-purchase"

interface House {
  id: string
  address: string
  city: string
  state: string
  zipCode: string
  price: number
  bedrooms: number
  bathrooms: number
  sqft: number
  yearBuilt: number
  propertyType: string
  description: string
  features: string[]
  image: string
  listingSource: string
  listingDate: string
  pricePerSqft: number
}

function generateHouses(): House[] {
  const cities = [
    { city: "Austin", state: "TX" },
    { city: "Phoenix", state: "AZ" },
    { city: "Atlanta", state: "GA" },
    { city: "Charlotte", state: "NC" },
    { city: "Denver", state: "CO" },
    { city: "Seattle", state: "WA" },
    { city: "Portland", state: "OR" },
    { city: "Nashville", state: "TN" },
    { city: "Tampa", state: "FL" },
    { city: "Dallas", state: "TX" },
  ]

  const propertyTypes = ["Single Family", "Condo", "Townhouse", "Multi-Family"]
  const sources = ["Zillow", "Realtor.com", "Redfin", "Trulia"]

  const houses: House[] = []
  for (let i = 0; i < 100; i++) {
    const location = cities[Math.floor(Math.random() * cities.length)]
    const beds = Math.floor(Math.random() * 4) + 2
    const baths = Math.floor(Math.random() * 3) + 1
    const sqft = Math.floor(Math.random() * 2000) + 1200
    const pricePerSqft = Math.floor(Math.random() * 150) + 100
    const price = sqft * pricePerSqft

    houses.push({
      id: `house-${i + 1}`,
      address: `${Math.floor(Math.random() * 9999) + 100} ${["Oak", "Maple", "Pine", "Elm", "Cedar"][Math.floor(Math.random() * 5)]} ${["St", "Ave", "Blvd", "Dr", "Ln"][Math.floor(Math.random() * 5)]}`,
      city: location.city,
      state: location.state,
      zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
      price,
      bedrooms: beds,
      bathrooms: baths,
      sqft,
      yearBuilt: Math.floor(Math.random() * 30) + 1990,
      propertyType: propertyTypes[Math.floor(Math.random() * propertyTypes.length)],
      description: `Beautiful ${beds} bedroom, ${baths} bathroom home in ${location.city}. Modern kitchen, hardwood floors, and spacious backyard.`,
      features: ["Central A/C", "Hardwood Floors", "Updated Kitchen", "Garage", "Backyard", "Smart Home"],
      image: `/placeholder.svg?height=300&width=400&text=${location.city} Home`,
      listingSource: sources[Math.floor(Math.random() * sources.length)],
      listingDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      pricePerSqft,
    })
  }
  return houses
}

export default function HousesPage() {
  const [houses, setHouses] = useState<House[]>([])
  const [filteredHouses, setFilteredHouses] = useState<House[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCity, setSelectedCity] = useState("All")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [minBeds, setMinBeds] = useState("All")
  const [propertyType, setPropertyType] = useState("All")
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [downPaymentPercent, setDownPaymentPercent] = useState(20)

  useEffect(() => {
    const allHouses = generateHouses()
    console.log("[v0] Generated houses:", allHouses.length)
    setHouses(allHouses)
    setFilteredHouses(allHouses)
  }, [])

  useEffect(() => {
    console.log("[v0] Filtering houses with:", {
      searchQuery,
      selectedCity,
      minPrice,
      maxPrice,
      minBeds,
      propertyType,
      totalHouses: houses.length,
    })

    let filtered = houses

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(
        (h) =>
          h.city.toLowerCase().includes(query) ||
          h.address.toLowerCase().includes(query) ||
          h.state.toLowerCase().includes(query),
      )
      console.log("[v0] After search query filter:", filtered.length)
    }

    if (selectedCity !== "All") {
      filtered = filtered.filter((h) => h.city === selectedCity)
      console.log("[v0] After city filter:", filtered.length)
    }

    if (minPrice) {
      filtered = filtered.filter((h) => h.price >= Number.parseInt(minPrice))
      console.log("[v0] After min price filter:", filtered.length)
    }

    if (maxPrice) {
      filtered = filtered.filter((h) => h.price <= Number.parseInt(maxPrice))
      console.log("[v0] After max price filter:", filtered.length)
    }

    if (minBeds !== "All") {
      filtered = filtered.filter((h) => h.bedrooms >= Number.parseInt(minBeds))
      console.log("[v0] After beds filter:", filtered.length)
    }

    if (propertyType !== "All") {
      filtered = filtered.filter((h) => h.propertyType === propertyType)
      console.log("[v0] After property type filter:", filtered.length)
    }

    console.log("[v0] Final filtered houses:", filtered.length)
    setFilteredHouses(filtered)
  }, [houses, searchQuery, selectedCity, minPrice, maxPrice, minBeds, propertyType])

  const cities = Array.from(new Set(houses.map((h) => h.city))).sort()

  const handleViewDetails = (house: House) => {
    setSelectedHouse(house)
    setShowPurchaseModal(true)
  }

  const closingCosts = selectedHouse ? calculateHouseClosingCosts(selectedHouse.price) : null
  if (closingCosts) {
    closingCosts.total = Object.values(closingCosts).reduce((a, b) => (typeof b === "number" ? a + b : a), 0)
  }

  const downPayment = selectedHouse ? (selectedHouse.price * downPaymentPercent) / 100 : 0
  const loanAmount = selectedHouse ? selectedHouse.price - downPayment : 0
  const monthlyPayment = (loanAmount * (0.065 / 12)) / (1 - Math.pow(1 + 0.065 / 12, -360)) // 30yr at 6.5%

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Home className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">FairCart Houses</h1>
                <p className="text-xs opacity-80">Find your dream home</p>
              </div>
            </div>
            {/* Navigation Tabs */}
            <div className="flex gap-1">
              <a href="/" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded">
                Products
              </a>
              <a href="/houses" className="px-4 py-2 text-sm font-medium bg-white/10 rounded">
                Houses
              </a>
              <a href="/cars" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded">
                Cars
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="bg-muted/30 border-b py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <Input
              placeholder="Search by city or address"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger>
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <Select value={minBeds} onValueChange={setMinBeds}>
              <SelectTrigger>
                <SelectValue placeholder="Beds" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Any Beds</SelectItem>
                <SelectItem value="2">2+ Beds</SelectItem>
                <SelectItem value="3">3+ Beds</SelectItem>
                <SelectItem value="4">4+ Beds</SelectItem>
              </SelectContent>
            </Select>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Types</SelectItem>
                <SelectItem value="Single Family">Single Family</SelectItem>
                <SelectItem value="Condo">Condo</SelectItem>
                <SelectItem value="Townhouse">Townhouse</SelectItem>
                <SelectItem value="Multi-Family">Multi-Family</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <Filter className="w-4 h-4 inline mr-1" />
              {filteredHouses.length} properties found
            </p>
          </div>
        </div>
      </section>

      {/* Houses Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHouses.map((house) => (
            <Card key={house.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={house.image || "/placeholder.svg"}
                  alt={house.address}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <Badge className="absolute top-2 left-2 bg-primary">{house.listingSource}</Badge>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-2xl font-bold text-primary">${house.price.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">${house.pricePerSqft}/sqft</p>
                  </div>
                  <Badge variant="secondary">{house.propertyType}</Badge>
                </div>
                <p className="text-sm font-medium mb-1">{house.address}</p>
                <p className="text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {house.city}, {house.state} {house.zipCode}
                </p>
                <div className="flex gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Bed className="w-4 h-4 text-muted-foreground" />
                    <span>{house.bedrooms} Beds</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Bath className="w-4 h-4 text-muted-foreground" />
                    <span>{house.bathrooms} Baths</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Square className="w-4 h-4 text-muted-foreground" />
                    <span>{house.sqft.toLocaleString()} sqft</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{house.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {house.features.slice(0, 3).map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <Button className="w-full" size="sm" onClick={() => handleViewDetails(house)}>
                  View Details & Purchase
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedHouse?.address}</DialogTitle>
            <DialogDescription>
              {selectedHouse?.city}, {selectedHouse?.state} • {selectedHouse?.bedrooms} bed, {selectedHouse?.bathrooms}{" "}
              bath
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financing">Financing</TabsTrigger>
              <TabsTrigger value="closing">Closing</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">List Price</p>
                  <p className="text-2xl font-bold">${selectedHouse?.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price per sqft</p>
                  <p className="font-medium">${selectedHouse?.pricePerSqft}/sqft</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">Real Estate Purchase Process:</p>
                    <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                      <li>✓ Verified account required (ID, income, credit check)</li>
                      <li>✓ Mortgage pre-approval or proof of funds</li>
                      <li>✓ Professional home inspection included</li>
                      <li>✓ Title search and title insurance</li>
                      <li>✓ Escrow service manages all funds securely</li>
                      <li>✓ Legal deed transfer through title company</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">How does the purchase work?</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Offer Submission (Day 1)</p>
                      <p className="text-sm text-muted-foreground">
                        Your offer is submitted directly to the seller. Earnest money deposit ($1,000) held in escrow
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Home Inspection (Days 7-10)</p>
                      <p className="text-sm text-muted-foreground">
                        Professional inspector evaluates structure, systems, and condition. You can negotiate repairs or
                        cancel
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Title Search & Insurance (Days 10-20)</p>
                      <p className="text-sm text-muted-foreground">
                        Title company verifies clean ownership, searches for liens, issues title insurance policy
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Closing (Day 30)</p>
                      <p className="text-sm text-muted-foreground">
                        Sign documents, funds transfer through escrow, deed recorded with county, keys delivered
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financing" className="space-y-4">
              <h4 className="font-semibold">Mortgage Calculator</h4>

              <div>
                <label className="text-sm font-medium">Down Payment ({downPaymentPercent}%)</label>
                <Input
                  type="range"
                  min="5"
                  max="50"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-muted p-3 rounded">
                  <p className="text-muted-foreground">Down Payment</p>
                  <p className="text-lg font-bold">${downPayment.toLocaleString()}</p>
                </div>
                <div className="bg-muted p-3 rounded">
                  <p className="text-muted-foreground">Loan Amount</p>
                  <p className="text-lg font-bold">${loanAmount.toLocaleString()}</p>
                </div>
                <div className="bg-primary text-primary-foreground p-3 rounded col-span-2">
                  <p className="text-sm opacity-90">Estimated Monthly Payment</p>
                  <p className="text-2xl font-bold">${Math.round(monthlyPayment).toLocaleString()}/mo</p>
                  <p className="text-xs opacity-75 mt-1">30-year fixed at 6.5% APR</p>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-3">Pre-Approval Requirements</h5>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Credit score 620+ (better rates with 740+)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Debt-to-income ratio below 43%</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>2 years employment history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span>Cash reserves for down payment + closing costs</span>
                  </li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="closing" className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Closing Costs Breakdown
                </h5>
                {closingCosts && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Title Search</span>
                      <span className="font-medium">${closingCosts.titleSearch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Title Insurance</span>
                      <span className="font-medium">${closingCosts.titleInsurance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Escrow Fee</span>
                      <span className="font-medium">${closingCosts.escrowFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Home Inspection</span>
                      <span className="font-medium">${closingCosts.inspectionFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Appraisal</span>
                      <span className="font-medium">${closingCosts.appraisalFee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Lender Origination Fee</span>
                      <span className="font-medium">${closingCosts.lenderFees.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recording Fees</span>
                      <span className="font-medium">${closingCosts.recordingFees}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total Closing Costs</span>
                      <span>${closingCosts.total.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-3">Title Company & Escrow</h5>
                <div className="space-y-2 text-sm">
                  {TITLE_COMPANIES.slice(0, 2).map((company) => (
                    <div key={company.name} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.avgClosingDays} day average closing</p>
                      </div>
                      <Badge variant="outline">{company.rating} ⭐</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Deed Transfer Process</h5>
                <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                  The title company handles the legal transfer of property ownership:
                </p>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <li>• Warranty deed prepared and signed by seller</li>
                  <li>• Deed recorded with county recorder's office</li>
                  <li>• Property title transferred to your name</li>
                  <li>• Official copy mailed to you within 30 days</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="purchase" className="space-y-4">
              {!isLoggedIn ? (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Verified Account Required for Real Estate
                      </p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        To purchase property, you need:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 mb-4">
                        <li>• Government-issued ID verification</li>
                        <li>• Mortgage pre-approval letter OR proof of funds</li>
                        <li>• Credit check authorization</li>
                        <li>• Income verification documents</li>
                      </ul>
                      <Button onClick={() => setIsLoggedIn(true)}>Create Verified Account</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-900 dark:text-green-100">
                      <CheckCircle className="w-5 h-5" />
                      <p className="font-medium">Account Verified & Pre-Approved</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-semibold">Purchase Summary</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Purchase Price</span>
                        <span className="font-medium">${selectedHouse?.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Down Payment ({downPaymentPercent}%)</span>
                        <span className="font-medium">${downPayment.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Closing Costs</span>
                        <span className="font-medium">${closingCosts?.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Earnest Money (due now)</span>
                        <span className="font-medium">$1,000</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-base font-bold">
                        <span>Total Due at Closing</span>
                        <span>${(downPayment + (closingCosts?.total || 0)).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Monthly Payment (30yr)</span>
                        <span>${Math.round(monthlyPayment).toLocaleString()}/mo</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    Submit Offer & Pay Earnest Money
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    Earnest money held in escrow • 10-day inspection period • Professional title service
                  </p>
                </>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  )
}
