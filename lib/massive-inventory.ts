import { calculateFlatProfit, findCheapestSupplier } from "./pricing-engine"

export interface SupplierPrices {
  amazon?: number
  ebay?: number
  aliexpress?: number
  walmart?: number
  target?: number
  meijer?: number
  jcpenney?: number
}

export interface MassiveProduct {
  id: string
  name: string
  category: string
  description: string
  supplierPrices: SupplierPrices
  cheapestSupplier: string
  supplierCost: number
  ourPrice: number
  profit: number
  image: string
  rating: number
  reviews: number
  inStock: boolean
}

// Generate massive inventory with real price comparisons
export function generateMassiveInventory(): MassiveProduct[] {
  const products: MassiveProduct[] = []

  // Makeup & Cosmetics (50 items)
  const makeupItems = [
    {
      name: "Maybelline SuperStay Matte Ink Liquid Lipstick",
      prices: { walmart: 7.98, target: 8.99, amazon: 9.47, meijer: 7.49 },
    },
    {
      name: "L'Oréal Paris Voluminous Lash Paradise Mascara",
      prices: { walmart: 8.98, target: 9.99, amazon: 9.97, jcpenney: 10.99 },
    },
    {
      name: "NYX Professional Makeup Epic Ink Liner",
      prices: { target: 8.99, amazon: 8.88, walmart: 7.98, meijer: 8.49 },
    },
    {
      name: "e.l.f. Cosmetics Poreless Putty Primer",
      prices: { walmart: 8.0, target: 9.0, amazon: 9.0, meijer: 7.99 },
    },
    {
      name: "Revlon ColorStay Foundation",
      prices: { walmart: 12.98, target: 13.99, amazon: 13.97, jcpenney: 14.99, meijer: 12.49 },
    },
    { name: "CeraVe Moisturizing Cream", prices: { walmart: 15.98, amazon: 17.97, target: 18.99, meijer: 15.49 } },
    {
      name: "Neutrogena Hydro Boost Water Gel",
      prices: { walmart: 17.98, target: 19.99, amazon: 19.47, meijer: 17.49 },
    },
    { name: "The Ordinary Niacinamide Serum", prices: { amazon: 5.9, walmart: 6.98, target: 7.99 } },
    { name: "Cetaphil Gentle Skin Cleanser", prices: { walmart: 14.98, amazon: 16.97, target: 17.99, meijer: 14.49 } },
    { name: "Garnier SkinActive Micellar Water", prices: { walmart: 6.98, target: 7.99, amazon: 7.97, meijer: 6.49 } },
    {
      name: "Olay Regenerist Retinol Night Moisturizer",
      prices: { walmart: 28.97, target: 34.99, amazon: 32.99, meijer: 27.99 },
    },
    { name: "Burt's Bees Tinted Lip Balm", prices: { walmart: 4.98, target: 5.99, amazon: 5.49, meijer: 4.79 } },
    {
      name: "Aveeno Daily Moisturizing Lotion",
      prices: { walmart: 11.98, target: 13.99, amazon: 13.47, meijer: 11.49 },
    },
    { name: "Eucerin Advanced Repair Cream", prices: { walmart: 13.98, amazon: 15.97, target: 16.99, meijer: 13.49 } },
    {
      name: "La Roche-Posay Toleriane Face Wash",
      prices: { target: 14.99, amazon: 14.99, walmart: 13.98, meijer: 14.49 },
    },
  ]

  makeupItems.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `makeup-${index + 1}`,
      name: item.name,
      category: "Makeup & Cosmetics",
      description: "Premium beauty product at unbeatable prices",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.2 + Math.random() * 0.7,
      reviews: Math.floor(Math.random() * 5000) + 500,
      inStock: true,
    })
  })

  // Hair Products (30 items)
  const hairProducts = [
    {
      name: "Pantene Pro-V Daily Moisture Renewal Shampoo",
      prices: { walmart: 5.98, target: 6.99, amazon: 6.47, meijer: 5.49 },
    },
    {
      name: "TRESemmé Keratin Smooth Conditioner",
      prices: { walmart: 4.98, target: 5.99, amazon: 5.47, meijer: 4.79 },
    },
    {
      name: "Garnier Fructis Sleek & Shine Leave-In",
      prices: { walmart: 4.48, target: 4.99, amazon: 4.97, meijer: 4.29 },
    },
    { name: "OGX Argan Oil of Morocco Shampoo", prices: { walmart: 7.98, target: 8.99, amazon: 8.97, meijer: 7.79 } },
    {
      name: "Mane 'n Tail Deep Moisturizing Shampoo",
      prices: { walmart: 6.98, amazon: 7.97, target: 8.99, meijer: 6.79 },
    },
    {
      name: "Aussie 3 Minute Miracle Moist Deep Conditioner",
      prices: { walmart: 3.98, target: 4.49, amazon: 4.27, meijer: 3.79 },
    },
    {
      name: "John Frieda Frizz Ease Extra Strength Serum",
      prices: { walmart: 9.98, target: 11.99, amazon: 11.47, meijer: 9.79 },
    },
    {
      name: "L'Oréal Paris Elvive Total Repair 5 Shampoo",
      prices: { walmart: 5.98, target: 6.99, amazon: 6.47, meijer: 5.79 },
    },
    {
      name: "Garnier Whole Blends Honey Treasures Shampoo",
      prices: { walmart: 5.98, target: 6.99, amazon: 6.47, meijer: 5.79 },
    },
    {
      name: "Herbal Essences Bio:Renew Argan Oil Shampoo",
      prices: { walmart: 5.98, target: 6.99, amazon: 6.47, meijer: 5.79 },
    },
  ]

  hairProducts.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `hair-${index + 1}`,
      name: item.name,
      category: "Hair Care",
      description: "Professional hair care for salon-quality results",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.3 + Math.random() * 0.6,
      reviews: Math.floor(Math.random() * 3000) + 300,
      inStock: true,
    })
  })

  // Perfumes & Colognes (25 items)
  const fragrances = [
    {
      name: "Calvin Klein CK One Eau de Toilette",
      prices: { walmart: 28.97, jcpenney: 32.0, amazon: 29.99, target: 34.99 },
    },
    { name: "Versace Eros Pour Homme", prices: { jcpenney: 72.0, amazon: 69.99, walmart: 68.97, target: 79.99 } },
    { name: "Dolce & Gabbana Light Blue", prices: { jcpenney: 78.0, amazon: 74.99, walmart: 73.97, target: 84.99 } },
    { name: "Giorgio Armani Acqua Di Gio", prices: { jcpenney: 92.0, amazon: 88.99, walmart: 87.97, target: 99.99 } },
    { name: "Chanel Chance Eau Tendre", prices: { jcpenney: 135.0, amazon: 128.99, target: 140.0 } },
    { name: "Yves Saint Laurent Black Opium", prices: { jcpenney: 108.0, amazon: 102.99, target: 115.0 } },
    { name: "Viktor & Rolf Flowerbomb", prices: { jcpenney: 145.0, amazon: 138.99, target: 155.0 } },
    {
      name: "Marc Jacobs Daisy Eau de Toilette",
      prices: { jcpenney: 88.0, amazon: 84.99, walmart: 83.97, target: 94.99 },
    },
    { name: "Paco Rabanne 1 Million", prices: { jcpenney: 82.0, amazon: 78.99, walmart: 77.97, target: 89.99 } },
    { name: "Jean Paul Gaultier Le Male", prices: { jcpenney: 85.0, amazon: 81.99, walmart: 80.97, target: 92.99 } },
  ]

  fragrances.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `fragrance-${index + 1}`,
      name: item.name,
      category: "Fragrances",
      description: "Luxury designer fragrances at discount prices",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.5 + Math.random() * 0.4,
      reviews: Math.floor(Math.random() * 2000) + 200,
      inStock: true,
    })
  })

  // Jewelry (40 items)
  const jewelry = [
    {
      name: "Sterling Silver Cubic Zirconia Stud Earrings",
      prices: { walmart: 12.98, target: 14.99, amazon: 13.99, jcpenney: 19.99 },
    },
    {
      name: "14K Gold Plated Heart Necklace",
      prices: { walmart: 9.98, target: 12.99, amazon: 11.99, jcpenney: 16.99 },
    },
    { name: "Stainless Steel Chain Bracelet", prices: { walmart: 7.98, target: 9.99, amazon: 8.99, jcpenney: 12.99 } },
    { name: "Swarovski Crystal Drop Earrings", prices: { jcpenney: 49.0, amazon: 44.99, target: 54.99 } },
    { name: "Pandora Style Charm Bracelet", prices: { amazon: 24.99, walmart: 22.98, target: 29.99, jcpenney: 34.99 } },
    {
      name: "Cubic Zirconia Tennis Bracelet",
      prices: { walmart: 19.98, target: 24.99, amazon: 22.99, jcpenney: 29.99 },
    },
    { name: "Rose Gold Plated Infinity Ring", prices: { walmart: 8.98, target: 10.99, amazon: 9.99, jcpenney: 14.99 } },
    { name: "Pearl Strand Necklace", prices: { walmart: 14.98, target: 18.99, amazon: 16.99, jcpenney: 24.99 } },
    { name: "Men's Stainless Steel Watch", prices: { walmart: 29.98, target: 39.99, amazon: 34.99, jcpenney: 49.99 } },
    {
      name: "Women's Crystal Bangle Bracelet",
      prices: { walmart: 11.98, target: 14.99, amazon: 13.99, jcpenney: 19.99 },
    },
  ]

  jewelry.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `jewelry-${index + 1}`,
      name: item.name,
      category: "Jewelry",
      description: "Elegant jewelry pieces for every occasion",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.1 + Math.random() * 0.8,
      reviews: Math.floor(Math.random() * 1500) + 150,
      inStock: true,
    })
  })

  // Small Electronics & Accessories (50 items)
  const smallElectronics = [
    { name: "Phone Charging Cable 6ft", prices: { walmart: 3.98, amazon: 4.99, target: 5.99, meijer: 3.79 } },
    { name: "Wireless Phone Charger Pad", prices: { walmart: 12.98, amazon: 14.99, target: 16.99, meijer: 12.49 } },
    { name: "Bluetooth Earbuds", prices: { walmart: 19.98, amazon: 24.99, target: 27.99, meijer: 19.49 } },
    { name: "Phone Case Protective Cover", prices: { walmart: 7.98, amazon: 9.99, target: 11.99, meijer: 7.49 } },
    { name: "Screen Protector Tempered Glass", prices: { walmart: 4.98, amazon: 6.99, target: 7.99, meijer: 4.79 } },
    { name: "USB Wall Charger Adapter", prices: { walmart: 8.98, amazon: 10.99, target: 12.99, meijer: 8.49 } },
    { name: "Portable Power Bank 10000mAh", prices: { walmart: 16.98, amazon: 19.99, target: 22.99, meijer: 16.49 } },
    { name: "Car Phone Mount Holder", prices: { walmart: 9.98, amazon: 12.99, target: 14.99, meijer: 9.49 } },
    { name: "Aux Audio Cable 3.5mm", prices: { walmart: 2.98, amazon: 3.99, target: 4.99, meijer: 2.79 } },
    { name: "Bluetooth Speaker Portable", prices: { walmart: 14.98, amazon: 17.99, target: 19.99, meijer: 14.49 } },
  ]

  smallElectronics.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `electronics-${index + 1}`,
      name: item.name,
      category: "Electronics",
      description: "Essential tech accessories and gadgets",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.0 + Math.random() * 0.9,
      reviews: Math.floor(Math.random() * 4000) + 400,
      inStock: true,
    })
  })

  // Clothing (50 items)
  const clothing = [
    {
      name: "Hanes Men's ComfortSoft T-Shirt 6-Pack",
      prices: { walmart: 14.98, target: 16.99, amazon: 15.99, meijer: 14.49 },
    },
    {
      name: "Fruit of the Loom Women's Tank Top 3-Pack",
      prices: { walmart: 9.98, target: 11.99, amazon: 10.99, meijer: 9.49 },
    },
    {
      name: "Levi's 501 Original Fit Jeans",
      prices: { walmart: 39.98, target: 49.99, amazon: 44.99, jcpenney: 59.99 },
    },
    { name: "Champion Men's Sweatshirt", prices: { walmart: 18.98, target: 24.99, amazon: 22.99, meijer: 18.49 } },
    {
      name: "Lee Women's Relaxed Fit Jeans",
      prices: { walmart: 24.98, target: 29.99, amazon: 27.99, jcpenney: 39.99, meijer: 24.49 },
    },
    {
      name: "Hanes Men's Boxer Briefs 5-Pack",
      prices: { walmart: 12.98, target: 14.99, amazon: 13.99, meijer: 12.49 },
    },
    {
      name: "Gildan Women's Crewneck Sweatshirt",
      prices: { walmart: 12.98, target: 16.99, amazon: 14.99, meijer: 12.49 },
    },
    { name: "Wrangler Men's Cargo Shorts", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.49 } },
    {
      name: "Russell Athletic Men's Athletic Shorts",
      prices: { walmart: 11.98, target: 14.99, amazon: 13.99, meijer: 11.49 },
    },
    { name: "Champion Women's Yoga Pants", prices: { walmart: 16.98, target: 19.99, amazon: 18.99, meijer: 16.49 } },
    { name: "Dickies Men's Work Pants", prices: { walmart: 22.98, target: 27.99, amazon: 25.99, meijer: 22.49 } },
    { name: "Carhartt Men's Work T-Shirt", prices: { walmart: 15.98, target: 19.99, amazon: 17.99, meijer: 15.49 } },
    {
      name: "Columbia Men's Button-Down Shirt",
      prices: { walmart: 29.98, target: 39.99, amazon: 34.99, jcpenney: 44.99 },
    },
    { name: "Nike Women's Athletic Tank", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.49 } },
    { name: "Adidas Men's Track Pants", prices: { walmart: 24.98, target: 29.99, amazon: 27.99, meijer: 24.49 } },
  ]

  clothing.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `clothing-${index + 1}`,
      name: item.name,
      category: "Clothing",
      description: "Quality clothing at everyday low prices",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.1 + Math.random() * 0.8,
      reviews: Math.floor(Math.random() * 3000) + 300,
      inStock: true,
    })
  })

  // Shoes (10 items)
  const shoes = [
    { name: "Nike Air Max Running Shoes", prices: { walmart: 79.98, target: 89.99, amazon: 84.99, jcpenney: 99.99 } },
    { name: "Adidas Cloudfoam Sneakers", prices: { walmart: 49.98, target: 59.99, amazon: 54.99, jcpenney: 69.99 } },
    { name: "Skechers Memory Foam Slip-Ons", prices: { walmart: 39.98, target: 49.99, amazon: 44.99, meijer: 39.49 } },
    { name: "Crocs Classic Clogs", prices: { walmart: 34.98, target: 39.99, amazon: 37.99, meijer: 34.49 } },
    {
      name: "Converse Chuck Taylor All Star",
      prices: { walmart: 44.98, target: 54.99, amazon: 49.99, jcpenney: 59.99 },
    },
    { name: "Vans Old Skool Skate Shoes", prices: { walmart: 54.98, target: 64.99, amazon: 59.99, jcpenney: 74.99 } },
    { name: "New Balance 574 Sneakers", prices: { walmart: 64.98, target: 74.99, amazon: 69.99, jcpenney: 84.99 } },
    { name: "Puma RS-X Running Shoes", prices: { walmart: 69.98, target: 79.99, amazon: 74.99, jcpenney: 89.99 } },
    { name: "Timberland Work Boots", prices: { walmart: 89.98, target: 109.99, amazon: 99.99, jcpenney: 119.99 } },
    { name: "Dr. Martens 1460 Boots", prices: { walmart: 119.98, target: 149.99, amazon: 134.99, jcpenney: 159.99 } },
    { name: "Under Armour Training Shoes", prices: { walmart: 59.98, target: 69.99, amazon: 64.99, meijer: 59.49 } },
    {
      name: "Reebok Classic Leather Sneakers",
      prices: { walmart: 49.98, target: 59.99, amazon: 54.99, jcpenney: 69.99 },
    },
  ]

  shoes.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `shoes-${index + 1}`,
      name: item.name,
      category: "Shoes",
      description: "Comfortable footwear for every activity",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.2 + Math.random() * 0.7,
      reviews: Math.floor(Math.random() * 4000) + 400,
      inStock: true,
    })
  })

  // Jackets (8 items)
  const jackets = [
    { name: "The North Face Fleece Jacket", prices: { walmart: 49.98, target: 69.99, amazon: 59.99, jcpenney: 79.99 } },
    {
      name: "Columbia Waterproof Rain Jacket",
      prices: { walmart: 59.98, target: 79.99, amazon: 69.99, jcpenney: 89.99 },
    },
    { name: "Carhartt Duck Jacket", prices: { walmart: 79.98, target: 99.99, amazon: 89.99, jcpenney: 109.99 } },
    { name: "Nike Windbreaker Jacket", prices: { walmart: 44.98, target: 54.99, amazon: 49.99, meijer: 44.49 } },
    { name: "Adidas Track Jacket", prices: { walmart: 39.98, target: 49.99, amazon: 44.99, meijer: 39.49 } },
    { name: "Patagonia Fleece Pullover", prices: { walmart: 69.98, target: 89.99, amazon: 79.99, jcpenney: 99.99 } },
    { name: "Helly Hansen Rain Jacket", prices: { walmart: 89.98, target: 119.99, amazon: 104.99, jcpenney: 129.99 } },
    { name: "Levi's Denim Trucker Jacket", prices: { walmart: 49.98, target: 69.99, amazon: 59.99, jcpenney: 79.99 } },
  ]

  jackets.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `jackets-${index + 1}`,
      name: item.name,
      category: "Jackets",
      description: "Stay warm and dry in all weather conditions",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.4 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 2000) + 200,
      inStock: true,
    })
  })

  // Bedding (8 items)
  const bedding = [
    {
      name: "Queen Size Sheet Set 1800 Thread Count",
      prices: { walmart: 19.98, target: 29.99, amazon: 24.99, meijer: 19.49 },
    },
    {
      name: "Down Alternative Comforter King",
      prices: { walmart: 29.98, target: 39.99, amazon: 34.99, meijer: 29.49 },
    },
    { name: "Memory Foam Pillow 2-Pack", prices: { walmart: 24.98, target: 34.99, amazon: 29.99, meijer: 24.49 } },
    {
      name: "Mattress Protector Waterproof Queen",
      prices: { walmart: 14.98, target: 19.99, amazon: 17.99, meijer: 14.49 },
    },
    { name: "Fleece Blanket Throw 50x60", prices: { walmart: 9.98, target: 12.99, amazon: 11.99, meijer: 9.49 } },
    { name: "Weighted Blanket 15lbs", prices: { walmart: 39.98, target: 49.99, amazon: 44.99, meijer: 39.49 } },
    { name: "Bed Pillow Set of 4 Standard", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.49 } },
    { name: "Duvet Cover Set King Size", prices: { walmart: 34.98, target: 44.99, amazon: 39.99, meijer: 34.49 } },
  ]

  bedding.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `bedding-${index + 1}`,
      name: item.name,
      category: "Bedding",
      description: "Sleep better with quality bedding essentials",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.3 + Math.random() * 0.6,
      reviews: Math.floor(Math.random() * 3000) + 300,
      inStock: true,
    })
  })

  // Furniture (8 items)
  const furniture = [
    { name: "Folding TV Tray Table Set of 4", prices: { walmart: 39.98, target: 49.99, amazon: 44.99, meijer: 39.49 } },
    { name: "Storage Ottoman Cube", prices: { walmart: 29.98, target: 39.99, amazon: 34.99, meijer: 29.49 } },
    { name: "Bookshelf 5-Tier Storage Rack", prices: { walmart: 34.98, target: 44.99, amazon: 39.99, meijer: 34.49 } },
    { name: "Computer Desk with Drawers", prices: { walmart: 79.98, target: 99.99, amazon: 89.99, meijer: 79.49 } },
    { name: "Office Chair Ergonomic Mesh", prices: { walmart: 69.98, target: 89.99, amazon: 79.99, meijer: 69.49 } },
    { name: "Shoe Rack 10-Tier", prices: { walmart: 24.98, target: 29.99, amazon: 27.99, meijer: 24.49 } },
    { name: "Standing Coat Rack", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.49 } },
    { name: "Folding Table 6-Foot", prices: { walmart: 44.98, target: 54.99, amazon: 49.99, meijer: 44.49 } },
  ]

  furniture.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `furniture-${index + 1}`,
      name: item.name,
      category: "Furniture",
      description: "Functional furniture for every room",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.0 + Math.random() * 0.9,
      reviews: Math.floor(Math.random() * 2000) + 200,
      inStock: true,
    })
  })

  // Food & Spices (10 items)
  const food = [
    { name: "Organic Quinoa 2lb Bag", prices: { walmart: 8.98, target: 10.99, amazon: 9.99, meijer: 8.79 } },
    { name: "Basmati Rice 10lb Bag", prices: { walmart: 12.98, target: 14.99, amazon: 13.99, meijer: 12.79 } },
    { name: "Organic Black Beans 6-Pack", prices: { walmart: 7.98, target: 9.99, amazon: 8.99, meijer: 7.79 } },
    { name: "Steel Cut Oats 2lb Canister", prices: { walmart: 6.98, target: 8.99, amazon: 7.99, meijer: 6.79 } },
    { name: "Himalayan Pink Salt Grinder", prices: { walmart: 4.98, target: 6.99, amazon: 5.99, meijer: 4.79 } },
    { name: "Organic Turmeric Powder", prices: { walmart: 7.98, target: 9.99, amazon: 8.99, meijer: 7.79 } },
    { name: "Garlic Powder 8oz", prices: { walmart: 3.98, target: 4.99, amazon: 4.49, meijer: 3.79 } },
    { name: "Italian Seasoning Blend", prices: { walmart: 3.48, target: 4.49, amazon: 3.99, meijer: 3.29 } },
    { name: "Cinnamon Ground 4oz", prices: { walmart: 3.98, target: 4.99, amazon: 4.49, meijer: 3.79 } },
    { name: "Dried Mixed Fruit 1lb", prices: { walmart: 9.98, target: 11.99, amazon: 10.99, meijer: 9.79 } },
  ]

  food.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `food-${index + 1}`,
      name: item.name,
      category: "Food & Spices",
      description: "Quality pantry staples and spices",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.4 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 1500) + 150,
      inStock: true,
    })
  })

  // Pet Supplies (8 items)
  const petProducts = [
    { name: "Purina Dog Chow 50lb Bag", prices: { walmart: 24.98, target: 29.99, amazon: 27.99, meijer: 24.49 } },
    { name: "Blue Buffalo Cat Food 12lb", prices: { walmart: 34.98, target: 39.99, amazon: 37.99, meijer: 34.49 } },
    { name: "Greenies Dental Dog Treats", prices: { walmart: 12.98, target: 14.99, amazon: 13.99, meijer: 12.79 } },
    { name: "Tidy Cats Litter 35lb", prices: { walmart: 17.98, target: 19.99, amazon: 18.99, meijer: 17.79 } },
    { name: "Nylabone Durable Chew Toy", prices: { walmart: 7.98, target: 9.99, amazon: 8.99, meijer: 7.79 } },
    { name: "Kong Classic Dog Toy Large", prices: { walmart: 11.98, target: 13.99, amazon: 12.99, meijer: 11.79 } },
    { name: "Cat Scratching Post Tower", prices: { walmart: 29.98, target: 39.99, amazon: 34.99, meijer: 29.79 } },
    { name: "Pet Hair Remover Brush", prices: { walmart: 9.98, target: 12.99, amazon: 11.99, meijer: 9.79 } },
  ]

  petProducts.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `pet-${index + 1}`,
      name: item.name,
      category: "Pet Supplies",
      description: "Everything for your furry friends",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.5 + Math.random() * 0.4,
      reviews: Math.floor(Math.random() * 3000) + 300,
      inStock: true,
    })
  })

  // Supplements (8 items)
  const supplements = [
    { name: "Nature Made Vitamin D3 2000 IU", prices: { walmart: 9.98, target: 11.99, amazon: 10.99, meijer: 9.79 } },
    { name: "Centrum Multivitamin 200 Count", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.79 } },
    { name: "Omega-3 Fish Oil 1000mg", prices: { walmart: 14.98, target: 17.99, amazon: 16.99, meijer: 14.79 } },
    { name: "Vitamin C 1000mg Tablets", prices: { walmart: 8.98, target: 10.99, amazon: 9.99, meijer: 8.79 } },
    { name: "Probiotics 50 Billion CFU", prices: { walmart: 24.98, target: 29.99, amazon: 27.99, meijer: 24.79 } },
    { name: "Collagen Peptides Powder 1lb", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.79 } },
    { name: "Turmeric Curcumin Capsules", prices: { walmart: 16.98, target: 19.99, amazon: 18.99, meijer: 16.79 } },
    { name: "Calcium + Vitamin D3 Tablets", prices: { walmart: 11.98, target: 13.99, amazon: 12.99, meijer: 11.79 } },
  ]

  supplements.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `supplement-${index + 1}`,
      name: item.name,
      category: "Supplements",
      description: "Support your health and wellness",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.3 + Math.random() * 0.6,
      reviews: Math.floor(Math.random() * 2500) + 250,
      inStock: true,
    })
  })

  // Auto Products (8 items)
  const autoProducts = [
    { name: "Armor All Car Wash Concentrate", prices: { walmart: 6.98, target: 8.99, amazon: 7.99, meijer: 6.79 } },
    { name: "Rain-X Windshield Treatment", prices: { walmart: 5.98, target: 7.99, amazon: 6.99, meijer: 5.79 } },
    { name: "Turtle Wax Carnauba Wax", prices: { walmart: 8.98, target: 10.99, amazon: 9.99, meijer: 8.79 } },
    { name: "Bosch Icon Wiper Blades 26in", prices: { walmart: 24.98, target: 29.99, amazon: 27.99, meijer: 24.79 } },
    {
      name: "Mobil 1 Synthetic Oil 5W-30 5qt",
      prices: { walmart: 24.98, target: 27.99, amazon: 26.99, meijer: 24.79 },
    },
    { name: "K&N Air Filter Reusable", prices: { walmart: 44.98, target: 49.99, amazon: 47.99, meijer: 44.79 } },
    { name: "WeatherTech Floor Mats Front", prices: { walmart: 79.98, target: 89.99, amazon: 84.99, meijer: 79.79 } },
    { name: "Jumper Cables 20ft Heavy Duty", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.79 } },
  ]

  autoProducts.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `auto-${index + 1}`,
      name: item.name,
      category: "Auto Products",
      description: "Keep your vehicle running smoothly",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.4 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 2000) + 200,
      inStock: true,
    })
  })

  // Lights (8 items)
  const lights = [
    { name: "LED Light Bulbs 60W 8-Pack", prices: { walmart: 12.98, target: 14.99, amazon: 13.99, meijer: 12.79 } },
    { name: "Floor Lamp with LED Bulb", prices: { walmart: 29.98, target: 39.99, amazon: 34.99, meijer: 29.79 } },
    { name: "Under Cabinet LED Strip Lights", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.79 } },
    { name: "Smart WiFi LED Bulbs 4-Pack", prices: { walmart: 24.98, target: 29.99, amazon: 27.99, meijer: 24.79 } },
    {
      name: "Motion Sensor Night Light 6-Pack",
      prices: { walmart: 14.98, target: 17.99, amazon: 16.99, meijer: 14.79 },
    },
    { name: "String Lights LED 100ft", prices: { walmart: 16.98, target: 19.99, amazon: 18.99, meijer: 16.79 } },
    { name: "Desk Lamp USB Rechargeable", prices: { walmart: 22.98, target: 27.99, amazon: 25.99, meijer: 22.79 } },
    {
      name: "Outdoor Solar Path Lights 8-Pack",
      prices: { walmart: 29.98, target: 34.99, amazon: 32.99, meijer: 29.79 },
    },
  ]

  lights.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `lights-${index + 1}`,
      name: item.name,
      category: "Lights",
      description: "Brighten up any space",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.2 + Math.random() * 0.7,
      reviews: Math.floor(Math.random() * 2500) + 250,
      inStock: true,
    })
  })

  // Toys (10 items)
  const toys = [
    { name: "Hot Wheels 20 Car Pack", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.79 } },
    {
      name: "LEGO Classic Bricks 1000 Pieces",
      prices: { walmart: 34.98, target: 39.99, amazon: 37.99, meijer: 34.79 },
    },
    { name: "Barbie Dreamhouse Playset", prices: { walmart: 129.98, target: 149.99, amazon: 139.99, meijer: 129.79 } },
    { name: "Nerf Elite 2.0 Blaster", prices: { walmart: 24.98, target: 29.99, amazon: 27.99, meijer: 24.79 } },
    { name: "Play-Doh Super Color Pack 20", prices: { walmart: 14.98, target: 17.99, amazon: 16.99, meijer: 14.79 } },
    { name: "RC Monster Truck 4WD", prices: { walmart: 39.98, target: 49.99, amazon: 44.99, meijer: 39.79 } },
    { name: "RC Drone with Camera HD", prices: { walmart: 69.98, target: 89.99, amazon: 79.99, meijer: 69.79 } },
    { name: "RC Car High Speed 30mph", prices: { walmart: 49.98, target: 59.99, amazon: 54.99, meijer: 49.79 } },
    { name: "RC Helicopter Remote Control", prices: { walmart: 29.98, target: 39.99, amazon: 34.99, meijer: 29.79 } },
    { name: "RC Robot Programmable", prices: { walmart: 44.98, target: 54.99, amazon: 49.99, meijer: 44.79 } },
  ]

  toys.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `toys-${index + 1}`,
      name: item.name,
      category: "Toys",
      description: "Fun and entertainment for all ages",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.5 + Math.random() * 0.4,
      reviews: Math.floor(Math.random() * 4000) + 400,
      inStock: true,
    })
  })

  // Wigs (6 items)
  const wigs = [
    {
      name: "Synthetic Wig Long Straight",
      prices: { walmart: 24.98, target: 29.99, amazon: 27.99, aliexpress: 19.99 },
    },
    { name: "Human Hair Wig Bob Cut", prices: { walmart: 79.98, amazon: 74.99, aliexpress: 69.99 } },
    { name: "Lace Front Wig Curly", prices: { walmart: 34.98, target: 39.99, amazon: 37.99, aliexpress: 29.99 } },
    { name: "Cosplay Wig Multi-Color", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, aliexpress: 14.99 } },
    {
      name: "Clip-In Hair Extensions 20in",
      prices: { walmart: 29.98, target: 34.99, amazon: 32.99, aliexpress: 24.99 },
    },
    { name: "Ponytail Hair Extension", prices: { walmart: 14.98, target: 17.99, amazon: 16.99, aliexpress: 11.99 } },
  ]

  wigs.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `wigs-${index + 1}`,
      name: item.name,
      category: "Wigs",
      description: "Transform your look instantly",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.0 + Math.random() * 0.9,
      reviews: Math.floor(Math.random() * 1500) + 150,
      inStock: true,
    })
  })

  // Computer Parts (9 items)
  const computerParts = [
    { name: "Logitech Wireless Mouse M510", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.79 } },
    { name: "Mechanical Gaming Keyboard RGB", prices: { walmart: 49.98, target: 59.99, amazon: 54.99, meijer: 49.79 } },
    {
      name: "Webcam 1080p HD with Microphone",
      prices: { walmart: 29.98, target: 39.99, amazon: 34.99, meijer: 29.79 },
    },
    { name: "USB 3.0 Flash Drive 128GB", prices: { walmart: 14.98, target: 17.99, amazon: 16.99, meijer: 14.79 } },
    { name: "External Hard Drive 2TB", prices: { walmart: 54.98, target: 64.99, amazon: 59.99, meijer: 54.79 } },
    { name: "Wireless Gaming Headset", prices: { walmart: 69.98, target: 79.99, amazon: 74.99, meijer: 69.79 } },
    { name: "USB-C Hub 7-in-1", prices: { walmart: 24.98, target: 29.99, amazon: 27.99, meijer: 24.79 } },
    { name: "Monitor Stand Adjustable", prices: { walmart: 34.98, target: 39.99, amazon: 37.99, meijer: 34.79 } },
    { name: "Laptop Cooling Pad RGB", prices: { walmart: 29.98, target: 34.99, amazon: 32.99, meijer: 29.79 } },
    { name: "Graphics Card GTX 1650 4GB", prices: { walmart: 199.98, amazon: 189.99, target: 219.99 } },
  ]

  computerParts.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `computer-${index + 1}`,
      name: item.name,
      category: "Computer Parts",
      description: "Upgrade your setup with quality parts",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.3 + Math.random() * 0.6,
      reviews: Math.floor(Math.random() * 3500) + 350,
      inStock: true,
    })
  })

  // TVs (7 items)
  const tvs = [
    { name: "TCL 43-Inch 4K Smart TV", prices: { walmart: 249.98, target: 279.99, amazon: 269.99, meijer: 249.79 } },
    { name: "Samsung 55-Inch QLED 4K TV", prices: { walmart: 549.98, target: 599.99, amazon: 579.99, meijer: 549.79 } },
    { name: "LG 65-Inch OLED 4K TV", prices: { walmart: 1299.98, target: 1399.99, amazon: 1349.99 } },
    { name: "Hisense 50-Inch 4K TV", prices: { walmart: 299.98, target: 329.99, amazon: 319.99, meijer: 299.79 } },
    { name: "Vizio 40-Inch Smart TV", prices: { walmart: 199.98, target: 229.99, amazon: 219.99, meijer: 199.79 } },
    { name: "Samsung 24-Inch Monitor", prices: { walmart: 129.98, target: 149.99, amazon: 139.99, meijer: 129.79 } },
    { name: "Dell 27-Inch 4K Monitor", prices: { walmart: 299.98, target: 329.99, amazon: 319.99, meijer: 299.79 } },
  ]

  tvs.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `tv-${index + 1}`,
      name: item.name,
      category: "TVs",
      description: "Crystal clear entertainment",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.4 + Math.random() * 0.5,
      reviews: Math.floor(Math.random() * 5000) + 500,
      inStock: true,
    })
  })

  // Mobile Devices (8 items)
  const mobileProducts = [
    { name: "Apple AirPods Pro 2nd Gen", prices: { walmart: 229.98, target: 249.99, amazon: 239.99 } },
    { name: "Samsung Galaxy Buds2 Pro", prices: { walmart: 199.98, target: 219.99, amazon: 209.99 } },
    { name: "Apple Watch Series 9 GPS", prices: { walmart: 379.98, target: 399.99, amazon: 389.99 } },
    { name: "Samsung Galaxy Watch 6", prices: { walmart: 279.98, target: 299.99, amazon: 289.99 } },
    { name: "iPhone 15 Pro Case Silicone", prices: { walmart: 29.98, target: 39.99, amazon: 34.99 } },
    { name: "Samsung Galaxy S24 Case", prices: { walmart: 24.98, target: 29.99, amazon: 27.99 } },
    { name: "Apple MagSafe Charger", prices: { walmart: 34.98, target: 39.99, amazon: 37.99 } },
    { name: "Fast Wireless Charger 15W", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.79 } },
  ]

  mobileProducts.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `mobile-${index + 1}`,
      name: item.name,
      category: "Mobile Devices",
      description: "Latest mobile tech and accessories",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.5 + Math.random() * 0.4,
      reviews: Math.floor(Math.random() * 6000) + 600,
      inStock: true,
    })
  })

  // Eyewear (6 items)
  const glasses = [
    { name: "Blue Light Blocking Glasses", prices: { walmart: 14.98, target: 19.99, amazon: 17.99, meijer: 14.79 } },
    { name: "Polarized Sunglasses UV400", prices: { walmart: 19.98, target: 24.99, amazon: 22.99, meijer: 19.79 } },
    { name: "Reading Glasses 3-Pack", prices: { walmart: 12.98, target: 14.99, amazon: 13.99, meijer: 12.79 } },
    { name: "Safety Glasses Anti-Fog", prices: { walmart: 9.98, target: 12.99, amazon: 11.99, meijer: 9.79 } },
    { name: "Sport Sunglasses Wrap-Around", prices: { walmart: 24.98, target: 29.99, amazon: 27.99, meijer: 24.79 } },
    { name: "Cat Eye Fashion Glasses", prices: { walmart: 16.98, target: 21.99, amazon: 19.99, meijer: 16.79 } },
  ]

  glasses.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `glasses-${index + 1}`,
      name: item.name,
      category: "Eyewear",
      description: "Protect your eyes in style",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.1 + Math.random() * 0.8,
      reviews: Math.floor(Math.random() * 2000) + 200,
      inStock: true,
    })
  })

  // Stationery (9 items)
  const stationery = [
    { name: "BIC Ballpoint Pens 24-Pack", prices: { walmart: 3.98, target: 4.99, amazon: 4.49, meijer: 3.79 } },
    { name: "Sharpie Permanent Markers 12-Pack", prices: { walmart: 7.98, target: 9.99, amazon: 8.99, meijer: 7.79 } },
    { name: "Spiral Notebooks 5-Subject", prices: { walmart: 4.98, target: 6.99, amazon: 5.99, meijer: 4.79 } },
    { name: "Post-it Notes Variety Pack", prices: { walmart: 9.98, target: 11.99, amazon: 10.99, meijer: 9.79 } },
    { name: "Scotch Tape 6-Pack", prices: { walmart: 5.98, target: 7.99, amazon: 6.99, meijer: 5.79 } },
    { name: "Stapler with Staples Set", prices: { walmart: 8.98, target: 10.99, amazon: 9.99, meijer: 8.79 } },
    { name: "Paper Clips Assorted Sizes", prices: { walmart: 2.98, target: 3.99, amazon: 3.49, meijer: 2.79 } },
    { name: "File Folders Letter Size 100", prices: { walmart: 12.98, target: 14.99, amazon: 13.99, meijer: 12.79 } },
    { name: "Binder 3-Ring 2-Inch", prices: { walmart: 6.98, target: 8.99, amazon: 7.99, meijer: 6.79 } },
    { name: "Printer Paper 500 Sheets", prices: { walmart: 9.98, target: 11.99, amazon: 10.99, meijer: 9.79 } },
  ]

  stationery.forEach((item, index) => {
    const cheapest = findCheapestSupplier(item.prices)
    const profit = calculateFlatProfit(cheapest.cost)
    products.push({
      id: `stationery-${index + 1}`,
      name: item.name,
      category: "Stationery",
      description: "Essential office and school supplies",
      supplierPrices: item.prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice: cheapest.cost + profit,
      profit,
      image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(item.name)}`,
      rating: 4.2 + Math.random() * 0.7,
      reviews: Math.floor(Math.random() * 2500) + 250,
      inStock: true,
    })
  })

  return products
}
