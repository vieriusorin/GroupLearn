import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentDomain, RecentGroup } from "@/types/admin";

interface RecentActivityCardProps {
  title: string;
  items: RecentGroup[] | RecentDomain[];
  emptyMessage: string;
}

export function RecentActivityCard({
  title,
  items,
  emptyMessage,
}: RecentActivityCardProps) {
  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item) => {
              const isGroup = "admin_name" in item && "member_count" in item;
              const isDomain = "category_count" in item;

              return (
                <li key={item.id}>
                  <div className="flex items-center justify-between p-4 bg-accent/50 hover:bg-accent rounded-lg border border-border/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isGroup && (
                          <>
                            By <span className="sr-only">Admin: </span>
                            <span className="font-medium">
                              {(item as RecentGroup).admin_name || "Unknown"}
                            </span>{" "}
                            • <span className="sr-only">Members: </span>
                            <span className="font-medium">
                              {(item as RecentGroup).member_count} members
                            </span>
                          </>
                        )}
                        {isDomain && (
                          <>
                            <span className="sr-only">Categories: </span>
                            <span className="font-medium">
                              {(item as RecentDomain).category_count} categories
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <time
                      dateTime={item.created_at}
                      className="text-xs text-muted-foreground ml-4 flex-shrink-0"
                    >
                      {new Date(item.created_at).toLocaleDateString()}
                    </time>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">{emptyMessage}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
