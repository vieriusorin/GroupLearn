"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAssignPathModal } from "@/hooks/admin/useAssignPathModal";

interface PathWithUnitCount {
  id: number;
  name: string;
  unit_count?: number;
}

interface AssignPathModalProps {
  availablePaths: PathWithUnitCount[];
  onClose: () => void;
  onAssign: (pathId: number, isVisible: boolean) => Promise<void>;
  isAssigning: boolean;
}

export const AssignPathModal = ({
  availablePaths,
  onClose,
  onAssign,
  isAssigning,
}: AssignPathModalProps) => {
  const { form, isFormValid, onSubmit } = useAssignPathModal({
    onAssign,
    isAssigning,
  });

  return (
    <DialogContent aria-describedby="assign-path-description">
      <DialogHeader>
        <DialogTitle>Assign Learning Path</DialogTitle>
        <DialogDescription id="assign-path-description">
          Select a learning path to assign to this group
        </DialogDescription>
      </DialogHeader>

      {form.formState.errors.root && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">
            {form.formState.errors.root.message}
          </p>
        </div>
      )}

      {availablePaths.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            All available paths have been assigned to this group.
          </p>
          <Button onClick={onClose}>Close</Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              control={form.control as any}
              name="pathId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Select Path <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    value={field.value ? field.value.toString() : ""}
                    disabled={isAssigning}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a path..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availablePaths.map((path) => (
                        <SelectItem key={path.id} value={path.id.toString()}>
                          {path.name} ({path.unit_count || 0} units)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control as any}
              name="isVisible"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-start space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isAssigning}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="grid gap-1.5 pl-2 leading-none">
                      <FormLabel className="text-sm font-medium cursor-pointer">
                        Make visible to members immediately
                      </FormLabel>
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isAssigning}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isAssigning || !isFormValid}>
                {isAssigning ? "Assigning..." : "Assign Path"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </DialogContent>
  );
};
