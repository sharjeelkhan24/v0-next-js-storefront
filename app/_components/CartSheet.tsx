"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ShoppingCart, Minus, Plus, Trash2, Crown, ExternalLink } from "lucide-react"
import type { CartItem } from "@/app/_hooks/useCartState"
import type { Customer } from "@/app/_types"

interface CartSheetProps {
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
  onCheckout: () => void
  onShowMembership: () => void
}

export function CartSheet({
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
  onCheckout,
  onShowMembership,
}: CartSheetProps) {
  return (
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
                  <div className="w-16 h-16 relative rounded overflow-hidden flex-shrink-0 bg-white">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = `https://via.placeholder.com/64x64/f0f0f0/333?text=${encodeURIComponent(item.store[0])}`
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.store}</p>
                    <p className="text-sm font-bold text-primary">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onUpdateQuantity(item.id, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive ml-auto"
                        onClick={() => onRemoveFromCart(item.id)}
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
          <div className="border-t mt-4 pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            {cartSavings > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Total Savings</span>
                <span>-${cartSavings.toFixed(2)}</span>
              </div>
            )}
            {customer?.isMember && (
              <div className="flex justify-between text-sm text-primary">
                <span className="flex items-center gap-1">
                  <Crown className="w-4 h-4" /> Member Discount (5%)
                </span>
                <span>-${memberDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t pt-3">
              <span>Total</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>

            {!customer?.isMember && (
              <Button
                variant="outline"
                className="w-full border-primary text-primary"
                onClick={onShowMembership}
              >
                <Crown className="w-4 h-4 mr-2" /> Become a Member - Save 5%
              </Button>
            )}

            <Button className="w-full bg-primary hover:bg-primary/90" onClick={onCheckout}>
              Checkout - ${finalTotal.toFixed(2)}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
