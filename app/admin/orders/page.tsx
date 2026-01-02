"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { mockOrders, type FulfillmentStatus, type Order } from "@/lib/mock-orders"
import { ExternalLink, Search, Package, Truck, Clock } from "lucide-react"
import Link from "next/link"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<FulfillmentStatus | "all">("all")

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: FulfillmentStatus) => {
    console.log("[v0] Updating order status:", { orderId, newStatus })
    setOrders((prevOrders) =>
      prevOrders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)),
    )
  }

  // Get status badge variant and icon
  const getStatusConfig = (status: FulfillmentStatus) => {
    switch (status) {
      case "pending":
        return {
          variant: "outline" as const,
          icon: Clock,
          label: "Pending",
        }
      case "placed":
        return {
          variant: "secondary" as const,
          icon: Package,
          label: "Placed",
        }
      case "shipped":
        return {
          variant: "default" as const,
          icon: Truck,
          label: "Shipped",
        }
    }
  }

  // Calculate statistics
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    placed: orders.filter((o) => o.status === "placed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    revenue: orders.reduce((sum, order) => sum + order.total, 0),
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
            <p className="text-muted-foreground mt-1">Monitor and manage all customer orders</p>
          </div>
          <Link href="/">
            <Button variant="outline">Back to Store</Button>
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Orders</div>
            <div className="mt-2 text-2xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Pending</div>
            <div className="mt-2 text-2xl font-bold text-yellow-600 dark:text-yellow-500">{stats.pending}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Placed</div>
            <div className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-500">{stats.placed}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Shipped</div>
            <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-500">{stats.shipped}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Revenue</div>
            <div className="mt-2 text-2xl font-bold">
              ${stats.revenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order number, customer name, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "placed" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("placed")}
              >
                Placed
              </Button>
              <Button
                variant={statusFilter === "shipped" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("shipped")}
              >
                Shipped
              </Button>
            </div>
          </div>
        </Card>

        {/* Orders Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status)
                    const StatusIcon = statusConfig.icon

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="font-medium">{order.orderNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.shippingAddress.city}, {order.shippingAddress.state}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-xs text-muted-foreground">{order.customerEmail}</div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center gap-2">
                                <span className="text-sm">
                                  {item.quantity}x {item.name}
                                </span>
                                <a
                                  href={item.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 transition-colors"
                                  title="View source"
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">${order.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={statusConfig.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {order.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {order.status === "pending" && (
                              <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order.id, "placed")}>
                                Mark Placed
                              </Button>
                            )}
                            {order.status === "placed" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateOrderStatus(order.id, "shipped")}
                              >
                                Mark Shipped
                              </Button>
                            )}
                            {order.status === "shipped" && (
                              <Badge variant="default" className="cursor-default">
                                Complete
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  )
}
