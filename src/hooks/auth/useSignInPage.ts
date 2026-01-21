/**
 * Custom Hook for Sign In Page
 * Manages form state, validation, and business logic for the sign in page
 * Uses NextAuth directly instead of TanStack Query
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/better-auth-client";
import { type SignInInput, signInSchema } from "@/lib/validation";

export function useSignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const formState = form.formState;
  const formValues = form.watch();

  // Check if form is valid and all required fields are filled
  const isFormValid =
    formState.isValid &&
    formValues.email.trim() !== "" &&
    formValues.password.trim() !== "";

  const handleGoogleSignIn = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
      errorCallbackURL: "/auth/error",
    });
  };

  const handleEmailSignIn = async (data: SignInInput) => {
    setError(null);

    startTransition(async () => {
      const { error: signInError } = await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          callbackURL: callbackUrl,
          rememberMe: true,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message || "Invalid email or password");
          },
          onSuccess: () => {
            router.push(callbackUrl);
            router.refresh();
          },
        },
      );

      if (signInError) {
        setError(signInError.message || "Failed to sign in");
      }
    });
  };

  return {
    // Form
    form,
    isFormValid,

    // State
    isLoading: isPending,
    error,
    callbackUrl,

    // Handlers
    handleGoogleSignIn,
    handleEmailSignIn,
  };
}
