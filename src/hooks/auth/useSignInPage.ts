import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { authClient } from "@/lib/auth/better-auth-client";
import {
  type SignInInput as BaseSignInInput,
  signInSchema,
} from "@/lib/shared/validation";
import { signIn } from "@/presentation/actions/auth";

export function useSignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<BaseSignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange",
  });

  const formState = form.formState;
  const formValues = form.watch();

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

  const handleEmailSignIn = async (data: BaseSignInInput) => {
    setError(null);

    startTransition(async () => {
      const result = await signIn({
        email: data.email,
        password: data.password,
        callbackUrl,
        rememberMe: true,
      });

      if (!result.success) {
        setError(result.error || "Failed to sign in");
        return;
      }

      // Success - redirect and refresh
      router.push(callbackUrl);
      router.refresh();
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
