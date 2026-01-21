import Link from "next/link";
import type { GroupPath } from "@/presentation/actions/groups";

type Props = {
  paths: GroupPath[];
};

export const GroupLearningPathsGrid = ({ paths }: Props) => {
  if (paths.length === 0) {
    return (
      <div className="rounded-lg border p-12 text-center">
        <div className="text-6xl mb-4" aria-hidden="true">
          🎯
        </div>
        <h3 className="text-lg font-semibold mb-2">No learning paths yet</h3>
        <p className="text-muted-foreground">
          Your group admin hasn&apos;t assigned any learning paths yet. Check
          back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paths.map((path) => (
        <Link key={path.id} href={`/domains/${path.id}`} className="block">
          <div className="rounded-lg border p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">{path.name}</h3>
                {path.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {path.description}
                  </p>
                )}
              </div>
              <span className="text-2xl ml-2" aria-hidden="true">
                🎯
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-muted-foreground">
                {path.unit_count || 0} units
              </span>
              <span className="text-sm font-medium text-primary">
                Start Learning →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
