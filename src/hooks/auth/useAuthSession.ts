"use client";

import type { AuthSession, AuthUser } from "@/domains/auth/auth-types";
import { authClient } from "@/lib/better-auth-client";

type Status = "loading" | "authenticated" | "unauthenticated";

export const useAuthSession = () => {
  const { data, isPending, error } = authClient.useSession();

  let status: Status = "unauthenticated";

  if (isPending) {
    status = "loading";
  } else if (data?.user) {
    status = "authenticated";
  }

  const user = data?.user as AuthUser | undefined;

  return {
    session: (data as AuthSession | null) ?? null,
    user,
    status,
    isLoading: isPending,
    error,
  };
};
