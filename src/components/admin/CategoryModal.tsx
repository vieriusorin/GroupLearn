"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCategoryModal } from "@/hooks/admin/useCategoryModal";
import type { CategoryModalProps } from "@/presentation/types";

export function CategoryModal({
  category,
  domainId,
  onClose,
  onSaved,
}: CategoryModalProps) {
  const { form, saving, isFormValid, hasChanges, onSubmit } = useCategoryModal({
    category,
    domainId,
    onSaved,
  });

  function handleClose() {
    if (!saving) {
      onClose();
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {category ? "Edit Category" : "Create Category"}
          </DialogTitle>
        </DialogHeader>

        {form.formState.errors.root && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md">
            <p className="text-sm text-red-600 dark:text-red-400">
              {form.formState.errors.root.message}
            </p>
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., JavaScript Basics, Spanish Verbs"
                      disabled={saving}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="Brief description of this category"
                      rows={3}
                      disabled={saving}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  saving || !isFormValid || (category ? !hasChanges : false)
                }
              >
                {saving ? "Saving..." : category ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
