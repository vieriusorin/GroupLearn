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
    <article className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{path.name}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                path.is_visible
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
              aria-label={
                path.is_visible
                  ? "Path is visible to members"
                  : "Path is hidden from members"
              }
            >
              {path.is_visible ? "Visible" : "Hidden"}
            </span>
          </div>
          {path.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
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
          <dt className="text-gray-500">Units:</dt>
          <dd className="font-medium text-gray-900">{path.unit_count || 0}</dd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <dt className="text-gray-500">Assigned by:</dt>
          <dd className="font-medium text-gray-900">
            {path.assigned_by_name || "Unknown"}
          </dd>
        </div>
        <div className="flex items-center justify-between text-sm">
          <dt className="text-gray-500">Assigned:</dt>
          <dd className="font-medium text-gray-900">
            <time dateTime={path.assigned_at}>
              {new Date(path.assigned_at).toLocaleDateString()}
            </time>
          </dd>
        </div>
      </dl>

      <div className="flex items-center gap-2 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onToggleVisibility(path.id, path.is_visible)}
          disabled={isTogglingVisibility}
          aria-label={
            path.is_visible
              ? `Hide ${path.name} from members`
              : `Show ${path.name} to members`
          }
        >
          {path.is_visible ? "Hide" : "Show"}
        </Button>
        <ConfirmDialog
          trigger={
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:bg-red-50"
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
