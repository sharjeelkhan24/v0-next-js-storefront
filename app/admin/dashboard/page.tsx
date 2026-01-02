"use client"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign,
  TrendingUp,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
} from "lucide-react"

// ============================================
// Types
// ============================================

interface DashboardStats {
  summary: {
    todayOrders: number
    todayRevenue: number
    totalProducts: number
    productsInStock: number
    productsOnSale: number
    pendingOrders: number
    processingOrders: number
  }
  orders: {
    stats: {
      totalOrders: number
      totalRevenue: number
      averageOrderValue: number
      byStatus: Record<string, number>
    }
    recent: any[]
  }
  products: {
    stats: {
      total: number
      active: number
      inStock: number
      onSale: number
      bySource: Record<string, number>
    }
  }
  users: {
    total: number
    admins: number
    recent: any[]
  }
  inventory: {
    status: {
      productsToSync: number
      recentSyncs: number
      failedSyncs: number
    }
  }
}

// ============================================
// Main Component
// ============================================

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  
  // Entity lists
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  
  // Pagination
  const [ordersPage, setOrdersPage] = useState(1)
  const [productsPage, setProductsPage] = useState(1)
  const [usersPage, setUsersPage] = useState(1)
  
  // Search
  const [orderSearch, setOrderSearch] = useState("")
  const [productSearch, setProductSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")

  // Redirect if not admin
  useEffect(() => {
    if (status === "authenticated" && (session?.user as any)?.role !== "admin") {
      redirect("/")
    }
  }, [session, status])

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/dashboard")
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: ordersPage.toString(),
        limit: "10",
        ...(orderSearch && { search: orderSearch }),
      })
      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }, [ordersPage, orderSearch])

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: productsPage.toString(),
        limit: "10",
        ...(productSearch && { search: productSearch }),
      })
      const res = await fetch(`/api/admin/products?${params}`)
      const data = await res.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error("Failed to fetch products:", error)
    }
  }, [productsPage, productSearch])

  // Fetch users
  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: usersPage.toString(),
        limit: "10",
        ...(userSearch && { search: userSearch }),
      })
      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    }
  }, [usersPage, userSearch])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  useEffect(() => {
    if (activeTab === "orders") fetchOrders()
    if (activeTab === "products") fetchProducts()
    if (activeTab === "users") fetchUsers()
  }, [activeTab, fetchOrders, fetchProducts, fetchUsers])

  // ============================================
  // CRUD Operations
  // ============================================

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/orders?id=${orderId}&action=updateStatus`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        fetchOrders()
        fetchStats()
      }
    } catch (error) {
      console.error("Failed to update order:", error)
    }
  }

  const deleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchProducts()
        fetchStats()
      }
    } catch (error) {
      console.error("Failed to delete product:", error)
    }
  }

  const toggleProductFeatured = async (productId: string, featured: boolean) => {
    try {
      const res = await fetch(`/api/admin/products?id=${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setFeatured", ids: [productId], featured }),
      })
      if (res.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error("Failed to update product:", error)
    }
  }

  const syncInventory = async () => {
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "syncAll" }),
      })
      if (res.ok) {
        alert("Inventory sync started!")
        fetchStats()
      }
    } catch (error) {
      console.error("Failed to sync inventory:", error)
    }
  }

  const importProducts = async (query: string) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", query, source: "amazon" }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`Imported ${data.count} products!`)
        fetchProducts()
        fetchStats()
      }
    } catch (error) {
      console.error("Failed to import products:", error)
    }
  }

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Failed to update user:", error)
    }
  }

  const deactivateUser = async (userId: string) => {
    if (!confirm("Are you sure you want to deactivate this user?")) return
    
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchUsers()
        fetchStats()
      }
    } catch (error) {
      console.error("Failed to deactivate user:", error)
    }
  }

  // ============================================
  // Render
  // ============================================

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!session || (session.user as any).role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Admin access required</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="secondary" size="sm" onClick={syncInventory}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync Inventory
            </Button>
            <span className="text-sm">{session.user.email}</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Revenue</p>
                  <p className="text-2xl font-bold">
                    ${stats?.summary?.todayRevenue?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today's Orders</p>
                  <p className="text-2xl font-bold">{stats?.summary?.todayOrders || 0}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold">{stats?.summary?.totalProducts || 0}</p>
                </div>
                <Package className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                  <p className="text-2xl font-bold">{stats?.summary?.pendingOrders || 0}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.orders?.recent?.length ? (
                    <div className="space-y-3">
                      {stats.orders.recent.map((order: any) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-muted rounded">
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${order.total?.toFixed(2)}</p>
                            <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No recent orders</p>
                  )}
                </CardContent>
              </Card>

              {/* Order Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Orders</span>
                      <span className="font-bold">{stats?.orders?.stats?.totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Revenue</span>
                      <span className="font-bold">${stats?.orders?.stats?.totalRevenue?.toFixed(2) || "0.00"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Order Value</span>
                      <span className="font-bold">${stats?.orders?.stats?.averageOrderValue?.toFixed(2) || "0.00"}</span>
                    </div>
                    <hr />
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-yellow-100 rounded">
                        <p className="text-lg font-bold">{stats?.orders?.stats?.byStatus?.pending || 0}</p>
                        <p className="text-xs">Pending</p>
                      </div>
                      <div className="p-2 bg-blue-100 rounded">
                        <p className="text-lg font-bold">{stats?.orders?.stats?.byStatus?.processing || 0}</p>
                        <p className="text-xs">Processing</p>
                      </div>
                      <div className="p-2 bg-green-100 rounded">
                        <p className="text-lg font-bold">{stats?.orders?.stats?.byStatus?.delivered || 0}</p>
                        <p className="text-xs">Delivered</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Product Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Active Products</span>
                      <span className="font-bold">{stats?.products?.stats?.active || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Stock</span>
                      <span className="font-bold text-green-600">{stats?.products?.stats?.inStock || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On Sale</span>
                      <span className="font-bold text-orange-600">{stats?.products?.stats?.onSale || 0}</span>
                    </div>
                    <hr />
                    <div>
                      <p className="text-sm font-medium mb-2">By Source</p>
                      {stats?.products?.stats?.bySource && Object.entries(stats.products.stats.bySource).map(([source, count]) => (
                        <div key={source} className="flex justify-between text-sm">
                          <span className="capitalize">{source}</span>
                          <span>{count as number}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Inventory Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Inventory Sync Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Products to Sync</span>
                      <span className="font-bold">{stats?.inventory?.status?.productsToSync || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Recent Syncs (24h)</span>
                      <span className="font-bold text-green-600">{stats?.inventory?.status?.recentSyncs || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed Syncs (24h)</span>
                      <span className="font-bold text-red-600">{stats?.inventory?.status?.failedSyncs || 0}</span>
                    </div>
                    <Button onClick={syncInventory} className="w-full">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Run Full Sync
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Orders Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search orders..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline" onClick={fetchOrders}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p>{order.customerName}</p>
                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>${order.total?.toFixed(2)}</TableCell>
                        <TableCell>
                          <Select
                            value={order.status}
                            onValueChange={(value) => updateOrderStatus(order.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              <SelectItem value="processing">Processing</SelectItem>
                              <SelectItem value="shipped">Shipped</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={order.payment?.status === "completed" ? "default" : "secondary"}>
                            {order.payment?.status || "pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Products Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search products..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline" onClick={fetchProducts}>
                      <Search className="w-4 h-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>
                          <Download className="w-4 h-4 mr-2" />
                          Import
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Import Products</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            placeholder="Search query (e.g., 'wireless headphones')"
                            id="import-query"
                          />
                          <Button onClick={() => {
                            const query = (document.getElementById("import-query") as HTMLInputElement).value
                            if (query) importProducts(query)
                          }}>
                            Import from Amazon
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Featured</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnail || "/placeholder.png"}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div>
                              <p className="font-medium line-clamp-1">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{product.brand}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">${product.price?.toFixed(2)}</p>
                            {product.originalPrice && (
                              <p className="text-xs text-muted-foreground line-through">
                                ${product.originalPrice.toFixed(2)}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.inventory?.inStock ? "default" : "destructive"}>
                            {product.inventory?.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{product.source}</TableCell>
                        <TableCell>
                          <Button
                            variant={product.isFeatured ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleProductFeatured(product.id, !product.isFeatured)}
                          >
                            {product.isFeatured ? "★" : "☆"}
                          </Button>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Users Management</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-64"
                    />
                    <Button variant="outline" onClick={fetchUsers}>
                      <Search className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Total Spent</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => updateUserRole(user.id, value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">Customer</SelectItem>
                              <SelectItem value="vendor">Vendor</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{user.stats?.totalOrders || 0}</TableCell>
                        <TableCell>${user.stats?.totalSpent?.toFixed(2) || "0.00"}</TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? "default" : "destructive"}>
                            {user.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deactivateUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sync Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted rounded">
                    <div>
                      <p className="font-medium">Products Pending Sync</p>
                      <p className="text-2xl font-bold">{stats?.inventory?.status?.productsToSync || 0}</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted rounded">
                    <div>
                      <p className="font-medium">Successful Syncs (24h)</p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats?.inventory?.status?.recentSyncs || 0}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted rounded">
                    <div>
                      <p className="font-medium">Failed Syncs (24h)</p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats?.inventory?.status?.failedSyncs || 0}
                      </p>
                    </div>
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <Button onClick={syncInventory} className="w-full" size="lg">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Run Full Inventory Sync
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Import</CardTitle>
                  <CardDescription>Import products from external APIs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Search Query</label>
                    <Input placeholder="e.g., wireless headphones" id="quick-import" />
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => {
                      const query = (document.getElementById("quick-import") as HTMLInputElement).value
                      if (query) importProducts(query)
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Import from Amazon
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Products will be imported from Amazon and automatically synced.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
