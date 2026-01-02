import { Home, ShoppingBag, Laptop, Gift, Shirt, Sofa, Wrench, Dog, Pill, Sparkles } from "lucide-react"

// Supplier price structure
export interface SupplierPrices {
  Amazon?: number
  Walmart?: number
  Target?: number
  eBay?: number
  AliExpress?: number
  BestBuy?: number
  Costco?: number
  Lowes?: number
  HomeDepot?: number
  Macys?: number
  Nordstrom?: number
  Sephora?: number
  Ulta?: number
  Wayfair?: number
  Chewy?: number
  AutoZone?: number
  OReilly?: number
  JCPenney?: number
  Kohls?: number
  Newegg?: number
  BHPhoto?: number
}

export interface MegaProduct {
  id: string
  name: string
  brand: string
  category: string
  subcategory: string
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
  isHotDeal: boolean
  isFlashSale: boolean
  isClearance: boolean
  discount: number
  originalPrice: number
  sku: string
}

// Calculate flat profit based on item cost (10 cents to 75 cents)
const calculateFlatProfit = (cost: number): number => {
  if (cost < 10) return 0.1
  if (cost < 25) return 0.15
  if (cost < 50) return 0.25
  if (cost < 100) return 0.35
  if (cost < 250) return 0.5
  return 0.75
}

// Find cheapest supplier
const findCheapestSupplier = (prices: SupplierPrices): { supplier: string; cost: number } => {
  let cheapest = { supplier: "Amazon", cost: Number.POSITIVE_INFINITY }
  for (const [supplier, cost] of Object.entries(prices)) {
    if (cost && cost < cheapest.cost) {
      cheapest = { supplier, cost }
    }
  }
  return cheapest
}

// Pre-determine which products are flash sales, hot deals, and clearance
const flashSaleIndices = new Set<number>()
const hotDealIndices = new Set<number>()
const clearanceIndices = new Set<number>()

const getProductImage = (name: string, category: string, brand: string): string => {
  const query = `${brand} ${name}`.replace(/[^a-zA-Z0-9\s]/g, "").trim()
  return `https://placehold.co/400x400/1a1a1a/white?text=${encodeURIComponent(query)}`
}

// Generate massive inventory with 500+ products
export function generateMegaInventory(): MegaProduct[] {
  const products: MegaProduct[] = []

  // Assign flash sales (30 products - indices 0-29)
  for (let i = 0; i < 30; i++) {
    flashSaleIndices.add(i)
  }

  // Assign hot deals (next 32 products - indices 30-61)
  for (let i = 30; i < 62; i++) {
    hotDealIndices.add(i)
  }

  // Assign clearance (next 20 products - indices 62-81)
  for (let i = 62; i < 82; i++) {
    clearanceIndices.add(i)
  }

  // Beauty Products (50 items)
  const beautyBrands = ["Maybelline", "L'Oreal", "NYX", "CoverGirl", "Revlon", "Neutrogena", "Cetaphil", "Olay"]
  const beautyProducts = [
    "Mascara",
    "Foundation",
    "Lipstick",
    "Eyeshadow Palette",
    "Blush",
    "Concealer",
    "Eyeliner",
    "Lip Gloss",
    "Face Moisturizer",
    "Cleanser",
    "Serum",
    "Eye Cream",
    "Sunscreen SPF 50",
    "Makeup Remover",
    "Face Mask",
    "Toner",
    "Primer",
    "Setting Spray",
    "Bronzer",
    "Highlighter",
    "Brow Pencil",
    "Nail Polish",
    "Makeup Brushes Set",
    "Beauty Sponge",
    "Hair Serum",
  ]

  beautyProducts.forEach((product, idx) => {
    const brand = beautyBrands[idx % beautyBrands.length]
    const baseCost = 8 + Math.random() * 30
    const prices: SupplierPrices = {
      Amazon: baseCost + Math.random() * 5,
      Walmart: baseCost + Math.random() * 5,
      Target: baseCost + Math.random() * 5,
      Ulta: baseCost + Math.random() * 8,
      Sephora: baseCost + Math.random() * 10,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `beauty-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Beauty",
      subcategory: product.includes("Lip") || product.includes("Eye") ? "Makeup" : "Skincare",
      description: `Premium ${product.toLowerCase()} from ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Beauty", brand),
      rating: 4.0 + Math.random() * 1,
      reviews: Math.floor(Math.random() * 5000) + 100,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 25 + Math.floor(Math.random() * 15) : 0,
      originalPrice: ourPrice,
      sku: `BEA-${idx.toString().padStart(5, "0")}`,
    })
  })

  // Electronics (50 items)
  const electronicsBrands = ["Sony", "Samsung", "LG", "Logitech", "Anker", "Bose", "JBL", "Apple"]
  const electronicsProducts = [
    "Wireless Headphones",
    "Bluetooth Speaker",
    "USB-C Hub",
    "Webcam HD",
    "Wireless Mouse",
    "Mechanical Keyboard",
    "Phone Case",
    "Screen Protector",
    "Power Bank 20000mAh",
    "Charging Cable 6ft",
    "Car Phone Mount",
    "Laptop Stand",
    "Monitor 27-inch",
    "External SSD 1TB",
    "Wireless Earbuds",
    "Smartwatch",
    "Tablet 10-inch",
    "E-Reader",
    "Streaming Stick 4K",
    "Security Camera",
    "Smart Bulb 4-Pack",
    "LED Strip Lights",
    "Robot Vacuum",
    "Air Purifier",
    "Electric Toothbrush",
  ]

  electronicsProducts.forEach((product, idx) => {
    const brand = electronicsBrands[idx % electronicsBrands.length]
    const baseCost = 20 + Math.random() * 200
    const prices: SupplierPrices = {
      Amazon: baseCost + Math.random() * 20,
      Walmart: baseCost + Math.random() * 15,
      Target: baseCost + Math.random() * 18,
      BestBuy: baseCost + Math.random() * 25,
      Newegg: baseCost + Math.random() * 22,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `electronics-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Electronics",
      subcategory: "Accessories",
      description: `High-quality ${product.toLowerCase()} by ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Electronics", brand),
      rating: 4.0 + Math.random() * 1,
      reviews: Math.floor(Math.random() * 8000) + 200,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 20 + Math.floor(Math.random() * 20) : 0,
      originalPrice: ourPrice,
      sku: `ELE-${idx.toString().padStart(5, "0")}`,
    })
  })

  // Home Improvement (60 items)
  const homeBrands = ["DeWalt", "Black+Decker", "Craftsman", "Ryobi", "Milwaukee", "Husky"]
  const homeProducts = [
    "Drill Set",
    "Hammer",
    "Screwdriver Set",
    "Tool Box",
    "Measuring Tape",
    "Level",
    "Paint Brushes",
    "Paint Roller",
    "Caulking Gun",
    "Utility Knife",
    "Work Gloves",
    "Safety Glasses",
    "Extension Cord 50ft",
    "LED Work Light",
    "Stud Finder",
    "Wire Stripper",
    "Pliers Set",
    "Wrench Set",
    "Socket Set",
    "Saw",
  ]

  homeProducts.forEach((product, idx) => {
    const brand = homeBrands[idx % homeBrands.length]
    const baseCost = 10 + Math.random() * 80
    const prices: SupplierPrices = {
      Lowes: baseCost + Math.random() * 10,
      HomeDepot: baseCost + Math.random() * 10,
      Amazon: baseCost + Math.random() * 12,
      Walmart: baseCost + Math.random() * 8,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `home-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Home Improvement",
      subcategory: "Tools",
      description: `Professional ${product.toLowerCase()} from ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Home Improvement", brand),
      rating: 4.2 + Math.random() * 0.8,
      reviews: Math.floor(Math.random() * 3000) + 150,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 15 + Math.floor(Math.random() * 25) : 0,
      originalPrice: ourPrice,
      sku: `HOM-${idx.toString().padStart(5, "0")}`,
    })
  })

  // Clothing (60 items)
  const clothingBrands = ["Nike", "Adidas", "Champion", "Levi's", "Gap", "H&M", "Zara"]
  const clothingProducts = [
    "T-Shirt",
    "Hoodie",
    "Jeans",
    "Shorts",
    "Dress",
    "Jacket",
    "Sweater",
    "Leggings",
    "Tank Top",
    "Polo Shirt",
    "Sweatpants",
    "Skirt",
    "Blouse",
    "Cardigan",
    "Joggers",
  ]

  clothingProducts.forEach((product, idx) => {
    const brand = clothingBrands[idx % clothingBrands.length]
    const baseCost = 15 + Math.random() * 50
    const prices: SupplierPrices = {
      Amazon: baseCost + Math.random() * 10,
      Walmart: baseCost + Math.random() * 8,
      Target: baseCost + Math.random() * 10,
      Macys: baseCost + Math.random() * 15,
      Kohls: baseCost + Math.random() * 12,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `clothing-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Clothing",
      subcategory: "Casual Wear",
      description: `Comfortable ${product.toLowerCase()} by ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Clothing", brand),
      rating: 4.0 + Math.random() * 1,
      reviews: Math.floor(Math.random() * 4000) + 100,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 30 + Math.floor(Math.random() * 20) : 0,
      originalPrice: ourPrice,
      sku: `CLO-${idx.toString().padStart(5, "0")}`,
    })
  })

  // Add more categories to reach 500 products...
  // Shoes, Furniture, Pet Supplies, Auto Parts, Toys, Grocery, Health

  // Shoes (40 items)
  const shoeBrands = ["Nike", "Adidas", "Puma", "Reebok", "New Balance", "Converse", "Vans"]
  const shoeProducts = [
    "Running Shoes",
    "Sneakers",
    "Sandals",
    "Boots",
    "Dress Shoes",
    "Slippers",
    "Flip Flops",
    "High Tops",
  ]

  shoeProducts.forEach((product, idx) => {
    const brand = shoeBrands[idx % shoeBrands.length]
    const baseCost = 25 + Math.random() * 80
    const prices: SupplierPrices = {
      Amazon: baseCost + Math.random() * 15,
      Walmart: baseCost + Math.random() * 12,
      Target: baseCost + Math.random() * 15,
      Kohls: baseCost + Math.random() * 18,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `shoes-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Shoes",
      subcategory: "Athletic",
      description: `Quality ${product.toLowerCase()} from ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Shoes", brand),
      rating: 4.1 + Math.random() * 0.9,
      reviews: Math.floor(Math.random() * 3500) + 150,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 25 + Math.floor(Math.random() * 25) : 0,
      originalPrice: ourPrice,
      sku: `SHO-${idx.toString().padStart(5, "0")}`,
    })
  })

  // Furniture (40 items)
  const furnitureBrands = ["Ashley", "IKEA", "Wayfair", "Amazon Basics", "Zinus"]
  const furnitureProducts = [
    "Office Chair",
    "Desk",
    "Bookshelf",
    "Coffee Table",
    "Nightstand",
    "Dresser",
    "Bed Frame Queen",
    "Sofa",
    "Dining Table",
    "TV Stand",
  ]

  furnitureProducts.forEach((product, idx) => {
    const brand = furnitureBrands[idx % furnitureBrands.length]
    const baseCost = 80 + Math.random() * 300
    const prices: SupplierPrices = {
      Amazon: baseCost + Math.random() * 50,
      Walmart: baseCost + Math.random() * 40,
      Wayfair: baseCost + Math.random() * 60,
      Target: baseCost + Math.random() * 45,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `furniture-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Furniture",
      subcategory: "Home",
      description: `Stylish ${product.toLowerCase()} by ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Furniture", brand),
      rating: 4.0 + Math.random() * 1,
      reviews: Math.floor(Math.random() * 2500) + 100,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 20 + Math.floor(Math.random() * 30) : 0,
      originalPrice: ourPrice,
      sku: `FUR-${idx.toString().padStart(5, "0")}`,
    })
  })

  // Pet Supplies (50 items)
  const petBrands = ["Purina", "Blue Buffalo", "Hill's", "Pedigree", "Fancy Feast"]
  const petProducts = [
    "Dog Food 30lb",
    "Cat Food 15lb",
    "Dog Treats",
    "Cat Treats",
    "Dog Toy",
    "Cat Toy",
    "Dog Collar",
    "Cat Collar",
    "Dog Leash",
    "Pet Bed",
    "Litter Box",
    "Cat Litter 20lb",
    "Pet Shampoo",
    "Flea Treatment",
    "Pet Carrier",
  ]

  petProducts.forEach((product, idx) => {
    const brand = petBrands[idx % petBrands.length]
    const baseCost = 10 + Math.random() * 40
    const prices: SupplierPrices = {
      Amazon: baseCost + Math.random() * 8,
      Walmart: baseCost + Math.random() * 6,
      Target: baseCost + Math.random() * 7,
      Chewy: baseCost + Math.random() * 10,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `pet-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Pet Supplies",
      subcategory: "Food & Accessories",
      description: `Premium ${product.toLowerCase()} from ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Pet Supplies", brand),
      rating: 4.3 + Math.random() * 0.7,
      reviews: Math.floor(Math.random() * 5000) + 200,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 15 + Math.floor(Math.random() * 20) : 0,
      originalPrice: ourPrice,
      sku: `PET-${idx.toString().padStart(5, "0")}`,
    })
  })

  // Auto Parts (40 items)
  const autoBrands = ["Bosch", "ACDelco", "Motorcraft", "Duralast", "Pennzoil"]
  const autoProducts = [
    "Motor Oil 5qt",
    "Oil Filter",
    "Air Filter",
    "Brake Pads",
    "Wiper Blades",
    "Car Battery",
    "Spark Plugs",
    "Headlight Bulbs",
    "Floor Mats",
    "Car Cover",
  ]

  autoProducts.forEach((product, idx) => {
    const brand = autoBrands[idx % autoBrands.length]
    const baseCost = 12 + Math.random() * 80
    const prices: SupplierPrices = {
      Amazon: baseCost + Math.random() * 10,
      Walmart: baseCost + Math.random() * 8,
      AutoZone: baseCost + Math.random() * 12,
      OReilly: baseCost + Math.random() * 12,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `auto-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Auto Parts",
      subcategory: "Maintenance",
      description: `Reliable ${product.toLowerCase()} by ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Auto Parts", brand),
      rating: 4.2 + Math.random() * 0.8,
      reviews: Math.floor(Math.random() * 2000) + 100,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 20 + Math.floor(Math.random() * 20) : 0,
      originalPrice: ourPrice,
      sku: `AUT-${idx.toString().padStart(5, "0")}`,
    })
  })

  // Toys & Games (50 items)
  const toyBrands = ["LEGO", "Hasbro", "Mattel", "Fisher-Price", "Nerf", "Hot Wheels"]
  const toyProducts = [
    "Building Blocks",
    "Action Figure",
    "Doll",
    "Board Game",
    "Puzzle 1000pc",
    "RC Car",
    "Stuffed Animal",
    "Play-Doh Set",
    "Water Gun",
    "Trading Cards",
  ]

  toyProducts.forEach((product, idx) => {
    const brand = toyBrands[idx % toyBrands.length]
    const baseCost = 8 + Math.random() * 50
    const prices: SupplierPrices = {
      Amazon: baseCost + Math.random() * 8,
      Walmart: baseCost + Math.random() * 6,
      Target: baseCost + Math.random() * 8,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `toys-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Toys & Games",
      subcategory: "Kids",
      description: `Fun ${product.toLowerCase()} from ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Toys", brand),
      rating: 4.4 + Math.random() * 0.6,
      reviews: Math.floor(Math.random() * 4000) + 150,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 25 + Math.floor(Math.random() * 25) : 0,
      originalPrice: ourPrice,
      sku: `TOY-${idx.toString().padStart(5, "0")}`,
    })
  })

  // Grocery (30 items)
  const groceryBrands = ["Kraft", "General Mills", "Nestle", "Campbell's", "Kellogg's"]
  const groceryProducts = [
    "Cereal",
    "Pasta",
    "Pasta Sauce",
    "Rice 5lb",
    "Canned Soup",
    "Peanut Butter",
    "Coffee 12oz",
    "Tea Bags",
    "Cookies",
    "Crackers",
  ]

  groceryProducts.forEach((product, idx) => {
    const brand = groceryBrands[idx % groceryBrands.length]
    const baseCost = 3 + Math.random() * 15
    const prices: SupplierPrices = {
      Amazon: baseCost + Math.random() * 3,
      Walmart: baseCost + Math.random() * 2,
      Target: baseCost + Math.random() * 3,
      Costco: baseCost + Math.random() * 4,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `grocery-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Grocery",
      subcategory: "Pantry",
      description: `Quality ${product.toLowerCase()} by ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Grocery", brand),
      rating: 4.3 + Math.random() * 0.7,
      reviews: Math.floor(Math.random() * 3000) + 200,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 10 + Math.floor(Math.random() * 20) : 0,
      originalPrice: ourPrice,
      sku: `GRO-${idx.toString().padStart(5, "0")}`,
    })
  })

  // Health & Wellness (50 items)
  const healthBrands = ["Nature Made", "Centrum", "Vitafusion", "GNC", "Optimum Nutrition"]
  const healthProducts = [
    "Multivitamin",
    "Vitamin D3",
    "Omega-3",
    "Protein Powder",
    "Probiotics",
    "Collagen",
    "Vitamin C",
    "Magnesium",
    "Zinc",
    "Melatonin",
  ]

  healthProducts.forEach((product, idx) => {
    const brand = healthBrands[idx % healthBrands.length]
    const baseCost = 10 + Math.random() * 40
    const prices: SupplierPrices = {
      Amazon: baseCost + Math.random() * 8,
      Walmart: baseCost + Math.random() * 6,
      Target: baseCost + Math.random() * 7,
      Costco: baseCost + Math.random() * 10,
    }
    const cheapest = findCheapestSupplier(prices)
    const profit = calculateFlatProfit(cheapest.cost)
    const ourPrice = cheapest.cost + profit

    products.push({
      id: `health-${idx}`,
      name: `${brand} ${product}`,
      brand,
      category: "Health",
      subcategory: "Supplements",
      description: `Premium ${product.toLowerCase()} supplement from ${brand}`,
      supplierPrices: prices,
      cheapestSupplier: cheapest.supplier,
      supplierCost: cheapest.cost,
      ourPrice,
      profit,
      image: getProductImage(product, "Health", brand),
      rating: 4.4 + Math.random() * 0.6,
      reviews: Math.floor(Math.random() * 5000) + 300,
      inStock: true,
      isFlashSale: flashSaleIndices.has(products.length),
      isHotDeal: hotDealIndices.has(products.length),
      isClearance: clearanceIndices.has(products.length),
      discount: flashSaleIndices.has(products.length) ? 20 + Math.floor(Math.random() * 20) : 0,
      originalPrice: ourPrice,
      sku: `HEA-${idx.toString().padStart(5, "0")}`,
    })
  })

  return products
}

export function getCategories() {
  return [
    { id: "all", name: "All Products", icon: ShoppingBag },
    { id: "Beauty", name: "Beauty", icon: Sparkles },
    { id: "Electronics", name: "Electronics", icon: Laptop },
    { id: "Home Improvement", name: "Home Improvement", icon: Home },
    { id: "Clothing", name: "Clothing", icon: Shirt },
    { id: "Shoes", name: "Shoes", icon: ShoppingBag },
    { id: "Furniture", name: "Furniture", icon: Sofa },
    { id: "Pet Supplies", name: "Pet Supplies", icon: Dog },
    { id: "Auto Parts", name: "Auto Parts", icon: Wrench },
    { id: "Toys & Games", name: "Toys & Games", icon: Gift },
    { id: "Grocery", name: "Grocery", icon: ShoppingBag },
    { id: "Health", name: "Health", icon: Pill },
  ]
}

export function getSuppliers() {
  return [
    { id: "all", name: "All Stores" },
    { id: "Amazon", name: "Amazon" },
    { id: "Walmart", name: "Walmart" },
    { id: "Target", name: "Target" },
    { id: "BestBuy", name: "Best Buy" },
    { id: "Costco", name: "Costco" },
    { id: "Lowes", name: "Lowe's" },
    { id: "HomeDepot", name: "Home Depot" },
    { id: "Macys", name: "Macy's" },
    { id: "Nordstrom", name: "Nordstrom" },
    { id: "Sephora", name: "Sephora" },
    { id: "Ulta", name: "Ulta" },
    { id: "Wayfair", name: "Wayfair" },
    { id: "Chewy", name: "Chewy" },
    { id: "AutoZone", name: "AutoZone" },
    { id: "OReilly", name: "O'Reilly" },
    { id: "JCPenney", name: "JCPenney" },
    { id: "Kohls", name: "Kohl's" },
    { id: "Newegg", name: "Newegg" },
    { id: "BHPhoto", name: "B&H Photo" },
  ]
}

// Need to import Sparkles icon
