"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { saveDomainAction } from "@/presentation/actions/content";
import type { ActionResult } from "@/presentation/types/action-result";
import type { DomainModalProps } from "@/types/domain";

type DomainFormState = ActionResult<null>;

const initialState: DomainFormState = {
  success: false,
  error: "",
};

export const DomainModal = ({ domain, onClose, onSaved }: DomainModalProps) => {
  const [state, formAction, isPending] = useActionState(
    saveDomainAction,
    initialState,
  );

  const handleClose = () => {
    if (!isPending) {
      onClose();
    }
  };

  useEffect(() => {
    if (state.success) {
      onSaved();
    }
  }, [state.success, onSaved]);

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {domain ? "Edit Domain" : "Create Domain"}
          </DialogTitle>
        </DialogHeader>

        {!state.success && state.error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {state.error}
            </p>
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {domain && <input type="hidden" name="id" value={domain.id} />}

          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              name="name"
              defaultValue={domain?.name ?? ""}
              placeholder="e.g., JavaScript, Biology, Spanish"
              disabled={isPending}
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              name="description"
              defaultValue={domain?.description ?? ""}
              placeholder="Brief description of this domain"
              rows={3}
              disabled={isPending}
            />
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              name="is_public"
              checked={domain?.is_public === 1}
              disabled={isPending}
              className="mt-1"
              onCheckedChange={() => {
                // Currently not persisted; included for future use
              }}
            />
            <div className="grid gap-1.5 pl-2 leading-none">
              <span className="text-sm font-medium cursor-pointer">
                Make this domain public
              </span>
              <p className="text-xs text-muted-foreground">
                Public domains are visible to all users
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? "Saving..." : domain ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
