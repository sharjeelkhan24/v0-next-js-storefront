"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Key, 
  RefreshCw,
  Copy,
  Terminal
} from "lucide-react"
import { useState } from "react"

interface ApiSetupGuideProps {
  apiStatus?: {
    amazon: boolean
    walmart: boolean
    ebay: boolean
    configured: boolean
  }
  setupInstructions?: Record<string, string>
  onRefresh?: () => void
}

export function ApiSetupGuide({ apiStatus, setupInstructions, onRefresh }: ApiSetupGuideProps) {
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text)
    setCopiedStep(step)
    setTimeout(() => setCopiedStep(null), 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Alert className="mb-6 border-amber-500 bg-amber-50">
        <Key className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-800">API Configuration Required</AlertTitle>
        <AlertDescription className="text-amber-700">
          To display real products with live prices from Amazon, Walmart, and eBay, 
          you need to configure your API keys.
        </AlertDescription>
      </Alert>

      {/* API Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            API Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Amazon", connected: apiStatus?.amazon },
              { name: "Walmart", connected: apiStatus?.walmart },
              { name: "eBay", connected: apiStatus?.ebay },
              { name: "Overall", connected: apiStatus?.configured },
            ].map((api) => (
              <div
                key={api.name}
                className={`flex items-center gap-2 p-3 rounded-lg ${
                  api.connected ? "bg-green-50" : "bg-red-50"
                }`}
              >
                {api.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <span className={api.connected ? "text-green-800" : "text-red-800"}>
                  {api.name}
                </span>
              </div>
            ))}
          </div>
          {onRefresh && (
            <Button variant="outline" className="mt-4" onClick={onRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Check Connection
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Setup Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Setup Guide</CardTitle>
          <CardDescription>
            Follow these steps to enable real product data (takes about 5 minutes)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="border-l-4 border-primary pl-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-2">Step 1</Badge>
                <h3 className="font-semibold">Create a RapidAPI Account</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  RapidAPI provides access to Amazon, Walmart, and other retail APIs with a free tier.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a href="https://rapidapi.com/auth/sign-up" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Sign Up
                </a>
              </Button>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-primary pl-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge className="mb-2">Step 2</Badge>
                <h3 className="font-semibold">Subscribe to Real-Time Amazon Data API</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  This API provides real Amazon product data. The free tier includes 100 requests/month.
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a 
                  href="https://rapidapi.com/letscrape-6bRBa3QguO5/api/real-time-amazon-data" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View API
                </a>
              </Button>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-primary pl-4">
            <Badge className="mb-2">Step 3</Badge>
            <h3 className="font-semibold">Copy Your API Key</h3>
            <p className="text-sm text-muted-foreground mt-1">
              After subscribing, click "Subscribe to Test" then copy your X-RapidAPI-Key from the code snippets.
            </p>
          </div>

          {/* Step 4 */}
          <div className="border-l-4 border-primary pl-4">
            <Badge className="mb-2">Step 4</Badge>
            <h3 className="font-semibold">Add to Environment Variables</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Create a <code className="bg-muted px-1 rounded">.env.local</code> file in your project root with:
            </p>
            <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm relative">
              <pre>{`RAPIDAPI_KEY=your_api_key_here`}</pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-slate-400 hover:text-white"
                onClick={() => copyToClipboard("RAPIDAPI_KEY=your_api_key_here", 4)}
              >
                {copiedStep === 4 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Step 5 */}
          <div className="border-l-4 border-primary pl-4">
            <Badge className="mb-2">Step 5</Badge>
            <h3 className="font-semibold">Restart Development Server</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Stop and restart your Next.js development server:
            </p>
            <div className="bg-slate-900 text-slate-50 p-4 rounded-lg font-mono text-sm relative">
              <pre>{`# Press Ctrl+C to stop, then:
pnpm dev`}</pre>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 text-slate-400 hover:text-white"
                onClick={() => copyToClipboard("pnpm dev", 5)}
              >
                {copiedStep === 5 ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Optional APIs */}
          <div className="border-t pt-6 mt-6">
            <h3 className="font-semibold mb-4">Optional: Additional APIs</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium">Walmart API</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uses the same RapidAPI key. Subscribe to the Walmart API for Walmart prices.
                  </p>
                  <Button variant="link" size="sm" className="px-0" asChild>
                    <a 
                      href="https://rapidapi.com/apidojo/api/walmart2" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      View Walmart API →
                    </a>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <h4 className="font-medium">eBay API</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Get a free eBay Developer account for eBay product data.
                  </p>
                  <Button variant="link" size="sm" className="px-0" asChild>
                    <a 
                      href="https://developer.ebay.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      eBay Developer Portal →
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Demo Mode Notice */}
      <Alert className="mt-6">
        <AlertTitle>Demo Mode Available</AlertTitle>
        <AlertDescription>
          While APIs aren't configured, the app will show sample products. 
          Configure the APIs above to see real, live product data from actual retailers.
        </AlertDescription>
      </Alert>
    </div>
  )
}
