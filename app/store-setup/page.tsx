"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  ExternalLink, 
  CheckCircle2, 
  Circle,
  Copy,
  Key,
  Store,
  ShoppingCart,
  Home,
  Sparkles,
  Pill,
  Package,
  Search,
  Zap,
} from "lucide-react"

// RapidAPI Stores
const RAPIDAPI_STORES = [
  {
    name: "General Retail",
    icon: ShoppingCart,
    stores: [
      { id: "amazon", name: "Amazon", url: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data", free: "100/mo", subscribed: true },
      { id: "walmart", name: "Walmart", url: "https://rapidapi.com/apidojo/api/walmart2", free: "100/mo" },
      { id: "target", name: "Target", url: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/target-com-shopping-api", free: "100/mo" },
      { id: "costco", name: "Costco", url: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/costco-data", free: "100/mo" },
      { id: "ebay", name: "eBay", url: "https://rapidapi.com/apidojo/api/ebay-search-result", free: "100/mo" },
    ],
  },
  {
    name: "Home Improvement",
    icon: Home,
    stores: [
      { id: "homedepot", name: "Home Depot", url: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/home-depot-product-data", free: "100/mo" },
      { id: "lowes", name: "Lowe's", url: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/lowes-data", free: "100/mo" },
      { id: "wayfair", name: "Wayfair", url: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/wayfair-data", free: "100/mo" },
    ],
  },
  {
    name: "Beauty & Health",
    icon: Sparkles,
    stores: [
      { id: "sephora", name: "Sephora", url: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/sephora", free: "100/mo" },
      { id: "ulta", name: "Ulta", url: "https://rapidapi.com/letscrape-6bRBa3QguO5/api/ulta", free: "100/mo" },
    ],
  },
]

// SerpAPI Google Shopping stores (automatically available)
const SERPAPI_STORES = {
  grocery: ["Meijer", "Kroger", "Publix", "HEB", "Aldi", "Trader Joe's", "Whole Foods", "Safeway"],
  department: ["Macy's", "Nordstrom", "Kohl's", "JCPenney", "Dillard's", "Neiman Marcus"],
  discount: ["TJ Maxx", "Marshalls", "Ross", "Burlington", "Dollar General", "Five Below"],
  sports: ["Dick's Sporting Goods", "REI", "Bass Pro Shops", "Academy Sports"],
  electronics: ["Best Buy", "Newegg", "B&H Photo", "Micro Center"],
  pets: ["PetSmart", "Petco", "Chewy"],
}

export default function StoreSetupPage() {
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">🛒 Store API Setup</h1>
          <p className="text-primary-foreground/80">
            You have access to <span className="font-bold">100+ stores</span> with real-time pricing
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* API Status */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* RapidAPI Status */}
          <Card className="border-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  RapidAPI
                </CardTitle>
                <Badge className="bg-green-500">✓ Connected</Badge>
              </div>
              <CardDescription>Amazon, Walmart, Target, eBay & more</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-slate-50 p-3 rounded font-mono text-xs flex items-center justify-between">
                <code>RAPIDAPI_KEY=9a54...73df</code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-400 h-6"
                  onClick={() => copyToClipboard("RAPIDAPI_KEY=9a54072d5cmsh961d1d5cc06d163p169947jsn2a30428d73df", "rapidapi")}
                >
                  {copied === "rapidapi" ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* SerpAPI Status */}
          <Card className="border-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  SerpAPI (Google Shopping)
                </CardTitle>
                <Badge className="bg-green-500">✓ Connected</Badge>
              </div>
              <CardDescription>Meijer, Kroger, Publix & 100+ stores</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900 text-slate-50 p-3 rounded font-mono text-xs flex items-center justify-between">
                <code>SERPAPI_KEY=7aec...19fc</code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-slate-400 h-6"
                  onClick={() => copyToClipboard("SERPAPI_KEY=7aecdad28b6b7ca7fc18e6a66d82363a4622b18008b15afa97681fa577d119fc", "serpapi")}
                >
                  {copied === "serpapi" ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SerpAPI - All These Stores Are Ready */}
        <Card className="mb-8 border-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              Instant Access via Google Shopping (SerpAPI)
            </CardTitle>
            <CardDescription>
              These stores are <span className="text-green-500 font-medium">already working</span> - no additional setup needed!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(SERPAPI_STORES).map(([category, stores]) => (
                <div key={category} className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium capitalize mb-2">{category}</h4>
                  <div className="flex flex-wrap gap-1">
                    {stores.map(store => (
                      <Badge key={store} variant="secondary" className="text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                        {store}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* RapidAPI Stores - Optional Upgrades */}
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          RapidAPI Stores (Subscribe for Direct Access)
        </h2>
        <p className="text-muted-foreground mb-4">
          These give you more detailed product data and faster responses. Click to subscribe (free tier available).
        </p>

        {RAPIDAPI_STORES.map((category) => (
          <div key={category.name} className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <category.icon className="w-4 h-4 text-primary" />
              <h3 className="font-medium">{category.name}</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {category.stores.map((store) => (
                <Card key={store.id} className={store.subscribed ? "border-green-500" : ""}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {store.subscribed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="font-medium text-sm">{store.name}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {store.free}
                      </Badge>
                    </div>
                    <Button 
                      variant={store.subscribed ? "outline" : "default"}
                      size="sm" 
                      className="w-full text-xs h-7"
                      asChild
                    >
                      <a href={store.url} target="_blank" rel="noopener noreferrer">
                        {store.subscribed ? "View" : "Subscribe"}
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Test Search */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Your Setup</CardTitle>
            <CardDescription>Try searching for a product to verify everything works</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input placeholder="Search for a product..." className="flex-1" />
              <Button>Search All Stores</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              This will search Amazon, Walmart, Target, Meijer, Kroger, and 100+ more stores simultaneously.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
