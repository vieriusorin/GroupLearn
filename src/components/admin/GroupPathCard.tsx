"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import type { GroupPath } from "@/presentation/actions/groups";

interface GroupPathCardProps {
  path: GroupPath;
  isTogglingVisibility: boolean;
  onToggleVisibility: (pathId: number, currentVisibility: number) => void;
  onRemove: (pathId: number) => void;
}

export const GroupPathCard = ({
  path,
  isTogglingVisibility,
  onToggleVisibility,
  onRemove,
}: GroupPathCardProps) => {
  return (
    <article className="bg-card text-card-foreground rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">
              {path.name}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                path.isVisible
                  ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {path.isVisible ? "Visible" : "Hidden"}
            </span>
          </div>
          {path.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {path.description}
            </p>
          )}
        </div>
        <span className="text-2xl ml-2" aria-hidden="true">
          🎯
        </span>
      </div>

      <dl className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <dt className="text-muted-foreground">Units:</dt>
          <dd className="font-medium text-foreground">{path.unitCount || 0}</dd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <dt className="text-muted-foreground">Assigned by:</dt>
          <dd className="font-medium text-foreground">
            {path.assignedByName || "Unknown"}
          </dd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <dt className="text-muted-foreground">Assigned:</dt>
          <dd className="font-medium text-foreground">
            <time dateTime={path.assignedAt}>
              {new Date(path.assignedAt).toLocaleDateString()}
            </time>
          </dd>
        </div>
      </dl>

      <div className="flex items-center gap-2 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onToggleVisibility(path.id, path.isVisible ? 1 : 0)}
          disabled={isTogglingVisibility}
          aria-label={
            path.isVisible
              ? `Hide ${path.name} from members`
              : `Show ${path.name} to members`
          }
        >
          {path.isVisible ? "Hide" : "Show"}
        </Button>
        <ConfirmDialog
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
              aria-label={`Remove ${path.name} from group`}
            >
              Remove
            </Button>
          }
          title="Remove Path"
          description={`Are you sure you want to remove "${path.name}" from this group? This action cannot be undone.`}
          confirmText="Remove"
          cancelText="Cancel"
          variant="destructive"
          onConfirm={() => onRemove(path.id)}
        />
      </div>
    </article>
  );
};
