import type { RecentDomain } from "@/application/dtos/admin.dto";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RecentGroup } from "@/types/admin";

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
              const isGroup = "adminName" in item && "memberCount" in item;
              const isDomain = "categoryCount" in item;

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
                              {(item as RecentGroup).adminName || "Unknown"}
                            </span>{" "}
                            • <span className="sr-only">Members: </span>
                            <span className="font-medium">
                              {(item as RecentGroup).memberCount} members
                            </span>
                          </>
                        )}
                        {isDomain && (
                          <>
                            <span className="sr-only">Categories: </span>
                            <span className="font-medium">
                              {(item as RecentDomain).categoryCount} categories
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <time
                      dateTime={item.createdAt}
                      className="text-xs text-muted-foreground ml-4 flex-shrink-0"
                    >
                      {new Date(item.createdAt).toLocaleDateString()}
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
