"use client";

import { Chrome, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { PasswordStrengthTracker } from "@/components/auth/PasswordStrengthTracker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSignUpPage } from "@/hooks/auth/useSignUpPage";

export default function SignUpPage() {
  const {
    form,
    password,
    isFormValid,
    isLoading,
    error,
    errorSuggestion,
    success,
    callbackUrl,
    handleGoogleSignUp,
    handleEmailSignUp,
  } = useSignUpPage();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600 dark:text-green-400">
            Learning Cards
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Create your account to get started
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleGoogleSignUp}
            className="w-full"
            size="lg"
            variant="outline"
          >
            <Chrome className="mr-2 h-5 w-5" />
            Sign up with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground dark:bg-gray-800">
                Or sign up with email
              </span>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleEmailSignUp)}
              className="space-y-4"
            >
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>{error}</p>
                      {errorSuggestion && (
                        <p className="text-sm">{errorSuggestion}</p>
                      )}
                      {error?.includes("already exists") && (
                        <Link
                          href={`/auth/signin${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                          className="text-sm font-medium underline hover:no-underline"
                        >
                          Sign in instead →
                        </Link>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert>
                  <AlertDescription>
                    Account created successfully! Signing you in...
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="Your name"
                        disabled={isLoading || success}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        disabled={isLoading || success}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="At least 8 characters with uppercase, number, and special character"
                        disabled={isLoading || success}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                    {password && (
                      <PasswordStrengthTracker password={password} />
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirm your password"
                        disabled={isLoading || success}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading || !isFormValid || success}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-5 w-5" />
                    Create Account
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              href={`/auth/signin${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
              className="text-green-600 hover:underline dark:text-green-400"
            >
              Sign in
            </Link>
          </div>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
