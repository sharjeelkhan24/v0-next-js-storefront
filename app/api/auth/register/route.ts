/**
 * Registration API
 * 
 * User registration endpoint
 */

import { NextRequest, NextResponse } from "next/server"
import { registerUser } from "@/lib/auth"
import { logger } from "@/lib/logger"
import { z } from "zod"

const log = logger.child({ module: "register-api" })

const RegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1, "Name is required"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const validation = RegisterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Validation failed",
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const { email, password, name } = validation.data

    const result = await registerUser({ email, password, name })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    log.info("User registered via API", { email })

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please sign in.",
      userId: result.userId,
    }, { status: 201 })

  } catch (error) {
    log.exception(error instanceof Error ? error : new Error(String(error)))
    return NextResponse.json(
      { success: false, error: "Registration failed" },
      { status: 500 }
    )
  }
}
