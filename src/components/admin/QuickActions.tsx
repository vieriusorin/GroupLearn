"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface QuickAction {
  href: string;
  icon: string;
  title: string;
  description: string;
  ariaLabel: string;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions = ({ actions }: QuickActionsProps) => {
  return (
    <nav
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
      aria-label="Quick actions"
    >
      {actions.map((action) => {
        if (action.disabled) {
          return (
            <Card
              key={action.href}
              className="cursor-not-allowed opacity-50"
              aria-label={action.ariaLabel}
              aria-disabled="true"
            >
              <CardContent className="p-6">
                <div className="mb-2 text-2xl" aria-hidden="true">
                  {action.icon}
                </div>
                <h3 className="mb-1 font-semibold">{action.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          );
        }

        return (
          <Link
            key={action.href}
            href={action.href}
            className="block"
            aria-label={action.ariaLabel}
          >
            <Card className="cursor-pointer transition-all hover:shadow-md">
              <CardContent className="p-6">
                <div className="mb-2 text-2xl" aria-hidden="true">
                  {action.icon}
                </div>
                <h3 className="mb-1 font-semibold">{action.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </nav>
  );
};
