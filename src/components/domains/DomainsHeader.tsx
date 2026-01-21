import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  right?: ReactNode;
  hasError?: boolean;
};

export const DomainsHeader = ({ right, hasError }: Props) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <Link href="/">
          <Button variant="ghost" className="mb-2">
            ← Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">Manage Domains</h1>
        <p className="text-muted-foreground">
          Organize your learning by domains and categories
        </p>
        {hasError && (
          <p className="mt-2 text-sm text-destructive">
            Failed to load some data. Please refresh the page or try again.
          </p>
        )}
      </div>
      {right}
    </div>
  );
};
