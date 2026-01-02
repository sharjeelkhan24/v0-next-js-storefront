export interface Product {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
}

export const products: Product[] = [
  {
    id: "1",
    name: "Premium Wireless Headphones",
    price: 299.99,
    description: "High-quality wireless headphones with noise cancellation",
    image: "/premium-wireless-headphones.png",
    category: "Electronics",
  },
  {
    id: "2",
    name: "Smart Watch Pro",
    price: 399.99,
    description: "Advanced fitness tracking and notifications",
    image: "/smart-watch-fitness-tracker.jpg",
    category: "Electronics",
  },
  {
    id: "3",
    name: "Leather Messenger Bag",
    price: 189.99,
    description: "Handcrafted genuine leather messenger bag",
    image: "/leather-messenger-bag.png",
    category: "Accessories",
  },
  {
    id: "4",
    name: "Minimalist Desk Lamp",
    price: 79.99,
    description: "Modern LED desk lamp with adjustable brightness",
    image: "/minimalist-desk-lamp.png",
    category: "Home",
  },
  {
    id: "5",
    name: "Portable Bluetooth Speaker",
    price: 129.99,
    description: "Waterproof speaker with 20-hour battery life",
    image: "/portable-bluetooth-speaker.jpg",
    category: "Electronics",
  },
  {
    id: "6",
    name: "Organic Cotton T-Shirt",
    price: 39.99,
    description: "Sustainable and comfortable everyday wear",
    image: "/organic-cotton-tshirt.png",
    category: "Clothing",
  },
]
