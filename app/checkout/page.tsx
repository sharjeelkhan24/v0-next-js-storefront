"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@/lib/cart-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CreditCard, TrendingUp } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UpsellSelector } from "@/components/upsell-selector"
import { getRelevantUpsells, calculateUpsellProfit, type UpsellPackage } from "@/lib/upsell-packages"

export default function CheckoutPage() {
  const { items, total } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const canceled = searchParams.get("canceled")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
  })

  const [selectedUpsells, setSelectedUpsells] = useState<UpsellPackage[]>([])
  const [availableUpsells, setAvailableUpsells] = useState<UpsellPackage[]>([])

  useEffect(() => {
    if (items.length > 0) {
      const upsells = getRelevantUpsells(items, total)
      setAvailableUpsells(upsells)
      // Pre-select recommended upsells
      setSelectedUpsells(upsells.filter((u) => u.recommended))
    }
  }, [items, total])

  const upsellTotal = selectedUpsells.reduce((sum, upsell) => sum + upsell.price, 0)
  const grandTotal = total + upsellTotal
  const estimatedProfit = calculateUpsellProfit(selectedUpsells)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("[v0] Initiating Stripe checkout with upsells...")

      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          upsells: selectedUpsells.map((upsell) => ({
            id: upsell.id,
            name: upsell.name,
            price: upsell.price,
            category: upsell.category,
          })),
          customerInfo: formData,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      console.log("[v0] Redirecting to Stripe Checkout...")

      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL received")
      }
    } catch (error: any) {
      console.error("[v0] Checkout error:", error)
      setError(error.message || "Failed to initiate checkout. Please try again.")
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => router.push("/")}>Continue Shopping</Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {canceled && (
          <Alert className="mb-6">
            <AlertDescription>Checkout was canceled. You can try again when you're ready.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">Zip Code</Label>
                      <Input
                        id="zip"
                        required
                        value={formData.zip}
                        onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Redirecting to payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Continue to Payment - ${grandTotal.toFixed(2)}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">Secure payment powered by Stripe</p>
                </form>
              </CardContent>
            </Card>

            {availableUpsells.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Add Value to Your Purchase
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UpsellSelector upsells={availableUpsells} onSelectionChange={setSelectedUpsells} />
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Items</h4>
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm mb-1">
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {selectedUpsells.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">Added Services</h4>
                      {selectedUpsells.map((upsell) => (
                        <div key={upsell.id} className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{upsell.name}</span>
                          <span className="font-medium">
                            {upsell.price === 0 ? "Included" : `$${upsell.price.toFixed(2)}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    {upsellTotal > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Services & Protection</span>
                        <span>${upsellTotal.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${grandTotal.toFixed(2)}</span>
                    </div>
                    {estimatedProfit > 0 && (
                      <div className="text-xs text-muted-foreground text-right">
                        Est. profit from services: ${estimatedProfit.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
