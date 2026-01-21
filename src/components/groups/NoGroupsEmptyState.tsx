import Link from "next/link";
import { Button } from "@/components/ui/button";

export const NoGroupsEmptyState = () => {
  return (
    <div className="rounded-lg border p-12 text-center">
      <div className="text-6xl mb-4" aria-hidden="true">
        👥
      </div>
      <h3 className="text-lg font-semibold mb-2">No groups yet</h3>
      <p className="text-muted-foreground mb-6">
        You haven&apos;t joined any learning groups yet. Ask an admin to invite
        you!
      </p>
      <Link href="/">
        <Button>Go to Home</Button>
      </Link>
    </div>
  );
};
