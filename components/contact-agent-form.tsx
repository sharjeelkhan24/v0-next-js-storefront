"use client"

import type React from "react"

/**
 * Contact agent form component with validation
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, CheckCircle2 } from "lucide-react"
import type { Property } from "@/lib/property-data"

interface ContactAgentFormProps {
  agent: Property["agent"]
  propertyTitle: string
}

export function ContactAgentForm({ agent, propertyTitle }: ContactAgentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: `I'm interested in ${propertyTitle}. Please contact me with more information.`,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // TODO: Replace with actual API call to MLS or CRM system
      console.log("[v0] Contact form submitted:", formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsSubmitted(true)
    } catch (error) {
      console.error("[v0] Error submitting contact form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2 className="mb-4 size-12 text-primary" />
          <h3 className="mb-2 text-lg font-semibold">Message Sent!</h3>
          <p className="text-muted-foreground text-sm">{agent.name} will contact you shortly.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-start gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-muted">
            <img src={agent.photo || "/placeholder.svg"} alt={agent.name} className="size-full object-cover" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{agent.name}</h3>
            <p className="text-muted-foreground text-sm">{agent.license}</p>
            <div className="mt-2 flex flex-col gap-1 text-sm">
              <a href={`tel:${agent.phone}`} className="text-primary flex items-center gap-2 hover:underline">
                <Phone className="size-4" />
                {agent.phone}
              </a>
              <a href={`mailto:${agent.email}`} className="text-primary flex items-center gap-2 hover:underline">
                <Mail className="size-4" />
                {agent.email}
              </a>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="I'm interested in this property..."
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Message"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
