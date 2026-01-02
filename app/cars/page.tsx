"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Car, Gauge, Calendar, MapPin, Fuel, Award, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, Truck, FileText, Shield } from "lucide-react"
import { calculateCarShippingCost, CAR_TRANSPORT_COMPANIES } from "@/lib/big-ticket-purchase"

interface CarListing {
  id: string
  make: string
  model: string
  year: number
  price: number
  mileage: number
  condition: string
  transmission: string
  fuelType: string
  color: string
  description: string
  location: string
  seller: string
  listingSource: string
  image: string
  vin: string
}

function generateCars(): CarListing[] {
  const makes = ["Toyota", "Honda", "Ford", "Chevrolet", "BMW", "Mercedes-Benz", "Audi", "Tesla", "Nissan", "Mazda"]
  const models: { [key: string]: string[] } = {
    Toyota: ["Camry", "Corolla", "RAV4", "Highlander"],
    Honda: ["Accord", "Civic", "CR-V", "Pilot"],
    Ford: ["F-150", "Mustang", "Explorer", "Escape"],
    Chevrolet: ["Silverado", "Equinox", "Malibu", "Tahoe"],
    BMW: ["3 Series", "5 Series", "X3", "X5"],
    "Mercedes-Benz": ["C-Class", "E-Class", "GLC", "GLE"],
    Audi: ["A4", "A6", "Q5", "Q7"],
    Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
    Nissan: ["Altima", "Rogue", "Sentra", "Pathfinder"],
    Mazda: ["Mazda3", "CX-5", "Mazda6", "CX-9"],
  }
  const conditions = ["Excellent", "Good", "Fair", "Like New"]
  const transmissions = ["Automatic", "Manual"]
  const fuelTypes = ["Gasoline", "Diesel", "Electric", "Hybrid"]
  const colors = ["Black", "White", "Silver", "Blue", "Red", "Gray"]
  const sources = ["Craigslist", "AutoTrader", "Cars.com", "CarGurus"]
  const cities = ["Austin, TX", "Phoenix, AZ", "Atlanta, GA", "Seattle, WA", "Denver, CO"]

  const cars: CarListing[] = []
  for (let i = 0; i < 150; i++) {
    const make = makes[Math.floor(Math.random() * makes.length)]
    const model = models[make][Math.floor(Math.random() * models[make].length)]
    const year = Math.floor(Math.random() * 10) + 2015
    const mileage = Math.floor(Math.random() * 100000) + 5000
    const basePrice = Math.floor(Math.random() * 40000) + 10000

    cars.push({
      id: `car-${i + 1}`,
      make,
      model,
      year,
      price: basePrice,
      mileage,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      transmission: transmissions[Math.floor(Math.random() * transmissions.length)],
      fuelType: fuelTypes[Math.floor(Math.random() * fuelTypes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      description: `${year} ${make} ${model} in ${conditions[Math.floor(Math.random() * conditions.length)]} condition. Well maintained with clean title.`,
      location: cities[Math.floor(Math.random() * cities.length)],
      seller: ["Private", "Dealer"][Math.floor(Math.random() * 2)],
      listingSource: sources[Math.floor(Math.random() * sources.length)],
      image: `/placeholder.svg?height=300&width=400&text=${make} ${model}`,
      vin: `VIN${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
    })
  }
  return cars
}

export default function CarsPage() {
  const [cars, setCars] = useState<CarListing[]>([])
  const [filteredCars, setFilteredCars] = useState<CarListing[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMake, setSelectedMake] = useState("All")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [maxMileage, setMaxMileage] = useState("")
  const [condition, setCondition] = useState("All")
  const [selectedCar, setSelectedCar] = useState<CarListing | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [shippingMethod, setShippingMethod] = useState<"pickup" | "open" | "enclosed">("open")
  const [distance, setDistance] = useState(500)

  useEffect(() => {
    const allCars = generateCars()
    setCars(allCars)
    setFilteredCars(allCars)
  }, [])

  useEffect(() => {
    let filtered = cars

    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.location.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (selectedMake !== "All") {
      filtered = filtered.filter((c) => c.make === selectedMake)
    }

    if (minPrice) {
      filtered = filtered.filter((c) => c.price >= Number.parseInt(minPrice))
    }

    if (maxPrice) {
      filtered = filtered.filter((c) => c.price <= Number.parseInt(maxPrice))
    }

    if (maxMileage) {
      filtered = filtered.filter((c) => c.mileage <= Number.parseInt(maxMileage))
    }

    if (condition !== "All") {
      filtered = filtered.filter((c) => c.condition === condition)
    }

    setFilteredCars(filtered)
  }, [cars, searchQuery, selectedMake, minPrice, maxPrice, maxMileage, condition])

  const makes = Array.from(new Set(cars.map((c) => c.make))).sort()

  const handleViewDetails = (car: CarListing) => {
    setSelectedCar(car)
    setShowPurchaseModal(true)
  }

  const shippingQuote =
    selectedCar && shippingMethod !== "pickup"
      ? calculateCarShippingCost(distance, shippingMethod === "enclosed" ? "enclosed" : "open")
      : null

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="w-8 h-8" />
              <div>
                <h1 className="text-xl font-bold">FairCart Cars</h1>
                <p className="text-xs opacity-80">Find your perfect vehicle</p>
              </div>
            </div>
            <div className="flex gap-1">
              <a href="/" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded">
                Products
              </a>
              <a href="/houses" className="px-4 py-2 text-sm font-medium hover:bg-white/10 rounded">
                Houses
              </a>
              <a href="/cars" className="px-4 py-2 text-sm font-medium bg-white/10 rounded">
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
              placeholder="Search make, model, location"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Select value={selectedMake} onValueChange={setSelectedMake}>
              <SelectTrigger>
                <SelectValue placeholder="Make" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Makes</SelectItem>
                {makes.map((make) => (
                  <SelectItem key={make} value={make}>
                    {make}
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
            <Input
              type="number"
              placeholder="Max Mileage"
              value={maxMileage}
              onChange={(e) => setMaxMileage(e.target.value)}
            />
            <Select value={condition} onValueChange={setCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Conditions</SelectItem>
                <SelectItem value="Excellent">Excellent</SelectItem>
                <SelectItem value="Good">Good</SelectItem>
                <SelectItem value="Fair">Fair</SelectItem>
                <SelectItem value="Like New">Like New</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <Filter className="w-4 h-4 inline mr-1" />
              {filteredCars.length} vehicles found
            </p>
          </div>
        </div>
      </section>

      {/* Cars Grid */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCars.map((car) => (
            <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={car.image || "/placeholder.svg"}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <Badge className="absolute top-2 left-2 bg-primary">{car.listingSource}</Badge>
                <Badge className="absolute top-2 right-2 bg-secondary">{car.seller}</Badge>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-2xl font-bold text-primary">${car.price.toLocaleString()}</p>
                    <p className="text-sm font-medium">
                      {car.year} {car.make} {car.model}
                    </p>
                  </div>
                  <Badge variant="secondary">{car.condition}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  <MapPin className="w-3 h-3 inline mr-1" />
                  {car.location}
                </p>
                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <span>{car.mileage.toLocaleString()} mi</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{car.year}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-4 h-4 text-muted-foreground" />
                    <span>{car.transmission}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Fuel className="w-4 h-4 text-muted-foreground" />
                    <span>{car.fuelType}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{car.description}</p>
                <div className="flex gap-2 text-xs mb-3">
                  <Badge variant="outline">Color: {car.color}</Badge>
                  <Badge variant="outline">VIN Available</Badge>
                </div>
                <Button className="w-full" size="sm" onClick={() => handleViewDetails(car)}>
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
            <DialogTitle>
              {selectedCar?.year} {selectedCar?.make} {selectedCar?.model}
            </DialogTitle>
            <DialogDescription>Complete purchase process with verified shipping and title transfer</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="paperwork">Paperwork</TabsTrigger>
              <TabsTrigger value="purchase">Purchase</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">${selectedCar?.price.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <Badge variant="secondary">{selectedCar?.condition}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <p className="font-medium">{selectedCar?.mileage.toLocaleString()} miles</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{selectedCar?.location}</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">Purchase Requirements:</p>
                    <ul className="space-y-1 text-blue-800 dark:text-blue-200">
                      <li>✓ Account verification required (ID, address, income)</li>
                      <li>✓ Vehicle inspection report provided by certified mechanic</li>
                      <li>✓ Clean title transfer through DMV</li>
                      <li>✓ Full vehicle history report (CARFAX)</li>
                      <li>✓ 30-day return policy with full refund</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">What happens after purchase?</h4>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Instant Order Placement</p>
                      <p className="text-sm text-muted-foreground">Your order is placed with the seller immediately</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Vehicle Inspection</p>
                      <p className="text-sm text-muted-foreground">Independent mechanic inspects vehicle (2-3 days)</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Shipping Arranged</p>
                      <p className="text-sm text-muted-foreground">
                        Professional auto transport scheduled to your location
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Title Transfer</p>
                      <p className="text-sm text-muted-foreground">
                        DMV handles title transfer, registration in your name (7-14 days)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="shipping" className="space-y-4">
              <h4 className="font-semibold">Choose Shipping Method</h4>

              <div className="space-y-3">
                <Card
                  className={`p-4 cursor-pointer ${shippingMethod === "pickup" ? "border-primary" : ""}`}
                  onClick={() => setShippingMethod("pickup")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 ${shippingMethod === "pickup" ? "border-primary bg-primary" : "border-gray-300"}`}
                      />
                      <div>
                        <p className="font-medium">Local Pickup</p>
                        <p className="text-sm text-muted-foreground">Pick up vehicle at seller location</p>
                      </div>
                    </div>
                    <p className="font-bold">FREE</p>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer ${shippingMethod === "open" ? "border-primary" : ""}`}
                  onClick={() => setShippingMethod("open")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 ${shippingMethod === "open" ? "border-primary bg-primary" : "border-gray-300"}`}
                      />
                      <div>
                        <p className="font-medium">Open Transport</p>
                        <p className="text-sm text-muted-foreground">Most popular, vehicle exposed to weather</p>
                        {shippingQuote && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Delivery: {shippingQuote.deliveryDays} days
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${shippingQuote?.total.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">Includes insurance</p>
                    </div>
                  </div>
                </Card>

                <Card
                  className={`p-4 cursor-pointer ${shippingMethod === "enclosed" ? "border-primary" : ""}`}
                  onClick={() => setShippingMethod("enclosed")}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 mt-0.5 ${shippingMethod === "enclosed" ? "border-primary bg-primary" : "border-gray-300"}`}
                      />
                      <div>
                        <p className="font-medium">Enclosed Transport</p>
                        <p className="text-sm text-muted-foreground">Premium protection, fully covered trailer</p>
                        {shippingQuote && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Delivery: {shippingQuote.deliveryDays} days
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${calculateCarShippingCost(distance, "enclosed").total.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">Includes insurance</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <label className="text-sm font-medium">Estimated Distance (miles)</label>
                <Input
                  type="number"
                  value={distance}
                  onChange={(e) => setDistance(Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Transport Partners
                </h5>
                <div className="space-y-2 text-sm">
                  {CAR_TRANSPORT_COMPANIES.map((company) => (
                    <div key={company.name} className="flex justify-between">
                      <span>{company.name}</span>
                      <Badge variant="outline">{company.rating} ⭐</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="paperwork" className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h5 className="font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Title Transfer Process
                </h5>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Clean Title Verification</p>
                      <p className="text-muted-foreground">
                        We verify the title is clean with no liens or salvage history
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">DMV Processing</p>
                      <p className="text-muted-foreground">
                        Title transferred to your name through your state DMV (7-14 business days)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Registration & Plates</p>
                      <p className="text-muted-foreground">New registration and license plates issued in your state</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">VIN Verification</p>
                      <p className="text-muted-foreground">Full CARFAX history report provided with purchase</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Title Transfer Fee</p>
                  <p className="font-medium">$75</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Processing Time</p>
                  <p className="font-medium">7-14 days</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Title Status</p>
                  <Badge variant="secondary">Clean</Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Lien Status</p>
                  <Badge variant="secondary">Clear</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="purchase" className="space-y-4">
              {!isLoggedIn ? (
                <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                        Account Verification Required
                      </p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        For high-value vehicle purchases, we require verified account with:
                      </p>
                      <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 mb-4">
                        <li>• Government-issued ID verification</li>
                        <li>• Address confirmation</li>
                        <li>• Income verification or financing pre-approval</li>
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
                      <p className="font-medium">Account Verified</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-semibold">Purchase Summary</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Vehicle Price</span>
                        <span className="font-medium">${selectedCar?.price.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>
                          Shipping (
                          {shippingMethod === "pickup"
                            ? "Pickup"
                            : shippingMethod === "open"
                              ? "Open Transport"
                              : "Enclosed Transport"}
                          )
                        </span>
                        <span className="font-medium">
                          ${shippingMethod === "pickup" ? "0" : shippingQuote?.total.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Title Transfer Fee</span>
                        <span className="font-medium">$75</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Inspection & Reports</span>
                        <span className="font-medium">$150</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between text-base font-bold">
                        <span>Total</span>
                        <span>
                          $
                          {(
                            (selectedCar?.price || 0) +
                            (shippingMethod === "pickup" ? 0 : shippingQuote?.total || 0) +
                            225
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" size="lg">
                    Complete Purchase
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    30-day money-back guarantee • Certified inspection • Secure title transfer
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
