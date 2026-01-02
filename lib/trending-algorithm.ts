// IrishTripplets Trending Products Algorithm
// Simulates scraping Google Trends, TikTok, Instagram, Facebook to find hot-selling items

export interface TrendingProduct {
  id: string
  name: string
  category: string
  trendScore: number
  searchVolume: number
  platforms: {
    google: number
    tiktok: number
    instagram: number
    facebook: number
  }
  priceRange: {
    min: number
    max: number
    average: number
  }
  competitors: {
    amazon: number
    ebay: number
    aliexpress: number
    walmart: number
    target: number
  }
  arbitrageOpportunity: {
    bestSource: string
    buyPrice: number
    suggestedPrice: number
    potentialProfit: number
    profitMargin: number
  }
  socialMetrics: {
    mentions: number
    engagement: number
    sentiment: "positive" | "neutral" | "negative"
  }
}

// Simulate trending product discovery
export function findTrendingProducts(): TrendingProduct[] {
  return [
    {
      id: "trend1",
      name: "Stanley Quencher Tumbler 40oz",
      category: "Home & Kitchen",
      trendScore: 98,
      searchVolume: 2500000,
      platforms: {
        google: 2500000,
        tiktok: 1800000,
        instagram: 950000,
        facebook: 680000,
      },
      priceRange: {
        min: 25.99,
        max: 45.0,
        average: 35.99,
      },
      competitors: {
        amazon: 35.99,
        ebay: 32.99,
        aliexpress: 18.5,
        walmart: 38.0,
        target: 40.0,
      },
      arbitrageOpportunity: {
        bestSource: "AliExpress",
        buyPrice: 18.5,
        suggestedPrice: 39.99,
        potentialProfit: 21.49,
        profitMargin: 53.7,
      },
      socialMetrics: {
        mentions: 4850000,
        engagement: 12500000,
        sentiment: "positive",
      },
    },
    {
      id: "trend2",
      name: "Dyson Airwrap Multi-Styler",
      category: "Beauty & Personal Care",
      trendScore: 96,
      searchVolume: 1850000,
      platforms: {
        google: 1850000,
        tiktok: 3200000,
        instagram: 2100000,
        facebook: 450000,
      },
      priceRange: {
        min: 499.99,
        max: 599.99,
        average: 549.99,
      },
      competitors: {
        amazon: 549.99,
        ebay: 520.0,
        aliexpress: 0, // Not available
        walmart: 549.99,
        target: 569.99,
      },
      arbitrageOpportunity: {
        bestSource: "eBay",
        buyPrice: 520.0,
        suggestedPrice: 579.99,
        potentialProfit: 59.99,
        profitMargin: 10.3,
      },
      socialMetrics: {
        mentions: 8900000,
        engagement: 25000000,
        sentiment: "positive",
      },
    },
    {
      id: "trend3",
      name: "Apple AirTag 4 Pack",
      category: "Electronics",
      trendScore: 94,
      searchVolume: 1650000,
      platforms: {
        google: 1650000,
        tiktok: 850000,
        instagram: 720000,
        facebook: 980000,
      },
      priceRange: {
        min: 89.99,
        max: 99.99,
        average: 94.99,
      },
      competitors: {
        amazon: 94.99,
        ebay: 92.5,
        aliexpress: 0,
        walmart: 99.0,
        target: 99.99,
      },
      arbitrageOpportunity: {
        bestSource: "eBay",
        buyPrice: 92.5,
        suggestedPrice: 99.99,
        potentialProfit: 7.49,
        profitMargin: 7.5,
      },
      socialMetrics: {
        mentions: 3200000,
        engagement: 8500000,
        sentiment: "positive",
      },
    },
    {
      id: "trend4",
      name: "Liquid Death Mountain Water",
      category: "Beverages",
      trendScore: 92,
      searchVolume: 1420000,
      platforms: {
        google: 1420000,
        tiktok: 2800000,
        instagram: 1900000,
        facebook: 350000,
      },
      priceRange: {
        min: 1.89,
        max: 2.99,
        average: 2.49,
      },
      competitors: {
        amazon: 2.49,
        ebay: 2.99,
        aliexpress: 0,
        walmart: 2.29,
        target: 2.49,
      },
      arbitrageOpportunity: {
        bestSource: "Walmart",
        buyPrice: 2.29,
        suggestedPrice: 2.99,
        potentialProfit: 0.7,
        profitMargin: 23.4,
      },
      socialMetrics: {
        mentions: 6500000,
        engagement: 18000000,
        sentiment: "positive",
      },
    },
    {
      id: "trend5",
      name: "Ninja Creami Ice Cream Maker",
      category: "Kitchen Appliances",
      trendScore: 91,
      searchVolume: 1380000,
      platforms: {
        google: 1380000,
        tiktok: 4200000,
        instagram: 1500000,
        facebook: 520000,
      },
      priceRange: {
        min: 179.99,
        max: 229.99,
        average: 199.99,
      },
      competitors: {
        amazon: 199.99,
        ebay: 189.99,
        aliexpress: 145.0,
        walmart: 199.0,
        target: 229.99,
      },
      arbitrageOpportunity: {
        bestSource: "AliExpress",
        buyPrice: 145.0,
        suggestedPrice: 219.99,
        potentialProfit: 74.99,
        profitMargin: 34.1,
      },
      socialMetrics: {
        mentions: 7600000,
        engagement: 22000000,
        sentiment: "positive",
      },
    },
    {
      id: "trend6",
      name: "Owala FreeSip Water Bottle",
      category: "Sports & Outdoors",
      trendScore: 89,
      searchVolume: 1250000,
      platforms: {
        google: 1250000,
        tiktok: 1600000,
        instagram: 890000,
        facebook: 320000,
      },
      priceRange: {
        min: 27.99,
        max: 37.99,
        average: 32.99,
      },
      competitors: {
        amazon: 32.99,
        ebay: 29.99,
        aliexpress: 15.5,
        walmart: 34.99,
        target: 32.99,
      },
      arbitrageOpportunity: {
        bestSource: "AliExpress",
        buyPrice: 15.5,
        suggestedPrice: 35.99,
        potentialProfit: 20.49,
        profitMargin: 56.9,
      },
      socialMetrics: {
        mentions: 4100000,
        engagement: 11000000,
        sentiment: "positive",
      },
    },
    {
      id: "trend7",
      name: "Olaplex Hair Treatment Set",
      category: "Beauty & Personal Care",
      trendScore: 88,
      searchVolume: 1180000,
      platforms: {
        google: 1180000,
        tiktok: 2900000,
        instagram: 3200000,
        facebook: 650000,
      },
      priceRange: {
        min: 28.0,
        max: 30.0,
        average: 28.99,
      },
      competitors: {
        amazon: 28.0,
        ebay: 29.99,
        aliexpress: 0,
        walmart: 30.0,
        target: 28.0,
      },
      arbitrageOpportunity: {
        bestSource: "Amazon",
        buyPrice: 28.0,
        suggestedPrice: 34.99,
        potentialProfit: 6.99,
        profitMargin: 20.0,
      },
      socialMetrics: {
        mentions: 9800000,
        engagement: 28000000,
        sentiment: "positive",
      },
    },
    {
      id: "trend8",
      name: "Lego Star Wars Millennium Falcon",
      category: "Toys & Games",
      trendScore: 86,
      searchVolume: 980000,
      platforms: {
        google: 980000,
        tiktok: 450000,
        instagram: 620000,
        facebook: 1200000,
      },
      priceRange: {
        min: 849.99,
        max: 899.99,
        average: 874.99,
      },
      competitors: {
        amazon: 849.99,
        ebay: 879.99,
        aliexpress: 0,
        walmart: 849.99,
        target: 899.99,
      },
      arbitrageOpportunity: {
        bestSource: "Amazon",
        buyPrice: 849.99,
        suggestedPrice: 919.99,
        potentialProfit: 70.0,
        profitMargin: 7.6,
      },
      socialMetrics: {
        mentions: 2800000,
        engagement: 7500000,
        sentiment: "positive",
      },
    },
  ]
}

// Get top trending by category
export function getTrendingByCategory(category: string): TrendingProduct[] {
  return findTrendingProducts().filter((p) => p.category === category)
}

// Get best arbitrage opportunities
export function getBestArbitrageOpportunities(minMargin = 20): TrendingProduct[] {
  return findTrendingProducts()
    .filter((p) => p.arbitrageOpportunity.profitMargin >= minMargin)
    .sort((a, b) => b.arbitrageOpportunity.profitMargin - a.arbitrageOpportunity.profitMargin)
}

// Simulate real-time social listening
export function simulateSocialListening() {
  return {
    lastUpdated: new Date(),
    totalMentions: 48200000,
    topHashtags: ["#TikTokMadeMeBuyIt", "#AmazonFinds", "#TargetRun", "#MustHave", "#Viral"],
    emergingTrends: ["Smart home devices", "Wellness products", "Sustainable goods"],
    viralProducts: [
      "Stanley Tumbler",
      "Dyson Airwrap",
      "Ninja Creami",
      "Liquid Death",
      "Owala Bottle",
      "AirTag",
      "Olaplex",
      "Lego Sets",
    ],
  }
}
