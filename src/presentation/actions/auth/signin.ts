"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/better-auth";
import { signInSchema } from "@/lib/shared/validation";
import type { ActionResult } from "@/presentation/types/action-result";

const signInActionSchema = signInSchema.extend({
  callbackUrl: z.string().optional(),
  rememberMe: z.boolean().optional().default(true),
});

export type SignInInput = z.infer<typeof signInActionSchema>;

export type SignInResult = {
  success: boolean;
  message: string;
};

export async function signIn(
  input: SignInInput,
): Promise<ActionResult<SignInResult>> {
  try {
    const validation = signInActionSchema.safeParse(input);

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      return {
        success: false,
        error: firstError?.message || "Validation failed",
        code: "VALIDATION_ERROR",
      };
    }

    const { email, password, callbackUrl, rememberMe } = validation.data;

    const headersList = await headers();

    try {
      await auth.api.signInEmail({
        body: {
          email,
          password,
          rememberMe,
          callbackURL: callbackUrl,
        },
        headers: headersList,
      });

      return {
        success: true,
        data: {
          success: true,
          message: "Signed in successfully",
        },
      };
    } catch (error) {
      if (error instanceof APIError) {
        return {
          success: false,
          error: error.message || "Invalid email or password",
          code: error.status === 401 ? "UNAUTHORIZED" : "AUTH_ERROR",
        };
      }

      throw error;
    }
  } catch (error) {
    console.error("Sign in error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to sign in. Please try again.",
      code: "INTERNAL_ERROR",
    };
  }
}
