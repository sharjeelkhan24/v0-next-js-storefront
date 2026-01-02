import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import {
  searchProductsTool,
  getTodaysDealsTool,
  searchCarsTool,
  getArbitrageOpportunitiesTool,
  searchPropertiesTool,
  getLeadMatchesTool,
  addToCartTool,
  placeBidTool,
  scheduleShowingTool,
  getCrossVerticalRecommendationsTool,
  getPlatformAnalyticsTool,
} from "@/lib/jarvis-tools"

export const maxDuration = 30

const tools = {
  searchProducts: searchProductsTool,
  getTodaysDeals: getTodaysDealsTool,
  searchCars: searchCarsTool,
  getArbitrageOpportunities: getArbitrageOpportunitiesTool,
  searchProperties: searchPropertiesTool,
  getLeadMatches: getLeadMatchesTool,
  addToCart: addToCartTool,
  placeBid: placeBidTool,
  scheduleShowing: scheduleShowingTool,
  getCrossVerticalRecommendations: getCrossVerticalRecommendationsTool,
  getPlatformAnalytics: getPlatformAnalyticsTool,
}

/**
 * POST /api/voice-chat
 * Handles chat messages and streams GPT responses with tool calling
 *
 * @param req - Request containing messages array
 * @returns Streamed text response from GPT with tool execution
 */
export async function POST(req: Request) {
  try {
    console.log("[v0] Voice Chat API: Received request")

    const { messages }: { messages: UIMessage[] } = await req.json()

    if (!messages || messages.length === 0) {
      console.error("[v0] Voice Chat API: No messages provided")
      return new Response("No messages provided", { status: 400 })
    }

    console.log("[v0] Voice Chat API: Processing", messages.length, "messages")

    // Convert UI messages to model format
    const prompt = convertToModelMessages(messages)

    const systemPrompt = `You are Jarvis, the AI assistant for IrishTripplets - a multi-vertical marketplace platform.

You have access to three main modules:
1. Electronics Engine - Search products, find deals, add items to cart
2. Car Engine - Search vehicles, analyze arbitrage opportunities, place bids
3. Real Estate Engine - Search properties, match leads, schedule showings

You can also provide cross-vertical recommendations (e.g., insurance for cars, moving services for homes, warranties for electronics).

Be conversational, helpful, and proactive. When users express interest in something, offer relevant recommendations across verticals.

Examples:
- "Show me cars under $20k" → Use searchCars tool
- "What are today's best deals?" → Use getTodaysDeals tool
- "Find properties in Miami" → Use searchProperties tool
- "Add this to my cart" → Use addToCart tool
- "Place a bid on that Honda" → Use placeBid tool
- "Schedule a showing" → Use scheduleShowing tool

Always provide context and explain what you're doing.`

    // Stream response from GPT with tools
    const result = streamText({
      model: "openai/gpt-4o-mini",
      prompt,
      tools,
      abortSignal: req.signal,
      temperature: 0.7,
      maxOutputTokens: 1500,
      system: systemPrompt,
    })

    return result.toUIMessageStreamResponse({
      onFinish: async ({ isAborted, text }) => {
        if (isAborted) {
          console.log("[v0] Voice Chat API: Request aborted")
        } else {
          console.log("[v0] Voice Chat API: Response completed:", text?.substring(0, 50) + "...")
        }
      },
      consumeSseStream: consumeStream,
    })
  } catch (error) {
    console.error("[v0] Voice Chat API: Error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
