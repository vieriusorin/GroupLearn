"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { z } from "zod";
import type { RegisterResult } from "@/application/dtos/auth.dto";
import { auth } from "@/lib/auth/better-auth";
import { passwordSchema } from "@/lib/shared/validation";
import type { ActionResult } from "@/presentation/types/action-result";

const registerActionSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z.string().email("Invalid email address"),
  password: passwordSchema,
  callbackUrl: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerActionSchema>;

export async function registerUser(
  input: RegisterInput,
): Promise<ActionResult<RegisterResult>> {
  try {
    const validation = registerActionSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation failed",
        code: "VALIDATION_ERROR",
      };
    }

    const { name, email, password, callbackUrl } = validation.data;

    const headersList = await headers();

    try {
      await auth.api.signUpEmail({
        body: {
          name,
          email,
          password,
          callbackURL: callbackUrl,
        },
        headers: headersList,
      });

      return {
        success: true,
        data: {
          success: true,
          message: "Account created successfully",
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        // Better Auth returns specific error messages
        let errorMessage = error.message || "Failed to create account";

        // Check for common error cases
        if (
          error.status === 409 ||
          errorMessage.toLowerCase().includes("already exists")
        ) {
          errorMessage =
            "An account with this email already exists. Please sign in instead.";
        }

        return {
          success: false,
          error: errorMessage,
          code: error.status === 409 ? "USER_ALREADY_EXISTS" : "AUTH_ERROR",
        };
      }

      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again.",
      code: "INTERNAL_ERROR",
    };
  }
}
