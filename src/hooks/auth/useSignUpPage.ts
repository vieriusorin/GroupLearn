/**
 * Custom Hook for Sign Up Page
 * Manages form state, validation, and business logic for the sign up page
 * Uses Server Actions instead of TanStack Query
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/better-auth-client";
import { type RegisterInput, registerSchema } from "@/lib/validation";
import { registerUser } from "@/presentation/actions/auth";

export function useSignUpPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [errorSuggestion, setErrorSuggestion] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
    criteriaMode: "all",
  });

  const password = form.watch("password");
  const formState = form.formState;
  const formValues = form.watch();

  // Check if form is valid and all required fields are filled
  const isFormValid =
    formState.isValid &&
    formValues.name.trim() !== "" &&
    formValues.email.trim() !== "" &&
    formValues.password.trim() !== "" &&
    formValues.confirmPassword.trim() !== "";

  const handleGoogleSignUp = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
      errorCallbackURL: "/auth/error",
      newUserCallbackURL: "/",
    });
  };

  const handleEmailSignUp = async (data: RegisterInput) => {
    setError(null);
    setErrorSuggestion(null);
    setSuccess(false);

    startTransition(async () => {
      // Call Server Action to register user
      const result = await registerUser({
        name: data.name,
        email: data.email,
        password: data.password,
        callbackUrl,
      });

      if (!result.success) {
        setError(result.error || "Failed to create account");
        // Check if error mentions "already exists" to show suggestion
        if (result.error?.includes("already exists")) {
          setErrorSuggestion(
            "Please sign in instead or use a different email address",
          );
        }
        return;
      }

      // Success - now auto sign in via Better Auth
      setSuccess(true);

      const { error: signInError } = await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          callbackURL: callbackUrl,
          rememberMe: true,
        },
        {
          onError: (ctx) => {
            setError(ctx.error.message || "Failed to sign in");
          },
          onSuccess: () => {
            router.push(callbackUrl);
            router.refresh();
          },
        },
      );

      if (signInError) {
        router.push(
          `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        );
      }
    });
  };

  return {
    // Form
    form,
    password,
    isFormValid,

    // State
    isLoading: isPending,
    error,
    errorSuggestion,
    success,
    callbackUrl,

    // Handlers
    handleGoogleSignUp,
    handleEmailSignUp,
  };
}
