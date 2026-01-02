/**
 * Loading state for property page
 */

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function PropertyLoading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-8 w-48" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Skeleton className="aspect-[16/10] w-full rounded-lg" />
            <div className="mt-8">
              <Skeleton className="mb-4 h-10 w-3/4" />
              <Skeleton className="mb-6 h-12 w-48" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-16 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
