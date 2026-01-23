"use client";

import {
  BookOpen,
  LogOut,
  Repeat,
  Settings,
  Shield,
  TrendingUp,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { HeartsDisplay } from "@/components/gamification/HeartsDisplay";
import { StreakDisplay } from "@/components/gamification/StreakDisplay";
import { XPProgressBar } from "@/components/gamification/XPProgressBar";
import { ThemeToggle } from "@/components/settings/ThemeToggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthSession } from "@/hooks/auth/useAuthSession";
import { authClient } from "@/lib/auth/better-auth-client";
import { calculateAvailableHearts } from "@/lib/gamification/gamification";
import { cn } from "@/lib/shared/utils";
import { getPaths } from "@/presentation/actions/paths/get-paths";
import { getUserProgress } from "@/presentation/actions/progress/get-user-progress";

interface ProgressData {
  pathId: number;
  currentUnitId: number | null;
  currentLessonId: number | null;
  totalXp: number;
  hearts: number;
  nextHeartRefillMinutes: number;
  streakCount: number;
  lastActivityDate: string | null;
  completionPercent: number;
  unitsCompleted: number;
  totalUnits: number;
  lessonsCompleted: number;
  totalLessons: number;
}

export function TopBar() {
  const pathname = usePathname();
  const { session, status } = useAuthSession();
  const [isPending, startTransition] = useTransition();
  const [progressData, setProgressData] = useState<ProgressData | null>(null);

  // Fetch paths and progress when authenticated
  useEffect(() => {
    if (status === "authenticated") {
      startTransition(async () => {
        try {
          // Fetch paths
          const pathsResult = await getPaths();
          if (
            !pathsResult.success ||
            !pathsResult.data ||
            pathsResult.data.length === 0
          ) {
            return;
          }

          const firstPathId = pathsResult.data[0].id;

          // Fetch progress for first path
          const progressResult = await getUserProgress(firstPathId);
          if (!progressResult.success || !progressResult.data) {
            return;
          }

          const progress = progressResult.data.progress;

          // Calculate available hearts
          const { hearts, nextRefillMinutes } = calculateAvailableHearts(
            progress.hearts,
            new Date(progress.lastHeartRefill),
          );

          // Map to ProgressData format
          setProgressData({
            pathId: progress.pathId,
            currentUnitId: progress.currentUnitId,
            currentLessonId: progress.currentLessonId,
            totalXp: progress.totalXP,
            hearts,
            nextHeartRefillMinutes: nextRefillMinutes,
            streakCount: progress.streakCount,
            lastActivityDate: progress.lastActivityDate,
            completionPercent: 0, // Not available from GetUserProgressResponse
            unitsCompleted: 0, // Not available from GetUserProgressResponse
            totalUnits: 0, // Not available from GetUserProgressResponse
            lessonsCompleted: 0, // Not available from GetUserProgressResponse
            totalLessons: 0, // Not available from GetUserProgressResponse
          });
        } catch (error) {
          console.error("Failed to fetch progress for TopBar:", error);
        }
      });
    }
  }, [status]);

  const navLinks = [
    { href: "/", label: "Learn", icon: BookOpen },
    { href: "/progress", label: "Progress", icon: TrendingUp },
    { href: "/review", label: "Practice", icon: Repeat },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  // Add admin link if user is admin
  const isAdmin = session?.user?.role === "admin";
  const allNavLinks = isAdmin
    ? [...navLinks, { href: "/admin", label: "Admin", icon: Shield }]
    : navLinks;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">Learning Cards</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {allNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;

              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn("gap-2", isActive && "bg-secondary")}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Side - Gamification */}
        <div className="flex items-center gap-4">
          {status === "authenticated" && progressData && !isPending && (
            <>
              <div className="hidden lg:block w-32">
                <XPProgressBar
                  currentXP={progressData.totalXp % 100}
                  goalXP={100}
                />
              </div>
              <HeartsDisplay
                currentHearts={progressData.hearts}
                maxHearts={5}
                nextRefillMinutes={progressData.nextHeartRefillMinutes}
              />
              <StreakDisplay streakCount={progressData.streakCount} />
            </>
          )}

          <ThemeToggle />

          {/* User Menu or Sign In */}
          {status === "loading" ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
          ) : status === "authenticated" && session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {session.user.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    authClient.signOut({
                      fetchOptions: {
                        onSuccess: () => {
                          window.location.href = "/auth/signin";
                        },
                      },
                    })
                  }
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() =>
                authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/",
                })
              }
              size="sm"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
