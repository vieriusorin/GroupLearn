import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Group } from "@/presentation/actions/groups";

type Props = {
  group: Group;
};

export const GroupLearningHeader = ({ group }: Props) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Link href="/groups">
          <Button variant="outline" size="sm">
            ← Back to Groups
          </Button>
        </Link>
      </div>
      <h1 className="text-3xl font-bold">{group.name}</h1>
      {group.description && (
        <p className="text-muted-foreground mt-1">{group.description}</p>
      )}
    </div>
  );
};
