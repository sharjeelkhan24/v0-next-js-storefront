"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  Users,
  DollarSign,
  Package,
  ShoppingCart,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Crown,
  Sparkles,
} from "lucide-react"
import {
  getAllTenants,
  calculateUsagePercentage,
  checkLimitWarnings,
  SUBSCRIPTION_PLANS,
  type Tenant,
} from "@/lib/tenant-management"

export default function SaaSPortalPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading tenants
    setTimeout(() => {
      const allTenants = getAllTenants()
      setTenants(allTenants)
      setSelectedTenant(allTenants[0])
      setLoading(false)
    }, 500)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-64 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  const totalRevenue = tenants.reduce((sum, tenant) => {
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === tenant.plan)
    return sum + (plan?.price || 0)
  }, 0)

  const activeTenants = tenants.filter((t) => t.status === "active").length
  const trialTenants = tenants.filter((t) => t.status === "trial").length

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-balance">SaaS Licensing Portal</h1>
            <p className="text-muted-foreground mt-2">Manage white-label tenants, subscriptions, and usage analytics</p>
          </div>
          <Button size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Add New Tenant
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}/mo</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tenants</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeTenants}</div>
              <p className="text-xs text-muted-foreground">{trialTenants} in trial</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tenants.reduce((sum, t) => sum + t.usage.ordersProcessed, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Across all tenants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(tenants.reduce((sum, t) => sum + t.usage.apiCalls, 0) / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Tenant Management */}
        <Tabs defaultValue="tenants" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="tenants" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {tenants.map((tenant) => {
                const usage = calculateUsagePercentage(tenant)
                const warnings = checkLimitWarnings(tenant)
                const plan = SUBSCRIPTION_PLANS.find((p) => p.id === tenant.plan)

                return (
                  <Card key={tenant.id} className="hover:border-primary transition-colors cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{tenant.name}</CardTitle>
                          <CardDescription>{tenant.email}</CardDescription>
                        </div>
                        <Badge
                          variant={
                            tenant.status === "active"
                              ? "default"
                              : tenant.status === "trial"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {tenant.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Plan Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {tenant.plan === "enterprise" && <Crown className="h-4 w-4 text-yellow-500" />}
                          <span className="font-medium capitalize">{tenant.plan}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">${plan?.price}/mo</span>
                      </div>

                      {/* Usage Stats */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Products</span>
                          <span className="font-medium">
                            {tenant.usage.productsListed}
                            {tenant.limits.maxProducts !== -1 && ` / ${tenant.limits.maxProducts}`}
                          </span>
                        </div>
                        {tenant.limits.maxProducts !== -1 && <Progress value={usage.products} />}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Orders</span>
                          <span className="font-medium">
                            {tenant.usage.ordersProcessed}
                            {tenant.limits.maxOrders !== -1 && ` / ${tenant.limits.maxOrders}`}
                          </span>
                        </div>
                        {tenant.limits.maxOrders !== -1 && <Progress value={usage.orders} />}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Storage</span>
                          <span className="font-medium">
                            {(tenant.usage.storageUsed / 1024).toFixed(1)} GB
                            {tenant.limits.maxStorage !== -1 && ` / ${(tenant.limits.maxStorage / 1024).toFixed(0)} GB`}
                          </span>
                        </div>
                        {tenant.limits.maxStorage !== -1 && <Progress value={usage.storage} />}
                      </div>

                      {/* Warnings */}
                      {warnings.hasWarnings && (
                        <div className="flex items-start gap-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
                          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <div className="text-xs text-yellow-600 dark:text-yellow-400">{warnings.warnings[0]}</div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                          View Details
                        </Button>
                        <Button variant="default" size="sm" className="flex-1">
                          Manage
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-3">
              {SUBSCRIPTION_PLANS.map((plan) => {
                const tenantCount = tenants.filter((t) => t.plan === plan.id).length

                return (
                  <Card key={plan.id} className={plan.id === "enterprise" ? "border-primary" : ""}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{plan.name}</CardTitle>
                        {plan.id === "enterprise" && <Crown className="h-5 w-5 text-yellow-500" />}
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.interval}</span>
                      </div>
                      <CardDescription>{tenantCount} active tenants</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Platform Analytics</CardTitle>
                <CardDescription>Aggregate metrics across all tenants</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      Total Products
                    </div>
                    <div className="text-2xl font-bold">
                      {tenants.reduce((sum, t) => sum + t.usage.productsListed, 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShoppingCart className="h-4 w-4" />
                      Total Orders
                    </div>
                    <div className="text-2xl font-bold">
                      {tenants.reduce((sum, t) => sum + t.usage.ordersProcessed, 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      API Calls
                    </div>
                    <div className="text-2xl font-bold">
                      {(tenants.reduce((sum, t) => sum + t.usage.apiCalls, 0) / 1000).toFixed(1)}K
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      Active Users
                    </div>
                    <div className="text-2xl font-bold">{tenants.reduce((sum, t) => sum + t.usage.activeUsers, 0)}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Revenue by Plan</h3>
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const planTenants = tenants.filter((t) => t.plan === plan.id && t.status === "active")
                    const revenue = planTenants.length * plan.price
                    const percentage = (revenue / totalRevenue) * 100

                    return (
                      <div key={plan.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{plan.name}</span>
                          <span className="text-muted-foreground">
                            ${revenue.toLocaleString()} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                        <Progress value={percentage} />
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
