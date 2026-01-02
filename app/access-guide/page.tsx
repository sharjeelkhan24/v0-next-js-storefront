import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import {
  ShoppingCart,
  Car,
  Home,
  TrendingUp,
  BarChart3,
  Gavel,
  Building2,
  Briefcase,
  Users,
  Package,
} from "lucide-react"

export default function AccessGuide() {
  const features = [
    {
      title: "Electronics Storefront",
      description: "Main product catalog with auto-refresh",
      href: "/",
      icon: ShoppingCart,
      status: "Live",
    },
    {
      title: "Hot Deals",
      description: "AI-detected deals with auto-checkout",
      href: "/deals",
      icon: TrendingUp,
      status: "Live",
    },
    {
      title: "Car Marketplace",
      description: "Private seller listings with sorting",
      href: "/cars",
      icon: Car,
      status: "Live",
    },
    {
      title: "Auction Inventory",
      description: "Copart/IAA/Manheim with AI arbitrage",
      href: "/auctions",
      icon: Gavel,
      status: "Live",
    },
    {
      title: "Property Listings",
      description: "Real estate with map and contact form",
      href: "/property/1",
      icon: Home,
      status: "Live",
    },
    {
      title: "Command Center",
      description: "Unified dashboard for all three engines",
      href: "/command-center",
      icon: BarChart3,
      status: "Live",
    },
    {
      title: "Dealer Dashboard",
      description: "Car inventory with profit calculator",
      href: "/dealer-dashboard",
      icon: Briefcase,
      status: "Live",
    },
    {
      title: "Real Estate Pipeline",
      description: "Lead matching and commission tracking",
      href: "/real-estate-pipeline",
      icon: Building2,
      status: "Live",
    },
    {
      title: "SaaS Portal",
      description: "Multi-tenant licensing platform",
      href: "/saas-portal",
      icon: Users,
      status: "Live",
    },
    {
      title: "Admin Orders",
      description: "Order management with fulfillment",
      href: "/admin/orders",
      icon: Package,
      status: "Live",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 text-balance">Welcome to IrishTripplets</h1>
            <p className="text-xl text-muted-foreground mb-6">AI-Powered Multi-Vertical Marketplace Platform</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Badge variant="secondary">Electronics Dropship</Badge>
              <Badge variant="secondary">Automotive Dealer</Badge>
              <Badge variant="secondary">Real Estate</Badge>
              <Badge variant="secondary">SaaS Licensing</Badge>
              <Badge variant="secondary">Data Monetization</Badge>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>Click any feature below to navigate directly to that section</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon
                  return (
                    <Link key={feature.href} href={feature.href}>
                      <Card className="hover:bg-accent transition-colors cursor-pointer h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <Icon className="h-5 w-5 text-primary" />
                            <Badge variant="outline" className="text-xs">
                              {feature.status}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg">{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Phase 1: Electronics MVP ✅</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Deal aggregator with Amazon/eBay integration</li>
                  <li>Auto-checkout bot for detected deals</li>
                  <li>Price tracking and deal alerts</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Phase 2: Car Engine ✅</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Auction scraping (Copart/IAA/Manheim)</li>
                  <li>AI arbitrage scoring engine</li>
                  <li>Automated bidding system</li>
                  <li>Financing/warranty/insurance calculators</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Phase 3: Real Estate ✅</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>AI lead matching algorithm</li>
                  <li>Buyer-property compatibility scoring</li>
                  <li>Commission calculator (3-6%)</li>
                  <li>Closing pipeline management</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Phase 4: Jarvis AI ✅</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Voice-enabled chatbot (Whisper + GPT)</li>
                  <li>Module-specific voice commands</li>
                  <li>Transaction automation via voice</li>
                  <li>Cross-vertical recommendations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
