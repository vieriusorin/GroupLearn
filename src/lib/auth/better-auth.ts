import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/infrastructure/database/drizzle";
import {
  groupInvitations,
  InvitationStatus,
  schema,
  users,
} from "@/infrastructure/database/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      account: schema.accounts,
      session: schema.sessions,
      verification: schema.verification,
    },
  }),
  account: {
    modelName: "accounts",
    fields: {
      accountId: "providerAccountId",
      providerId: "provider",
      accessToken: "accessToken",
      refreshToken: "refreshToken",
      scope: "scope",
      idToken: "idToken",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  },
  session: {
    modelName: "sessions",
    fields: {
      token: "token",
      expiresAt: "expiresAt",
      ipAddress: "ipAddress",
      userAgent: "userAgent",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    // Shorter-lived sessions with sliding expiration on activity
    expiresIn: 60 * 60 * 24, // 24 hours
    updateAge: 60 * 15, // refresh expiry after 15 minutes of activity
    // Keep DB as source of truth, but cache session data in a short-lived cookie
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
      strategy: "jwe",
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "member",
        input: false, // Prevent users from setting role during signup
      },
      subscriptionStatus: {
        type: "string",
        required: false,
        defaultValue: "free",
        input: false, // Prevent users from setting subscription status during signup
      },
      subscriptionExpiresAt: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [nextCookies()],
  advanced: (() => {
    // Determine if we should use secure cookies based on environment
    // Secure cookies require HTTPS, so we only enable them in production or when using HTTPS
    const isProduction = process.env.NODE_ENV === "production";
    const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
    const isHttps = baseUrl.startsWith("https://");
    const useSecure = isProduction || isHttps;

    return {
      // Only force secure cookies in production or when using HTTPS
      useSecureCookies: useSecure,
      // Explicit cookie security attributes
      defaultCookieAttributes: {
        httpOnly: true, // Prevent JavaScript access to cookies (XSS protection)
        secure: useSecure, // Only send cookies over HTTPS (conditional based on environment)
        sameSite: "lax", // CSRF protection while allowing OAuth flows
      },
    };
  })(),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const now = new Date();

          const [pendingInvitation] = await db
            .select({ id: groupInvitations.id })
            .from(groupInvitations)
            .where(
              and(
                eq(groupInvitations.email, user.email.toLowerCase()),
                eq(groupInvitations.status, InvitationStatus.PENDING),
                gt(groupInvitations.expiresAt, now),
              ),
            )
            .limit(1);

          const role = pendingInvitation ? "member" : "admin";

          await db
            .update(users)
            .set({
              role,
              subscriptionStatus: "free",
            })
            .where(eq(users.id, user.id));
        },
      },
    },
  },
});
