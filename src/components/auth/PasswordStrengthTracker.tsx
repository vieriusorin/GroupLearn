"use client";

import { Check, X } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PasswordStrengthTrackerProps {
  password: string;
  className?: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export const PasswordStrengthTracker = ({
  password,
  className,
}: PasswordStrengthTrackerProps) => {
  const requirements = useMemo<Requirement[]>(() => {
    return [
      {
        label: "At least 8 characters",
        met: password.length >= 8,
      },
      {
        label: "One uppercase letter",
        met: /[A-Z]/.test(password),
      },
      {
        label: "One lowercase letter",
        met: /[a-z]/.test(password),
      },
      {
        label: "One number",
        met: /[0-9]/.test(password),
      },
      {
        label: "One special character",
        met: /[^A-Za-z0-9]/.test(password),
      },
    ];
  }, [password]);

  const strength = useMemo(() => {
    const metCount = requirements.filter((req) => req.met).length;
    if (metCount === 0) return { level: 0, label: "", color: "" };
    if (metCount <= 2) return { level: 1, label: "Weak", color: "bg-red-500" };
    if (metCount <= 3)
      return { level: 2, label: "Fair", color: "bg-yellow-500" };
    if (metCount <= 4) return { level: 3, label: "Good", color: "bg-blue-500" };
    return { level: 4, label: "Strong", color: "bg-green-500" };
  }, [requirements]);

  const allMet = requirements.every((req) => req.met);

  if (!password) {
    return null;
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Strength Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Password strength</span>
          {strength.label && (
            <span
              className={cn(
                "font-medium",
                strength.level === 1 && "text-red-500",
                strength.level === 2 && "text-yellow-500",
                strength.level === 3 && "text-blue-500",
                strength.level === 4 && "text-green-500",
              )}
            >
              {strength.label}
            </span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              strength.color,
              strength.level === 0 && "w-0",
              strength.level === 1 && "w-1/4",
              strength.level === 2 && "w-2/4",
              strength.level === 3 && "w-3/4",
              strength.level === 4 && "w-full",
            )}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-1.5">
        {requirements.map((requirement, index) => (
          <div
            key={index}
            className={cn(
              "flex items-center gap-2 text-xs transition-colors",
              requirement.met
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground",
            )}
          >
            {requirement.met ? (
              <Check className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>{requirement.label}</span>
          </div>
        ))}
      </div>

      {allMet && (
        <p className="text-xs text-green-600 dark:text-green-400 font-medium">
          ✓ Password meets all requirements
        </p>
      )}
    </div>
  );
};
