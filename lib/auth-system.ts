/**
 * Simple authentication system for staff and admin access
 * In production, use proper auth like Supabase or NextAuth
 */

export type UserRole = "staff" | "manager" | "owner" | "admin"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  password: string // In production, this would be hashed
  createdAt: Date
  lastLogin?: Date
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: Date
}

// Mock users for demo
export const mockUsers: User[] = [
  {
    id: "1",
    email: "sharjeel@irishtripplets.com",
    name: "Sharjeel (Owner)",
    role: "owner",
    password: "owner123", // Demo only - never store plain passwords
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "2",
    email: "admin@irishtripplets.com",
    name: "Admin User",
    role: "admin",
    password: "admin123",
    createdAt: new Date("2025-01-01"),
  },
  {
    id: "3",
    email: "manager@irishtripplets.com",
    name: "Sales Manager",
    role: "manager",
    password: "manager123",
    createdAt: new Date("2025-01-05"),
  },
  {
    id: "4",
    email: "staff@irishtripplets.com",
    name: "Staff Member",
    role: "staff",
    password: "staff123",
    createdAt: new Date("2025-01-10"),
  },
]

// Simple in-memory session store
let currentSession: AuthSession | null = null

/**
 * Login function
 */
export function login(email: string, password: string): AuthSession | null {
  const user = mockUsers.find((u) => u.email === email && u.password === password)

  if (!user) {
    return null
  }

  const session: AuthSession = {
    user: { ...user, lastLogin: new Date() },
    token: `token_${user.id}_${Date.now()}`,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  }

  currentSession = session
  return session
}

/**
 * Logout function
 */
export function logout(): void {
  currentSession = null
}

/**
 * Get current session
 */
export function getCurrentSession(): AuthSession | null {
  if (!currentSession) return null

  // Check if session is expired
  if (new Date() > currentSession.expiresAt) {
    currentSession = null
    return null
  }

  return currentSession
}

/**
 * Check if user has permission
 */
export function hasPermission(role: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy: Record<UserRole, number> = {
    staff: 1,
    manager: 2,
    owner: 3,
    admin: 4,
  }

  return roleHierarchy[role] >= roleHierarchy[requiredRole]
}
