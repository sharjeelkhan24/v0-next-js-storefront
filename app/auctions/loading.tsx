import { Skeleton } from "@/components/ui/skeleton"

export default function AuctionsLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96" />
          ))}
        </div>
      </div>
    </div>
  )
}
