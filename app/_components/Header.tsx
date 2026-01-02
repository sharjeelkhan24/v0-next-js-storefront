"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, User, Upload, ScanLine, Package } from "lucide-react"
import { CartSheet } from "./CartSheet"
import type { CartItem } from "@/app/_hooks/useCartState"
import type { Customer } from "@/app/_types"

interface HeaderProps {
  // Search & Filters
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  categories: string[]
  
  // Cart
  cart: CartItem[]
  cartOpen: boolean
  setCartOpen: (open: boolean) => void
  customer: Customer | null
  cartTotal: number
  cartSavings: number
  memberDiscount: number
  finalTotal: number
  onUpdateQuantity: (productId: string, delta: number) => void
  onRemoveFromCart: (productId: string) => void
  
  // Modals
  onShowLogin: () => void
  onShowUpload: () => void
  onShowScan: () => void
  onShowTracking: () => void
  onShowMembership: () => void
  onShowCheckout: () => void
}

export function Header({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories,
  cart,
  cartOpen,
  setCartOpen,
  customer,
  cartTotal,
  cartSavings,
  memberDiscount,
  finalTotal,
  onUpdateQuantity,
  onRemoveFromCart,
  onShowLogin,
  onShowUpload,
  onShowScan,
  onShowTracking,
  onShowMembership,
  onShowCheckout,
}: HeaderProps) {
  return (
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

          {/* Category selector - desktop */}
          <div className="hidden lg:flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px] bg-white text-foreground">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
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
              onClick={onShowUpload}
            >
              <Upload className="w-4 h-4 mr-1" />
              <span className="hidden lg:inline">Upload List</span>
            </Button>

            {/* Scan */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-primary-foreground hover:bg-white/20"
              onClick={onShowScan}
            >
              <ScanLine className="w-4 h-4 mr-1" />
              <span className="hidden lg:inline">Scan</span>
            </Button>

            {/* Track Orders */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:flex text-primary-foreground hover:bg-white/20"
              onClick={onShowTracking}
            >
              <Package className="w-4 h-4 mr-1" />
              <span className="hidden lg:inline">Track</span>
            </Button>

            {/* Login */}
            <Button
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-white/20"
              onClick={onShowLogin}
            >
              <User className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">{customer ? customer.name : "Login"}</span>
            </Button>

            {/* Cart */}
            <CartSheet
              cart={cart}
              cartOpen={cartOpen}
              setCartOpen={setCartOpen}
              customer={customer}
              cartTotal={cartTotal}
              cartSavings={cartSavings}
              memberDiscount={memberDiscount}
              finalTotal={finalTotal}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveFromCart={onRemoveFromCart}
              onCheckout={onShowCheckout}
              onShowMembership={onShowMembership}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
