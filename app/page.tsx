"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  Search,
  User,
  Star,
  Zap,
  Flame,
  Truck,
  ChevronDown,
  ChevronUp,
  Upload,
  ScanLine,
  Package,
  Bell,
  Crown,
  Check,
  Store,
  Award,
  Sparkles,
  CreditCard,
  Mail,
  Phone,
  Timer,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  Clock,
} from "lucide-react"
import { generateFairCartInventory, getCategories, STORES, type FairCartProduct } from "@/lib/faircart-inventory"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  fetchRealTimeTrending,
  createTrendingSession,
  formatTimeRemaining,
  type TrendingSession,
} from "@/lib/real-time-trending"

// Cart item type
interface CartItem extends FairCartProduct {
  quantity: number
}

// Customer type
interface Customer {
  id: string
  email: string
  name: string
  isMember: boolean
  memberSince?: Date
  savedItems: string[]
  priceAlerts: string[]
}

export default function FairCartHomePage() {
  // State
  const [products, setProducts] = useState<FairCartProduct[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [selectedStore, setSelectedStore] = useState<string>("All")
  const [selectedRegion, setSelectedRegion] = useState<string>("All")
  const [productsToShow, setProductsToShow] = useState(24)
  const [showAllFlashSales, setShowAllFlashSales] = useState(false)
  const [showAllHotDeals, setShowAllHotDeals] = useState(false)
  const [showAllAmazonHaul, setShowAllAmazonHaul] = useState(false) // This state will now control FairCart Deals visibility
  const [hoveredRetailerLink, setHoveredRetailerLink] = useState<string | null>(null)
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 })

  const [trendingSession, setTrendingSession] = useState<TrendingSession | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)

  // Modals
  const [selectedProduct, setSelectedProduct] = useState<FairCartProduct | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMembershipModal, setShowMembershipModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [showPriceAlertModal, setShowPriceAlertModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState<string | null>(null)
  const [cartOpen, setCartOpen] = useState(false)

  // User state
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isGuest, setIsGuest] = useState(true)

  // Load products
  useEffect(() => {
    const inventory = generateFairCartInventory()
    setProducts(inventory)
    console.log("[v0] Generated products:", inventory.length)

    const loadTrending = async () => {
      const trending = await fetchRealTimeTrending(inventory) // Pass inventory here
      const session = createTrendingSession(trending)
      setTrendingSession(session)
      setTimeRemaining(session.timeRemaining)
    }

    loadTrending()

    // Refresh trending every 30 minutes
    const refreshInterval = setInterval(loadTrending, 30 * 60 * 1000)

    return () => clearInterval(refreshInterval)
  }, [])

  useEffect(() => {
    if (!trendingSession) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1000
        if (newTime <= 0) {
          // Refresh trending when timer expires
          fetchRealTimeTrending(products).then((trending) => {
            const session = createTrendingSession(trending)
            setTrendingSession(session)
            return session.timeRemaining
          })
          return 0
        }
        return newTime
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [trendingSession, products])

  // Get categories and regions
  const categories = ["All", ...getCategories()]
  const regions = ["All", "US", "India", "Mexico", "Global"]
  const storesList = ["All", ...Object.values(STORES).map((s) => s.name)]

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory
      const matchesStore = selectedStore === "All" || p.bestStore === selectedStore
      const matchesRegion = selectedRegion === "All" || p.storesPrices.some((sp) => sp.region === selectedRegion)
      return matchesSearch && matchesCategory && matchesStore && matchesRegion
    })
  }, [products, searchQuery, selectedCategory, selectedStore, selectedRegion])

  // Get special deals
  const flashSales = products.filter((p) => p.isFlashSale)
  const hotDeals = products.filter((p) => p.isHotDeal)
  const clearanceItems = products.filter((p) => p.isClearance)
  const bestSellers = products.filter((p) => p.isBestSeller)
  const amazonChoice = products.filter((p) => p.isAmazonChoice)
  const fairCartDeals = products.filter((p) => p.bestPrice <= 20 && p.bestStore === "Amazon Haul")

  // Cart functions
  const addToCart = (product: FairCartProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    setCartOpen(true)
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === productId) {
          const newQty = Math.max(1, item.quantity + delta)
          return { ...item, quantity: newQty }
        }
        return item
      }),
    )
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.ourPrice * item.quantity, 0)
  const cartSavings = cart.reduce((sum, item) => sum + item.savings * item.quantity, 0)
  const memberDiscount = customer?.isMember ? cartTotal * 0.05 : 0
  const finalTotal = cartTotal - memberDiscount

  // Product Card Component
  const ProductCard = ({ product }: { product: FairCartProduct }) => (
    <Card
      className="group overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-lg transition-all cursor-pointer bg-card"
      onClick={() => {
        setSelectedProduct(product)
        setShowProductModal(true)
      }}
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform"
          unoptimized
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFlashSale && (
            <Badge className="bg-blue-600 text-white text-xs">
              <Zap className="w-3 h-3 mr-1" /> Flash Sale
            </Badge>
          )}
          {product.isHotDeal && (
            <Badge className="bg-red-500 text-white text-xs">
              <Flame className="w-3 h-3 mr-1" /> Hot Deal
            </Badge>
          )}
          {product.isBestSeller && (
            <Badge className="bg-amber-500 text-white text-xs">
              <Award className="w-3 h-3 mr-1" /> Best Seller
            </Badge>
          )}
          {product.isAmazonChoice && (
            <Badge className="bg-orange-600 text-white text-xs">
              <Sparkles className="w-3 h-3 mr-1" /> Top Pick
            </Badge>
          )}
        </div>
        {/* Savings badge */}
        {product.savingsPercent > 10 && (
          <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
            Save {product.savingsPercent}%
          </div>
        )}
      </div>
      <CardContent className="p-3">
        <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
        <h3 className="font-medium text-sm line-clamp-2 mb-1">{product.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>

        {/* Price comparison */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-primary">${product.ourPrice.toFixed(2)}</span>
          <span className="text-xs text-muted-foreground line-through">
            ${(product.ourPrice + product.savings).toFixed(2)}
          </span>
        </div>

        {/* Best store */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <Store className="w-3 h-3" />
          <span>Best price from {product.bestStore}</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>

        {/* Compare stores indicator */}
        <div className="text-xs text-primary mb-3">Compare {product.storesPrices.length} stores</div>

        {/* Add to cart button */}
        <Button
          size="sm"
          className="w-full bg-primary hover:bg-primary/90"
          onClick={(e) => {
            e.stopPropagation()
            addToCart(product)
          }}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </CardContent>
    </Card>
  )

  // Keep a copy of all products for detail lookup
  const allProducts = products

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground shadow-lg">
        {/* Top bar */}
        <div className="bg-primary/90 py-1 px-4 text-xs text-center">
          <span className="animate-pulse">
            Compare prices across 30+ stores including Amazon, Walmart, Costco & more!
          </span>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-xl font-bold">FairCart.ai</h1>
                <p className="text-xs opacity-80">Compare. Shop Smart.</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[200px] bg-white text-foreground">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {getCategories().map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search bar - desktop */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search products across all stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 bg-white text-foreground"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Upload List */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-primary-foreground hover:bg-white/20"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Upload List</span>
              </Button>

              {/* Scan */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-primary-foreground hover:bg-white/20"
                onClick={() => setShowScanModal(true)}
              >
                <ScanLine className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Scan</span>
              </Button>

              {/* Track Orders */}
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex text-primary-foreground hover:bg-white/20"
                onClick={() => setShowTrackingModal(true)}
              >
                <Package className="w-4 h-4 mr-1" />
                <span className="hidden lg:inline">Track</span>
              </Button>

              {/* Login */}
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-foreground hover:bg-white/20"
                onClick={() => setShowLoginModal(true)}
              >
                <User className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">{customer ? customer.name : "Login"}</span>
              </Button>

              {/* Cart */}
              <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="sm" className="relative">
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Cart</span>
                    {cart.length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {cart.length}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-full sm:max-w-lg">
                  <SheetHeader>
                    <SheetTitle>Shopping Cart ({cart.length} items)</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-300px)] mt-4">
                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Your cart is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={item.id} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                            <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={item.image || "/placeholder.svg"}
                                alt={item.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.brand}</p>
                              <p className="text-sm font-bold text-primary">${item.ourPrice.toFixed(2)}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="w-6 h-6 bg-transparent"
                                  onClick={() => updateQuantity(item.id, -1)}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="text-sm w-6 text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="w-6 h-6 bg-transparent"
                                  onClick={() => updateQuantity(item.id, 1)}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-6 h-6 ml-auto text-red-500"
                                  onClick={() => removeFromCart(item.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  {cart.length > 0 && (
                    <div className="border-t pt-4 mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>You Save</span>
                        <span>-${cartSavings.toFixed(2)}</span>
                      </div>
                      {customer?.isMember && (
                        <div className="flex justify-between text-sm text-primary">
                          <span>Member Discount (5%)</span>
                          <span>-${memberDiscount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                      </div>
                      {!customer?.isMember && (
                        <div className="bg-primary/10 p-3 rounded-lg text-sm">
                          <Crown className="w-4 h-4 inline mr-2 text-primary" />
                          <span>Become a member for $35/month and save 5% on every purchase!</span>
                          <Button
                            variant="link"
                            size="sm"
                            className="text-primary p-0 ml-1"
                            onClick={() => setShowMembershipModal(true)}
                          >
                            Learn more
                          </Button>
                        </div>
                      )}
                      <Button
                        className="w-full bg-primary hover:bg-primary/90"
                        onClick={() => {
                          setCartOpen(false)
                          setShowCheckoutModal(true)
                        }}
                      >
                        Checkout {customer ? "" : "(Guest)"}
                      </Button>
                    </div>
                  )}
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden mt-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-white text-foreground"
              />
            </div>
          </div>

          <div className="flex gap-1 mt-3 border-b border-white/20">
            <a href="/" className="px-4 py-2 text-sm font-medium border-b-2 border-white bg-white/10">
              Products
            </a>
            <a href="/houses" className="px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:bg-white/10">
              Houses
            </a>
            <a href="/cars" className="px-4 py-2 text-sm font-medium border-b-2 border-transparent hover:bg-white/10">
              Cars
            </a>
          </div>

          {/* Mobile action buttons */}
          <div className="flex sm:hidden justify-around mt-3 pt-3 border-t border-white/20">
            <button className="flex flex-col items-center text-xs" onClick={() => setShowUploadModal(true)}>
              <Upload className="w-5 h-5 mb-1" />
              Upload
            </button>
            <button className="flex flex-col items-center text-xs" onClick={() => setShowScanModal(true)}>
              <ScanLine className="w-5 h-5 mb-1" />
              Scan
            </button>
            <button className="flex flex-col items-center text-xs" onClick={() => setShowTrackingModal(true)}>
              <Package className="w-5 h-5 mb-1" />
              Track
            </button>
            <button className="flex flex-col items-center text-xs" onClick={() => setShowPriceAlertModal(true)}>
              <Bell className="w-5 h-5 mb-1" />
              Alerts
            </button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary via-primary/90 to-blue-700 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-2">Save Big on Every Purchase</h2>
          <p className="text-lg opacity-90 mb-4">
            We compare prices from Amazon, Walmart, Target, Best Buy, Costco, Lowe's, Home Depot, Flipkart, MercadoLibre
            & 20+ more stores to find you the best deal.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button variant="secondary" size="lg" onClick={() => setShowPriceAlertModal(true)}>
              <Bell className="w-4 h-4 mr-2" />
              Get Price Alerts
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-primary bg-transparent"
              onClick={() => setShowMembershipModal(true)}
            >
              <Crown className="w-4 h-4 mr-2" />
              Join for $35/mo
            </Button>
          </div>
        </div>
      </section>

      {trendingSession && trendingSession.products.length > 0 && (
        <section className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-lg p-6 py-8 px-4">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold">Trending Now</h2>
              </div>
              <div className="flex items-center gap-2 bg-white dark:bg-gray-900 px-4 py-2 rounded-full shadow-sm">
                <Clock className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium">Ends in {formatTimeRemaining(timeRemaining)}</span>
              </div>
            </div>
            <p className="text-muted-foreground mb-6">
              Hot deals ending soon! These trending products won't last long.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingSession.products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square relative bg-muted rounded-lg overflow-hidden mb-3">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <Badge className="absolute top-2 right-2 bg-orange-600">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Hot
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-bold text-primary">${product.ourPrice.toFixed(2)}</span>
                      <span className="text-sm text-muted-foreground line-through">
                        ${(product.ourPrice + product.savings).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 font-medium mb-3">
                      Save ${product.savings.toFixed(2)} ({product.savingsPercent}%)
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                      size="sm"
                      onClick={() => {
                        console.log("[v0] Trending Buy Now clicked for:", product.name)
                        setSelectedProduct(product)
                        setShowProductModal(true)
                      }}
                    >
                      Buy Now from FairCart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {fairCartDeals.length > 0 && (
        <section className="container mx-auto px-4 py-8 border-b">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">FairCart Deals</h2>
                <p className="text-sm text-muted-foreground">Everything $20 and under • Best prices guaranteed</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => setShowAllAmazonHaul(!showAllAmazonHaul)} // State name is kept for consistency with existing code, but controls FairCart Deals visibility
              className="text-primary hover:text-primary/80"
            >
              {showAllAmazonHaul ? "Show Less" : `View All (${fairCartDeals.length})`}
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showAllAmazonHaul ? "rotate-180" : ""}`} />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {(showAllAmazonHaul ? fairCartDeals : fairCartDeals.slice(0, 12)).map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-all border-primary/20"
                onClick={() => {
                  setSelectedProduct(product)
                  setShowProductModal(true)
                }}
              >
                <CardContent className="p-3">
                  <div className="relative mb-3">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-32 object-contain rounded"
                    />
                    <Badge className="absolute top-1 right-1 bg-primary text-white text-xs">Under $20</Badge>
                  </div>
                  <p className="font-medium text-sm line-clamp-2 mb-1">{product.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{product.brand}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-primary">${product.ourPrice.toFixed(2)}</span>
                    <span className="text-xs text-muted-foreground line-through">
                      ${(product.ourPrice + product.savings).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-2 bg-primary hover:bg-primary/90"
                    onClick={(e) => {
                      e.stopPropagation()
                      addToCart(product)
                    }}
                  >
                    <ShoppingCart className="w-3 h-3 mr-1" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Flash Sales - Always visible at top */}
      {flashSales.length > 0 && (
        <section className="py-6 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white">
                <Zap className="w-6 h-6" />
                <h2 className="text-xl font-bold">Flash Sales</h2>
                <Badge variant="secondary" className="ml-2">
                  <Timer className="w-3 h-3 mr-1" />
                  Ends Soon!
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowAllFlashSales(!showAllFlashSales)}
              >
                {showAllFlashSales ? "Show Less" : `View All ${flashSales.length}`}
                {showAllFlashSales ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(showAllFlashSales ? flashSales : flashSales.slice(0, 6)).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hot Deals */}
      {hotDeals.length > 0 && (
        <section className="py-6 px-4 bg-gradient-to-r from-red-500 to-orange-500">
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white">
                <Flame className="w-6 h-6" />
                <h2 className="text-xl font-bold">Hot Deals</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => setShowAllHotDeals(!showAllHotDeals)}
              >
                {showAllHotDeals ? "Show Less" : `View All ${hotDeals.length}`}
                {showAllHotDeals ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {(showAllHotDeals ? hotDeals : hotDeals.slice(0, 6)).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="sticky top-[140px] md:top-[100px] z-40 bg-background border-b py-3 px-4">
        <div className="container mx-auto">
          {/* Category tabs */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-2 pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="flex-shrink-0"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Store and Region filters */}
          <div className="flex flex-wrap gap-2 mt-2">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-muted-foreground" />
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="text-sm border rounded px-2 py-1 bg-background"
              >
                {storesList.map((store) => (
                  <option key={store} value={store}>
                    {store}
                  </option>
                ))}
              </select>
            </div>
            <Badge variant="secondary" className="ml-auto">
              {filteredProducts.length} products found
            </Badge>
          </div>
        </div>
      </section>

      {/* Main Product Grid */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredProducts.slice(0, productsToShow).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Load More */}
        {productsToShow < filteredProducts.length && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" onClick={() => setProductsToShow((prev) => prev + 24)}>
              Load More Products ({filteredProducts.length - productsToShow} remaining)
            </Button>
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
                  <Image
                    src={selectedProduct.image || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Details */}
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{selectedProduct.brand}</p>
                  <p className="text-muted-foreground mb-4">{selectedProduct.description}</p>

                  <div className="bg-primary/10 p-4 rounded-lg mb-4">
                    <div className="text-sm text-muted-foreground mb-1">FairCart Best Price</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-primary">${selectedProduct.ourPrice.toFixed(2)}</span>
                      <span className="text-lg text-muted-foreground line-through">
                        ${(selectedProduct.ourPrice + selectedProduct.savings).toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-green-600 font-medium mt-1">
                      You save ${selectedProduct.savings.toFixed(2)} ({selectedProduct.savingsPercent}%) compared to
                      other retailers
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-green-600" />
                      <span>
                        {selectedProduct.shipping === "free"
                          ? "Includes FREE shipping"
                          : `Shipping: $${selectedProduct.shipping.toFixed(2)}`}{" "}
                        • Best price guarantee
                      </span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(selectedProduct.rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {selectedProduct.rating.toFixed(1)} ({selectedProduct.reviews.toLocaleString()} reviews)
                    </span>
                  </div>

                  {selectedProduct.storesPrices && selectedProduct.storesPrices.length > 0 && (
                    <div className="border rounded-lg overflow-hidden mb-4">
                      <div className="bg-primary text-primary-foreground px-3 py-2 font-medium text-sm flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        Price Comparison ({selectedProduct.storesPrices.length} Retailers)
                      </div>
                      <div className="divide-y max-h-64 overflow-y-auto">
                        {/* FairCart price shown first */}
                        <div className="p-3 bg-green-50 dark:bg-green-950/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="font-semibold">FairCart</span>
                              <Badge variant="default" className="bg-green-600">
                                Best Price
                              </Badge>
                            </div>
                            <span className="text-lg font-bold text-green-600">
                              ${selectedProduct.ourPrice.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {selectedProduct.shipping === "free"
                              ? "Includes FREE shipping"
                              : `Shipping: $${selectedProduct.shipping.toFixed(2)}`}
                          </p>
                        </div>

                        {selectedProduct.storesPrices
                          .sort((a, b) => a.price - b.price)
                          .map((store, idx) => (
                            <div
                              key={idx}
                              className="p-3 relative hover:bg-muted/50 transition-colors"
                              onMouseEnter={(e) => {
                                setHoveredRetailerLink(store.productUrl || "")
                                setHoverPosition({ x: e.clientX, y: e.clientY })
                              }}
                              onMouseLeave={() => setHoveredRetailerLink(null)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium cursor-pointer hover:text-primary hover:underline">
                                    {store.store}
                                  </span>
                                  {store.isBestSeller && (
                                    <Badge variant="outline" className="text-xs">
                                      Best Seller
                                    </Badge>
                                  )}
                                  {store.isAmazonChoice && (
                                    <Badge variant="outline" className="text-xs text-orange-600">
                                      Amazon's Choice
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-base font-semibold text-muted-foreground">
                                  ${store.price.toFixed(2)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {store.inStock ? `In stock • ${store.deliveryDays}-day delivery` : "Out of stock"}
                                {store.shipping && store.shipping > 0 && ` • Shipping: $${store.shipping.toFixed(2)}`}
                              </p>
                            </div>
                          ))}
                      </div>
                      <div className="p-3 bg-muted/50 text-xs text-center text-muted-foreground border-t">
                        Prices include shipping costs • Updated in real-time • Hover over retailers to verify listings
                      </div>
                    </div>
                  )}

                  {/* Add to cart */}
                  <div className="flex gap-2">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => {
                        addToCart(selectedProduct)
                        setShowProductModal(false)
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                    <Button variant="outline" onClick={() => setShowPriceAlertModal(true)}>
                      <Bell className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-4 h-4 text-primary" />
                      <span className="font-medium">How FairCart Works:</span>
                    </div>
                    <p className="text-muted-foreground">
                      We compare prices across {selectedProduct.storesPrices?.length || 5}+ trusted retailers to find
                      you the best deal. When you order, we source and ship directly to you
                      {selectedProduct.shipping === "free" ? " with FREE shipping included" : ""}. Save $
                      {selectedProduct.savings.toFixed(2)}
                      compared to buying elsewhere!
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome to FairCart</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="login">
            <TabsList className="w-full">
              <TabsTrigger value="login" className="flex-1">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="flex-1">
                Register
              </TabsTrigger>
              <TabsTrigger value="guest" className="flex-1">
                Guest
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 mt-4">
              <Input placeholder="Email" type="email" />
              <Input placeholder="Password" type="password" />
              <Button className="w-full">Login</Button>
            </TabsContent>
            <TabsContent value="register" className="space-y-4 mt-4">
              <Input placeholder="Full Name" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Password" type="password" />
              <Button className="w-full">Create Account</Button>
            </TabsContent>
            <TabsContent value="guest" className="space-y-4 mt-4">
              <p className="text-sm text-muted-foreground">
                Continue as guest to checkout without creating an account. You can still track your orders via email.
              </p>
              <Button
                className="w-full"
                onClick={() => {
                  setIsGuest(true)
                  setShowLoginModal(false)
                }}
              >
                Continue as Guest
              </Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Membership Modal */}
      <Dialog open={showMembershipModal} onOpenChange={setShowMembershipModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" />
              FairCart Premium
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-gradient-to-r from-primary/10 to-blue-500/10 rounded-lg">
              <p className="text-3xl font-bold text-primary">$35/month</p>
              <p className="text-sm text-muted-foreground">Cancel anytime</p>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>5% off every purchase (no commission fees)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Priority price drop alerts</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Exclusive member-only deals</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Free expedited order processing</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="w-5 h-5 text-green-500" />
                <span>Bulk discount access (Sam's Club, Costco)</span>
              </div>
            </div>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
              Start Premium Membership
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload List Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Shopping List
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload your shopping list and we'll find the best prices across all stores.
            </p>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="font-medium">Drag & drop your file here</p>
              <p className="text-sm text-muted-foreground">Supports CSV, TXT, or Excel files</p>
              <Button variant="outline" className="mt-4 bg-transparent">
                Browse Files
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">or</div>
            <textarea
              className="w-full border rounded-lg p-3 text-sm"
              rows={4}
              placeholder="Paste your shopping list here (one item per line)..."
            />
            <Button className="w-full">Find Best Prices</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Scan Modal */}
      <Dialog open={showScanModal} onOpenChange={setShowScanModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ScanLine className="w-5 h-5" />
              Scan Barcode
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scan any product barcode to instantly compare prices across stores.
            </p>
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ScanLine className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="font-medium">Camera access required</p>
                <p className="text-sm text-muted-foreground">Point camera at barcode</p>
              </div>
            </div>
            <div className="text-center text-sm text-muted-foreground">or enter manually</div>
            <Input placeholder="Enter barcode or SKU number..." />
            <Button className="w-full">Search Product</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Order Tracking Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Track Your Orders
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Enter order number or email..." />
            <Button className="w-full">Track Order</Button>
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-3">Recent Orders</p>
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">#FC-2024-001</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Delivered
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">3 items • $127.50</p>
                  <p className="text-xs text-muted-foreground">Delivered Jan 15, 2026</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-medium text-sm">#FC-2024-002</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                      In Transit
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">1 item • $49.99</p>
                  <p className="text-xs text-muted-foreground">Est. delivery Jan 20, 2026</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Price Alert Modal */}
      <Dialog open={showPriceAlertModal} onOpenChange={setShowPriceAlertModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Price Drop Alerts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Get notified when prices drop on your favorite products. We check prices across all stores multiple times
              daily.
            </p>
            <Input placeholder="Enter your email address..." type="email" />
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Checkbox />
                <span className="text-sm">Alert me for any price drop</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox />
                <span className="text-sm">Only alert for drops of 10% or more</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox />
                <span className="text-sm">Include out-of-stock notifications</span>
              </label>
            </div>
            <Button className="w-full">
              <Bell className="w-4 h-4 mr-2" />
              Enable Alerts
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Shipping Information</h3>
              <Input placeholder="Full Name" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Phone" type="tel" />
              <Input placeholder="Address Line 1" />
              <Input placeholder="Address Line 2 (optional)" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="City" />
                <Input placeholder="State" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="ZIP Code" />
                <Input placeholder="Country" defaultValue="United States" />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Order Summary</h3>
              <div className="border rounded-lg p-4 space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>${(item.ourPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>You Save</span>
                    <span>-${cartSavings.toFixed(2)}</span>
                  </div>
                  {customer?.isMember && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Member Discount</span>
                      <span>-${memberDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-primary" />
                  <span className="font-medium">Real-time Order Placement</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Your order is automatically placed with each store's best price the moment you checkout. Tracking
                  numbers sent within 24 hours.
                </p>
              </div>
              <Button className="w-full bg-primary hover:bg-primary/90" size="lg">
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Purchase
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 px-4 mt-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">FairCart.ai</h3>
              <p className="text-sm opacity-70">Compare prices across 30+ stores and save on every purchase.</p>
            </div>
            <div>
              <h4 className="font-medium mb-3">Quick Links</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>
                  <button onClick={() => setShowInfoModal("about")}>About Us</button>
                </li>
                <li>
                  <button onClick={() => setShowInfoModal("how")}>How It Works</button>
                </li>
                <li>
                  <button onClick={() => setShowMembershipModal(true)}>Membership</button>
                </li>
                <li>
                  <button onClick={() => setShowInfoModal("contact")}>Contact</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Policies</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li>
                  <button onClick={() => setShowInfoModal("privacy")}>Privacy Policy</button>
                </li>
                <li>
                  <button onClick={() => setShowInfoModal("terms")}>Terms of Service</button>
                </li>
                <li>
                  <button onClick={() => setShowInfoModal("returns")}>Return Policy</button>
                </li>
                <li>
                  <button onClick={() => setShowInfoModal("shipping")}>Shipping Info</button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Contact Us</h4>
              <ul className="space-y-2 text-sm opacity-70">
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@faircart.ai
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  1-800-FAIRCART
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm opacity-70">
            <p>&copy; 2026 FairCart.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Info Modals */}
      <Dialog open={!!showInfoModal} onOpenChange={() => setShowInfoModal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {showInfoModal === "about" && "About FairCart.ai"}
              {showInfoModal === "how" && "How It Works"}
              {showInfoModal === "contact" && "Contact Us"}
              {showInfoModal === "privacy" && "Privacy Policy"}
              {showInfoModal === "terms" && "Terms of Service"}
              {showInfoModal === "returns" && "Return Policy"}
              {showInfoModal === "shipping" && "Shipping Information"}
            </DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            {showInfoModal === "about" && (
              <div className="space-y-4">
                <p>
                  FairCart.ai is a revolutionary price comparison platform that helps you save money on every purchase.
                </p>
                <p>
                  We aggregate prices from 30+ stores including Amazon, Walmart, Target, Best Buy, Costco, Sam's Club,
                  Lowe's, Home Depot, plus international stores like Flipkart, MercadoLibre, and AliExpress.
                </p>
                <p>Our mission is simple: help you find the best price, every time.</p>
              </div>
            )}
            {showInfoModal === "how" && (
              <div className="space-y-4">
                <h4 className="font-medium">1. Search or Browse</h4>
                <p>Find products using our search, browse categories, or upload your shopping list.</p>
                <h4 className="font-medium">2. Compare Prices</h4>
                <p>See prices from all stores side-by-side, including Best Seller and Amazon's Choice badges.</p>
                <h4 className="font-medium">3. Checkout Once</h4>
                <p>Add items to your cart and checkout. We automatically place orders with the cheapest stores.</p>
                <h4 className="font-medium">4. Track Everything</h4>
                <p>Get real-time tracking from each store. All orders managed in one place.</p>
              </div>
            )}
            {showInfoModal === "contact" && (
              <div className="space-y-4">
                <p>
                  <strong>Email:</strong> support@faircart.ai
                </p>
                <p>
                  <strong>Phone:</strong> 1-800-FAIRCART (1-800-324-7227)
                </p>
                <p>
                  <strong>Hours:</strong> 24/7 Customer Support
                </p>
                <p>
                  <strong>Address:</strong> 123 Commerce Street, New York, NY 10001
                </p>
              </div>
            )}
            {showInfoModal === "privacy" && (
              <div className="space-y-4">
                <p>
                  Your privacy is important to us. We collect only the information necessary to process your orders and
                  improve our service.
                </p>
                <p>
                  We never sell your personal information to third parties. Your payment information is encrypted and
                  secure.
                </p>
              </div>
            )}
            {showInfoModal === "terms" && (
              <div className="space-y-4">
                <p>By using FairCart.ai, you agree to these terms of service.</p>
                <p>
                  We act as an intermediary between you and various retailers. Prices and availability are subject to
                  change.
                </p>
              </div>
            )}
            {showInfoModal === "returns" && (
              <div className="space-y-4">
                <p>Returns are processed through the original retailer's return policy.</p>
                <p>We assist with all return requests and coordinate with stores on your behalf.</p>
                <p>Most returns are accepted within 30 days of delivery.</p>
              </div>
            )}
            {showInfoModal === "shipping" && (
              <div className="space-y-4">
                <p>Shipping times vary by store and product:</p>
                <ul className="list-disc pl-4">
                  <li>US stores: 1-5 business days</li>
                  <li>International (India, Mexico): 7-21 business days</li>
                  <li>Global (AliExpress): 14-30 business days</li>
                </ul>
                <p>Free shipping on most orders over $35 from US stores.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {hoveredRetailerLink && (
        <div
          className="fixed z-50 bg-popover border border-border rounded-lg shadow-lg p-3 max-w-md pointer-events-none"
          style={{
            left: `${hoverPosition.x + 10}px`,
            top: `${hoverPosition.y + 10}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ExternalLink className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Verify on Retailer Site</span>
          </div>
          <a
            href={hoveredRetailerLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline break-all"
          >
            {hoveredRetailerLink}
          </a>
          <p className="text-xs text-muted-foreground mt-2 italic">
            This link shows where to verify the price - we never redirect you away from FairCart
          </p>
        </div>
      )}
    </div>
  )
}
