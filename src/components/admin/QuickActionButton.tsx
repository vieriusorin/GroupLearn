import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { QuickActionProps } from "@/types/admin";

export function QuickActionButton({ href, icon, label }: QuickActionProps) {
  return (
    <Link href={href} aria-label={label} className="block">
      <Button
        variant="outline"
        className="w-full h-auto py-4 justify-start gap-3 hover:bg-accent hover:border-primary/50 transition-all"
      >
        <span className="text-2xl" aria-hidden="true">
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </Button>
    </Link>
  );
}
