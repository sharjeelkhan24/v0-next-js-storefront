"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Loader2, XCircle } from "lucide-react"
import { useCart } from "@/lib/cart-context"

interface StripeSession {
  id: string
  amount_total: number
  currency: string
  customer_email: string
  payment_status: string
  metadata: {
    customerName?: string
    customerPhone?: string
    customerAddress?: string
    customerCity?: string
    customerZip?: string
  }
  line_items?: Array<{
    description: string
    quantity: number
    amount_total: number
  }>
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { clearCart } = useCart()
  const sessionId = searchParams.get("session_id")

  const [session, setSession] = useState<StripeSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found")
      setLoading(false)
      return
    }

    const fetchSession = async () => {
      try {
        console.log("[v0] Fetching Stripe session details...")

        const response = await fetch(`/api/stripe/session?session_id=${sessionId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to retrieve session")
        }

        console.log("[v0] Session retrieved successfully")
        setSession(data.session)

        // Clear the cart after successful payment
        clearCart()
      } catch (err: any) {
        console.error("[v0] Error fetching session:", err)
        setError(err.message || "Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId, clearCart])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="h-16 w-16 animate-spin mx-auto mb-4 text-primary" />
            <h1 className="text-2xl font-bold mb-2">Loading order details...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </div>
        </main>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
            <p className="text-muted-foreground mb-8">
              {error || "Unable to load order details. Please contact support if you were charged."}
            </p>
            <Button onClick={() => router.push("/")}>Return to Home</Button>
          </div>
        </main>
      </div>
    )
  }

  const isPaymentSuccessful = session.payment_status === "paid"

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            {isPaymentSuccessful ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
                <p className="text-muted-foreground">Thank you for your purchase. Your order has been confirmed.</p>
              </>
            ) : (
              <>
                <Loader2 className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-2">Payment Processing</h1>
                <p className="text-muted-foreground">
                  Your payment is being processed. You'll receive a confirmation email shortly.
                </p>
              </>
            )}
          </div>

          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono text-sm">{session.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className="font-medium capitalize">{session.payment_status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Amount</span>
                  <span className="font-bold text-lg">
                    ${((session.amount_total || 0) / 100).toFixed(2)} {session.currency?.toUpperCase()}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Email</span>
                  <p className="font-medium">{session.customer_email}</p>
                </div>
                {session.metadata?.customerName && (
                  <div>
                    <span className="text-sm text-muted-foreground">Name</span>
                    <p className="font-medium">{session.metadata.customerName}</p>
                  </div>
                )}
                {session.metadata?.customerAddress && (
                  <div>
                    <span className="text-sm text-muted-foreground">Shipping Address</span>
                    <p className="font-medium">
                      {session.metadata.customerAddress}
                      {session.metadata.customerCity && `, ${session.metadata.customerCity}`}
                      {session.metadata.customerZip && ` ${session.metadata.customerZip}`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {session.line_items && session.line_items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Items Ordered</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {session.line_items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>
                          {item.description} x {item.quantity}
                        </span>
                        <span className="font-medium">${((item.amount_total || 0) / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to {session.customer_email}
            </p>
            <Button onClick={() => router.push("/")} size="lg">
              Continue Shopping
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  )
}
