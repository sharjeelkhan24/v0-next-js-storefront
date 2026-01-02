/**
 * Admin Users API
 * 
 * CRUD operations for user management
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import * as userRepo from "@/lib/db/repositories/user-repo"
import { logger } from "@/lib/logger"
import { z } from "zod"

const log = logger.child({ module: "admin-users-api" })

// ============================================
// Validation Schemas
// ============================================

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8).optional(),
  role: z.enum(["customer", "admin", "vendor"]).default("customer"),
})

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
  role: z.enum(["customer", "admin", "vendor"]).optional(),
  isActive: z.boolean().optional(),
  preferences: z.object({
    notifications: z.boolean().optional(),
    newsletter: z.boolean().optional(),
  }).optional(),
})

// ============================================
// Auth Helper
// ============================================

async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return { error: "Unauthorized", status: 401 }
  }
  
  if ((session.user as any).role !== "admin") {
    return { error: "Forbidden - Admin access required", status: 403 }
  }
  
  return { user: session.user }
}

// ============================================
// GET - List Users
// ============================================

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    
    // Single user request
    const userId = searchParams.get("id")
    if (userId) {
      const user = await userRepo.getUserById(userId)
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      // Remove sensitive data
      const { passwordHash, ...safeUser } = user as any
      return NextResponse.json({ success: true, user: safeUser })
    }

    // List users
    const options = {
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      role: searchParams.get("role") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") as any || "desc",
    }

    const result = await userRepo.getUsers(options)
    
    // Remove sensitive data
    const safeUsers = result.users.map(user => {
      const { passwordHash, ...safe } = user as any
      return safe
    })

    return NextResponse.json({
      success: true,
      users: safeUsers,
      total: result.total,
      page: options.page,
      limit: options.limit,
      totalPages: Math.ceil(result.total / options.limit),
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// ============================================
// POST - Create User
// ============================================

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await request.json()
    
    const validation = CreateUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid user data", details: validation.error.issues },
        { status: 400 }
      )
    }

    const { email, name, password, role } = validation.data

    // Check if email exists
    const existing = await userRepo.getUserByEmail(email)
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      )
    }

    const user = await userRepo.createUser({
      email,
      name,
      password,
      role,
    })

    log.info("User created by admin", { 
      admin: auth.user.email, 
      userId: user.id, 
      email: user.email,
      role 
    })

    const { passwordHash, ...safeUser } = user as any
    return NextResponse.json({ success: true, user: safeUser }, { status: 201 })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to create user" },
      { status: 500 }
    )
  }
}

// ============================================
// PATCH - Update User
// ============================================

export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Handle password reset
    if (body.action === "resetPassword" && body.newPassword) {
      if (body.newPassword.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters" },
          { status: 400 }
        )
      }
      
      const success = await userRepo.updateUserPassword(userId, body.newPassword)
      if (!success) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      
      log.info("User password reset by admin", { admin: auth.user.email, userId })
      return NextResponse.json({ success: true, message: "Password updated" })
    }

    // Regular update
    const validation = UpdateUserSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid update data", details: validation.error.issues },
        { status: 400 }
      )
    }

    // Build update object
    const updates: any = {}
    if (validation.data.name) updates.name = validation.data.name
    if (validation.data.phone !== undefined) updates.phone = validation.data.phone
    if (validation.data.isActive !== undefined) updates.isActive = validation.data.isActive
    if (validation.data.preferences) {
      updates.preferences = validation.data.preferences
    }

    const user = await userRepo.updateUser(userId, updates)
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Handle role change separately (need direct db update)
    if (validation.data.role && validation.data.role !== user.role) {
      const { collections } = await import("@/lib/db/client")
      const col = await collections.users()
      await col.updateOne(
        { id: userId },
        { $set: { role: validation.data.role, updatedAt: new Date() } }
      )
      user.role = validation.data.role
    }

    log.info("User updated by admin", { 
      admin: auth.user.email, 
      userId,
      updates: Object.keys(updates) 
    })

    const { passwordHash, ...safeUser } = user as any
    return NextResponse.json({ success: true, user: safeUser })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to update user" },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE - Deactivate/Delete User
// ============================================

export async function DELETE(request: NextRequest) {
  const auth = await requireAdmin(request)
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("id")
    const hard = searchParams.get("hard") === "true"
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      )
    }

    // Prevent self-deletion
    if (userId === (auth.user as any).id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      )
    }

    let success: boolean
    if (hard) {
      success = await userRepo.hardDeleteUser(userId)
    } else {
      success = await userRepo.deleteUser(userId)
    }
    
    if (!success) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    log.info("User deleted by admin", { 
      admin: auth.user.email, 
      userId,
      hard 
    })

    return NextResponse.json({ 
      success: true, 
      message: hard ? "User permanently deleted" : "User deactivated" 
    })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Failed to delete user" },
      { status: 500 }
    )
  }
}
