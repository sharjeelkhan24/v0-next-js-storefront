"use client"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"

interface FilterBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedStore: string
  setSelectedStore: (store: string) => void
  selectedRegion: string
  setSelectedRegion: (region: string) => void
  categories: string[]
  stores: string[]
  regions: string[]
}

export function FilterBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStore,
  setSelectedStore,
  selectedRegion,
  setSelectedRegion,
  categories,
  stores,
  regions,
}: FilterBarProps) {
  return (
    <div className="bg-card border-b py-4 mb-6 sticky top-[88px] z-40">
      <div className="container mx-auto px-4">
        {/* Mobile search */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10"
            />
          </div>
        </div>

        {/* Filter row */}
        <div className="flex flex-wrap gap-3">
          {/* Category filter - mobile */}
          <div className="lg:hidden">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Store filter */}
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Store" />
            </SelectTrigger>
            <SelectContent>
              {stores.map((store) => (
                <SelectItem key={store} value={store}>
                  {store === "All" ? "All Stores" : store}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Region filter */}
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region === "All" ? "All Regions" : region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Results count */}
          <div className="flex items-center ml-auto text-sm text-muted-foreground">
            Showing products from {selectedStore === "All" ? "all stores" : selectedStore}
          </div>
        </div>
      </div>
    </div>
  )
}
