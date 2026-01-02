"use client"

/**
 * Property photo carousel component with navigation
 */

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PropertyCarouselProps {
  images: string[]
  title: string
}

export function PropertyCarousel({ images, title }: PropertyCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <div className="relative w-full">
      {/* Main image display */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-muted">
        <Image
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`${title} - Photo ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority={currentIndex === 0}
        />

        {/* Navigation buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-4">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPrevious}
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNext}
            className="bg-background/80 backdrop-blur-sm hover:bg-background/90"
            aria-label="Next image"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 rounded-md bg-background/80 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail navigation */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "relative aspect-video h-20 shrink-0 overflow-hidden rounded-md border-2 transition-all",
              currentIndex === index
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-muted-foreground/20",
            )}
            aria-label={`Go to image ${index + 1}`}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt={`${title} thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
