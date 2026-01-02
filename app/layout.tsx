import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/lib/cart-context"
import { VoiceChatbox } from "@/components/voice-chatbox"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "IrishTripplets",
  description: "Premium products for modern living",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <CartProvider>{children}</CartProvider>
        <VoiceChatbox />
        <Analytics />
      </body>
    </html>
  )
}
