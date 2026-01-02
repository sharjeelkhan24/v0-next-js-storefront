import { NextResponse } from "next/server"

// In-memory orders storage for v0 preview
const ordersStore: any[] = []

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newOrder = {
      _id: `order-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      ...body,
      status: "pending",
      createdAt: new Date(),
    }

    ordersStore.push(newOrder)

    return NextResponse.json({
      success: true,
      orderId: newOrder._id,
    })
  } catch (error) {
    console.error("Order creation error:", error)
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const allOrders = ordersStore
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 50)

    return NextResponse.json({ success: true, orders: allOrders })
  } catch (error) {
    console.error("Fetch orders error:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 })
  }
}
