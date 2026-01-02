"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Plus } from "lucide-react"
import type { UpsellPackage } from "@/lib/upsell-packages"

interface UpsellSelectorProps {
  upsells: UpsellPackage[]
  onSelectionChange: (selected: UpsellPackage[]) => void
}

export function UpsellSelector({ upsells, onSelectionChange }: UpsellSelectorProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(upsells.filter((u) => u.recommended).map((u) => u.id)),
  )

  const toggleUpsell = (upsell: UpsellPackage) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(upsell.id)) {
      newSelected.delete(upsell.id)
    } else {
      newSelected.add(upsell.id)
    }
    setSelectedIds(newSelected)
    onSelectionChange(upsells.filter((u) => newSelected.has(u.id)))
  }

  // Group upsells by category
  const groupedUpsells = upsells.reduce(
    (acc, upsell) => {
      if (!acc[upsell.category]) {
        acc[upsell.category] = []
      }
      acc[upsell.category].push(upsell)
      return acc
    },
    {} as Record<string, UpsellPackage[]>,
  )

  const categoryLabels: Record<string, string> = {
    financing: "Financing Options",
    warranty: "Extended Warranties",
    insurance: "Insurance Protection",
    moving: "Moving Services",
    "smart-home": "Smart Home Packages",
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Enhance Your Purchase</h3>
        <p className="text-sm text-muted-foreground">Add protection and services to maximize value and peace of mind</p>
      </div>

      {Object.entries(groupedUpsells).map(([category, items]) => (
        <div key={category}>
          <h4 className="text-sm font-medium mb-3">{categoryLabels[category] || category}</h4>
          <div className="grid gap-3">
            {items.map((upsell) => {
              const isSelected = selectedIds.has(upsell.id)
              return (
                <Card
                  key={upsell.id}
                  className={`cursor-pointer transition-all ${
                    isSelected ? "border-primary bg-primary/5" : "hover:border-primary/50"
                  }`}
                  onClick={() => toggleUpsell(upsell)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium">{upsell.name}</h5>
                          {upsell.recommended && (
                            <Badge variant="secondary" className="text-xs">
                              Recommended
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{upsell.description}</p>
                        <p className="text-lg font-semibold">
                          {upsell.price === 0 ? "Included" : `$${upsell.price.toFixed(2)}`}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleUpsell(upsell)
                        }}
                      >
                        {isSelected ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
