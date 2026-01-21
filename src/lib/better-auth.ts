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
