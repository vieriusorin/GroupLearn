"use client";

import {
  Calendar,
  CheckCircle2,
  Loader2,
  Mail,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import {
  acceptInvitationAction,
  getInvitation,
} from "@/presentation/actions/invitations";
import type { InvitationData } from "@/types/invitation";

const InvitationPage = () => {
  const params = useParams();
  const router = useRouter();
  const { session, status } = useAuthSession();
  const token = params.token as string;

  const [invitationData, setInvitationData] = useState<InvitationData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, startAcceptTransition] = useTransition();
  const [acceptSuccess, setAcceptSuccess] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);
  const hasAttemptedAutoAccept = useRef(false);

  const isAuthenticated = status === "authenticated";
  const userEmail = session?.user?.email?.toLowerCase();
  const invitationEmail = invitationData?.invitation?.email.toLowerCase();
  const emailMatches = useMemo(
    () => userEmail === invitationEmail,
    [userEmail, invitationEmail],
  );

  const expiryDate = useMemo(() => {
    if (!invitationData?.invitation?.expiresAt) return "";
    return new Date(invitationData.invitation.expiresAt).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  }, [invitationData?.invitation?.expiresAt]);

  useEffect(() => {
    let cancelled = false;

    async function loadInvitation() {
      setIsLoading(true);
      setError(null);

      try {
        if (!token) {
          throw new Error("Invitation token is missing");
        }

        const result = await getInvitation(token);

        if (cancelled) return;

        if (!result.success) {
          setError(result.error || "Failed to fetch invitation");
          setInvitationData(result.data as InvitationData | null);
        } else {
          setInvitationData(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch invitation",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = useCallback(() => {
    if (!session) {
      const callbackUrl = `/invitations/${token}`;
      router.push(
        `/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
      return;
    }

    startAcceptTransition(async () => {
      try {
        setAcceptError(null);
        const result = await acceptInvitationAction(token);

        if (!result.success) {
          setAcceptError(result.error || "Failed to accept invitation");
          return;
        }

        setAcceptSuccess(true);

        setTimeout(() => {
          router.push("/");
        }, 2000);
      } catch (err) {
        setAcceptError(
          err instanceof Error ? err.message : "Failed to accept invitation",
        );
      }
    });
  }, [session, token, router]);

  const handleSignUpRedirect = () => {
    const callbackUrl = `/invitations/${token}`;
    router.push(`/auth/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  };

  useEffect(() => {
    if (
      !hasAttemptedAutoAccept.current &&
      isAuthenticated &&
      emailMatches &&
      invitationData?.valid &&
      !isAccepting &&
      !acceptSuccess &&
      !acceptError
    ) {
      hasAttemptedAutoAccept.current = true;

      const timer = setTimeout(() => {
        handleAccept();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    isAuthenticated,
    emailMatches,
    invitationData?.valid,
    isAccepting,
    acceptSuccess,
    acceptError,
    handleAccept,
  ]);

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        aria-live="polite"
      >
        <div className="text-center space-y-4">
          <Loader2
            className="h-8 w-8 animate-spin mx-auto text-muted-foreground"
            aria-hidden="true"
          />
          <p className="text-muted-foreground">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitationData || !invitationData.valid) {
    const errorMessage =
      invitationData?.message ||
      invitationData?.error ||
      error ||
      "Invalid invitation";

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle
              className="h-12 w-12 mx-auto text-destructive mb-4"
              aria-hidden="true"
            />
            <CardTitle className="text-2xl">Invitation Not Available</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/" aria-label="Go to home page">
              <Button variant="outline">Go to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const { invitation, group } = invitationData;

  if (isAuthenticated && !emailMatches && invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle
              className="h-12 w-12 mx-auto text-destructive mb-4"
              aria-hidden="true"
            />
            <CardTitle className="text-2xl">Email Mismatch</CardTitle>
            <CardDescription>
              This invitation was sent to <strong>{invitation.email}</strong>,
              but you're signed in as{" "}
              <strong>{session?.user?.email ?? "your account"}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                Please sign out and sign in with the email address that received
                this invitation.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              onClick={handleSignUpRedirect}
              className="w-full"
              aria-label="Sign up or sign in with the correct email address"
            >
              Sign Up / Sign In with Correct Email
            </Button>
            <Link href="/" className="w-full" aria-label="Go to home page">
              <Button variant="outline" className="w-full">
                Go to Home
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (acceptSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2
              className="h-12 w-12 mx-auto text-green-500 mb-4"
              aria-hidden="true"
            />
            <CardTitle className="text-2xl">Successfully Joined!</CardTitle>
            <CardDescription>
              You've been added to the group. Redirecting...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <Mail
              className="h-8 w-8 text-green-600 dark:text-green-400"
              aria-hidden="true"
            />
          </div>
          <CardTitle className="text-2xl">You're Invited!</CardTitle>
          <CardDescription>
            Join a learning group and start your journey
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {acceptError && (
            <Alert variant="destructive">
              <AlertDescription>{acceptError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <h2 className="font-semibold text-lg mb-2">{group?.name}</h2>
              {group?.description && (
                <p className="text-sm text-muted-foreground">
                  {group.description}
                </p>
              )}
            </div>

            <dl className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <dt className="sr-only">Member count</dt>
                <dd className="flex items-center gap-2">
                  <Users
                    className="h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <span className="text-muted-foreground">
                    {group?.memberCount || 0}{" "}
                    {group?.memberCount === 1 ? "member" : "members"}
                  </span>
                </dd>
              </div>
              {invitation && (
                <>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Invited by</dt>
                    <dd className="flex items-center gap-2">
                      <Mail
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="text-muted-foreground">
                        Invited by{" "}
                        <strong>
                          {invitation.invitedByName || invitation.invitedBy}
                        </strong>
                      </span>
                    </dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <dt className="sr-only">Expires on</dt>
                    <dd className="flex items-center gap-2">
                      <Calendar
                        className="h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <span className="text-muted-foreground">
                        Expires on {expiryDate}
                      </span>
                    </dd>
                  </div>
                </>
              )}
            </dl>

            {!isAuthenticated && invitation && (
              <Alert>
                <AlertDescription>
                  You need to create an account or sign in to accept this
                  invitation. The invitation was sent to{" "}
                  <strong>{invitation.email}</strong>. You can sign up with
                  email/password or use Google.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          <Button
            onClick={handleAccept}
            disabled={isAccepting}
            className="w-full"
            size="lg"
            aria-label={
              isAuthenticated
                ? "Accept invitation"
                : "Sign up or sign in to accept invitation"
            }
          >
            {isAccepting ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Accepting...
              </>
            ) : isAuthenticated ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Accept Invitation
              </>
            ) : (
              "Sign Up / Sign In to Accept"
            )}
          </Button>
          <Link href="/" className="w-full" aria-label="Go to home page">
            <Button variant="outline" className="w-full">
              Go to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default InvitationPage;
