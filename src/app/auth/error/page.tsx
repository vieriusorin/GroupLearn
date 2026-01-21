"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification:
      "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication.",
  };

  const errorMessage =
    errorMessages[error || "Default"] || errorMessages.Default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Authentication Error
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {errorMessage}
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button asChild className="w-full" size="lg">
            <Link href="/auth/signin">Try Again</Link>
          </Button>

          <Button asChild variant="outline" className="w-full" size="lg">
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
