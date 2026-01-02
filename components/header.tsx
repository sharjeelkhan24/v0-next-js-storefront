import Link from "next/link"
import { CartDrawer } from "./cart-drawer"
import { Store, Zap, LayoutDashboard, Building2 } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold text-xl">
          <Store className="h-6 w-6" />
          <span>IrishTripplets</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/command-center"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            <LayoutDashboard className="h-4 w-4" />
            Command Center
          </Link>
          <Link
            href="/saas-portal"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            <Building2 className="h-4 w-4" />
            SaaS Portal
          </Link>
          {/* </CHANGE> */}
          <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
            Products
          </Link>
          <Link
            href="/deals"
            className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1"
          >
            <Zap className="h-4 w-4" />
            Deals
          </Link>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">
            Dashboard
          </Link>
          <Link href="/cars" className="text-sm font-medium hover:text-primary transition-colors">
            Cars
          </Link>
          <Link href="/property/1" className="text-sm font-medium hover:text-primary transition-colors">
            Real Estate
          </Link>
        </nav>
        <CartDrawer />
      </div>
    </header>
  )
}
