"use client"

import { MapPin } from "lucide-react"

/**
 * Property location map component - mock version without API keys
 * Shows static map placeholder with address information
 */

interface PropertyMapProps {
  coordinates: {
    lat: number
    lng: number
  }
  address: string
}

export function PropertyMap({ coordinates, address }: PropertyMapProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="h-12 w-12 text-primary mb-4" />
        <p className="text-sm font-medium text-foreground mb-2">Property Location</p>
        <p className="text-xs text-muted-foreground mb-1">{address}</p>
        <p className="text-xs text-muted-foreground">
          Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
        </p>
        <p className="text-xs text-muted-foreground mt-4 opacity-60">Interactive map available in production</p>
      </div>
    </div>
  )
}
