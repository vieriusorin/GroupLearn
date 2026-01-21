"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { StatCardColor } from "@/types/admin";

/**
 * StatCard Component
 * Displays a statistic with icon, value, and optional subtitle
 */

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: StatCardColor;
  href?: string;
  subtitle?: string;
}

export function StatCard({
  title,
  value,
  icon,
  color,
  href,
  subtitle,
}: StatCardProps) {
  const colorClasses = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-500/10 dark:bg-blue-500/20",
      border: "border-l-blue-500",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      bg: "bg-green-500/10 dark:bg-green-500/20",
      border: "border-l-green-500",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-500/10 dark:bg-purple-500/20",
      border: "border-l-purple-500",
    },
    orange: {
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
      border: "border-l-orange-500",
    },
    pink: {
      gradient: "from-pink-500 to-pink-600",
      bg: "bg-pink-500/10 dark:bg-pink-500/20",
      border: "border-l-pink-500",
    },
    indigo: {
      gradient: "from-indigo-500 to-indigo-600",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
      border: "border-l-indigo-500",
    },
  };

  const colors = colorClasses[color];

  const content = (
    <CardContent className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl" aria-hidden="true">
          {icon}
        </div>
        <div
          className={cn(
            "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
            colors.gradient,
          )}
          aria-hidden="true"
        />
      </div>
      <div className="space-y-1">
        <div className="text-3xl font-bold tracking-tight">
          <span className="sr-only">{title}: </span>
          {typeof value === "number" ? value.toLocaleString() : value}
        </div>
        <div className="text-sm font-semibold text-muted-foreground">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-muted-foreground/80 mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </CardContent>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`${title}: ${value}`}>
        <Card
          className={cn(
            "border-2 border-l-4 hover:shadow-lg hover:border-primary/50 transition-all duration-200",
            colors.border,
          )}
        >
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card
      aria-label={title}
      className={cn("border-2 border-l-4", colors.border)}
    >
      {content}
    </Card>
  );
}
