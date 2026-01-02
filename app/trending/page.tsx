import { trendingElectronics } from "@/lib/trending-products"
import { TrendingProductCard } from "@/components/trending-product-card"
import { Header } from "@/components/header"
import { TrendingUp, Zap, Award } from "lucide-react"

export default function TrendingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full bg-accent/10 text-accent">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">Trending Now</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">Trending Electronics</h1>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto text-pretty">
            Discover the most popular tech products loved by thousands of customers worldwide
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="flex items-center gap-4 p-6 rounded-lg bg-muted/30 border border-border/50">
            <div className="p-3 rounded-full bg-emerald-500/10">
              <Zap className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm text-muted-foreground">New Arrivals</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-lg bg-muted/30 border border-border/50">
            <div className="p-3 rounded-full bg-rose-500/10">
              <TrendingUp className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">15K+</div>
              <div className="text-sm text-muted-foreground">Happy Customers</div>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 rounded-lg bg-muted/30 border border-border/50">
            <div className="p-3 rounded-full bg-blue-500/10">
              <Award className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingElectronics.map((product) => (
            <TrendingProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  )
}
