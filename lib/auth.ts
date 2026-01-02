/**
 * NextAuth.js Configuration
 * 
 * Authentication for the application
 */

import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import * as userRepo from "./db/repositories/user-repo"
import { logger } from "./logger"

const log = logger.child({ module: "auth" })

export const authOptions: NextAuthOptions = {
  providers: [
    // Email/Password Authentication
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required")
        }

        const user = await userRepo.getUserByEmail(credentials.email)
        
        if (!user) {
          throw new Error("No user found with this email")
        }

        if (!user.isActive) {
          throw new Error("Account has been deactivated")
        }

        const isValid = await userRepo.verifyPassword(user, credentials.password)
        
        if (!isValid) {
          throw new Error("Invalid password")
        }

        // Record login
        await userRepo.recordLogin(user.id)

        log.info("User logged in", { userId: user.id, email: user.email })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.avatar,
        }
      },
    }),

    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          let dbUser = await userRepo.getUserByEmail(user.email!)
          
          if (!dbUser) {
            // Create new user
            dbUser = await userRepo.createUser({
              email: user.email!,
              name: user.name || "User",
              provider: { type: "google", id: account.providerAccountId },
            })
            log.info("New Google user created", { userId: dbUser.id })
          } else if (!dbUser.providers?.google) {
            // Link Google account to existing user
            await userRepo.linkProvider(dbUser.id, "google", account.providerAccountId)
            log.info("Google account linked", { userId: dbUser.id })
          }

          await userRepo.recordLogin(dbUser.id)
          return true
        } catch (error) {
          log.error("Google sign in error", { error })
          return false
        }
      }

      return true
    },

    async jwt({ token, user, account }) {
      if (user) {
        // Initial sign in
        token.id = user.id
        token.role = (user as any).role || "customer"
      }

      if (account?.provider === "google") {
        // Fetch user from database to get role
        const dbUser = await userRepo.getUserByEmail(token.email!)
        if (dbUser) {
          token.id = dbUser.id
          token.role = dbUser.role
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id
        (session.user as any).role = token.role
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-change-in-production",

  debug: process.env.NODE_ENV === "development",
}

// ============================================
// Helper Functions
// ============================================

export async function registerUser(data: {
  email: string
  password: string
  name: string
}): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    // Check if email already exists
    const existing = await userRepo.getUserByEmail(data.email)
    if (existing) {
      return { success: false, error: "Email already registered" }
    }

    // Validate password
    if (data.password.length < 8) {
      return { success: false, error: "Password must be at least 8 characters" }
    }

    // Create user
    const user = await userRepo.createUser({
      email: data.email,
      password: data.password,
      name: data.name,
    })

    log.info("User registered", { userId: user.id, email: user.email })

    return { success: true, userId: user.id }
  } catch (error) {
    log.error("Registration error", { error })
    return { success: false, error: "Registration failed" }
  }
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await userRepo.getUserById(userId)
    if (!user) {
      return { success: false, error: "User not found" }
    }

    const isValid = await userRepo.verifyPassword(user, currentPassword)
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" }
    }

    if (newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters" }
    }

    await userRepo.updateUserPassword(userId, newPassword)

    log.info("Password changed", { userId })

    return { success: true }
  } catch (error) {
    log.error("Password change error", { error })
    return { success: false, error: "Failed to change password" }
  }
}

// ============================================
// Type Extensions
// ============================================

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role: "customer" | "admin" | "vendor"
    }
  }

  interface User {
    id: string
    role: "customer" | "admin" | "vendor"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "customer" | "admin" | "vendor"
  }
}
