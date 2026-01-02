export interface TrendingProduct {
  id: string
  name: string
  price: number
  description: string
  image: string
  category: string
  badge?: "New" | "Hot" | "Limited" | "Bestseller"
  rating: number
  reviews: number
  discount?: number
}

export const trendingElectronics: TrendingProduct[] = [
  {
    id: "t1",
    name: "UltraSound Pro Earbuds",
    price: 249.99,
    description: "Premium wireless earbuds with adaptive noise cancellation and 30-hour battery life",
    image: "/premium-wireless-earbuds-black.jpg",
    category: "Audio",
    badge: "Hot",
    rating: 4.8,
    reviews: 2847,
  },
  {
    id: "t2",
    name: "4K Action Camera Elite",
    price: 399.99,
    description: "Professional-grade action camera with 4K 120fps recording and waterproof design",
    image: "/4k-action-camera-waterproof.jpg",
    category: "Cameras",
    badge: "New",
    rating: 4.9,
    reviews: 1523,
  },
  {
    id: "t3",
    name: "Smart Home Hub X",
    price: 179.99,
    description: "Central control for all your smart devices with voice assistant integration",
    image: "/smart-home-hub.png",
    category: "Smart Home",
    badge: "Bestseller",
    rating: 4.7,
    reviews: 3912,
  },
  {
    id: "t4",
    name: "Gaming Mechanical Keyboard RGB",
    price: 159.99,
    description: "Ultra-responsive mechanical switches with customizable RGB lighting",
    image: "/gaming-mechanical-keyboard-rgb.jpg",
    category: "Gaming",
    badge: "Hot",
    rating: 4.6,
    reviews: 2156,
    discount: 20,
  },
  {
    id: "t5",
    name: "Wireless Charging Station Pro",
    price: 89.99,
    description: "3-in-1 fast charging station for phone, watch, and earbuds",
    image: "/wireless-charging-station-modern.jpg",
    category: "Accessories",
    rating: 4.5,
    reviews: 1834,
  },
  {
    id: "t6",
    name: "Portable SSD 2TB",
    price: 299.99,
    description: "Ultra-fast portable storage with USB-C 3.2 Gen 2 connectivity",
    image: "/portable-ssd-drive.jpg",
    category: "Storage",
    badge: "Limited",
    rating: 4.9,
    reviews: 987,
  },
  {
    id: "t7",
    name: "Smart Fitness Watch Ultra",
    price: 449.99,
    description: "Advanced health monitoring with GPS, ECG, and 7-day battery life",
    image: "/premium-fitness-smartwatch.jpg",
    category: "Wearables",
    badge: "New",
    rating: 4.8,
    reviews: 2634,
  },
  {
    id: "t8",
    name: "Drone 4K Pro",
    price: 899.99,
    description: "Professional drone with 4K camera, obstacle avoidance, and 45-min flight time",
    image: "/professional-drone-4k-camera.jpg",
    category: "Drones",
    badge: "Hot",
    rating: 4.7,
    reviews: 1245,
  },
  {
    id: "t9",
    name: "Studio Monitor Speakers",
    price: 549.99,
    description: "Professional-grade studio monitors with pristine sound reproduction",
    image: "/studio-monitor-speakers.jpg",
    category: "Audio",
    badge: "Bestseller",
    rating: 4.9,
    reviews: 876,
  },
]
