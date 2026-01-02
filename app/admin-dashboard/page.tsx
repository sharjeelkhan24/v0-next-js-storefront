"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DollarSign,
  TrendingUp,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react"
import { mockOrders } from "@/lib/mock-orders"
import { mockRefunds } from "@/lib/refund-system"
import { calculatePaymentFlow, generateTransactionAudit } from "@/lib/payment-tracking"
import { calculateProductPricing } from "@/lib/pricing-engine"
import { getCurrentSession, login, logout } from "@/lib/auth-system"

export default function AdminDashboardPage() {
  const [session, setSession] = useState(getCurrentSession())
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // Handle login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const newSession = login(email, password)
    if (newSession) {
      setSession(newSession)
      setLoginError("")
    } else {
      setLoginError("Invalid email or password")
    }
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    setSession(null)
  }

  // Login screen
  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Admin Dashboard Login</CardTitle>
            <CardDescription>Sign in to access the admin panel</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@irishtripplets.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && <div className="text-sm text-red-600 dark:text-red-400">{loginError}</div>}
              <Button type="submit" className="w-full">
                Sign In
              </Button>
              <div className="text-xs text-muted-foreground mt-4 space-y-1">
                <div>Demo Credentials:</div>
                <div>Owner: sharjeel@irishtripplets.com / owner123</div>
                <div>Admin: admin@irishtripplets.com / admin123</div>
                <div>Manager: manager@irishtripplets.com / manager123</div>
                <div>Staff: staff@irishtripplets.com / staff123</div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate metrics
  const totalOrders = mockOrders.length
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0)
  const pendingOrders = mockOrders.filter((o) => o.status === "pending").length
  const totalRefunds = mockRefunds.reduce((sum, r) => sum + r.netRefund, 0)

  // Calculate payment flow for first order as example
  const examplePayment = calculatePaymentFlow(mockOrders[0].total, mockOrders[0].total * 0.85, "electronics")
  const exampleAudit = generateTransactionAudit(examplePayment)

  // Calculate pricing breakdown
  const pricingExample = calculateProductPricing(1099.99, "electronics")

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome, {session.user.name} ({session.user.role})
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => (window.location.href = "/")}>
              Back to Store
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-green-600">+12.5%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">{pendingOrders} pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${(totalRevenue * 0.15).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">15% avg margin</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Refunds</CardTitle>
              <ArrowDownRight className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalRefunds.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{mockRefunds.length} requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="transactions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="pricing">Pricing Engine</TabsTrigger>
            <TabsTrigger value="refunds">Refunds & Returns</TabsTrigger>
            <TabsTrigger value="payment-flow">Payment Flow</TabsTrigger>
          </TabsList>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Complete audit trail of all payments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={order.status === "shipped" ? "default" : "outline"}>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{order.createdAt.toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pricing Engine Tab */}
          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Markup Engine</CardTitle>
                <CardDescription>How prices are calculated and profit margins are determined</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Example: $1,099.99 Laptop</h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2 p-4 border rounded-lg">
                      <div className="text-sm font-medium text-muted-foreground">Cost Breakdown</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Source Cost (Amazon)</span>
                          <span className="font-medium">${pricingExample.sourceCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Shipping Cost</span>
                          <span className="font-medium">${pricingExample.shippingCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Platform Fee (3%)</span>
                          <span className="font-medium">${pricingExample.platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-sm font-semibold">Total Cost</span>
                          <span className="font-bold">${pricingExample.totalCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 p-4 border rounded-lg bg-green-500/5">
                      <div className="text-sm font-medium text-muted-foreground">Revenue & Profit</div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm">Markup (15%)</span>
                          <span className="font-medium text-green-600">${pricingExample.markup.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Selling Price</span>
                          <span className="font-bold">${pricingExample.sellingPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1">
                          <span className="text-sm font-semibold">Net Profit</span>
                          <span className="font-bold text-green-600">${pricingExample.profit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Profit Margin</span>
                          <span className="font-medium text-green-600">{pricingExample.profitMargin.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Markup Rules by Category</h3>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Electronics</div>
                      <div className="text-sm text-muted-foreground">15% markup</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Automotive</div>
                      <div className="text-sm text-muted-foreground">8% markup</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Accessories</div>
                      <div className="text-sm text-muted-foreground">25% markup</div>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="font-medium">Real Estate</div>
                      <div className="text-sm text-muted-foreground">3-6% commission</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Refunds Tab */}
          <TabsContent value="refunds" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Refund & Return Management</CardTitle>
                <CardDescription>Track and process customer refund requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Refund ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Fee</TableHead>
                      <TableHead>Net Refund</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockRefunds.map((refund) => (
                      <TableRow key={refund.id}>
                        <TableCell className="font-medium">{refund.id}</TableCell>
                        <TableCell>{refund.customerName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{refund.reason}</Badge>
                        </TableCell>
                        <TableCell>${refund.refundAmount.toFixed(2)}</TableCell>
                        <TableCell className="text-red-600">-${refund.restockingFee.toFixed(2)}</TableCell>
                        <TableCell className="font-bold">${refund.netRefund.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              refund.status === "completed"
                                ? "default"
                                : refund.status === "approved"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {refund.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {refund.status === "processing" && <RefreshCw className="h-3 w-3 mr-1" />}
                            {refund.status === "requested" && <Clock className="h-3 w-3 mr-1" />}
                            {refund.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                            {refund.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{refund.requestedAt.toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                  <h3 className="font-semibold mb-2">Restocking Fee Policy</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Defective items: 0% restocking fee</li>
                    <li>• Not as described: 0% restocking fee</li>
                    <li>• Changed mind: 10% restocking fee</li>
                    <li>• Wrong item (our mistake): 0% restocking fee</li>
                    <li>• Other reasons: 15% restocking fee</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Flow Tab */}
          <TabsContent value="payment-flow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Payment Flow Tracking</CardTitle>
                <CardDescription>See exactly where every dollar goes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold">Example Transaction Breakdown</h3>
                  <div className="text-sm text-muted-foreground">
                    Order: {examplePayment.orderId} | Total: ${examplePayment.totalAmount.toFixed(2)}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3 p-4 border rounded-lg">
                      <div className="font-semibold">Payment Breakdown</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Product Cost</span>
                          <span className="font-medium">${examplePayment.breakdown.productCost.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Shipping</span>
                          <span className="font-medium">${examplePayment.breakdown.shipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Tax (8%)</span>
                          <span className="font-medium">${examplePayment.breakdown.tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Platform Fee</span>
                          <span className="font-medium">${examplePayment.breakdown.platformFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Processing Fee (Stripe)</span>
                          <span className="font-medium">
                            ${examplePayment.breakdown.paymentProcessingFee.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 border rounded-lg bg-green-500/5">
                      <div className="font-semibold">Money Distribution</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">To Supplier (Amazon/eBay)</span>
                          <span className="font-medium">${examplePayment.distribution.toSupplier.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">To Shipping Carrier</span>
                          <span className="font-medium">${examplePayment.distribution.toShipping.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">To Stripe (Payment Fee)</span>
                          <span className="font-medium">${examplePayment.distribution.toStripe.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm">Platform Fees</span>
                          <span className="font-medium">${examplePayment.distribution.toPlatform.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2">
                          <span className="font-semibold">Net Profit (IrishTripplets)</span>
                          <span className="font-bold text-green-600">
                            ${examplePayment.distribution.netProfit.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold">Transaction Audit Trail</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exampleAudit.map((audit) => (
                        <TableRow key={audit.id}>
                          <TableCell className="font-medium">{audit.action}</TableCell>
                          <TableCell>{audit.from}</TableCell>
                          <TableCell>{audit.to}</TableCell>
                          <TableCell className="font-medium">${audit.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="default">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {audit.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {audit.timestamp.toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
