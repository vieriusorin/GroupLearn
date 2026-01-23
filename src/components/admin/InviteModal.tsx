"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInviteModal } from "@/hooks/admin/useInviteModal";
import type { InviteModalProps } from "@/types/invitation";

export const InviteModal = ({
  groupId,
  onClose,
  onSent,
  isSending,
  onSend,
}: InviteModalProps) => {
  const {
    form,
    isFormValid,
    isLoadingPaths,
    allPaths,
    pathsByDomain,
    onSubmit,
    handlePathToggle,
  } = useInviteModal({
    isSending,
    onSend,
    onSent,
  });

  function handleClose() {
    if (!isSending) {
      onClose();
    }
  }

  return (
    <DialogContent aria-describedby="invite-member-description">
      <DialogHeader>
        <DialogTitle>Invite Member</DialogTitle>
        <DialogDescription id="invite-member-description">
          Send an invitation to join this group
        </DialogDescription>
      </DialogHeader>

      {form.formState.errors.root && (
        <div
          className="p-3 bg-destructive/10 border border-destructive/50 rounded-md"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Email{" "}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    disabled={isSending}
                    autoComplete="email"
                    aria-describedby={
                      form.formState.errors.email ? "email-error" : undefined
                    }
                  />
                </FormControl>
                <FormMessage id="email-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Role{" "}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSending}
                >
                  <FormControl>
                    <SelectTrigger
                      aria-describedby={
                        form.formState.errors.role ? "role-error" : undefined
                      }
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage id="role-error" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="selectedPathIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Learning Paths (Optional)</FormLabel>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Select paths that will be automatically assigned to this
                  member when they accept the invitation
                </p>
                <FormControl>
                  {isLoadingPaths ? (
                    <div
                      className="text-sm text-muted-foreground"
                      aria-live="polite"
                    >
                      Loading paths...
                    </div>
                  ) : allPaths && allPaths.length > 0 ? (
                    <section
                      className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-5"
                      aria-label="Learning paths selection"
                    >
                      {Object.entries(pathsByDomain).map(
                        ([domainName, paths]) => (
                          <div key={domainName} className="space-y-2">
                            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {domainName}
                            </div>
                            <div className="space-y-1.5 pl-2">
                              {paths.map((path) => {
                                const checkboxId = `path-checkbox-${path.id}`;
                                return (
                                  <label
                                    key={path.id}
                                    htmlFor={checkboxId}
                                    className="flex items-center gap-2 cursor-pointer hover:bg-accent p-1.5 rounded transition-colors"
                                  >
                                    <Checkbox
                                      id={checkboxId}
                                      checked={field.value.includes(path.id)}
                                      onCheckedChange={() => {
                                        field.onChange(
                                          handlePathToggle(
                                            path.id,
                                            field.value,
                                          ),
                                        );
                                      }}
                                      disabled={isSending}
                                      aria-label={`Select ${path.name} path`}
                                    />
                                    <span className="text-sm text-foreground">
                                      {path.name}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ),
                      )}
                    </section>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No paths available
                    </div>
                  )}
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
              disabled={isSending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSending || !isFormValid}
              className="flex-1"
              aria-label={
                isSending ? "Sending invitation..." : "Send invitation"
              }
            >
              {isSending ? "Sending..." : "Send Invitation"}
            </Button>
          </div>
        </form>
      </Form>
    </DialogContent>
  );
};
