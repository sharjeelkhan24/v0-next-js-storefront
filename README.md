# FairCart - Real-Time Price Comparison Storefront

A fully functional e-commerce storefront that fetches **real products with real prices** from Amazon, Walmart, eBay, and more.

## 🌟 Features

- **Real Product Data** - Fetches actual products from Amazon, Walmart, eBay
- **Live Pricing** - Real-time prices updated every 5 minutes
- **Price Comparison** - Compare prices across multiple stores
- **Direct Store Links** - Click to buy from the retailer with the best price
- **No Placeholders** - Every product has real images and descriptions

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure API Keys (Required for Real Products)

Create `.env.local` in project root:

```bash
# Required: Get from https://rapidapi.com
RAPIDAPI_KEY=your_rapidapi_key_here
```

**How to get your RapidAPI key:**

1. Go to [RapidAPI.com](https://rapidapi.com) and create a free account
2. Subscribe to [Real-Time Amazon Data API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data) (Free: 100 req/month)
3. Copy your X-RapidAPI-Key from the API page
4. Add to `.env.local`

### 3. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see real products!

## 📦 API Endpoints

```bash
# Get featured products (deals + bestsellers)
GET /api/products

# Search products
GET /api/products?type=search&query=laptop

# Get deals
GET /api/products?type=deals

# Get bestsellers
GET /api/products?type=bestsellers
```

## 🔌 Supported Stores

| Store | API | Free Tier |
|-------|-----|-----------|
| Amazon | Real-Time Amazon Data | 100 req/month |
| Walmart | Walmart API | 100 req/month |
| eBay | eBay Search Result | 100 req/month |

## 🛠 Tech Stack

- Next.js 16 (App Router)
- TypeScript 5
- React 19
- Tailwind CSS + shadcn/ui
- SWR for data fetching
- Zod for validation

## 📄 License

MIT License
