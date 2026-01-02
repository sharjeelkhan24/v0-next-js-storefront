"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import type { CraigslistCar } from "@/lib/craigslist-cars"
import { getConditionColor, getConditionLabel } from "@/lib/craigslist-cars"
import { Calendar, Gauge, MapPin, Fuel, Settings } from "lucide-react"

interface CarListingCardProps {
  car: CraigslistCar
}

/**
 * Car Listing Card Component
 * Displays car information in a marketplace-style card
 * Production-ready with proper error handling and accessibility
 */
export function CarListingCard({ car }: CarListingCardProps) {
  // Format date for display
  const postedDate = new Date(car.postedDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 group">
      <div className="relative aspect-[3/2] overflow-hidden bg-muted/30">
        <Image
          src={car.image || "/placeholder.svg"}
          alt={car.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Condition badge overlay */}
        <div className="absolute top-3 right-3">
          <Badge variant="outline" className={`${getConditionColor(car.condition)} font-medium backdrop-blur-sm`}>
            {getConditionLabel(car.condition)}
          </Badge>
        </div>
        {/* Year badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="outline" className="bg-background/80 backdrop-blur-sm font-semibold">
            {car.year}
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-lg leading-tight text-balance line-clamp-2">{car.title}</CardTitle>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{car.location}</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price - prominent display */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">${car.price.toLocaleString()}</span>
        </div>

        {/* Key specs grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Mileage</span>
              <span className="font-semibold">{car.mileage.toLocaleString()} mi</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Transmission</span>
              <span className="font-semibold capitalize">{car.transmission}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Fuel Type</span>
              <span className="font-semibold capitalize">{car.fuelType}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Posted</span>
              <span className="font-semibold">{postedDate}</span>
            </div>
          </div>
        </div>

        {/* Features */}
        {car.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {car.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {car.features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{car.features.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
