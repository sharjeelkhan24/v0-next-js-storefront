"use client"

import { useState, useMemo } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Star,
  Zap,
  Flame,
  Crown,
  Check,
  Store,
  Award,
  CreditCard,
  DollarSign,
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  Settings,
  ShoppingCart,
} from "lucide-react"

// Components
import { Header, FilterBar, DealSection, ProductGrid, ApiSetupGuide } from "./_components"
import { useCartState, useProducts, useFilteredProducts, type Product } from "./_hooks"

// ============================================
// Loading Skeleton
// ============================================

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================
// Main Page Component
// ============================================

export default function FairCartHomePage() {
  // Cart state
  const {
    cart,
    cartOpen,
    setCartOpen,
    customer,
    addToCart,
    removeFromCart,
    updateQuantity,
    cartTotal,
    cartSavings,
    memberDiscount,
    finalTotal,
  } = useCartState()

  // Products from real API
  const {
    products,
    deals,
    bestsellers,
    isLoading,
    error,
    apiConfigured,
    setupGuide,
    productsToShow,
    setProductsToShow,
    categories,
    regions,
    storesList,
    refreshProducts,
    lastUpdated,
  } = useProducts()

  // Filter state
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedStore, setSelectedStore] = useState("All")
  const [selectedRegion, setSelectedRegion] = useState("All")

  // Filtered products
  const filters = useMemo(() => ({
    search: searchQuery,
    category: selectedCategory,
    store: selectedStore,
    region: selectedRegion,
  }), [searchQuery, selectedCategory, selectedStore, selectedRegion])

  const { filteredProducts, flashSales, hotDeals, bestSellers, fairCartDeals } = useFilteredProducts(
    products,
    filters
  )

  // Modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showMembershipModal, setShowMembershipModal] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showScanModal, setShowScanModal] = useState(false)
  const [showTrackingModal, setShowTrackingModal] = useState(false)
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState<string | null>(null)
  const [showSetupGuide, setShowSetupGuide] = useState(false)

  // Handlers
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product)
    setShowProductModal(true)
  }

  const handleShowMore = () => {
    setProductsToShow((prev: number) => prev + 24)
  }

  // Show setup guide if API not configured
  if (!isLoading && !apiConfigured && setupGuide) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          cart={cart}
          cartOpen={cartOpen}
          setCartOpen={setCartOpen}
          customer={customer}
          cartTotal={cartTotal}
          cartSavings={cartSavings}
          memberDiscount={memberDiscount}
          finalTotal={finalTotal}
          onUpdateQuantity={updateQuantity}
          onRemoveFromCart={removeFromCart}
          onShowLogin={() => setShowLoginModal(true)}
          onShowUpload={() => setShowUploadModal(true)}
          onShowScan={() => setShowScanModal(true)}
          onShowTracking={() => setShowTrackingModal(true)}
          onShowMembership={() => setShowMembershipModal(true)}
          onShowCheckout={() => setShowCheckoutModal(true)}
        />
        <ApiSetupGuide 
          setupInstructions={setupGuide}
          onRefresh={refreshProducts}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        cart={cart}
        cartOpen={cartOpen}
        setCartOpen={setCartOpen}
        customer={customer}
        cartTotal={cartTotal}
        cartSavings={cartSavings}
        memberDiscount={memberDiscount}
        finalTotal={finalTotal}
        onUpdateQuantity={updateQuantity}
        onRemoveFromCart={removeFromCart}
        onShowLogin={() => setShowLoginModal(true)}
        onShowUpload={() => setShowUploadModal(true)}
        onShowScan={() => setShowScanModal(true)}
        onShowTracking={() => setShowTrackingModal(true)}
        onShowMembership={() => setShowMembershipModal(true)}
        onShowCheckout={() => setShowCheckoutModal(true)}
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedStore={selectedStore}
        setSelectedStore={setSelectedStore}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
        categories={categories}
        stores={storesList}
        regions={regions}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Status Bar */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg">
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-xs">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Live Prices
            </Badge>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={refreshProducts} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading products</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-8">
            <div>
              <Skeleton className="h-8 w-48 mb-4" />
              <ProductSkeleton />
            </div>
          </div>
        ) : (
          <>
            {/* Flash Sales */}
            {flashSales.length > 0 && (
              <DealSection
                title="Flash Sales"
                products={flashSales}
                icon={Zap}
                iconColor="text-blue-600"
                badgeColor="bg-blue-600 text-white"
                badgeText="Limited Time"
                onAddToCart={addToCart}
                onViewDetails={handleViewDetails}
              />
            )}

            {/* Hot Deals */}
            {hotDeals.length > 0 && (
              <DealSection
                title="Hot Deals"
                products={hotDeals}
                icon={Flame}
                iconColor="text-red-500"
                badgeColor="bg-red-500 text-white"
                badgeText="Trending"
                onAddToCart={addToCart}
                onViewDetails={handleViewDetails}
              />
            )}

            {/* Best Sellers */}
            {bestSellers.length > 0 && (
              <DealSection
                title="Best Sellers"
                products={bestSellers}
                icon={Award}
                iconColor="text-amber-500"
                badgeColor="bg-amber-500 text-white"
                badgeText="Top Rated"
                onAddToCart={addToCart}
                onViewDetails={handleViewDetails}
              />
            )}

            {/* Budget Deals */}
            {fairCartDeals.length > 0 && (
              <DealSection
                title="Under $25"
                products={fairCartDeals}
                icon={DollarSign}
                iconColor="text-green-600"
                badgeColor="bg-green-600 text-white"
                badgeText="Budget Friendly"
                onAddToCart={addToCart}
                onViewDetails={handleViewDetails}
              />
            )}

            {/* All Products */}
            <ProductGrid
              products={filteredProducts}
              productsToShow={productsToShow}
              onShowMore={handleShowMore}
              onAddToCart={addToCart}
              onViewDetails={handleViewDetails}
            />

            {/* No products message */}
            {filteredProducts.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search query
                </p>
                <Button onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("All")
                  setSelectedStore("All")
                }}>
                  Clear Filters
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-muted/50 border-t mt-12 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-bold mb-4">About FairCart</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setShowInfoModal("about")} className="hover:text-primary">About Us</button></li>
                <li><button onClick={() => setShowInfoModal("how")} className="hover:text-primary">How It Works</button></li>
                <li><button onClick={() => setShowInfoModal("contact")} className="hover:text-primary">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Stores</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Amazon</li>
                <li>Walmart</li>
                <li>eBay</li>
                <li>Target</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => setShowInfoModal("privacy")} className="hover:text-primary">Privacy Policy</button></li>
                <li><button onClick={() => setShowInfoModal("terms")} className="hover:text-primary">Terms of Service</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">FairCart</h4>
              <p className="text-sm text-muted-foreground">
                Real prices from real stores. Compare and save on every purchase.
              </p>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            © 2024 FairCart - Real Products. Real Prices.
          </div>
        </div>
      </footer>

      {/* Product Detail Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedProduct && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{selectedProduct.name}</DialogTitle>
              </DialogHeader>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Product Image */}
                <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="object-contain w-full h-full p-4"
                  />
                  <Badge className="absolute top-4 left-4">
                    {selectedProduct.store}
                  </Badge>
                </div>
                
                {/* Product Details */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{selectedProduct.brand}</p>
                    <p className="text-muted-foreground mt-2">{selectedProduct.description}</p>
                  </div>
                  
                  {/* Price */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-primary">
                      ${selectedProduct.price.toFixed(2)}
                    </span>
                    {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                      <>
                        <span className="text-lg text-muted-foreground line-through">
                          ${selectedProduct.originalPrice.toFixed(2)}
                        </span>
                        <Badge className="bg-green-600">
                          Save {selectedProduct.savingsPercent}%
                        </Badge>
                      </>
                    )}
                  </div>

                  {/* Rating */}
                  {selectedProduct.rating > 0 && (
                    <div className="flex items-center gap-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(selectedProduct.rating)
                              ? "text-amber-400 fill-amber-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                      <span className="text-muted-foreground">
                        {selectedProduct.rating.toFixed(1)} ({selectedProduct.reviewCount.toLocaleString()} reviews)
                      </span>
                    </div>
                  )}

                  {/* Features */}
                  {selectedProduct.features && selectedProduct.features.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Features</h4>
                      <ul className="space-y-1">
                        {selectedProduct.features.slice(0, 5).map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <Button 
                      className="w-full" 
                      size="lg"
                      onClick={() => {
                        addToCart(selectedProduct)
                        setShowProductModal(false)
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart - ${selectedProduct.price.toFixed(2)}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(selectedProduct.storeUrl, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on {selectedProduct.store}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In to FairCart</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4 pt-4">
              <Input type="email" placeholder="Email" />
              <Input type="password" placeholder="Password" />
              <Button className="w-full">Sign In</Button>
              <Button variant="outline" className="w-full" onClick={() => setShowLoginModal(false)}>
                Continue as Guest
              </Button>
            </TabsContent>
            <TabsContent value="register" className="space-y-4 pt-4">
              <Input placeholder="Full Name" />
              <Input type="email" placeholder="Email" />
              <Input type="password" placeholder="Password" />
              <div className="flex items-center gap-2">
                <Checkbox id="member" />
                <label htmlFor="member" className="text-sm">Join FairCart+ for 5% off</label>
              </div>
              <Button className="w-full">Create Account</Button>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Membership Modal */}
      <Dialog open={showMembershipModal} onOpenChange={setShowMembershipModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-amber-500" /> FairCart+ Membership
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-lg">
              <p className="text-2xl font-bold">$9.99/month</p>
              <p className="text-sm text-muted-foreground">or $99/year (save 17%)</p>
            </div>
            <ul className="space-y-2">
              {["5% off all orders", "Free express shipping", "Early access to deals", "Price drop alerts", "Exclusive deals"].map((benefit) => (
                <li key={benefit} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            <Button className="w-full bg-amber-500 hover:bg-amber-600">Start Free Trial</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Modal */}
      <Dialog open={showCheckoutModal} onOpenChange={setShowCheckoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Full Name" />
            <Input type="email" placeholder="Email" />
            <Input placeholder="Shipping Address" />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="City" />
              <Input placeholder="ZIP Code" />
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full" disabled={cart.length === 0}>
              <CreditCard className="w-4 h-4 mr-2" /> Pay ${finalTotal.toFixed(2)}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Info Modal */}
      <Dialog open={!!showInfoModal} onOpenChange={() => setShowInfoModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {showInfoModal === "about" && "About FairCart"}
              {showInfoModal === "how" && "How It Works"}
              {showInfoModal === "contact" && "Contact Us"}
              {showInfoModal === "privacy" && "Privacy Policy"}
              {showInfoModal === "terms" && "Terms of Service"}
            </DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm max-w-none">
            {showInfoModal === "about" && (
              <p>FairCart compares real prices from Amazon, Walmart, eBay, and more to help you find the best deals on every purchase.</p>
            )}
            {showInfoModal === "how" && (
              <div className="space-y-2">
                <p><strong>1. Search</strong> - Find products across all major retailers</p>
                <p><strong>2. Compare</strong> - See real-time prices from multiple stores</p>
                <p><strong>3. Save</strong> - Buy from the store with the best price</p>
              </div>
            )}
            {showInfoModal === "contact" && (
              <p>Email: support@faircart.ai</p>
            )}
            {showInfoModal === "privacy" && (
              <p>We respect your privacy and never sell your data.</p>
            )}
            {showInfoModal === "terms" && (
              <p>By using FairCart, you agree to our terms of service.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload/Scan/Tracking Modals - Simplified */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Shopping List</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Upload a CSV or text file with your shopping list.</p>
          <Input type="file" accept=".csv,.txt" />
          <Button className="w-full">Upload & Compare</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showScanModal} onOpenChange={setShowScanModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Scan Product</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Use your camera to scan a barcode.</p>
          <Button className="w-full">Open Camera</Button>
        </DialogContent>
      </Dialog>

      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Track Orders</DialogTitle></DialogHeader>
          <p className="text-muted-foreground">Sign in to view order tracking.</p>
          <Button className="w-full" onClick={() => { setShowTrackingModal(false); setShowLoginModal(true) }}>
            Sign In
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
