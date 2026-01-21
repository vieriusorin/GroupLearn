"use client";

import Link from "next/link";

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

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <nav
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      aria-label="Quick actions"
    >
      {actions.map((action) => {
        if (action.disabled) {
          return (
            <div
              key={action.href}
              className="bg-white rounded-lg shadow-sm border p-6 opacity-50 cursor-not-allowed"
              aria-label={action.ariaLabel}
              aria-disabled="true"
            >
              <div className="text-2xl mb-2" aria-hidden="true">
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          );
        }

        return (
          <Link
            key={action.href}
            href={action.href}
            className="block"
            aria-label={action.ariaLabel}
          >
            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md hover:border-blue-400 transition-all cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
              <div className="text-2xl mb-2" aria-hidden="true">
                {action.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.title}
              </h3>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
