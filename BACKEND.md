# FairCart Backend Documentation

## Overview

This is a complete, production-ready e-commerce backend with:
- **Real Product Data** from 100+ stores via RapidAPI and SerpAPI
- **MongoDB Database** for persistent storage
- **NextAuth.js** for authentication (email/password + Google OAuth)
- **Stripe** for payment processing
- **Automatic Inventory Sync** with price tracking
- **Full Admin Dashboard** with CRUD operations

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Set Up MongoDB
**Option A: Local MongoDB**
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Free Cloud)**
1. Go to https://cloud.mongodb.com
2. Create a free cluster
3. Get your connection string
4. Add to `.env.local`: `MONGODB_URI=mongodb+srv://...`

### 3. Configure Environment
Edit `.env.local` with your values (API keys are pre-configured):
```env
# Required
MONGODB_URI=mongodb://localhost:27017
NEXTAUTH_SECRET=your-32-char-secret

# Optional (for Google OAuth)
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx

# Optional (for Stripe payments)
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### 4. Seed Database
```bash
pnpm db:seed
```
This creates:
- Admin user: `admin@faircart.com` / `admin123456`
- Test customer: `customer@test.com` / `customer123`
- Sample coupons: SAVE10, SAVE20, FLAT15, FREESHIP
- Sample products from Amazon

### 5. Start Development Server
```bash
pnpm dev
```

## API Reference

### Authentication

#### POST /api/auth/register
Create a new user account.
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### POST /api/auth/[...nextauth]
NextAuth.js handles login/logout/session.

### Products

#### GET /api/products
Get products (featured, deals, search).
```
?type=featured|deals|bestsellers|search
&query=search term
&page=1
&store=amazon|walmart|google|all
&category=Electronics
```

#### GET /api/admin/products
Admin: List all products with pagination.
```
?page=1&limit=20&search=keyword&source=amazon&inStock=true
```

#### POST /api/admin/products
Admin: Create product or import from API.
```json
// Create manually
{
  "name": "Product Name",
  "brand": "Brand",
  "price": 99.99,
  "images": ["https://..."],
  "category": "Electronics"
}

// Import from Amazon
{
  "action": "import",
  "query": "wireless headphones",
  "source": "amazon"
}
```

#### PATCH /api/admin/products?id=xxx
Admin: Update product.
```json
{
  "name": "Updated Name",
  "isFeatured": true,
  "isActive": false
}
```

#### DELETE /api/admin/products?id=xxx
Admin: Soft delete product.

### Orders

#### GET /api/user/orders
Customer: Get own orders.

#### GET /api/admin/orders
Admin: List all orders.
```
?status=pending|confirmed|shipped|delivered
&search=order number or email
&dateFrom=2024-01-01
```

#### PATCH /api/admin/orders?id=xxx&action=updateStatus
Admin: Update order status.
```json
{
  "status": "shipped",
  "note": "Shipped via FedEx"
}
```

#### PATCH /api/admin/orders?id=xxx&action=updateFulfillment
Admin: Add tracking info.
```json
{
  "status": "shipped",
  "carrier": "FedEx",
  "trackingNumber": "123456789",
  "trackingUrl": "https://..."
}
```

#### PATCH /api/admin/orders?id=xxx&action=refund
Admin: Process refund.
```json
{
  "amount": 50.00,
  "reason": "Customer requested"
}
```

### Cart

#### GET /api/cart
Get current cart (creates if not exists).

#### POST /api/cart
Add item to cart.
```json
{
  "productId": "product-id",
  "quantity": 1
}
```

#### PATCH /api/cart
Update item or apply coupon.
```json
// Update quantity
{
  "action": "updateItem",
  "itemId": "item-id",
  "quantity": 2
}

// Apply coupon
{
  "action": "applyCoupon",
  "code": "SAVE10"
}
```

#### DELETE /api/cart?itemId=xxx
Remove item from cart.

#### DELETE /api/cart?clear=true
Clear entire cart.

### Checkout

#### POST /api/checkout
Create order and initiate payment.
```json
{
  "email": "customer@example.com",
  "name": "John Doe",
  "shippingAddress": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "sameAsShipping": true
}
```

### Inventory Sync

#### GET /api/admin/inventory
Get sync status and history.

#### POST /api/admin/inventory
Trigger sync operations.
```json
// Sync all products
{ "action": "syncAll" }

// Sync specific products
{
  "action": "syncProducts",
  "productIds": ["id1", "id2"]
}

// Import new products
{
  "action": "import",
  "query": "laptop stand",
  "source": "amazon"
}
```

### Users (Admin)

#### GET /api/admin/users
List all users.

#### POST /api/admin/users
Create user.

#### PATCH /api/admin/users?id=xxx
Update user role or reset password.
```json
{
  "role": "admin"
}

// Reset password
{
  "action": "resetPassword",
  "newPassword": "newpassword123"
}
```

#### DELETE /api/admin/users?id=xxx
Deactivate user.

### Coupons (Admin)

#### GET /api/admin/coupons
List all coupons.

#### POST /api/admin/coupons
Create coupon.
```json
{
  "code": "SUMMER25",
  "type": "percentage",
  "value": 25,
  "minOrderAmount": 50,
  "validUntil": "2024-12-31T23:59:59Z"
}
```

#### PATCH /api/admin/coupons?id=xxx
Update coupon.

#### DELETE /api/admin/coupons?id=xxx
Delete coupon.

### Dashboard

#### GET /api/admin/dashboard
Get dashboard statistics.
```
?section=all|orders|products|users|inventory
&days=30
```

## Database Schema

### Collections
- `users` - User accounts
- `products` - Product catalog
- `carts` - Shopping carts (TTL indexed)
- `orders` - Order records
- `coupons` - Promo codes
- `inventory_sync` - Sync history
- `price_alerts` - User price alerts
- `notifications` - User notifications
- `analytics` - Event tracking
- `admin_logs` - Admin activity

## Stripe Webhooks

Set up webhook endpoint in Stripe Dashboard:
```
https://your-domain.com/api/webhooks/stripe
```

Events handled:
- `payment_intent.succeeded` - Mark order as paid
- `payment_intent.payment_failed` - Mark payment failed
- `charge.refunded` - Process refund
- `charge.dispute.created` - Log dispute

## Security

- All admin routes require `admin` role
- Passwords hashed with bcrypt (12 rounds)
- Sessions via JWT (30-day expiry)
- CSRF protection via NextAuth
- Rate limiting recommended for production

## Production Deployment

1. Set all environment variables in your hosting provider
2. Use MongoDB Atlas for database
3. Enable Stripe live mode
4. Set up Stripe webhooks
5. Configure Google OAuth redirect URLs
6. Set `NODE_ENV=production`

## File Structure

```
lib/
├── db/
│   ├── client.ts          # MongoDB connection
│   ├── schema.ts          # TypeScript types
│   ├── index.ts           # Exports
│   ├── inventory-sync.ts  # Auto-sync service
│   └── repositories/
│       ├── user-repo.ts
│       ├── product-repo.ts
│       ├── order-repo.ts
│       ├── cart-repo.ts
│       └── coupon-repo.ts
├── auth.ts               # NextAuth config
├── product-api.ts        # RapidAPI integration
├── serpapi.ts            # Google Shopping
└── logger.ts             # Logging utility

app/
├── api/
│   ├── auth/            # Authentication
│   ├── cart/            # Cart operations
│   ├── checkout/        # Checkout flow
│   ├── products/        # Product search
│   ├── admin/           # Admin CRUD
│   │   ├── products/
│   │   ├── orders/
│   │   ├── users/
│   │   ├── coupons/
│   │   ├── inventory/
│   │   └── dashboard/
│   └── webhooks/
│       └── stripe/
├── login/
├── register/
└── admin/
    └── dashboard/
```
