"use client";

import { Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { DomainCardProps } from "@/presentation/types";

export function DomainCard({
  domain,
  onEdit,
  onDelete,
  isDeleting = false,
}: DomainCardProps) {
  return (
    <Card className="border-2 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">{domain.name}</h3>
            {domain.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {domain.description}
              </p>
            )}
          </div>
          <div className="ml-3 p-2 rounded-lg bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {"categoryCount" in domain && domain.categoryCount !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Categories:</span>
              <span className="font-semibold">{domain.categoryCount}</span>
            </div>
          )}
          {"isPublic" in domain && domain.isPublic !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Visibility:</span>
              <Badge
                variant={domain.isPublic ? "default" : "secondary"}
                className={
                  domain.isPublic ? "bg-green-600 hover:bg-green-700" : ""
                }
              >
                {domain.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
          )}
          {"groupId" in domain && domain.groupId && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Group:</span>
              <Badge variant="outline" className="text-xs">
                Group #{domain.groupId}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(domain)}
            disabled={isDeleting}
            aria-label={`Edit domain ${domain.name}`}
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            onClick={() => onDelete(domain.id)}
            disabled={isDeleting}
            aria-label={`Delete domain ${domain.name}`}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
