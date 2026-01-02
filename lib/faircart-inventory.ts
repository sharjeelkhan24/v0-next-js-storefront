import { getAllVerifiedProducts } from "./real-product-api"

export interface FairCartProduct {
  id: string
  name: string
  brand: string
  description: string
  category: string
  image: string

  // Price comparison across all stores
  storesPrices: {
    store: string
    price: number
    inStock: boolean
    deliveryDays: number
    isBestSeller?: boolean
    isAmazonChoice?: boolean
    isBulkOption?: boolean
    bulkQuantity?: number
    region: "US" | "India" | "Mexico" | "Global"
    productUrl?: string
    shipping?: number
  }[]

  // Our pricing (cheapest + small markup)
  bestPrice: number
  bestStore: string
  ourPrice: number
  profit: number
  savings: number
  savingsPercent: number

  // Tags
  isFlashSale: boolean
  isHotDeal: boolean
  isClearance: boolean
  isBestSeller: boolean
  isAmazonChoice: boolean
  hasBulkOption: boolean

  rating: number
  reviews: number
  sku: string
  shipping: number | "free"
  productUrl?: string // Added for real product data
}

// All integrated stores
export const STORES = {
  // US Stores Only
  amazon: { name: "Amazon", region: "US", logo: "🛒", avgDeliveryDays: 2, shippingCost: 0 },
  amazonhaul: { name: "Amazon Haul", region: "US", logo: "🎯", hidden: true, avgDeliveryDays: 1, shippingCost: 0 },
  walmart: { name: "Walmart", region: "US", logo: "🏪", avgDeliveryDays: 3, shippingCost: 5.99 },
  meijer: { name: "Meijer", region: "US", logo: "🏬", avgDeliveryDays: 4, shippingCost: 5.99 },
  kroger: { name: "Kroger", region: "US", logo: "🛒", avgDeliveryDays: 5, shippingCost: 7.99 },
  dollargeneral: { name: "Dollar General", region: "US", logo: "💵", avgDeliveryDays: 3, shippingCost: 0 },
  officedepot: { name: "Office Depot", region: "US", logo: "📎", avgDeliveryDays: 3, shippingCost: 5.99 },
  officemax: { name: "Office Max", region: "US", logo: "📋", avgDeliveryDays: 3, shippingCost: 5.99 },
  ashleyfurniture: { name: "Ashley Furniture", region: "US", logo: "🛋️", avgDeliveryDays: 7, shippingCost: 49.99 },
  ikea: { name: "IKEA", region: "US", logo: "🪑", avgDeliveryDays: 5, shippingCost: 9.99 },
  petco: { name: "Petco", region: "US", logo: "🐾", avgDeliveryDays: 3, shippingCost: 4.99 },
  petsmart: { name: "PetSmart", region: "US", logo: "🐕", avgDeliveryDays: 3, shippingCost: 4.99 },
  autozone: { name: "AutoZone", region: "US", logo: "🚗", avgDeliveryDays: 2, shippingCost: 6.99 },
  target: { name: "Target", region: "US", logo: "🎯", avgDeliveryDays: 3, shippingCost: 5.99 },
  bestbuy: { name: "Best Buy", region: "US", logo: "📱", avgDeliveryDays: 3, shippingCost: 5.99 },
  costco: { name: "Costco", region: "US", logo: "📦", bulk: true, avgDeliveryDays: 4, shippingCost: 0 },
  samsclub: { name: "Sam's Club", region: "US", logo: "🏬", bulk: true, avgDeliveryDays: 4, shippingCost: 0 },
  lowes: { name: "Lowe's", region: "US", logo: "🔨", avgDeliveryDays: 4, shippingCost: 6.99 },
  homedepot: { name: "Home Depot", region: "US", logo: "🏠", avgDeliveryDays: 4, shippingCost: 6.99 },
  sephora: { name: "Sephora", region: "US", logo: "💄", avgDeliveryDays: 3, shippingCost: 5.95 },
  ulta: { name: "Ulta", region: "US", logo: "✨", avgDeliveryDays: 3, shippingCost: 5.95 },
  oreilly: { name: "O'Reilly Auto", region: "US", logo: "🛠️", avgDeliveryDays: 2, shippingCost: 6.99 },
  newegg: { name: "Newegg", region: "US", logo: "🛍️", avgDeliveryDays: 3, shippingCost: 4.99 },
  bhphoto: { name: "B&H Photo", region: "US", logo: "📷", avgDeliveryDays: 3, shippingCost: 0 },
  macy: { name: "Macy's", region: "US", logo: "🏢", avgDeliveryDays: 5, shippingCost: 9.99 },
  nordstrom: { name: "Nordstrom", region: "US", logo: "👗", avgDeliveryDays: 3, shippingCost: 0 },
  wayfair: { name: "Wayfair", region: "US", logo: "🏠", avgDeliveryDays: 4, shippingCost: 4.99 },
  chewy: { name: "Chewy", region: "US", logo: "🐶", avgDeliveryDays: 3, shippingCost: 0 },
  ebay: { name: "eBay", region: "US", logo: "🛒", avgDeliveryDays: 4, shippingCost: 0 },
}

// Simplified categories for mapping
const SIMPLIFIED_CATEGORIES = [
  "Electronics",
  "Computers",
  "Home",
  "Beauty",
  "Clothing",
  "Shoes",
  "Pet Supplies",
  "Health",
  "Toys",
  "Office",
  "Grocery",
  "Furniture",
  "Automotive",
  "Home Improvement",
  "Tools",
  "Outdoor",
  "Appliances",
  "Hardware",
  "Cleaning",
  "Cameras",
]

const STORE_CATEGORY_MAP: Record<keyof typeof STORES, string[]> = {
  amazon: [
    "Electronics",
    "Computers",
    "Home",
    "Beauty",
    "Clothing",
    "Shoes",
    "Pet Supplies",
    "Health",
    "Toys",
    "Office",
    "Grocery",
  ],
  amazonhaul: [
    "Electronics",
    "Computers",
    "Home",
    "Beauty",
    "Clothing",
    "Shoes",
    "Pet Supplies",
    "Health",
    "Toys",
    "Office",
    "Grocery",
  ], // Hidden source
  walmart: [
    "Electronics",
    "Computers",
    "Home",
    "Beauty",
    "Clothing",
    "Shoes",
    "Pet Supplies",
    "Health",
    "Toys",
    "Office",
    "Grocery",
    "Furniture",
    "Automotive",
  ],
  target: [
    "Electronics",
    "Computers",
    "Home",
    "Beauty",
    "Clothing",
    "Shoes",
    "Pet Supplies",
    "Health",
    "Toys",
    "Office",
    "Grocery",
    "Furniture",
  ],
  bestbuy: ["Electronics", "Computers", "Smart Home", "Cameras", "Appliances"],
  meijer: ["Grocery", "Health", "Beauty", "Clothing", "Toys", "Office", "Pet Supplies"],
  kroger: ["Grocery", "Health", "Beauty", "Pet Supplies"],
  dollargeneral: ["Grocery", "Health", "Beauty", "Toys", "Office", "Cleaning"],
  officedepot: ["Office", "Electronics", "Computers", "Furniture"],
  officemax: ["Office", "Electronics", "Computers", "Furniture"],
  ashleyfurniture: ["Furniture", "Home"],
  ikea: ["Furniture", "Home", "Office"],
  petco: ["Pet Supplies"],
  petsmart: ["Pet Supplies"],
  lowes: ["Home Improvement", "Tools", "Outdoor", "Appliances", "Hardware"],
  homedepot: ["Home Improvement", "Tools", "Outdoor", "Appliances", "Hardware"],
  autozone: ["Automotive"],
  oreilly: ["Automotive"],
  costco: ["Electronics", "Grocery", "Appliances", "Furniture", "Office", "Health"],
  samsclub: ["Electronics", "Grocery", "Appliances", "Furniture", "Office", "Health"],
  sephora: ["Beauty"],
  ulta: ["Beauty", "Health"],
  newegg: ["Computers", "Electronics"],
  bhphoto: ["Cameras", "Electronics", "Computers"],
  macy: ["Clothing", "Shoes", "Beauty", "Home"],
  nordstrom: ["Clothing", "Shoes", "Beauty"],
  wayfair: ["Furniture", "Home"],
  chewy: ["Pet Supplies"],
  ebay: ["Electronics", "Computers", "Clothing", "Shoes", "Home", "Automotive", "Toys"],
}

// All integrated stores
export const CATEGORIES = [
  "Electronics",
  "Computers & Accessories",
  "Smart Home",
  "Camera & Photo",
  "Cell Phones & Accessories",
  "Headphones",
  "Video Games",
  "TVs & Home Theater",
  "Wearable Technology",
  "Clothing, Shoes & Jewelry",
  "Men's Fashion",
  "Women's Fashion",
  "Girls' Fashion",
  "Boys' Fashion",
  "Baby",
  "Luggage & Travel",
  "Home & Kitchen",
  "Furniture",
  "Bedding & Bath",
  "Home Decor",
  "Kitchen & Dining",
  "Patio & Garden",
  "Beauty & Personal Care",
  "Makeup",
  "Skin Care",
  "Hair Care",
  "Fragrance",
  "Grocery & Gourmet Food",
  "Beverages",
  "Snacks",
  "Pantry Staples",
  "Sports & Outdoors",
  "Exercise & Fitness",
  "Outdoor Recreation",
  "Sports Equipment",
  "Tools & Home Improvement",
  "Power Tools",
  "Hand Tools",
  "Building Materials",
  "Automotive",
  "Car Electronics",
  "Motorcycle & Powersports",
  "RV Parts",
  "Toys & Games",
  "Action Figures",
  "Dolls",
  "Board Games",
  "Arts & Crafts",
  "Books",
  "Movies & TV",
  "Music",
  "Pet Supplies",
  "Dog Supplies",
  "Cat Supplies",
  "Health & Household",
  "Vitamins & Supplements",
  "Medical Supplies",
  "Office Products",
  "Office Electronics",
  "School Supplies",
  "Industrial & Scientific",
]

// Mapping of which stores sell which product categories
// const STORE_CATEGORY_MAP: Record<string, string[]> = {
//   // Beauty-only stores
//   sephora: ["Beauty & Personal Care", "Makeup", "Skin Care", "Hair Care", "Fragrance"],
//   ulta: ["Beauty & Personal Care", "Makeup", "Skin Care", "Hair Care", "Fragrance"],

//   // Auto-only stores
//   autozone: ["Automotive", "Car Electronics", "Motorcycle & Powersports", "RV Parts"],
//   oreilly: ["Automotive", "Car Electronics", "Motorcycle & Powersports", "RV Parts"],

//   // Home improvement stores
//   lowes: [
//     "Tools & Home Improvement",
//     "Power Tools",
//     "Hand Tools",
//     "Building Materials",
//     "Home & Kitchen",
//     "Furniture",
//     "Patio & Garden",
//   ],
//   homedepot: [
//     "Tools & Home Improvement",
//     "Power Tools",
//     "Hand Tools",
//     "Building Materials",
//     "Home & Kitchen",
//     "Furniture",
//     "Patio & Garden",
//   ],

//   // Electronics specialty stores
//   bestbuy: [
//     "Electronics",
//     "Computers & Accessories",
//     "Smart Home",
//     "Camera & Photo",
//     "Cell Phones & Accessories",
//     "Headphones",
//     "Video Games",
//     "TVs & Home Theater",
//     "Wearable Technology",
//   ],
//   newegg: [
//     "Electronics",
//     "Computers & Accessories",
//     "Smart Home",
//     "Camera & Photo",
//     "Cell Phones & Accessories",
//     "Video Games",
//   ],
//   bhphoto: ["Electronics", "Computers & Accessories", "Camera & Photo", "TVs & Home Theater"],

//   // Pet stores
//   chewy: ["Pet Supplies", "Dog Supplies", "Cat Supplies"],

//   // Grocery stores
//   kroger: [
//     "Grocery & Gourmet Food",
//     "Beverages",
//     "Snacks",
//     "Pantry Staples",
//     "Health & Household",
//     "Vitamins & Supplements",
//   ],

//   // Department stores (sell everything except specialized categories)
//   amazon: [
//     "Electronics",
//     "Computers & Accessories",
//     "Smart Home",
//     "Camera & Photo",
//     "Cell Phones & Accessories",
//     "Headphones",
//     "Video Games",
//     "TVs & Home Theater",
//     "Wearable Technology",
//     "Clothing, Shoes & Jewelry",
//     "Men's Fashion",
//     "Women's Fashion",
//     "Girls' Fashion",
//     "Boys' Fashion",
//     "Baby",
//     "Luggage & Travel",
//     "Home & Kitchen",
//     "Furniture",
//     "Bedding & Bath",
//     "Home Decor",
//     "Kitchen & Dining",
//     "Patio & Garden",
//     "Beauty & Personal Care",
//     "Makeup",
//     "Skin Care",
//     "Hair Care",
//     "Fragrance",
//     "Grocery & Gourmet Food",
//     "Beverages",
//     "Snacks",
//     "Pantry Staples",
//     "Sports & Outdoors",
//     "Exercise & Fitness",
//     "Outdoor Recreation",
//     "Sports Equipment",
//     "Tools & Home Improvement",
//     "Power Tools",
//     "Hand Tools",
//     "Building Materials",
//     "Automotive",
//     "Car Electronics",
//     "Toys & Games",
//     "Action Figures",
//     "Dolls",
//     "Board Games",
//     "Arts & Crafts",
//     "Books",
//     "Movies & TV",
//     "Music",
//     "Pet Supplies",
//     "Dog Supplies",
//     "Cat Supplies",
//     "Health & Household",
//     "Vitamins & Supplements",
//     "Medical Supplies",
//     "Office Products",
//     "Office Electronics",
//     "School Supplies",
//   ],
//   walmart: [
//     "Electronics",
//     "Computers & Accessories",
//     "Smart Home",
//     "Clothing, Shoes & Jewelry",
//     "Home & Kitchen",
//     "Furniture",
//     "Beauty & Personal Care",
//     "Grocery & Gourmet Food",
//     "Sports & Outdoors",
//     "Tools & Home Improvement",
//     "Automotive",
//     "Toys & Games",
//     "Pet Supplies",
//     "Health & Household",
//     "Office Products",
//   ],
//   target: [
//     "Electronics",
//     "Computers & Accessories",
//     "Clothing, Shoes & Jewelry",
//     "Home & Kitchen",
//     "Furniture",
//     "Beauty & Personal Care",
//     "Grocery & Gourmet Food",
//     "Sports & Outdoors",
//     "Toys & Games",
//     "Pet Supplies",
//     "Health & Household",
//     "Office Products",
//   ],
//   meijer: [
//     "Electronics",
//     "Clothing, Shoes & Jewelry",
//     "Home & Kitchen",
//     "Beauty & Personal Care",
//     "Grocery & Gourmet Food",
//     "Sports & Outdoors",
//     "Tools & Home Improvement",
//     "Automotive",
//     "Toys & Games",
//     "Pet Supplies",
//     "Health & Household",
//     "Office Products",
//   ],

//   // Warehouse clubs (sell bulk everything)
//   costco: [
//     "Electronics",
//     "Computers & Accessories",
//     "Clothing, Shoes & Jewelry",
//     "Home & Kitchen",
//     "Furniture",
//     "Grocery & Gourmet Food",
//     "Sports & Outdoors",
//     "Tools & Home Improvement",
//     "Toys & Games",
//     "Pet Supplies",
//     "Health & Household",
//     "Office Products",
//   ],
//   samsclub: [
//     "Electronics",
//     "Computers & Accessories",
//     "Clothing, Shoes & Jewelry",
//     "Home & Kitchen",
//     "Furniture",
//     "Grocery & Gourmet Food",
//     "Sports & Outdoors",
//     "Tools & Home Improvement",
//     "Toys & Games",
//     "Pet Supplies",
//     "Health & Household",
//     "Office Products",
//   ],

//   // Specialty department stores
//   macy: ["Clothing, Shoes & Jewelry", "Men's Fashion", "Women's Fashion", "Beauty & Personal Care", "Home & Kitchen"],
//   nordstrom: [
//     "Clothing, Shoes & Jewelry",
//     "Men's Fashion",
//     "Women's Fashion",
//     "Beauty & Personal Care",
//     "Luggage & Travel",
//   ],

//   // Furniture/home stores
//   wayfair: ["Furniture", "Home & Kitchen", "Bedding & Bath", "Home Decor", "Patio & Garden"],

//   // General marketplace
//   ebay: [
//     "Electronics",
//     "Computers & Accessories",
//     "Clothing, Shoes & Jewelry",
//     "Home & Kitchen",
//     "Furniture",
//     "Sports & Outdoors",
//     "Tools & Home Improvement",
//     "Automotive",
//     "Toys & Games",
//     "Pet Supplies",
//   ],
// }

// Helper function to get stores that sell a specific category
function getStoresForCategory(category: string): string[] {
  const relevantStores: string[] = []
  for (const [storeKey, categories] of Object.entries(STORE_CATEGORY_MAP)) {
    if (categories.some((cat) => category.includes(cat))) {
      relevantStores.push(STORES[storeKey as keyof typeof STORES].name)
    }
  }
  return relevantStores
}

// Generate price comparison for a product across stores
function generateStorePrices(
  product: { name: string; brand: string; basePrice: number; category: string },
  actualSupplierPrice: number,
  actualSupplier: string,
): FairCartProduct["storesPrices"] {
  const relevantStores = getStoresForCategory(product.category)
  // Ensure we have at least some stores, default to major retailers if none match category
  const availableStores = relevantStores.length > 0 ? relevantStores : ["Amazon", "Walmart", "Target"]

  // Amazon Haul is our secret cheap source for items under $20
  const selectedStores = availableStores
    .filter((storeName) => storeName !== actualSupplier && storeName !== "Amazon Haul") // Hide our actual supplier AND Amazon Haul
    .slice(0, Math.min(5, availableStores.length))

  return selectedStores
    .map((storeName) => {
      const store = Object.values(STORES).find((s) => s.name === storeName)!
      // Simulate realistic pricing - these are the HIGHER prices customers can verify
      // We're showing prices 15-40% MORE than our actual supplier cost
      const markup = 1.15 + Math.random() * 0.25
      const price = actualSupplierPrice * markup

      const productUrl = generateProductUrl(storeName, product.name, product.brand)

      return {
        store: storeName,
        price: Number.parseFloat(price.toFixed(2)),
        inStock: Math.random() > 0.1, // 90% chance of being in stock
        deliveryDays: store.avgDeliveryDays,
        region: store.region,
        isBestSeller: Math.random() > 0.7, // 30% chance of being a best seller
        isAmazonChoice: storeName === "Amazon" && Math.random() > 0.8, // 20% chance of being Amazon's Choice
        productUrl,
        shipping: store.shippingCost,
      }
    })
    .sort((a, b) => a.price - b.price)
}

function generateProductUrl(store: string, productName: string, brand: string): string {
  const searchQuery = `${brand} ${productName}`.replace(/\s+/g, "+")

  const urlMap: Record<string, string> = {
    Amazon: `https://www.amazon.com/s?k=${searchQuery}`,
    Walmart: `https://www.walmart.com/search?q=${searchQuery}`,
    Target: `https://www.target.com/s?searchTerm=${searchQuery}`,
    "Best Buy": `https://www.bestbuy.com/site/searchpage.jsp?st=${searchQuery}`,
    "Home Depot": `https://www.homedepot.com/s/${searchQuery}`,
    "Lowe's": `https://www.lowes.com/search?searchTerm=${searchQuery}`,
    "Macy's": `https://www.macys.com/shop/search?keyword=${searchQuery}`,
    Costco: `https://www.costco.com/CatalogSearch?keyword=${searchQuery}`,
    Meijer: `https://www.meijer.com/shop/en/search?text=${searchQuery}`,
    Kroger: `https://www.kroger.com/search?query=${searchQuery}`,
    "Office Depot": `https://www.officedepot.com/a/products/${searchQuery.toLowerCase().replace(/ /g, "-")}`,
    "Office Max": `https://www.officemax.com/a/products/${searchQuery.toLowerCase().replace(/ /g, "-")}`,
    "Ashley Furniture": `https://www.ashleyfurniture.com/search/?q=${searchQuery}`,
    IKEA: `https://www.ikea.com/us/en/search/?q=${searchQuery}`,
    Petco: `https://www.petco.com/shop/en/petcostore/${searchQuery.replace(/ /g, "-")}`,
    PetSmart: `https://www.petsmart.com/search?q=${searchQuery}`,
    AutoZone: `https://www.autozone.com/search/${searchQuery}`,
    "O'Reilly Auto": `https://www.oreillyauto.com/store/search/${searchQuery}`,
    Newegg: `https://www.newegg.com/p/${searchQuery.replace(/ /g, "-")}`,
    "B&H Photo": `https://www.bhphotovideo.com/c/search?searchterm=${searchQuery}`,
    Nordstrom: `https://www.nordstrom.com/sr?origin=keywordsearch&keyword=${searchQuery}`,
    Wayfair: `https://www.wayfair.com/search.php?keyword=${searchQuery}`,
    Chewy: `https://www.chewy.com/s?query=${searchQuery}`,
    eBay: `https://www.ebay.com/sch/i.html?_nkw=${searchQuery}`,
  }

  return urlMap[store] || `https://www.google.com/search?q=${searchQuery}+${store.replace(/\s/g, "+")}`
}

// Product database by category
const PRODUCT_DATABASE: Record<
  string,
  { name: string; brand: string; basePrice: number; variants?: number; description?: string; id?: string }[]
> = {
  Electronics: [
    {
      name: "Wireless Noise Cancelling Headphones",
      brand: "Sony",
      basePrice: 299.99,
      variants: 3,
      description: "Experience premium audio quality with these Sony headphones.",
      id: "EL001",
    },
    {
      name: "Smart Speaker with Alexa",
      brand: "Amazon",
      basePrice: 99.99,
      variants: 2,
      description: "Control your smart home with voice commands.",
      id: "EL002",
    },
    {
      name: "4K Smart TV 55 inch",
      brand: "Samsung",
      basePrice: 599.99,
      variants: 4,
      description: "Immerse yourself in stunning visuals with this Samsung TV.",
      id: "EL003",
    },
    {
      name: "Bluetooth Earbuds Pro",
      brand: "Apple",
      basePrice: 249.99,
      variants: 3,
      description: "Crystal clear sound and comfortable fit.",
      id: "EL004",
    },
    {
      name: "Gaming Console",
      brand: "Sony",
      basePrice: 499.99,
      variants: 1,
      description: "The ultimate gaming experience.",
      id: "EL005",
    },
    {
      name: "Smart Watch Series 9",
      brand: "Apple",
      basePrice: 399.99,
      variants: 3,
      description: "Stay connected and track your fitness.",
      id: "EL006",
    },
    {
      name: "Portable Bluetooth Speaker",
      brand: "JBL",
      basePrice: 129.99,
      variants: 2,
      description: "Take your music anywhere.",
      id: "EL007",
    },
    {
      name: "Digital Camera 24MP",
      brand: "Canon",
      basePrice: 549.99,
      variants: 2,
      description: "Capture life's moments in high detail.",
      id: "EL008",
    },
    {
      name: "Wireless Mouse",
      brand: "Logitech",
      basePrice: 29.99,
      variants: 2,
      description: "Ergonomic design for comfortable use.",
      id: "EL009",
    },
    {
      name: "Mechanical Keyboard RGB",
      brand: "Corsair",
      basePrice: 149.99,
      variants: 2,
      description: "Tactile feedback and customizable lighting.",
      id: "EL010",
    },
    {
      name: "USB-C Hub",
      brand: "Anker",
      basePrice: 49.99,
      variants: 2,
      description: "Expand your connectivity options.",
      id: "EL011",
    },
    {
      name: "External Hard Drive 2TB",
      brand: "Seagate",
      basePrice: 79.99,
      variants: 1,
      description: "Massive storage for all your files.",
      id: "EL012",
    },
    {
      name: "Webcam 1080p",
      brand: "Logitech",
      basePrice: 69.99,
      variants: 2,
      description: "High-definition video for calls and streaming.",
      id: "EL013",
    },
    {
      name: "Soundbar with Subwoofer",
      brand: "Bose",
      basePrice: 399.99,
      variants: 1,
      description: "Immersive audio for your home theater.",
      id: "EL014",
    },
    {
      name: "Streaming Device 4K",
      brand: "Roku",
      basePrice: 49.99,
      variants: 2,
      description: "Access all your favorite streaming services.",
      id: "EL015",
    },
    {
      name: "E-Reader",
      brand: "Amazon",
      basePrice: 139.99,
      variants: 3,
      description: "Read your favorite books on the go.",
      id: "EL016",
    },
    {
      name: "Tablet 10 inch",
      brand: "Samsung",
      basePrice: 329.99,
      variants: 3,
      description: "Versatile device for work and play.",
      id: "EL017",
    },
    {
      name: "VR Headset",
      brand: "Meta",
      basePrice: 299.99,
      variants: 1,
      description: "Step into virtual worlds.",
      id: "EL018",
    },
    {
      name: "Drone with Camera",
      brand: "DJI",
      basePrice: 449.99,
      variants: 2,
      description: "Capture stunning aerial footage.",
      id: "EL019",
    },
    {
      name: "Action Camera 4K",
      brand: "GoPro",
      basePrice: 349.99,
      variants: 2,
      description: "Record your adventures in high quality.",
      id: "EL020",
    },
    {
      name: "Gaming Headset RGB",
      brand: "Razer",
      basePrice: 129.99,
      variants: 2,
      description: "Immersive sound and clear communication.",
      id: "EL021",
    },
    {
      name: "Smart Display 10 inch",
      brand: "Amazon",
      basePrice: 229.99,
      variants: 2,
      description: "Your smart home hub with a screen.",
      id: "EL022",
    },
    {
      name: "Security Camera Indoor",
      brand: "Ring",
      basePrice: 59.99,
      variants: 2,
      description: "Keep an eye on your home.",
      id: "EL023",
    },
    {
      name: "Video Doorbell",
      brand: "Ring",
      basePrice: 99.99,
      variants: 1,
      description: "See who's at your door from anywhere.",
      id: "EL024",
    },
    {
      name: "Smart Light Bulbs 4-Pack",
      brand: "Philips Hue",
      basePrice: 49.99,
      variants: 1,
      description: "Set the mood with customizable lighting.",
      id: "EL025",
    },
    {
      name: "Smart Plug 4-Pack",
      brand: "TP-Link",
      basePrice: 24.99,
      variants: 1,
      description: "Make any appliance smart.",
      id: "EL026",
    },
    {
      name: "Smart Thermostat",
      brand: "Nest",
      basePrice: 249.99,
      variants: 1,
      description: "Save energy and control your home's temperature.",
      id: "EL027",
    },
    {
      name: "Robot Vacuum",
      brand: "Roomba",
      basePrice: 599.99,
      variants: 1,
      description: "Effortless cleaning for your home.",
      id: "EL028",
    },
    {
      name: "Electric Kettle Smart",
      brand: "Cosori",
      basePrice: 79.99,
      variants: 1,
      description: "Boil water with precision and convenience.",
      id: "EL029",
    },
    {
      name: "Digital Photo Frame",
      brand: "Nixplay",
      basePrice: 159.99,
      variants: 1,
      description: "Share and display your cherished memories.",
      id: "EL030",
    },
    {
      name: "Wireless Charger Pad",
      brand: "Anker",
      basePrice: 19.99,
      variants: 2,
      description: "Fast and convenient charging.",
      id: "EL031",
    },
    {
      name: "Phone Case iPhone 15",
      brand: "OtterBox",
      basePrice: 49.99,
      variants: 4,
      description: "Durable protection for your phone.",
      id: "EL032",
    },
    {
      name: "Screen Protector 2-Pack",
      brand: "ZAGG",
      basePrice: 39.99,
      variants: 1,
      description: "Protect your phone's display.",
      id: "EL033",
    },
    {
      name: "Power Bank 20000mAh",
      brand: "Anker",
      basePrice: 49.99,
      variants: 1,
      description: "Charge your devices on the go.",
      id: "EL034",
    },
    {
      name: "Car Phone Mount",
      brand: "iOttie",
      basePrice: 24.99,
      variants: 2,
      description: "Securely mount your phone in your car.",
      id: "EL035",
    },
    {
      name: "Bluetooth FM Transmitter",
      brand: "Anker",
      basePrice: 19.99,
      variants: 1,
      description: "Stream music wirelessly to your car stereo.",
      id: "EL036",
    },
    {
      name: "Ring Light 10 inch",
      brand: "Neewer",
      basePrice: 39.99,
      variants: 1,
      description: "Perfect lighting for photos and videos.",
      id: "EL037",
    },
    {
      name: "Microphone USB Condenser",
      brand: "Blue Yeti",
      basePrice: 129.99,
      variants: 1,
      description: "Professional sound for recording and streaming.",
      id: "EL038",
    },
    {
      name: "Tripod Flexible",
      brand: "Joby",
      basePrice: 29.99,
      variants: 1,
      description: "Stable shots from any angle.",
      id: "EL039",
    },
    {
      name: "Gimbal Stabilizer",
      brand: "DJI",
      basePrice: 149.99,
      variants: 1,
      description: "Smooth, professional-looking video.",
      id: "EL040",
    },
    {
      name: "LED Strip Lights 50ft",
      brand: "Govee",
      basePrice: 39.99,
      variants: 1,
      description: "Add ambiance to any room.",
      id: "EL041",
    },
    {
      name: "Smart Door Lock",
      brand: "August",
      basePrice: 279.99,
      variants: 1,
      description: "Keyless entry and remote access.",
      id: "EL042",
    },
    {
      name: "Wireless Doorbell",
      brand: "SadoTech",
      basePrice: 29.99,
      variants: 1,
      description: "Easy to install doorbell system.",
      id: "EL043",
    },
    {
      name: "Baby Monitor Video",
      brand: "Nanit",
      basePrice: 299.99,
      variants: 1,
      description: "Keep track of your baby.",
      id: "EL044",
    },
    {
      name: "Air Quality Monitor",
      brand: "Awair",
      basePrice: 149.99,
      variants: 1,
      description: "Monitor and improve your indoor air.",
      id: "EL045",
    },
    {
      name: "Smart Scale",
      brand: "Withings",
      basePrice: 99.99,
      variants: 1,
      description: "Track your health metrics.",
      id: "EL046",
    },
    {
      name: "Fitness Tracker",
      brand: "Fitbit",
      basePrice: 149.99,
      variants: 2,
      description: "Monitor your activity and workouts.",
      id: "EL047",
    },
    {
      name: "Sleep Tracker",
      brand: "Withings",
      basePrice: 99.99,
      variants: 1,
      description: "Understand and improve your sleep.",
      id: "EL048",
    },
    {
      name: "Electric Toothbrush Smart",
      brand: "Oral-B",
      basePrice: 179.99,
      variants: 2,
      description: "Advanced cleaning for healthier teeth.",
      id: "EL049",
    },
    {
      name: "Water Flosser",
      brand: "Waterpik",
      basePrice: 69.99,
      variants: 1,
      description: "Effective oral hygiene tool.",
      id: "EL050",
    },
  ],
  "Computers & Accessories": [
    {
      name: "Laptop 15 inch Intel i7",
      brand: "Dell",
      basePrice: 899.99,
      variants: 3,
      description: "Powerful performance for work and multitasking.",
      id: "CO001",
    },
    {
      name: "Desktop Computer Gaming",
      brand: "HP",
      basePrice: 1299.99,
      variants: 2,
      description: "High-end gaming rig for immersive play.",
      id: "CO002",
    },
    {
      name: "Monitor 27 inch 4K",
      brand: "LG",
      basePrice: 399.99,
      variants: 2,
      description: "Stunning clarity and vibrant colors.",
      id: "CO003",
    },
    {
      name: "Laptop Stand Adjustable",
      brand: "Rain Design",
      basePrice: 49.99,
      variants: 1,
      description: "Ergonomic setup for your workspace.",
      id: "CO004",
    },
    {
      name: "Laptop Bag 15 inch",
      brand: "Samsonite",
      basePrice: 59.99,
      variants: 2,
      description: "Protective and stylish carrying solution.",
      id: "CO005",
    },
    {
      name: "Wireless Keyboard and Mouse Combo",
      brand: "Logitech",
      basePrice: 59.99,
      variants: 2,
      description: "Seamless connectivity for your computer.",
      id: "CO006",
    },
    {
      name: "USB Flash Drive 128GB",
      brand: "SanDisk",
      basePrice: 19.99,
      variants: 1,
      description: "Portable storage for your data.",
      id: "CO007",
    },
    {
      name: "Graphics Card RTX 4060",
      brand: "NVIDIA",
      basePrice: 599.99,
      variants: 1,
      description: "Boost your gaming performance.",
      id: "CO008",
    },
    {
      name: "SSD 1TB Internal",
      brand: "Samsung",
      basePrice: 89.99,
      variants: 1,
      description: "Lightning-fast storage upgrades.",
      id: "CO009",
    },
    {
      name: "RAM 16GB DDR4",
      brand: "Corsair",
      basePrice: 69.99,
      variants: 1,
      description: "Enhance your system's speed.",
      id: "CO010",
    },
    {
      name: "Laptop Cooling Pad",
      brand: "Havit",
      basePrice: 29.99,
      variants: 1,
      description: "Prevent overheating during intensive tasks.",
      id: "CO011",
    },
    {
      name: "Docking Station USB-C",
      brand: "Dell",
      basePrice: 199.99,
      variants: 1,
      description: "Connect all your peripherals with ease.",
      id: "CO012",
    },
    {
      name: "Printer All-in-One",
      brand: "HP",
      basePrice: 129.99,
      variants: 2,
      description: "Print, scan, and copy with one device.",
      id: "CO013",
    },
    {
      name: "Router WiFi 6",
      brand: "TP-Link",
      basePrice: 79.99,
      variants: 1,
      description: "Faster, more reliable internet.",
      id: "CO014",
    },
    {
      name: "Network Switch 8-Port",
      brand: "Netgear",
      basePrice: 39.99,
      variants: 1,
      description: "Expand your wired network.",
      id: "CO015",
    },
    {
      name: "Chromebook 14 inch",
      brand: "Acer",
      basePrice: 299.99,
      variants: 2,
      description: "Lightweight and cloud-focused computing.",
      id: "CO016",
    },
    {
      name: "MacBook Pro 16 inch",
      brand: "Apple",
      basePrice: 2499.99,
      variants: 1,
      description: "Professional-grade performance and display.",
      id: "CO017",
    },
    {
      name: "Gaming Laptop RTX 4070",
      brand: "ASUS",
      basePrice: 1799.99,
      variants: 1,
      description: "Unleash your gaming potential on the go.",
      id: "CO018",
    },
    {
      name: "All-in-One Desktop",
      brand: "HP",
      basePrice: 899.99,
      variants: 1,
      description: "Space-saving design with powerful performance.",
      id: "CO019",
    },
    {
      name: "Mini PC",
      brand: "Intel NUC",
      basePrice: 599.99,
      variants: 1,
      description: "Compact and versatile computing solution.",
      id: "CO020",
    },
    {
      name: "Monitor Ultrawide 34 inch",
      brand: "Dell",
      basePrice: 599.99,
      variants: 1,
      description: "Expansive view for productivity and gaming.",
      id: "CO021",
    },
    {
      name: "Monitor Gaming 144Hz",
      brand: "ASUS",
      basePrice: 299.99,
      variants: 1,
      description: "Fluid motion for competitive gaming.",
      id: "CO022",
    },
    {
      name: "Monitor Arm Dual",
      brand: "VIVO",
      basePrice: 39.99,
      variants: 1,
      description: "Optimize your desk space.",
      id: "CO023",
    },
    {
      name: "Webcam 4K",
      brand: "Logitech",
      basePrice: 199.99,
      variants: 1,
      description: "Ultra-high definition for professional use.",
      id: "CO024",
    },
    {
      name: "USB Hub 10-Port",
      brand: "Anker",
      basePrice: 49.99,
      variants: 1,
      description: "Connect multiple devices simultaneously.",
      id: "CO025",
    },
    {
      name: "KVM Switch 2-Port",
      brand: "IOGEAR",
      basePrice: 39.99,
      variants: 1,
      description: "Control multiple computers with one set of peripherals.",
      id: "CO026",
    },
    {
      name: "Cable Management Kit",
      brand: "JOTO",
      basePrice: 14.99,
      variants: 1,
      description: "Tidy up your workspace.",
      id: "CO027",
    },
    {
      name: "Surge Protector 12 Outlet",
      brand: "Belkin",
      basePrice: 29.99,
      variants: 1,
      description: "Protect your electronics from power surges.",
      id: "CO028",
    },
    {
      name: "UPS Battery Backup 1500VA",
      brand: "APC",
      basePrice: 199.99,
      variants: 1,
      description: "Ensure uninterrupted power for your devices.",
      id: "CO029",
    },
    {
      name: "External DVD Drive",
      brand: "LG",
      basePrice: 29.99,
      variants: 1,
      description: "Read and write CDs and DVDs.",
      id: "CO030",
    },
    {
      name: "Card Reader USB 3.0",
      brand: "Transcend",
      basePrice: 14.99,
      variants: 1,
      description: "Quickly transfer files from memory cards.",
      id: "CO031",
    },
    {
      name: "M.2 SSD 2TB",
      brand: "Samsung",
      basePrice: 189.99,
      variants: 1,
      description: "High-speed storage for modern systems.",
      id: "CO032",
    },
    {
      name: "External SSD 1TB",
      brand: "Samsung",
      basePrice: 129.99,
      variants: 1,
      description: "Portable and fast solid-state drive.",
      id: "CO033",
    },
    {
      name: "RAM 32GB DDR5",
      brand: "G.Skill",
      basePrice: 139.99,
      variants: 1,
      description: "Maximum performance for demanding applications.",
      id: "CO034",
    },
    {
      name: "Motherboard ATX",
      brand: "ASUS",
      basePrice: 249.99,
      variants: 1,
      description: "The foundation for your custom PC build.",
      id: "CO035",
    },
    {
      name: "CPU Intel i9",
      brand: "Intel",
      basePrice: 589.99,
      variants: 1,
      description: "Top-tier processor for extreme performance.",
      id: "CO036",
    },
    {
      name: "CPU Cooler RGB",
      brand: "Cooler Master",
      basePrice: 89.99,
      variants: 1,
      description: "Keep your CPU cool under load.",
      id: "CO037",
    },
    {
      name: "Power Supply 850W",
      brand: "EVGA",
      basePrice: 129.99,
      variants: 1,
      description: "Reliable power for high-performance systems.",
      id: "CO038",
    },
    {
      name: "PC Case RGB",
      brand: "NZXT",
      basePrice: 149.99,
      variants: 1,
      description: "Showcase your components with style.",
      id: "CO039",
    },
    {
      name: "Thermal Paste",
      brand: "Arctic",
      basePrice: 9.99,
      variants: 1,
      description: "Ensure efficient heat transfer.",
      id: "CO040",
    },
    {
      name: "Fan RGB 3-Pack",
      brand: "Corsair",
      basePrice: 49.99,
      variants: 1,
      description: "Enhance cooling and aesthetics.",
      id: "CO041",
    },
    {
      name: "WiFi Adapter USB",
      brand: "TP-Link",
      basePrice: 19.99,
      variants: 1,
      description: "Upgrade your computer's wireless connection.",
      id: "CO042",
    },
    {
      name: "Bluetooth Adapter",
      brand: "ASUS",
      basePrice: 14.99,
      variants: 1,
      description: "Add Bluetooth capability to your PC.",
      id: "CO043",
    },
    {
      name: "Sound Card External",
      brand: "Creative",
      basePrice: 79.99,
      variants: 1,
      description: "Improve your audio experience.",
      id: "CO044",
    },
    {
      name: "Capture Card HDMI",
      brand: "Elgato",
      basePrice: 179.99,
      variants: 1,
      description: "Stream high-quality video.",
      id: "CO045",
    },
    {
      name: "Drawing Tablet",
      brand: "Wacom",
      basePrice: 249.99,
      variants: 1,
      description: "Unleash your creativity digitally.",
      id: "CO046",
    },
    {
      name: "Gaming Mouse Pad XL",
      brand: "SteelSeries",
      basePrice: 39.99,
      variants: 1,
      description: "Ample space for precise mouse movements.",
      id: "CO047",
    },
    {
      name: "Wrist Rest Keyboard",
      brand: "Glorious",
      basePrice: 19.99,
      variants: 1,
      description: "Comfortable typing experience.",
      id: "CO048",
    },
    {
      name: "Monitor Privacy Filter",
      brand: "3M",
      basePrice: 49.99,
      variants: 1,
      description: "Keep your screen content confidential.",
      id: "CO049",
    },
    {
      name: "Laptop Privacy Screen",
      brand: "Kensington",
      basePrice: 39.99,
      variants: 1,
      description: "Protect your sensitive information.",
      id: "CO050",
    },
  ],
  "Clothing, Shoes & Jewelry": [
    {
      name: "Men's Athletic Shoes",
      brand: "Nike",
      basePrice: 89.99,
      variants: 4,
      description: "Comfortable and stylish athletic footwear.",
      id: "CL001",
    },
    {
      name: "Women's Running Shoes",
      brand: "Adidas",
      basePrice: 79.99,
      variants: 4,
      description: "Lightweight and supportive for your runs.",
      id: "CL002",
    },
    {
      name: "Men's Dress Shirt",
      brand: "Calvin Klein",
      basePrice: 49.99,
      variants: 3,
      description: "Classic style for any occasion.",
      id: "CL003",
    },
    {
      name: "Women's Yoga Pants",
      brand: "Lululemon",
      basePrice: 98.0,
      variants: 4,
      description: "Soft and flexible for ultimate comfort.",
      id: "CL004",
    },
    {
      name: "Men's Jeans Slim Fit",
      brand: "Levi's",
      basePrice: 59.99,
      variants: 4,
      description: "Timeless denim with a modern cut.",
      id: "CL005",
    },
    {
      name: "Women's Handbag",
      brand: "Michael Kors",
      basePrice: 199.99,
      variants: 2,
      description: "Chic accessory to complete your look.",
      id: "CL006",
    },
    {
      name: "Men's Leather Wallet",
      brand: "Fossil",
      basePrice: 39.99,
      variants: 1,
      description: "Genuine leather for durability and style.",
      id: "CL007",
    },
    {
      name: "Women's Sunglasses",
      brand: "Ray-Ban",
      basePrice: 149.99,
      variants: 2,
      description: "Iconic style for sun protection.",
      id: "CL008",
    },
    {
      name: "Men's Winter Jacket",
      brand: "The North Face",
      basePrice: 199.99,
      variants: 3,
      description: "Stay warm and protected in cold weather.",
      id: "CL009",
    },
    {
      name: "Women's Dress",
      brand: "Calvin Klein",
      basePrice: 89.99,
      variants: 4,
      description: "Elegant and versatile dresses.",
      id: "CL010",
    },
    {
      name: "Kids Sneakers",
      brand: "Nike",
      basePrice: 49.99,
      variants: 4,
      description: "Durable and fun footwear for children.",
      id: "CL011",
    },
    {
      name: "Men's T-Shirt Pack of 3",
      brand: "Hanes",
      basePrice: 24.99,
      variants: 1,
      description: "Everyday essentials for comfort.",
      id: "CL012",
    },
    {
      name: "Women's Leggings",
      brand: "Under Armour",
      basePrice: 49.99,
      variants: 4,
      description: "Performance wear for workouts and casual use.",
      id: "CL013",
    },
    {
      name: "Gold Necklace 18k",
      brand: "Ross-Simons",
      basePrice: 299.99,
      variants: 1,
      description: "Timeless elegance in fine jewelry.",
      id: "CL014",
    },
    {
      name: "Silver Earrings",
      brand: "Pandora",
      basePrice: 79.99,
      variants: 1,
      description: "Beautifully crafted sterling silver earrings.",
      id: "CL015",
    },
  ],
  "Home & Kitchen": [
    {
      name: "Coffee Maker Programmable",
      brand: "Cuisinart",
      basePrice: 79.99,
      variants: 2,
      description: "Wake up to freshly brewed coffee.",
      id: "HK001",
    },
    {
      name: "Blender High Speed",
      brand: "Vitamix",
      basePrice: 399.99,
      variants: 1,
      description: "Powerful blending for smoothies and more.",
      id: "HK002",
    },
    {
      name: "Air Fryer 5.8 Quart",
      brand: "Ninja",
      basePrice: 129.99,
      variants: 1,
      description: "Healthier cooking with crispy results.",
      id: "HK003",
    },
    {
      name: "Vacuum Cleaner Robot",
      brand: "iRobot",
      basePrice: 399.99,
      variants: 1,
      description: "Automated cleaning for a spotless home.",
      id: "HK004",
    },
    {
      name: "Instant Pot 6 Quart",
      brand: "Instant Pot",
      basePrice: 89.99,
      variants: 1,
      description: "Multifunctional cooker for quick meals.",
      id: "HK005",
    },
    {
      name: "Knife Set 15-Piece",
      brand: "Cuisinart",
      basePrice: 59.99,
      variants: 1,
      description: "Professional quality knives for your kitchen.",
      id: "HK006",
    },
    {
      name: "Non-Stick Cookware Set",
      brand: "T-fal",
      basePrice: 99.99,
      variants: 1,
      description: "Effortless cooking and easy cleanup.",
      id: "HK007",
    },
    {
      name: "Food Processor",
      brand: "Cuisinart",
      basePrice: 149.99,
      variants: 1,
      description: "Simplify food preparation.",
      id: "HK008",
    },
    {
      name: "Toaster 4-Slice",
      brand: "Breville",
      basePrice: 199.99,
      variants: 1,
      description: "Perfect toast every time.",
      id: "HK009",
    },
    {
      name: "Stand Mixer",
      brand: "KitchenAid",
      basePrice: 379.99,
      variants: 2,
      description: "Your ultimate baking companion.",
      id: "HK010",
    },
    {
      name: "Dish Drying Rack",
      brand: "Simplehuman",
      basePrice: 49.99,
      variants: 1,
      description: "Efficient and stylish drying solution.",
      id: "HK011",
    },
    {
      name: "Cutting Board Set",
      brand: "Gorilla Grip",
      basePrice: 29.99,
      variants: 1,
      description: "Durable and hygienic cutting surfaces.",
      id: "HK012",
    },
    {
      name: "Spice Rack with Spices",
      brand: "Kamenstein",
      basePrice: 39.99,
      variants: 1,
      description: "Organized and accessible spices.",
      id: "HK013",
    },
    {
      name: "Trash Can 13 Gallon",
      brand: "Simplehuman",
      basePrice: 129.99,
      variants: 1,
      description: "Elegant and functional waste disposal.",
      id: "HK014",
    },
    {
      name: "Kitchen Scale Digital",
      brand: "Etekcity",
      basePrice: 19.99,
      variants: 1,
      description: "Precise measurements for cooking and baking.",
      id: "HK015",
    },
  ],
  Furniture: [
    {
      name: "Office Chair Ergonomic",
      brand: "Herman Miller",
      basePrice: 799.99,
      variants: 3,
      description: "Unmatched comfort and support for your workday.",
      id: "FU001",
    },
    {
      name: "Standing Desk Electric",
      brand: "FlexiSpot",
      basePrice: 399.99,
      variants: 2,
      description: "Promote a healthier work posture.",
      id: "FU002",
    },
    {
      name: "Sofa 3-Seater",
      brand: "Ashley",
      basePrice: 899.99,
      variants: 3,
      description: "Comfortable and stylish seating for your living room.",
      id: "FU003",
    },
    {
      name: "Queen Mattress Memory Foam",
      brand: "Zinus",
      basePrice: 299.99,
      variants: 1,
      description: "Supportive and comfortable sleep.",
      id: "FU004",
    },
    {
      name: "Bed Frame Queen",
      brand: "Zinus",
      basePrice: 199.99,
      variants: 1,
      description: "Sturdy and modern foundation for your bed.",
      id: "FU005",
    },
    {
      name: "Bookshelf 5-Tier",
      brand: "IKEA",
      basePrice: 79.99,
      variants: 1,
      description: "Stylish storage for books and decor.",
      id: "FU006",
    },
    {
      name: "Coffee Table Modern",
      brand: "Walker Edison",
      basePrice: 149.99,
      variants: 2,
      description: "Centerpiece for your living space.",
      id: "FU007",
    },
    {
      name: "TV Stand 65 inch",
      brand: "Ameriwood",
      basePrice: 199.99,
      variants: 1,
      description: "Organize your entertainment center.",
      id: "FU008",
    },
    {
      name: "Nightstand Set of 2",
      brand: "Yaheetech",
      basePrice: 89.99,
      variants: 1,
      description: "Convenient bedside storage.",
      id: "FU009",
    },
    {
      name: "Dining Table Set 5-Piece",
      brand: "Best Choice",
      basePrice: 399.99,
      variants: 1,
      description: "Perfect for family meals.",
      id: "FU010",
    },
    {
      name: "Recliner Chair",
      brand: "La-Z-Boy",
      basePrice: 599.99,
      variants: 1,
      description: "Ultimate relaxation and comfort.",
      id: "FU011",
    },
    {
      name: "Desk Lamp LED",
      brand: "TaoTronics",
      basePrice: 39.99,
      variants: 2,
      description: "Adjustable lighting for your workspace.",
      id: "FU012",
    },
    {
      name: "Floor Lamp",
      brand: "Brightech",
      basePrice: 59.99,
      variants: 1,
      description: "Stylish illumination for any room.",
      id: "FU013",
    },
    {
      name: "File Cabinet 3-Drawer",
      brand: "Lorell",
      basePrice: 129.99,
      variants: 1,
      description: "Keep your important documents organized.",
      id: "FU014",
    },
    {
      name: "Bar Stools Set of 2",
      brand: "Flash Furniture",
      basePrice: 99.99,
      variants: 1,
      description: "Modern seating for your kitchen island or bar.",
      id: "FU015",
    },
  ],
  "Beauty & Personal Care": [
    {
      name: "Pro Filt'r Soft Matte Longwear Foundation",
      brand: "Fenty Beauty",
      basePrice: 38,
      variants: 3,
      description: "Flawless matte finish for all skin types.",
      id: "BE001",
    },
    {
      name: "Charlotte's Magic Cream",
      brand: "Charlotte Tilbury",
      basePrice: 100,
      variants: 1,
      description: "Intensely hydrating and revitalizing moisturizer.",
      id: "BE002",
    },
    {
      name: "Rose Gold Remastered Eyeshadow Palette",
      brand: "Huda Beauty",
      basePrice: 67,
      variants: 1,
      description: "Versatile shades for stunning eye looks.",
      id: "BE003",
    },
    {
      name: "Retro Matte Lipstick - Ruby Woo",
      brand: "MAC",
      basePrice: 20,
      variants: 2,
      description: "Iconic matte red lipstick.",
      id: "BE004",
    },
    {
      name: "Radiant Creamy Concealer",
      brand: "NARS",
      basePrice: 32,
      variants: 3,
      description: "Full coverage concealer for a natural finish.",
      id: "BE005",
    },
    {
      name: "Brow Wiz Micro-Defining Pencil",
      brand: "Anastasia Beverly Hills",
      basePrice: 25,
      variants: 3,
      description: "Precisely shapes and defines eyebrows.",
      id: "BE006",
    },
    {
      name: "Better Than Sex Mascara",
      brand: "Too Faced",
      basePrice: 27,
      variants: 1,
      description: "Volumizing mascara for dramatic lashes.",
      id: "BE007",
    },
    {
      name: "Naked Reloaded Eyeshadow Palette",
      brand: "Urban Decay",
      basePrice: 54,
      variants: 1,
      description: "Neutral shades for endless makeup possibilities.",
      id: "BE008",
    },
    {
      name: "Fit Me Matte + Poreless Foundation",
      brand: "Maybelline",
      basePrice: 7.98,
      variants: 3,
      description: "Affordable foundation for a natural look.",
      id: "BE009",
    },
    {
      name: "Mineral Infused Volcanic Ash Pore Minimizing Primer",
      brand: "e.l.f.",
      basePrice: 9,
      variants: 1,
      description: "Smooths and primes skin for makeup.",
      id: "BE010",
    },
    {
      name: "Dewy Finish Makeup Setting Spray",
      brand: "NYX Professional Makeup",
      basePrice: 8,
      variants: 1,
      description: "Keeps makeup fresh and radiant all day.",
      id: "BE011",
    },
    {
      name: "Super Shock Shadow",
      brand: "ColourPop",
      basePrice: 6,
      variants: 5,
      description: "Unique creamy-powder formula eyeshadow.",
      id: "BE012",
    },
    {
      name: "Soft Pinch Liquid Blush",
      brand: "Rare Beauty",
      basePrice: 23,
      variants: 4,
      description: "Weightless liquid blush for a natural flush.",
      id: "BE013",
    },
    {
      name: "No. 3 Hair Perfector",
      brand: "Olaplex",
      basePrice: 28,
      variants: 1,
      description: "Repairs and strengthens damaged hair.",
      id: "BE014",
    },
    {
      name: "Airwrap Multi-Styler Complete",
      brand: "Dyson",
      basePrice: 549.99,
      variants: 1,
      description: "Innovative styling tool using air multipliers.",
      id: "BE015",
    },
    {
      name: "C-Firma Fresh Day Serum",
      brand: "Drunk Elephant",
      basePrice: 80,
      variants: 1,
      description: "Potent Vitamin C serum for brighter skin.",
      id: "BE016",
    },
    {
      name: "10% + Zinc PCA Serum",
      brand: "The Ordinary",
      basePrice: 5.9,
      variants: 1,
      description: "Balances excess oil and reduces blemishes.",
      id: "BE017",
    },
    {
      name: "Moisturizing Cream",
      brand: "CeraVe",
      basePrice: 19.99,
      variants: 1,
      description: "Intense hydration for dry skin.",
      id: "BE018",
    },
    {
      name: "Anthelios Melt-in Milk Sunscreen SPF 60",
      brand: "La Roche-Posay",
      basePrice: 35.99,
      variants: 1,
      description: "Broad-spectrum sun protection.",
      id: "BE019",
    },
    {
      name: "Hydro Boost Water Gel",
      brand: "Neutrogena",
      basePrice: 18.97,
      variants: 1,
      description: "Lightweight gel moisturizer for hydration.",
      id: "BE020",
    },
  ],
  "Grocery & Gourmet Food": [
    {
      name: "Organic Whole Bean Coffee",
      brand: "Lavazza",
      basePrice: 24.99,
      variants: 3,
      description: "Rich and aromatic coffee beans.",
      id: "GR001",
    },
    {
      name: "100% Whey Protein Powder",
      brand: "Optimum Nutrition",
      basePrice: 59.99,
      variants: 2,
      description: "High-quality protein for muscle recovery.",
      id: "GR002",
    },
    {
      name: "Extra Virgin Olive Oil",
      brand: "Kirkland Signature",
      basePrice: 19.99,
      variants: 1,
      description: "Premium olive oil for cooking and dressing.",
      id: "GR003",
    },
    {
      name: "Roasted Salted Mixed Nuts",
      brand: "Planters",
      basePrice: 29.99,
      variants: 1,
      description: "A delicious and satisfying snack.",
      id: "GR004",
    },
    {
      name: "Quest Protein Bars",
      brand: "Quest Nutrition",
      basePrice: 24.99,
      variants: 2,
      description: "High protein, low carb snack bars.",
      id: "GR005",
    },
    {
      name: "Green Tea Bags",
      brand: "Bigelow",
      basePrice: 9.99,
      variants: 1,
      description: "Refreshing and healthy tea.",
      id: "GR006",
    },
    {
      name: "Pasta Variety Pack",
      brand: "Barilla",
      basePrice: 14.99,
      variants: 1,
      description: "Assorted pasta shapes for versatile meals.",
      id: "GR007",
    },
    {
      name: "Organic Tomato Sauce",
      brand: "Rao's Homemade",
      basePrice: 29.99,
      variants: 1,
      description: "Authentic Italian tomato sauce.",
      id: "GR008",
    },
    {
      name: "Raw & Unfiltered Honey",
      brand: "Nature Nate's",
      basePrice: 19.99,
      variants: 1,
      description: "Natural sweetener with beneficial properties.",
      id: "GR009",
    },
    {
      name: "Creamy Almond Butter",
      brand: "Justin's",
      basePrice: 11.99,
      variants: 1,
      description: "Nutritious and delicious almond spread.",
      id: "GR010",
    },
  ],
  "Sports & Outdoors": [
    {
      name: "Eco-Friendly Yoga Mat",
      brand: "Manduka",
      basePrice: 79.99,
      variants: 2,
      description: "Superior grip and comfort for your practice.",
      id: "SO001",
    },
    {
      name: "Adjustable Dumbbell Set",
      brand: "Bowflex",
      basePrice: 399.99,
      variants: 1,
      description: "Space-saving weights for home workouts.",
      id: "SO002",
    },
    {
      name: "Resistance Bands Set",
      brand: "Fit Simplify",
      basePrice: 12.99,
      variants: 1,
      description: "Versatile tool for strength training.",
      id: "SO003",
    },
    {
      name: "Folding Treadmill",
      brand: "NordicTrack",
      basePrice: 799.99,
      variants: 1,
      description: "Compact and effective cardio machine.",
      id: "SO004",
    },
    {
      name: "Indoor Exercise Bike",
      brand: "Peloton",
      basePrice: 1495.0,
      variants: 1,
      description: "Immersive cycling experience at home.",
      id: "SO005",
    },
    {
      name: "4-Person Camping Tent",
      brand: "Coleman",
      basePrice: 129.99,
      variants: 1,
      description: "Spacious and durable shelter for outdoor adventures.",
      id: "SO006",
    },
    {
      name: "Warm Sleeping Bag",
      brand: "TETON Sports",
      basePrice: 49.99,
      variants: 1,
      description: "Comfortable sleep in cool conditions.",
      id: "SO007",
    },
    {
      name: "Hiking Backpack 50L",
      brand: "Osprey",
      basePrice: 199.99,
      variants: 1,
      description: "Ergonomic design for multi-day treks.",
      id: "SO008",
    },
    {
      name: "Insulated Water Bottle 40oz",
      brand: "Hydro Flask",
      basePrice: 44.95,
      variants: 3,
      description: "Keeps drinks cold for hours.",
      id: "SO009",
    },
    {
      name: "Mountain Bike",
      brand: "Schwinn",
      basePrice: 399.99,
      variants: 2,
      description: "Durable bike for trails and rugged terrain.",
      id: "SO010",
    },
    {
      name: "Inflatable Kayak",
      brand: "Intex",
      basePrice: 299.99,
      variants: 1,
      description: "Portable watercraft for recreational use.",
      id: "SO011",
    },
    {
      name: "Complete Golf Club Set",
      brand: "Callaway",
      basePrice: 599.99,
      variants: 1,
      description: "All-in-one set for beginner golfers.",
      id: "SO012",
    },
    {
      name: "Official Size Basketball",
      brand: "Spalding",
      basePrice: 29.99,
      variants: 1,
      description: "High-quality ball for indoor and outdoor play.",
      id: "SO013",
    },
    {
      name: "Soccer Ball",
      brand: "Adidas",
      basePrice: 24.99,
      variants: 1,
      description: "Durable ball for practice and games.",
      id: "SO014",
    },
    {
      name: "Fishing Rod and Reel Combo",
      brand: "Ugly Stik",
      basePrice: 49.99,
      variants: 1,
      description: "Reliable gear for anglers.",
      id: "SO015",
    },
  ],
  "Tools & Home Improvement": [
    {
      name: "Cordless Drill Driver Kit",
      brand: "DeWalt",
      basePrice: 149.99,
      variants: 1,
      description: "Powerful and versatile for DIY projects.",
      id: "TH001",
    },
    {
      name: "Circular Saw",
      brand: "Makita",
      basePrice: 129.99,
      variants: 1,
      description: "Precise cuts for various materials.",
      id: "TH002",
    },
    {
      name: "Tool Set 200-Piece",
      brand: "Craftsman",
      basePrice: 199.99,
      variants: 1,
      description: "Comprehensive collection for home repairs.",
      id: "TH003",
    },
    {
      name: "6ft Folding Ladder",
      brand: "Little Giant",
      basePrice: 199.99,
      variants: 1,
      description: "Safe and stable for reaching heights.",
      id: "TH004",
    },
    {
      name: "Rolling Tool Chest",
      brand: "Husky",
      basePrice: 299.99,
      variants: 1,
      description: "Organized storage for your tools.",
      id: "TH005",
    },
    {
      name: "HVLP Paint Sprayer",
      brand: "Graco",
      basePrice: 349.99,
      variants: 1,
      description: "Professional finish for painting projects.",
      id: "TH006",
    },
    {
      name: "Electronic Stud Finder",
      brand: "Zircon",
      basePrice: 29.99,
      variants: 1,
      description: "Locate studs and wires easily.",
      id: "TH007",
    },
    {
      name: "25ft Tape Measure",
      brand: "Stanley",
      basePrice: 14.99,
      variants: 1,
      description: "Durable and accurate measuring tool.",
      id: "TH008",
    },
    {
      name: "Claw Hammer",
      brand: "Estwing",
      basePrice: 24.99,
      variants: 1,
      description: "Reliable tool for driving and removing nails.",
      id: "TH009",
    },
    {
      name: "Screwdriver Set",
      brand: "Klein Tools",
      basePrice: 39.99,
      variants: 1,
      description: "High-quality drivers for various tasks.",
      id: "TH010",
    },
    {
      name: "Laser Level",
      brand: "Bosch",
      basePrice: 89.99,
      variants: 1,
      description: "Precise alignment for construction and decorating.",
      id: "TH011",
    },
    {
      name: "LED Work Light",
      brand: "DEWALT",
      basePrice: 49.99,
      variants: 1,
      description: "Bright illumination for job sites.",
      id: "TH012",
    },
    {
      name: "6 Gallon Shop Vacuum",
      brand: "Shop-Vac",
      basePrice: 79.99,
      variants: 1,
      description: "Powerful suction for messes and cleanup.",
      id: "TH013",
    },
    {
      name: "Portable Generator 2000W",
      brand: "WEN",
      basePrice: 449.99,
      variants: 1,
      description: "Reliable power source for emergencies or outdoors.",
      id: "TH014",
    },
    {
      name: "Electric Pressure Washer",
      brand: "Sun Joe",
      basePrice: 149.99,
      variants: 1,
      description: "Powerful cleaning for surfaces and vehicles.",
      id: "TH015",
    },
    {
      name: "Tubular Skylight Kit",
      brand: "Velux",
      basePrice: 349.99,
      variants: 3,
      description: "Bring natural light into dark spaces.",
      id: "TH020",
    },
    {
      name: "Fixed Deck Mount Skylight",
      brand: "Velux",
      basePrice: 449.99,
      variants: 4,
      description: "Energy-efficient natural lighting solution.",
      id: "TH021",
    },
    {
      name: "Venting Curb Mount Skylight",
      brand: "Velux",
      basePrice: 549.99,
      variants: 3,
      description: "Operable skylight for ventilation and light.",
      id: "TH022",
    },
    {
      name: "Solar Powered Skylight",
      brand: "Velux",
      basePrice: 799.99,
      variants: 2,
      description: "Opens automatically with solar power.",
      id: "TH023",
    },
    {
      name: "Sun Tunnel Skylight",
      brand: "ODL",
      basePrice: 229.99,
      variants: 2,
      description: "Flexible tubing brings light anywhere.",
      id: "TH024",
    },
    {
      name: "Flat Roof Skylight",
      brand: "Fakro",
      basePrice: 499.99,
      variants: 3,
      description: "Perfect for modern flat roof designs.",
      id: "TH025",
    },
    {
      name: "Electric Opening Skylight",
      brand: "Fakro",
      basePrice: 649.99,
      variants: 2,
      description: "Remote controlled for convenience.",
      id: "TH026",
    },
    {
      name: "Skylight Blinds",
      brand: "Velux",
      basePrice: 149.99,
      variants: 5,
      description: "Light filtering and blackout options.",
      id: "TH027",
    },
    {
      name: "Skylight Flashing Kit",
      brand: "Velux",
      basePrice: 89.99,
      variants: 4,
      description: "Waterproof installation kit.",
      id: "TH028",
    },
    {
      name: "Skylight Shaft Kit",
      brand: "Velux",
      basePrice: 199.99,
      variants: 3,
      description: "Pre-made shaft for easy installation.",
      id: "TH029",
    },
    {
      name: "Cordless Impact Driver",
      brand: "Milwaukee",
      basePrice: 179.99,
      variants: 2,
      description: "High torque for heavy duty fastening.",
      id: "TH030",
    },
    {
      name: "Table Saw 10 inch",
      brand: "DEWALT",
      basePrice: 599.99,
      variants: 1,
      description: "Professional woodworking tool.",
      id: "TH031",
    },
    {
      name: "Miter Saw 12 inch",
      brand: "Bosch",
      basePrice: 429.99,
      variants: 2,
      description: "Precision cutting for trim work.",
      id: "TH032",
    },
    {
      name: "Jigsaw Corded",
      brand: "Makita",
      basePrice: 89.99,
      variants: 1,
      description: "Versatile for curved cuts.",
      id: "TH033",
    },
    {
      name: "Orbital Sander",
      brand: "BLACK+DECKER",
      basePrice: 49.99,
      variants: 1,
      description: "Smooth finishing tool.",
      id: "TH034",
    },
    {
      name: "Router with Table",
      brand: "Bosch",
      basePrice: 249.99,
      variants: 1,
      description: "Professional edge forming.",
      id: "TH035",
    },
    {
      name: "Reciprocating Saw",
      brand: "DEWALT",
      basePrice: 139.99,
      variants: 2,
      description: "Demolition and cutting power.",
      id: "TH036",
    },
    {
      name: "Angle Grinder 4.5 inch",
      brand: "Makita",
      basePrice: 79.99,
      variants: 1,
      description: "Grinding and cutting metal.",
      id: "TH037",
    },
    {
      name: "Nail Gun Brad Nailer",
      brand: "BOSTITCH",
      basePrice: 159.99,
      variants: 1,
      description: "Fast and precise fastening.",
      id: "TH038",
    },
    {
      name: "Framing Nailer",
      brand: "Hitachi",
      basePrice: 299.99,
      variants: 1,
      description: "Heavy duty construction tool.",
      id: "TH039",
    },
    {
      name: "Air Compressor 6 Gallon",
      brand: "DEWALT",
      basePrice: 249.99,
      variants: 1,
      description: "Powers pneumatic tools.",
      id: "TH040",
    },
    {
      name: "Welding Machine MIG",
      brand: "Lincoln Electric",
      basePrice: 599.99,
      variants: 1,
      description: "Professional metal joining.",
      id: "TH041",
    },
    {
      name: "Tile Cutter 24 inch",
      brand: "QEP",
      basePrice: 189.99,
      variants: 1,
      description: "Precision tile cutting.",
      id: "TH042",
    },
    {
      name: "Wet Tile Saw",
      brand: "DEWALT",
      basePrice: 449.99,
      variants: 1,
      description: "Professional tile installation.",
      id: "TH043",
    },
    {
      name: "Planer Handheld",
      brand: "Makita",
      basePrice: 119.99,
      variants: 1,
      description: "Smooth wood surfaces.",
      id: "TH044",
    },
    {
      name: "Belt Sander",
      brand: "DEWALT",
      basePrice: 149.99,
      variants: 1,
      description: "Rapid material removal.",
      id: "TH045",
    },
    {
      name: "Oscillating Multi-Tool",
      brand: "Bosch",
      basePrice: 99.99,
      variants: 2,
      description: "Versatile cutting and sanding.",
      id: "TH046",
    },
    {
      name: "Heat Gun",
      brand: "DEWALT",
      basePrice: 69.99,
      variants: 1,
      description: "Paint stripping and shrinking.",
      id: "TH047",
    },
    {
      name: "Glue Gun Heavy Duty",
      brand: "Surebonder",
      basePrice: 19.99,
      variants: 1,
      description: "Industrial strength bonding.",
      id: "TH048",
    },
    {
      name: "Socket Set 100-Piece",
      brand: "Craftsman",
      basePrice: 129.99,
      variants: 1,
      description: "Complete mechanic tool set.",
      id: "TH049",
    },
    {
      name: "Wrench Set Combination",
      brand: "GearWrench",
      basePrice: 89.99,
      variants: 1,
      description: "SAE and metric sizes.",
      id: "TH050",
    },
  ],
  Automotive: [
    {
      name: "Car Battery",
      brand: "Interstate",
      basePrice: 149.99,
      variants: 1,
      description: "Reliable power for your vehicle.",
      id: "AU001",
    },
    {
      name: "5W-30 Synthetic Motor Oil 5 Quart",
      brand: "Mobil 1",
      basePrice: 29.99,
      variants: 1,
      description: "High-performance engine protection.",
      id: "AU002",
    },
    {
      name: "Windshield Wipers Pair",
      brand: "Bosch",
      basePrice: 24.99,
      variants: 3,
      description: "Clear visibility in all weather conditions.",
      id: "AU003",
    },
    {
      name: "Waterproof Car Cover",
      brand: "Kayme",
      basePrice: 59.99,
      variants: 1,
      description: "Protect your vehicle from the elements.",
      id: "AU004",
    },
    {
      name: "Portable Jump Starter",
      brand: "NOCO",
      basePrice: 99.99,
      variants: 1,
      description: "Jump start your car without another vehicle.",
      id: "AU005",
    },
    {
      name: "Portable Tire Inflator",
      brand: "AstroAI",
      basePrice: 29.99,
      variants: 1,
      description: "Maintain optimal tire pressure on the go.",
      id: "AU006",
    },
    {
      name: "All-Weather Floor Mats",
      brand: "WeatherTech",
      basePrice: 129.99,
      variants: 1,
      description: "Durable protection for your car's interior.",
      id: "AU007",
    },
    {
      name: "Car Vacuum Cleaner",
      brand: "ThisWorx",
      basePrice: 34.99,
      variants: 1,
      description: "Powerful suction for cleaning your car.",
      id: "AU008",
    },
    {
      name: "Dash Cam 1080p",
      brand: "VIOFO",
      basePrice: 99.99,
      variants: 1,
      description: "Record your drives for safety and evidence.",
      id: "AU009",
    },
    {
      name: "Seat Covers Set",
      brand: "FH Group",
      basePrice: 49.99,
      variants: 1,
      description: "Protect and upgrade your car's seats.",
      id: "AU010",
    },
    {
      name: "Spark Plugs Set of 4",
      brand: "NGK",
      basePrice: 19.99,
      variants: 1,
      description: "Ensure optimal engine performance.",
      id: "AU011",
    },
    {
      name: "High-Flow Air Filter",
      brand: "K&N",
      basePrice: 49.99,
      variants: 1,
      description: "Improve engine efficiency.",
      id: "AU012",
    },
    {
      name: "Front Brake Pads",
      brand: "Bosch",
      basePrice: 59.99,
      variants: 1,
      description: "Reliable stopping power.",
      id: "AU013",
    },
    {
      name: "Premium Car Wax",
      brand: "Meguiar's",
      basePrice: 19.99,
      variants: 1,
      description: "Protect and shine your car's finish.",
      id: "AU014",
    },
    {
      name: "H11 Headlight Bulbs",
      brand: "Sylvania",
      basePrice: 24.99,
      variants: 1,
      description: "Brighter illumination for safer night driving.",
      id: "AU015",
    },
  ],
  "Toys & Games": [
    {
      name: "Star Wars Millennium Falcon",
      brand: "LEGO",
      basePrice: 79.99,
      variants: 1,
      description: "Build and play with this iconic spaceship.",
      id: "TG001",
    },
    {
      name: "Dreamhouse",
      brand: "Barbie",
      basePrice: 199.99,
      variants: 1,
      description: "The ultimate dream home for Barbie.",
      id: "TG002",
    },
    {
      name: "Hot Wheels City Track Set",
      brand: "Hot Wheels",
      basePrice: 49.99,
      variants: 1,
      description: "Expand your Hot Wheels world.",
      id: "TG003",
    },
    {
      name: "Monopoly Classic Board Game",
      brand: "Hasbro",
      basePrice: 29.99,
      variants: 1,
      description: "The timeless property trading game.",
      id: "TG004",
    },
    {
      name: "1000 Piece Jigsaw Puzzle",
      brand: "Ravensburger",
      basePrice: 19.99,
      variants: 5,
      description: "Challenging and rewarding puzzle.",
      id: "TG005",
    },
    {
      name: "RC Off-Road Truck",
      brand: "Traxxas",
      basePrice: 299.99,
      variants: 1,
      description: "High-performance remote-controlled vehicle.",
      id: "TG006",
    },
    {
      name: "Play-Doh Mega Pack",
      brand: "Play-Doh",
      basePrice: 19.99,
      variants: 1,
      description: "Creative fun with colorful modeling compound.",
      id: "TG007",
    },
    {
      name: "Marvel Legends Action Figure Set",
      brand: "Marvel",
      basePrice: 39.99,
      variants: 1,
      description: "Collect your favorite Marvel heroes.",
      id: "TG008",
    },
    {
      name: "Nerf N-Strike Elite Disruptor",
      brand: "Nerf",
      basePrice: 29.99,
      variants: 1,
      description: "Fast-blasting fun for outdoor play.",
      id: "TG009",
    },
    {
      name: "Teddy Bear Stuffed Animal",
      brand: "Melissa & Doug",
      basePrice: 24.99,
      variants: 1,
      description: "Soft and cuddly friend.",
      id: "TG010",
    },
    {
      name: "3-Wheel Kids Scooter",
      brand: "Razor",
      basePrice: 49.99,
      variants: 1,
      description: "Stable and fun scooter for younger children.",
      id: "TG011",
    },
    {
      name: "Baby Alive Interactive Doll",
      brand: "Baby Alive",
      basePrice: 59.99,
      variants: 1,
      description: "Doll that eats, drinks, and wets.",
      id: "TG012",
    },
    {
      name: "Building Blocks 500 Pieces",
      brand: "Mega Bloks",
      basePrice: 34.99,
      variants: 1,
      description: "Inspire creativity and construction.",
      id: "TG013",
    },
    {
      name: "Kids Art Set",
      brand: "Crayola",
      basePrice: 29.99,
      variants: 1,
      description: "Everything needed for artistic expression.",
      id: "TG014",
    },
    {
      name: "Wooden Chess Set",
      brand: "House of Staunton",
      basePrice: 79.99,
      variants: 1,
      description: "Classic strategy game with elegant pieces.",
      id: "TG015",
    },
  ],
  "Pet Supplies": [
    {
      name: "Dry Dog Food 30lb Bag",
      brand: "Blue Buffalo",
      basePrice: 54.99,
      variants: 2,
      description: "Wholesome nutrition for your canine companion.",
      id: "PS001",
    },
    {
      name: "Wet Cat Food Variety Pack",
      brand: "Fancy Feast",
      basePrice: 19.99,
      variants: 1,
      description: "Delicious flavors your cat will love.",
      id: "PS002",
    },
    {
      name: "Airline Approved Pet Carrier",
      brand: "Sherpa",
      basePrice: 69.99,
      variants: 1,
      description: "Safe and comfortable travel for your pet.",
      id: "PS003",
    },
    {
      name: "Orthopedic Dog Bed",
      brand: "Furhaven",
      basePrice: 49.99,
      variants: 1,
      description: "Supportive comfort for your dog's joints.",
      id: "PS004",
    },
    {
      name: "Automatic Self-Cleaning Litter Box",
      brand: "Litter-Robot",
      basePrice: 549.99,
      variants: 1,
      description: "Effortless and hygienic solution for cats.",
      id: "PS005",
    },
    {
      name: "Retractable Dog Leash",
      brand: "Flexi",
      basePrice: 29.99,
      variants: 2,
      description: "Controlled freedom for walks.",
      id: "PS006",
    },
    {
      name: "Multi-Level Cat Tree Tower",
      brand: "Go Pet Club",
      basePrice: 79.99,
      variants: 1,
      description: "Fun and stimulating play structure for cats.",
      id: "PS007",
    },
    {
      name: "Pet Water Fountain",
      brand: "Catit",
      basePrice: 34.99,
      variants: 1,
      description: "Encourages hydration with circulating water.",
      id: "PS008",
    },
    {
      name: "Durable Dog Toy Set",
      brand: "KONG",
      basePrice: 24.99,
      variants: 1,
      description: "Tough toys for energetic dogs.",
      id: "PS009",
    },
    {
      name: "Cat Scratching Post",
      brand: "SmartCat",
      basePrice: 39.99,
      variants: 1,
      description: "Satisfies your cat's natural scratching instincts.",
      id: "PS010",
    },
    {
      name: "Professional Pet Grooming Kit",
      brand: "Wahl",
      basePrice: 44.99,
      variants: 1,
      description: "Tools for at-home grooming.",
      id: "PS011",
    },
    {
      name: "LED Light-Up Dog Collar",
      brand: "Illumiseen",
      basePrice: 14.99,
      variants: 2,
      description: "Enhanced visibility for nighttime walks.",
      id: "PS012",
    },
    {
      name: "Pet Stroller",
      brand: "Pet Gear",
      basePrice: 149.99,
      variants: 1,
      description: "Comfortable transport for small pets.",
      id: "PS013",
    },
    {
      name: "10 Gallon Aquarium Starter Kit",
      brand: "Tetra",
      basePrice: 49.99,
      variants: 1,
      description: "Everything needed to start your aquarium.",
      id: "PS014",
    },
    {
      name: "Large Bird Cage",
      brand: "Yaheetech",
      basePrice: 89.99,
      variants: 1,
      description: "Spacious and secure home for birds.",
      id: "PS015",
    },
  ],
  "Health & Household": [
    {
      name: "Daily Multivitamin",
      brand: "Centrum",
      basePrice: 19.99,
      variants: 1,
      description: "Essential nutrients for daily wellness.",
      id: "HH001",
    },
    {
      name: "Vitamin D3 5000 IU",
      brand: "Nature Made",
      basePrice: 14.99,
      variants: 1,
      description: "Supports bone health and immune function.",
      id: "HH002",
    },
    {
      name: "Omega-3 Fish Oil",
      brand: "Nordic Naturals",
      basePrice: 39.99,
      variants: 1,
      description: "Supports heart and brain health.",
      id: "HH003",
    },
    {
      name: "Probiotic 50 Billion CFU",
      brand: "Garden of Life",
      basePrice: 44.99,
      variants: 1,
      description: "Supports digestive health.",
      id: "HH004",
    },
    {
      name: "Ready-to-Drink Protein Shake",
      brand: "Premier Protein",
      basePrice: 24.99,
      variants: 2,
      description: "Convenient protein boost.",
      id: "HH005",
    },
    {
      name: "Digital Blood Pressure Monitor",
      brand: "Omron",
      basePrice: 69.99,
      variants: 1,
      description: "Monitor your blood pressure at home.",
      id: "HH006",
    },
    {
      name: "Digital Forehead Thermometer",
      brand: "Braun",
      basePrice: 44.99,
      variants: 1,
      description: "Fast and accurate temperature readings.",
      id: "HH007",
    },
    {
      name: "First Aid Kit 299 Pieces",
      brand: "Johnson & Johnson",
      basePrice: 24.99,
      variants: 1,
      description: "Comprehensive kit for emergencies.",
      id: "HH008",
    },
    {
      name: "Hand Sanitizer Gel Gallon",
      brand: "Purell",
      basePrice: 39.99,
      variants: 1,
      description: "Kills germs and keeps hands clean.",
      id: "HH009",
    },
    {
      name: "KN95 Face Masks 50-Pack",
      brand: "KN95",
      basePrice: 19.99,
      variants: 1,
      description: "Protective masks for everyday use.",
      id: "HH010",
    },
    {
      name: "Electric Heating Pad",
      brand: "Sunbeam",
      basePrice: 29.99,
      variants: 1,
      description: "Soothing relief for muscle aches.",
      id: "HH011",
    },
    {
      name: "Cool Mist Humidifier",
      brand: "Levoit",
      basePrice: 49.99,
      variants: 1,
      description: "Adds moisture to the air for comfort.",
      id: "HH012",
    },
    {
      name: "HEPA Air Purifier",
      brand: "Coway",
      basePrice: 229.99,
      variants: 1,
      description: "Removes allergens and pollutants from the air.",
      id: "HH013",
    },
    {
      name: "Digital Bathroom Scale",
      brand: "Etekcity",
      basePrice: 24.99,
      variants: 1,
      description: "Accurate weight tracking.",
      id: "HH014",
    },
    {
      name: "Weekly Pill Organizer",
      brand: "MEDca",
      basePrice: 9.99,
      variants: 1,
      description: "Organize your daily medication.",
      id: "HH015",
    },
  ],
  "Office Products": [
    {
      name: "Copy Printer Paper 10 Ream Case",
      brand: "HP",
      basePrice: 49.99,
      variants: 1,
      description: "Essential paper for your office needs.",
      id: "OP001",
    },
    {
      name: "Gel Pen Set 12-Pack",
      brand: "Pilot",
      basePrice: 14.99,
      variants: 1,
      description: "Smooth writing for notes and documents.",
      id: "OP002",
    },
    {
      name: "Notebook Set 5-Pack",
      brand: "Moleskine",
      basePrice: 39.99,
      variants: 1,
      description: "High-quality notebooks for ideas and planning.",
      id: "OP003",
    },
    {
      name: "Assorted Sticky Notes",
      brand: "Post-it",
      basePrice: 19.99,
      variants: 1,
      description: "Versatile notes for reminders and organization.",
      id: "OP004",
    },
    {
      name: "Heavy Duty Stapler",
      brand: "Swingline",
      basePrice: 24.99,
      variants: 1,
      description: "Reliable stapling for thick stacks of paper.",
      id: "OP005",
    },
    {
      name: "Cross-Cut Paper Shredder",
      brand: "Fellowes",
      basePrice: 79.99,
      variants: 1,
      description: "Securely destroy sensitive documents.",
      id: "OP006",
    },
    {
      name: "Desk Organizer",
      brand: "Simplehouseware",
      basePrice: 29.99,
      variants: 1,
      description: "Keep your desk tidy and efficient.",
      id: "OP007",
    },
    {
      name: "Label Maker",
      brand: "Brother",
      basePrice: 49.99,
      variants: 1,
      description: "Create custom labels for organization.",
      id: "OP008",
    },
    {
      name: "Scientific Calculator",
      brand: "Texas Instruments",
      basePrice: 19.99,
      variants: 1,
      description: "Advanced functions for math and science.",
      id: "OP009",
    },
    {
      name: "3-Inch Binder 6-Pack",
      brand: "Avery",
      basePrice: 29.99,
      variants: 1,
      description: "Organize and store documents.",
      id: "OP010",
    },
    {
      name: "Highlighter Set",
      brand: "Sharpie",
      basePrice: 12.99,
      variants: 1,
      description: "Mark important information.",
      id: "OP011",
    },
    {
      name: "Desk Calendar 2024",
      brand: "AT-A-GLANCE",
      basePrice: 14.99,
      variants: 1,
      description: "Plan your schedule at a glance.",
      id: "OP012",
    },
    {
      name: "Whiteboard 36x24",
      brand: "AmazonBasics",
      basePrice: 29.99,
      variants: 1,
      description: "Smooth writing surface for ideas and notes.",
      id: "OP013",
    },
    {
      name: "Jumbo Paper Clips 1000ct",
      brand: "ACCO",
      basePrice: 9.99,
      variants: 1,
      description: "Securely fasten papers.",
      id: "OP014",
    },
    {
      name: "Standard Envelopes Pack 500ct",
      brand: "AmazonBasics",
      basePrice: 19.99,
      variants: 1,
      description: "Mailing essentials for your correspondence.",
      id: "OP015",
    },
  ],
}

// Calculate our price (cheapest + tiny markup)
function calculateOurPrice(storesPrices: FairCartProduct["storesPrices"]): {
  bestPrice: number
  bestStore: string
  ourPrice: number
  profit: number
} {
  const inStock = storesPrices.filter((s) => s.inStock)
  if (inStock.length === 0) {
    // Fallback: if nothing is in stock from competitors, use the supplier price + a small fee
    // Note: This scenario might need refinement based on how 'inStock' is truly determined.
    // For now, we assume the 'bestPrice' in 'storesPrices' is the cheapest competitor's price IF they were in stock.
    // If no competitors are in stock, we might need to adjust this logic.
    // As a temporary measure, we'll use the first item's price if available, otherwise a default.
    const cheapestAvailable = storesPrices.length > 0 ? storesPrices[0] : { price: 0, store: "Unknown" }
    const fee = 0.25
    return {
      bestPrice: cheapestAvailable.price, // This might be from an out-of-stock competitor
      bestStore: cheapestAvailable.store, // This might be from an out-of-stock competitor
      ourPrice: Math.round((cheapestAvailable.price + fee) * 100) / 100,
      profit: fee,
    }
  }

  // Use the cheapest *in-stock* competitor's price as the 'bestPrice' for calculation
  const cheapest = inStock.sort((a, b) => a.price - b.price)[0]
  const highestPrice = Math.max(...storesPrices.map((s) => s.price))
  const priceDifference = highestPrice - cheapest.price

  let markup = 0.1

  if (priceDifference > 100) {
    markup = Math.min(priceDifference * 0.08, 15)
  } else if (priceDifference > 50) {
    markup = Math.min(priceDifference * 0.05, 5)
  } else if (priceDifference > 20) {
    markup = Math.min(priceDifference * 0.03, 2)
  } else {
    if (cheapest.price > 10) markup = 0.25
    if (cheapest.price > 50) markup = 0.5
    if (cheapest.price > 100) markup = 0.75
  }

  return {
    bestPrice: cheapest.price,
    bestStore: cheapest.store,
    ourPrice: Math.round((cheapest.price + markup) * 100) / 100,
    profit: markup,
  }
}

// Added function to find actual cheapest supplier across all stores
function findCheapestSupplier(
  basePrice: number,
  category: string,
): {
  supplier: string
  cost: number
  shipping: number
  totalCost: number
  hasAmazonHaul: boolean
} {
  const storeShipping: Record<string, number> = {
    Amazon: 0,
    "Amazon Haul": 0,
    Walmart: 5.99,
    Target: 5.99,
    "Best Buy": 5.99,
    Costco: 0,
    "Sam's Club": 0,
    "Lowe's": 6.99,
    "Home Depot": 6.99,
    Meijer: 5.99,
    Kroger: 7.99,
    "Dollar General": 0,
    "Office Depot": 5.99,
    "Office Max": 5.99,
    "Ashley Furniture": 49.99,
    IKEA: 9.99,
    Petco: 4.99,
    PetSmart: 4.99,
    AutoZone: 6.99,
    "O'Reilly Auto": 6.99,
    Newegg: 4.99,
    "B&H Photo": 0,
    Sephora: 5.95,
    Ulta: 5.95,
    Macy: 9.99,
    Nordstrom: 0,
    Wayfair: 4.99,
    Chewy: 0,
    eBay: 0,
  }

  const storeKeys = Object.keys(STORES) as (keyof typeof STORES)[]
  const relevantStores = storeKeys.filter((storeKey) => {
    const categories = STORE_CATEGORY_MAP[storeKey]
    return categories && categories.some((storeCat) => category.includes(storeCat))
  })

  // If no specific stores, use general retailers
  const availableSuppliers =
    relevantStores.length > 0 ? relevantStores : (["amazon", "walmart", "target"] as (keyof typeof STORES)[])

  let cheapestSupplier = availableSuppliers[0]
  let cheapestCost = basePrice * 0.85 // Default competitive price
  let cheapestShipping = storeShipping[STORES[cheapestSupplier].name] || 5.99
  let cheapestTotal = cheapestCost + cheapestShipping
  let hasAmazonHaul = false

  // Check Amazon Haul for ultra-cheap items (20% chance per product)
  if (Math.random() > 0.8 && availableSuppliers.includes("amazonhaul")) {
    const amazonHaulCost = basePrice * (0.4 + Math.random() * 0.15) // 40-55% of base price
    const amazonHaulTotal = amazonHaulCost + 0 // Free shipping
    if (amazonHaulTotal < cheapestTotal) {
      cheapestSupplier = "amazonhaul"
      cheapestCost = amazonHaulCost
      cheapestShipping = 0
      cheapestTotal = amazonHaulTotal
      hasAmazonHaul = true
    }
  }

  // Check all other available suppliers
  for (const storeKey of availableSuppliers) {
    if (storeKey === "amazonhaul") continue // Already checked above

    const store = STORES[storeKey]
    // Generate realistic supplier costs (70-90% of base price)
    const supplierCost = basePrice * (0.7 + Math.random() * 0.2)
    const shipping = storeShipping[store.name] || 5.99
    const totalCost = supplierCost + shipping

    if (totalCost < cheapestTotal) {
      cheapestSupplier = storeKey
      cheapestCost = supplierCost
      cheapestShipping = shipping
      cheapestTotal = totalCost
    }
  }

  return {
    supplier: STORES[cheapestSupplier].name,
    cost: Math.round(cheapestCost * 100) / 100,
    shipping: cheapestShipping,
    totalCost: Math.round(cheapestTotal * 100) / 100,
    hasAmazonHaul,
  }
}

// Generate full inventory
function generateFairCartInventory(): FairCartProduct[] {
  const inventory: FairCartProduct[] = []

  // Get all verified products with REAL images and data
  const verifiedProducts = getAllVerifiedProducts()

  console.log(`[v0] Loading ${verifiedProducts.length} verified products with real images and data`)

  for (const realProduct of verifiedProducts) {
    // Use the REAL price from the verified product
    const actualSupplierCost = realProduct.price
    const actualSupplier = realProduct.source === "Amazon" ? "Amazon" : "Amazon Haul"

    // Generate higher-priced competitors (NEVER show our actual supplier)
    const storesPrices = generateStorePrices(
      {
        name: realProduct.name,
        brand: realProduct.brand,
        basePrice: realProduct.originalPrice,
        category: realProduct.category,
      },
      actualSupplierCost,
      actualSupplier,
    )

    // Calculate savings against the highest competitor price
    const highestCompetitorPrice =
      storesPrices.length > 0 ? Math.max(...storesPrices.map((s) => s.price)) : actualSupplierCost * 1.2
    const savings = highestCompetitorPrice - actualSupplierCost
    const savingsPercent = highestCompetitorPrice > 0 ? Math.round((savings / highestCompetitorPrice) * 100) : 0

    // Calculate our price using the actual supplier's cost and a markup
    const ourPriceResult = calculateOurPrice(storesPrices)
    const ourPrice = Math.round((actualSupplierCost + ourPriceResult.profit) * 100) / 100
    const profit = ourPriceResult.profit

    // Use real shipping data
    const shipping = realProduct.shipping === 0 ? "free" : realProduct.shipping

    const product: FairCartProduct = {
      id: realProduct.id,
      name: realProduct.name,
      brand: realProduct.brand,
      description: realProduct.description, // REAL description from Amazon
      category: realProduct.category,
      image: realProduct.image, // REAL image from Amazon
      storesPrices, // Only shows higher-priced retailers, never our source
      bestPrice: actualSupplierCost, // Our actual cost (hidden from customers)
      bestStore: actualSupplier, // Our actual supplier (hidden from customers)
      ourPrice,
      profit,
      savings,
      savingsPercent,
      isFlashSale: Math.random() > 0.92,
      isHotDeal: savings > 50 && savingsPercent > 20,
      isClearance: Math.random() > 0.95,
      isBestSeller: realProduct.reviews > 5000,
      isAmazonChoice: realProduct.rating > 4.5 && realProduct.reviews > 1000,
      hasBulkOption: storesPrices.some((s) => s.isBulkOption),
      rating: realProduct.rating, // REAL rating from Amazon
      reviews: realProduct.reviews, // REAL review count from Amazon
      sku: realProduct.asin || `SKU-${realProduct.id}`,
      shipping: shipping,
      productUrl: realProduct.url, // REAL Amazon URL
    }

    inventory.push(product)
  }

  // Now add products from the old PRODUCT_DATABASE to fill out the inventory
  // These will still use placeholders but at least the verified ones are real
  for (const [category, items] of Object.entries(PRODUCT_DATABASE)) {
    for (const item of items) {
      // Skip if we already have this product from verified products
      if (inventory.find((p) => p.name.includes(item.name))) {
        continue
      }

      const variantCount = item.variants || 1
      const variantSuffixes = [
        "Black",
        "White",
        "Blue",
        "Red",
        "Gray",
        "Green",
        "Small",
        "Medium",
        "Large",
        "XL",
        "Standard",
        "Deluxe",
        "Pro",
        "Plus",
        "Basic",
        "Premium",
      ]

      for (let v = 0; v < variantCount; v++) {
        const variantName =
          variantCount > 1 ? `${item.name} - ${variantSuffixes[v % variantSuffixes.length]}` : item.name

        let actualSupplier: string
        let actualSupplierCost: number

        if (item.basePrice <= 20) {
          actualSupplier = "Amazon Haul"
          actualSupplierCost = Math.max(item.basePrice * 0.4, item.basePrice - 10)
        } else {
          const regularSuppliers = ["Amazon", "Walmart", "Target", "Best Buy", "Costco"]
          const eligibleSuppliers = getStoresForCategory(category).filter((s) => s !== "Amazon Haul")
          const availableSuppliers = eligibleSuppliers.length > 0 ? eligibleSuppliers : regularSuppliers

          actualSupplier = availableSuppliers[Math.floor(Math.random() * availableSuppliers.length)]
          const store = Object.values(STORES).find((s) => s.name === actualSupplier)!
          actualSupplierCost = item.basePrice + (store.shippingCost || 0)
        }

        const storesPrices = generateStorePrices(
          { name: variantName, brand: item.brand, basePrice: item.basePrice, category },
          actualSupplierCost,
          actualSupplier,
        )

        const highestCompetitorPrice =
          storesPrices.length > 0 ? Math.max(...storesPrices.map((s) => s.price)) : actualSupplierCost
        const savings = highestCompetitorPrice - actualSupplierCost
        const savingsPercent = highestCompetitorPrice > 0 ? Math.round((savings / highestCompetitorPrice) * 100) : 0

        const isFlashSale = Math.random() > 0.92
        const isHotDeal = Math.random() > 0.85
        const isClearance = Math.random() > 0.95
        const isBestSeller = Math.random() > 0.8
        const isAmazonChoice = Math.random() > 0.9
        const hasBulkOption = storesPrices.some((s) => s.isBulkOption)

        const ourPriceResult = calculateOurPrice(storesPrices)
        const ourPrice = Math.round((actualSupplierCost + ourPriceResult.profit) * 100) / 100
        const profit = ourPriceResult.profit

        let shipping: number | "free" = "free"
        const supplierDetails =
          STORES[actualSupplier.toLowerCase().replace(" ", "").replace("'", "") as keyof typeof STORES]

        if (supplierDetails && supplierDetails.shippingCost !== undefined && supplierDetails.shippingCost > 0) {
          shipping = supplierDetails.shippingCost
        } else if (actualSupplier === "Amazon" || actualSupplier === "Amazon Haul") {
          shipping = "free"
        } else if (supplierDetails && supplierDetails.shippingCost === 0) {
          shipping = "free"
        } else {
          const shippingOptions = [0, 4.99, 5.99, 7.99, 9.99]
          shipping = shippingOptions[Math.floor(Math.random() * shippingOptions.length)]
          if (shipping === 0) shipping = "free"
        }

        const product: FairCartProduct = {
          id: `${item.id || category.substring(0, 2)}-${inventory.length + 1}-${v}`,
          name: variantName,
          brand: item.brand,
          description: item.description || `${item.brand} ${variantName}`,
          category,
          image: `/placeholder.svg?height=400&width=400&query=${encodeURIComponent(variantName)}`,
          storesPrices,
          bestPrice: actualSupplierCost,
          bestStore: actualSupplier,
          ourPrice,
          profit,
          savings,
          savingsPercent,
          isFlashSale,
          isHotDeal,
          isClearance,
          isBestSeller,
          isAmazonChoice,
          hasBulkOption,
          rating: 3.5 + Math.random() * 1.5,
          reviews: Math.floor(Math.random() * 10000) + 100,
          sku: `SKU-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          shipping: shipping,
        }

        inventory.push(product)
      }
    }
  }

  console.log(`[v0] Generated ${inventory.length} products total`)
  console.log(
    `[v0] Verified products with real images: ${inventory.filter((p) => p.image.includes("amazon.com")).length}`,
  )
  console.log(`[v0] Amazon Haul items (under $20): ${inventory.filter((p) => p.bestStore === "Amazon Haul").length}`)
  console.log(`[v0] Regular items (over $20): ${inventory.filter((p) => p.bestStore !== "Amazon Haul").length}`)

  return inventory
}

// Product description generator
function generateDescription(name: string, brand: string, category: string): string {
  return `Discover the exceptional ${name} from ${brand}. Compare prices from leading retailers and get the best deal in the ${category} category!`
}

// Get categories
export function getCategories(): string[] {
  return CATEGORIES
}

// Get stores
export function getStores(): typeof STORES {
  return STORES
}

// Helper function to get random stores
function getRandomStores(count = 3): string[] {
  const storeKeys = Object.keys(STORES)
  const shuffled = [...storeKeys].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

// Helper function to generate product variants (This function is no longer directly used by generateFairCartInventory but kept for reference if needed elsewhere)
function generateProductVariants(
  item: { name: string; brand: string; basePrice: number },
  category: string,
): { name: string; brand: string; basePrice: number }[] {
  const variants = []

  // Original product
  variants.push(item)

  // Generate 2-4 additional variants based on category
  if (category === "Electronics" || category === "Computers & Accessories") {
    variants.push(
      { ...item, name: item.name + " - Black", basePrice: item.basePrice },
      { ...item, name: item.name + " - White", basePrice: item.basePrice + 10 },
      { ...item, name: item.name + " - Premium Edition", basePrice: item.basePrice * 1.3 },
    )
  } else if (category === "Clothing, Shoes & Jewelry") {
    variants.push(
      { ...item, name: item.name + " - Small", basePrice: item.basePrice },
      { ...item, name: item.name + " - Medium", basePrice: item.basePrice },
      { ...item, name: item.name + " - Large", basePrice: item.basePrice },
      { ...item, name: item.name + " - X-Large", basePrice: item.basePrice + 5 },
    )
  } else if (category === "Home & Kitchen" || category === "Furniture") {
    variants.push(
      { ...item, name: item.name + " - Standard", basePrice: item.basePrice },
      { ...item, name: item.name + " - Deluxe", basePrice: item.basePrice * 1.25 },
      { ...item, name: item.name + " - Professional", basePrice: item.basePrice * 1.5 },
    )
  } else {
    // For other categories, create size/quantity variants
    variants.push(
      { ...item, name: item.name + " - Single Pack", basePrice: item.basePrice },
      { ...item, name: item.name + " - 2-Pack", basePrice: item.basePrice * 1.8 },
      { ...item, name: item.name + " - 4-Pack", basePrice: item.basePrice * 3.2 },
    )
  }

  return variants
}

export function getSuppliers(): string[] {
  return Object.keys(STORES)
}

export { generateFairCartInventory }
