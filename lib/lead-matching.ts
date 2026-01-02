import { generateObject } from "ai"

/**
 * Buyer profile and preferences for AI matching
 */
export interface BuyerProfile {
  id: string
  name: string
  email: string
  phone: string
  budget: {
    min: number
    max: number
  }
  preferences: {
    bedrooms: number
    bathrooms: number
    propertyTypes: string[]
    locations: string[]
    mustHaveFeatures: string[]
    niceToHaveFeatures: string[]
  }
  timeline: "immediate" | "1-3 months" | "3-6 months" | "6+ months"
  financing: "cash" | "pre-approved" | "needs-approval"
  createdAt: string
}

/**
 * Property compatibility score with detailed breakdown
 */
export interface CompatibilityScore {
  propertyId: string
  buyerId: string
  overallScore: number // 0-100
  breakdown: {
    priceMatch: number // 0-100
    locationMatch: number // 0-100
    featuresMatch: number // 0-100
    sizeMatch: number // 0-100
    timelineMatch: number // 0-100
  }
  reasoning: string
  recommendedAction: "high-priority" | "good-match" | "potential" | "not-recommended"
  estimatedInterestLevel: "very-high" | "high" | "medium" | "low"
}

/**
 * AI-powered lead matching algorithm
 * Uses GPT to analyze buyer preferences and property features
 */
export async function matchBuyerToProperty(buyer: BuyerProfile, property: any): Promise<CompatibilityScore> {
  console.log("[v0] AI matching buyer to property:", { buyerId: buyer.id, propertyId: property.id })

  try {
    // Calculate basic compatibility scores
    const priceMatch = calculatePriceMatch(buyer.budget, property.price)
    const locationMatch = calculateLocationMatch(buyer.preferences.locations, property.city, property.state)
    const featuresMatch = calculateFeaturesMatch(buyer.preferences.mustHaveFeatures, property.features)
    const sizeMatch = calculateSizeMatch(buyer.preferences, property)
    const timelineMatch = calculateTimelineMatch(buyer.timeline, property.status)

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      priceMatch * 0.3 + locationMatch * 0.25 + featuresMatch * 0.25 + sizeMatch * 0.15 + timelineMatch * 0.05,
    )

    // Use AI to generate reasoning and recommendations
    const result = await generateObject({
      model: "openai/gpt-4o-mini",
      schema: {
        type: "object",
        properties: {
          reasoning: { type: "string" },
          recommendedAction: {
            type: "string",
            enum: ["high-priority", "good-match", "potential", "not-recommended"],
          },
          estimatedInterestLevel: { type: "string", enum: ["very-high", "high", "medium", "low"] },
        },
        required: ["reasoning", "recommendedAction", "estimatedInterestLevel"],
      },
      prompt: `Analyze this buyer-property match and provide insights:

Buyer Profile:
- Budget: $${buyer.budget.min.toLocaleString()} - $${buyer.budget.max.toLocaleString()}
- Desired: ${buyer.preferences.bedrooms} bed, ${buyer.preferences.bathrooms} bath
- Locations: ${buyer.preferences.locations.join(", ")}
- Must-have features: ${buyer.preferences.mustHaveFeatures.join(", ")}
- Timeline: ${buyer.timeline}
- Financing: ${buyer.financing}

Property:
- Price: $${property.price.toLocaleString()}
- Specs: ${property.bedrooms} bed, ${property.bathrooms} bath, ${property.squareFeet} sq ft
- Location: ${property.city}, ${property.state}
- Features: ${property.features.join(", ")}
- Status: ${property.status}

Compatibility Scores:
- Price Match: ${priceMatch}/100
- Location Match: ${locationMatch}/100
- Features Match: ${featuresMatch}/100
- Size Match: ${sizeMatch}/100
- Overall: ${overallScore}/100

Provide a brief reasoning (2-3 sentences) for why this is or isn't a good match, recommend an action priority, and estimate the buyer's interest level.`,
    })

    console.log("[v0] AI matching complete:", { overallScore, action: result.object.recommendedAction })

    return {
      propertyId: property.id,
      buyerId: buyer.id,
      overallScore,
      breakdown: {
        priceMatch,
        locationMatch,
        featuresMatch,
        sizeMatch,
        timelineMatch,
      },
      reasoning: result.object.reasoning,
      recommendedAction: result.object.recommendedAction as any,
      estimatedInterestLevel: result.object.estimatedInterestLevel as any,
    }
  } catch (error) {
    console.error("[v0] Error in AI lead matching:", error)

    // Fallback to basic scoring without AI reasoning
    const priceMatch = calculatePriceMatch(buyer.budget, property.price)
    const locationMatch = calculateLocationMatch(buyer.preferences.locations, property.city, property.state)
    const featuresMatch = calculateFeaturesMatch(buyer.preferences.mustHaveFeatures, property.features)
    const sizeMatch = calculateSizeMatch(buyer.preferences, property)
    const timelineMatch = calculateTimelineMatch(buyer.timeline, property.status)

    const overallScore = Math.round(
      priceMatch * 0.3 + locationMatch * 0.25 + featuresMatch * 0.25 + sizeMatch * 0.15 + timelineMatch * 0.05,
    )

    return {
      propertyId: property.id,
      buyerId: buyer.id,
      overallScore,
      breakdown: {
        priceMatch,
        locationMatch,
        featuresMatch,
        sizeMatch,
        timelineMatch,
      },
      reasoning: "Basic compatibility analysis based on buyer preferences and property features.",
      recommendedAction: overallScore >= 80 ? "high-priority" : overallScore >= 60 ? "good-match" : "potential",
      estimatedInterestLevel: overallScore >= 80 ? "very-high" : overallScore >= 60 ? "high" : "medium",
    }
  }
}

// Helper functions for calculating individual match scores

function calculatePriceMatch(budget: { min: number; max: number }, price: number): number {
  if (price < budget.min) {
    // Property is below budget - still good but might raise questions
    const percentBelow = ((budget.min - price) / budget.min) * 100
    return Math.max(70, 100 - percentBelow)
  } else if (price > budget.max) {
    // Property is above budget - penalize based on how much over
    const percentOver = ((price - budget.max) / budget.max) * 100
    return Math.max(0, 100 - percentOver * 2)
  } else {
    // Property is within budget - perfect match
    return 100
  }
}

function calculateLocationMatch(preferredLocations: string[], city: string, state: string): number {
  if (preferredLocations.length === 0) return 100 // No preference specified

  const locationString = `${city}, ${state}`.toLowerCase()
  const hasMatch = preferredLocations.some((loc) => locationString.includes(loc.toLowerCase()))

  return hasMatch ? 100 : 30 // Still give some points for being in the general area
}

function calculateFeaturesMatch(mustHaveFeatures: string[], propertyFeatures: string[]): number {
  if (mustHaveFeatures.length === 0) return 100 // No requirements

  const propertyFeaturesLower = propertyFeatures.map((f) => f.toLowerCase())
  const matchedFeatures = mustHaveFeatures.filter((feature) =>
    propertyFeaturesLower.some((pf) => pf.includes(feature.toLowerCase())),
  )

  return Math.round((matchedFeatures.length / mustHaveFeatures.length) * 100)
}

function calculateSizeMatch(
  preferences: { bedrooms: number; bathrooms: number },
  property: { bedrooms: number; bathrooms: number },
): number {
  const bedroomMatch = property.bedrooms >= preferences.bedrooms ? 100 : (property.bedrooms / preferences.bedrooms) * 70
  const bathroomMatch =
    property.bathrooms >= preferences.bathrooms ? 100 : (property.bathrooms / preferences.bathrooms) * 70

  return Math.round((bedroomMatch + bathroomMatch) / 2)
}

function calculateTimelineMatch(timeline: string, status: string): number {
  if (status === "Sold") return 0
  if (status === "Pending") return timeline === "immediate" ? 50 : 80
  return 100 // For Sale - matches all timelines
}

/**
 * Find best property matches for a buyer
 */
export async function findBestMatches(
  buyer: BuyerProfile,
  properties: any[],
  limit = 10,
): Promise<CompatibilityScore[]> {
  console.log("[v0] Finding best matches for buyer:", buyer.id)

  const scores = await Promise.all(properties.map((property) => matchBuyerToProperty(buyer, property)))

  // Sort by overall score and return top matches
  return scores.sort((a, b) => b.overallScore - a.overallScore).slice(0, limit)
}
