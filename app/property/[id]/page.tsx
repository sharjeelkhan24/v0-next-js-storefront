/**
 * Property listing detail page
 * Displays property information, photo carousel, map, and contact form
 * Prepared for future MLS API integration
 */

import { PropertyCarousel } from "@/components/property-carousel"
import { PropertyMap } from "@/components/property-map"
import { ContactAgentForm } from "@/components/contact-agent-form"
import { mockProperty, formatPrice, formatNumber } from "@/lib/property-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Maximize, Home, MapPin, CheckCircle2 } from "lucide-react"

// TODO: Replace with actual data fetching from MLS API
async function getProperty(id: string) {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100))
  return mockProperty
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const property = await getProperty(id)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Property Listing</h1>
            <Badge variant={property.status === "For Sale" ? "default" : "secondary"}>{property.status}</Badge>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content - Left column */}
          <div className="lg:col-span-2">
            {/* Photo carousel */}
            <PropertyCarousel images={property.images} title={property.title} />

            {/* Property details */}
            <div className="mt-8">
              <div className="mb-4">
                <h1 className="text-balance mb-2 text-3xl font-bold leading-tight">{property.title}</h1>
                <div className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>
                    {property.address}, {property.city}, {property.state} {property.zipCode}
                  </span>
                </div>
              </div>

              <div className="mb-6 text-4xl font-bold text-primary">{formatPrice(property.price)}</div>

              {/* Key stats */}
              <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Bed className="text-muted-foreground size-5" />
                    <div>
                      <div className="text-2xl font-bold">{property.bedrooms}</div>
                      <div className="text-muted-foreground text-xs">Bedrooms</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Bath className="text-muted-foreground size-5" />
                    <div>
                      <div className="text-2xl font-bold">{property.bathrooms}</div>
                      <div className="text-muted-foreground text-xs">Bathrooms</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Maximize className="text-muted-foreground size-5" />
                    <div>
                      <div className="text-2xl font-bold">{formatNumber(property.squareFeet)}</div>
                      <div className="text-muted-foreground text-xs">Sq Ft</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <Home className="text-muted-foreground size-5" />
                    <div>
                      <div className="text-2xl font-bold">{property.yearBuilt}</div>
                      <div className="text-muted-foreground text-xs">Built</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Description */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">About This Property</h2>
                  <p className="text-pretty leading-relaxed">{property.description}</p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div>
                      <div className="text-muted-foreground mb-1 text-sm">Property Type</div>
                      <div className="font-medium">{property.propertyType}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1 text-sm">Lot Size</div>
                      <div className="font-medium">{property.lotSize}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground mb-1 text-sm">Listed Date</div>
                      <div className="font-medium">{new Date(property.listingDate).toLocaleDateString()}</div>
                    </div>
                    {property.mlsNumber && (
                      <div>
                        <div className="text-muted-foreground mb-1 text-sm">MLS Number</div>
                        <div className="font-medium">{property.mlsNumber}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Features */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Features</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {property.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Map */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="mb-4 text-xl font-semibold">Location</h2>
                  <PropertyMap
                    coordinates={property.coordinates}
                    address={`${property.address}, ${property.city}, ${property.state}`}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Right column */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <ContactAgentForm agent={property.agent} propertyTitle={property.title} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
