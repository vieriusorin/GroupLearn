import { headers } from "next/headers";
import type { AuthSession } from "@/domains/auth/auth-types";
import { auth as betterAuth } from "./better-auth";

// Server-side auth helper backed by Better Auth
export const auth = async (): Promise<AuthSession | null> => {
  try {
    const headersList = await headers();

    const session = await betterAuth.api.getSession({
      headers: headersList,
    });

    if (!session || !session.user) {
      return null;
    }

    // Map Better Auth session to our AuthSession type
    return {
      user: {
        id: session.user.id,
        name: session.user.name ?? null,
        email: session.user.email,
        image: session.user.image ?? null,
        // These custom fields are populated from the database via action-wrapper / RBAC utilities
        role: (session.user as any).role ?? "member",
        subscriptionStatus: (session.user as any).subscriptionStatus ?? "free",
        subscriptionExpiresAt:
          (session.user as any).subscriptionExpiresAt ?? null,
      },
    } as AuthSession;
  } catch (error) {
    if (error instanceof Error) {
      console.error("[auth] Error getting session:", error.message);
    }
    return null;
  }
};

export { betterAuth as authInstance };
