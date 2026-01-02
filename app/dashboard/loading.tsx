import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading state for dashboard page
 * Provides visual feedback while data loads
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <header className="border-b border-border/50 bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-9 w-64" />
              <Skeleton className="h-5 w-96" />
            </div>
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Filters Skeleton */}
        <div className="mb-8 space-y-4">
          <Skeleton className="h-10 w-full max-w-md" />
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
