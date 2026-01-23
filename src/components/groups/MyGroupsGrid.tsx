import Link from "next/link";
import type { MyGroupListItem } from "@/presentation/actions/groups";

type Props = {
  groups: MyGroupListItem[];
};

export const MyGroupsGrid = ({ groups }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <Link key={group.id} href={`/groups/${group.id}`} className="block">
          <div className="rounded-lg border p-6 hover:bg-accent transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">{group.name}</h3>
                  {group.role === "admin" && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      Admin
                    </span>
                  )}
                </div>
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                )}
              </div>
              <span className="text-2xl ml-2" aria-hidden="true">
                👥
              </span>
            </div>

            <div className="space-y-2 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Members:</span>
                <span className="font-medium">{group.memberCount || 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Learning Paths:</span>
                <span className="font-medium">{group.pathCount || 0}</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <span className="text-sm font-medium text-primary">
                View Learning Paths →
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};
