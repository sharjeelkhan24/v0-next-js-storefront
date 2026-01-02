import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function SuccessPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Order Successful!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been confirmed and will be shipped soon.
          </p>
          <Button asChild size="lg">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
