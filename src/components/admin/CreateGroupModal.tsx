"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CreateGroupModalProps {
  onClose: () => void;
  onCreated: () => void;
  isCreating: boolean;
  onCreate: (name: string, description?: string) => Promise<void>;
}

export const CreateGroupModal = ({
  onClose,
  onCreated,
  isCreating,
  onCreate,
}: CreateGroupModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        await onCreate(formData.name, formData.description || undefined);
        onCreated();
      } catch (_error) {
        // Error handling is done in parent component
      }
    },
    [formData.name, formData.description, onCreate, onCreated],
  );

  return (
    <DialogContent aria-describedby="create-group-description">
      <DialogHeader>
        <DialogTitle>Create Group</DialogTitle>
        <DialogDescription id="create-group-description">
          Create a new learning group to organize learners
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="group-name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name{" "}
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="group-name"
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isCreating}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-required="true"
          />
        </div>

        <div>
          <label
            htmlFor="group-description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="group-description"
            rows={3}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            disabled={isCreating}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isCreating || !formData.name.trim()}>
            {isCreating ? "Creating..." : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
