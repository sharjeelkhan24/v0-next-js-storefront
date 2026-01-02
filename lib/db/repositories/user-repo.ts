/**
 * User Repository
 * 
 * CRUD operations for users
 */

import { collections, generateId, toObjectId } from "./client"
import type { User, Address } from "./schema"
import { logger } from "../logger"
import bcrypt from "bcryptjs"

const log = logger.child({ module: "user-repo" })

// ============================================
// Create
// ============================================

export async function createUser(data: {
  email: string
  password?: string
  name: string
  role?: "customer" | "admin" | "vendor"
  provider?: { type: "google" | "apple" | "facebook"; id: string }
}): Promise<User> {
  const col = await collections.users()
  
  const now = new Date()
  const user: User = {
    id: generateId(),
    email: data.email.toLowerCase(),
    passwordHash: data.password ? await bcrypt.hash(data.password, 12) : undefined,
    name: data.name,
    role: data.role || "customer",
    providers: data.provider ? { [data.provider.type]: data.provider.id } : undefined,
    addresses: [],
    preferences: {
      notifications: true,
      newsletter: false,
      currency: "USD",
      language: "en",
    },
    stats: {
      totalOrders: 0,
      totalSpent: 0,
      savedAmount: 0,
    },
    createdAt: now,
    updatedAt: now,
    isActive: true,
    isVerified: !!data.provider,  // OAuth users are pre-verified
  }

  await col.insertOne(user as any)
  log.info("User created", { userId: user.id, email: user.email })
  
  return user
}

// ============================================
// Read
// ============================================

export async function getUserById(id: string): Promise<User | null> {
  const col = await collections.users()
  return col.findOne({ id }) as Promise<User | null>
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const col = await collections.users()
  return col.findOne({ email: email.toLowerCase() }) as Promise<User | null>
}

export async function getUserByProvider(
  provider: "google" | "apple" | "facebook",
  providerId: string
): Promise<User | null> {
  const col = await collections.users()
  return col.findOne({ [`providers.${provider}`]: providerId }) as Promise<User | null>
}

export async function getUsers(options: {
  page?: number
  limit?: number
  role?: string
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}): Promise<{ users: User[]; total: number }> {
  const col = await collections.users()
  
  const page = options.page || 1
  const limit = options.limit || 20
  const skip = (page - 1) * limit

  const filter: any = {}
  
  if (options.role) {
    filter.role = options.role
  }
  
  if (options.search) {
    filter.$or = [
      { name: { $regex: options.search, $options: "i" } },
      { email: { $regex: options.search, $options: "i" } },
    ]
  }

  const sort: any = {}
  if (options.sortBy) {
    sort[options.sortBy] = options.sortOrder === "desc" ? -1 : 1
  } else {
    sort.createdAt = -1
  }

  const [users, total] = await Promise.all([
    col.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
    col.countDocuments(filter),
  ])

  return { users: users as User[], total }
}

// ============================================
// Update
// ============================================

export async function updateUser(
  id: string,
  updates: Partial<Pick<User, "name" | "phone" | "avatar" | "preferences" | "isActive">>
): Promise<User | null> {
  const col = await collections.users()
  
  const result = await col.findOneAndUpdate(
    { id },
    { 
      $set: { 
        ...updates, 
        updatedAt: new Date() 
      } 
    },
    { returnDocument: "after" }
  )

  if (result) {
    log.info("User updated", { userId: id })
  }
  
  return result as User | null
}

export async function updateUserPassword(
  id: string,
  newPassword: string
): Promise<boolean> {
  const col = await collections.users()
  
  const passwordHash = await bcrypt.hash(newPassword, 12)
  
  const result = await col.updateOne(
    { id },
    { 
      $set: { 
        passwordHash,
        updatedAt: new Date() 
      } 
    }
  )

  return result.modifiedCount > 0
}

export async function updateUserStats(
  id: string,
  orderTotal: number,
  savedAmount: number
): Promise<void> {
  const col = await collections.users()
  
  await col.updateOne(
    { id },
    {
      $inc: {
        "stats.totalOrders": 1,
        "stats.totalSpent": orderTotal,
        "stats.savedAmount": savedAmount,
      },
      $set: {
        "stats.lastOrderDate": new Date(),
        updatedAt: new Date(),
      },
    }
  )
}

export async function recordLogin(id: string): Promise<void> {
  const col = await collections.users()
  
  await col.updateOne(
    { id },
    { $set: { lastLoginAt: new Date() } }
  )
}

// ============================================
// Addresses
// ============================================

export async function addUserAddress(
  userId: string,
  address: Omit<Address, "id">
): Promise<Address> {
  const col = await collections.users()
  
  const newAddress: Address = {
    ...address,
    id: generateId(),
  }

  // If this is the first address or marked as default, update other addresses
  if (address.isDefault) {
    await col.updateOne(
      { id: userId },
      { $set: { "addresses.$[].isDefault": false } }
    )
  }

  await col.updateOne(
    { id: userId },
    { 
      $push: { addresses: newAddress },
      $set: { updatedAt: new Date() }
    }
  )

  log.info("Address added", { userId, addressId: newAddress.id })
  return newAddress
}

export async function updateUserAddress(
  userId: string,
  addressId: string,
  updates: Partial<Address>
): Promise<boolean> {
  const col = await collections.users()
  
  const updateFields: any = {}
  Object.entries(updates).forEach(([key, value]) => {
    updateFields[`addresses.$.${key}`] = value
  })
  updateFields.updatedAt = new Date()

  const result = await col.updateOne(
    { id: userId, "addresses.id": addressId },
    { $set: updateFields }
  )

  return result.modifiedCount > 0
}

export async function deleteUserAddress(
  userId: string,
  addressId: string
): Promise<boolean> {
  const col = await collections.users()
  
  const result = await col.updateOne(
    { id: userId },
    { 
      $pull: { addresses: { id: addressId } },
      $set: { updatedAt: new Date() }
    }
  )

  return result.modifiedCount > 0
}

// ============================================
// Delete
// ============================================

export async function deleteUser(id: string): Promise<boolean> {
  const col = await collections.users()
  
  // Soft delete - just deactivate
  const result = await col.updateOne(
    { id },
    { 
      $set: { 
        isActive: false,
        updatedAt: new Date() 
      } 
    }
  )

  if (result.modifiedCount > 0) {
    log.info("User deactivated", { userId: id })
    return true
  }
  
  return false
}

export async function hardDeleteUser(id: string): Promise<boolean> {
  const col = await collections.users()
  
  const result = await col.deleteOne({ id })
  
  if (result.deletedCount > 0) {
    log.info("User permanently deleted", { userId: id })
    return true
  }
  
  return false
}

// ============================================
// Authentication Helpers
// ============================================

export async function verifyPassword(
  user: User,
  password: string
): Promise<boolean> {
  if (!user.passwordHash) {
    return false
  }
  return bcrypt.compare(password, user.passwordHash)
}

export async function linkProvider(
  userId: string,
  provider: "google" | "apple" | "facebook",
  providerId: string
): Promise<boolean> {
  const col = await collections.users()
  
  const result = await col.updateOne(
    { id: userId },
    { 
      $set: { 
        [`providers.${provider}`]: providerId,
        updatedAt: new Date()
      } 
    }
  )

  return result.modifiedCount > 0
}
