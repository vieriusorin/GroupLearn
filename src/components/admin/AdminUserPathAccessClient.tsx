"use client";

import {
  BookOpen,
  CheckCircle2,
  Globe,
  Lock,
  Users,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type {
  PathWithAccess,
  UserPathsResponse,
} from "@/application/dtos/admin.dto";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { updateUserPathAccess } from "@/presentation/actions/admin";

interface Props {
  user: UserPathsResponse["user"];
  paths: PathWithAccess[];
}

export function AdminUserPathAccessClient({ user, paths }: Props) {
  const [filter, setFilter] = useState<
    "all" | "approved" | "accessible" | "none"
  >("all");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleToggleAccess = async (
    pathId: number,
    currentApproved: boolean,
  ) => {
    startTransition(async () => {
      const result = await updateUserPathAccess(
        user.id,
        pathId,
        !currentApproved,
      );
      if (result.success) {
        router.refresh();
      } else {
        console.error("Failed to update path access:", result.error);
      }
    });
  };

  const filteredPaths = paths.filter((path) => {
    if (filter === "all") return true;
    if (filter === "approved") return path.isApproved;
    if (filter === "accessible") return path.canAccess;
    if (filter === "none")
      return !path.canAccess && path.visibility === "private";
    return true;
  });

  const groupedPaths = filteredPaths.reduce(
    (acc, path) => {
      if (!acc[path.domainName]) {
        acc[path.domainName] = [];
      }
      acc[path.domainName].push(path);
      return acc;
    },
    {} as Record<string, PathWithAccess[]>,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Learning Paths ({paths.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "accessible" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("accessible")}
            >
              Accessible
            </Button>
            <Button
              variant={filter === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("approved")}
            >
              Approved
            </Button>
            <Button
              variant={filter === "none" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("none")}
            >
              No Access
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {Object.keys(groupedPaths).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedPaths).map(([domainName, domainPaths]) => (
              <div key={domainName} className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">
                  {domainName}
                </h3>
                <div className="space-y-2">
                  {domainPaths.map((path) => {
                    const canToggle =
                      path.visibility === "private" && !path.isCreated;

                    return (
                      <div
                        key={path.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="text-2xl">{path.icon || "📚"}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{path.name}</h4>
                              {path.visibility === "public" ? (
                                <Badge variant="outline" className="gap-1">
                                  <Globe className="h-3 w-3" />
                                  Public
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="gap-1">
                                  <Lock className="h-3 w-3" />
                                  Private
                                </Badge>
                              )}
                              {path.accessType === "created" && (
                                <Badge variant="secondary">Created</Badge>
                              )}
                              {path.accessType === "group" && (
                                <Badge variant="secondary" className="gap-1">
                                  <Users className="h-3 w-3" />
                                  Group
                                </Badge>
                              )}
                            </div>
                            {path.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {path.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span>{path.unitCount} units</span>
                              {path.canAccess && (
                                <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Can Access
                                </span>
                              )}
                              {!path.canAccess &&
                                path.visibility === "private" && (
                                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                    <XCircle className="h-3 w-3" />
                                    No Access
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                        {canToggle && (
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={path.isApproved}
                              onCheckedChange={() =>
                                handleToggleAccess(path.id, path.isApproved)
                              }
                              disabled={isPending}
                              aria-label={`${path.isApproved ? "Remove" : "Grant"} approval for ${path.name}`}
                            />
                            <span className="text-sm text-muted-foreground w-20">
                              {path.isApproved ? "Approved" : "Not Approved"}
                            </span>
                          </div>
                        )}
                        {!canToggle && path.visibility === "private" && (
                          <div className="text-sm text-muted-foreground">
                            {path.isCreated
                              ? "Created by user"
                              : path.isGroupAccessible
                                ? "Access via group"
                                : "Public path"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No paths found matching the current filter
          </div>
        )}
      </CardContent>
    </Card>
  );
}
