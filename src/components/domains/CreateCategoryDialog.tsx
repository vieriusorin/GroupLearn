import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

// Constraint to ensure form data has the required category fields
interface CategoryFormFields extends FieldValues {
  name: string;
  description?: string | null | undefined;
}

type Props<TFormData extends CategoryFormFields> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<TFormData>;
  onSubmit: (data: TFormData) => void;
  isSubmitting: boolean;
  isFormValid: boolean;
  disabled?: boolean;
};

export const CreateCategoryDialog = <TFormData extends CategoryFormFields>({
  open,
  onOpenChange,
  form,
  onSubmit,
  isSubmitting,
  isFormValid,
  disabled,
}: Props<TFormData>) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button disabled={disabled}>Create Category</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
          <DialogDescription>
            Add a category to organize flashcards within this domain
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name={"name" as Path<TFormData>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., Variables, Loops, Functions"
                      autoComplete="off"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={"description" as Path<TFormData>}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      placeholder="Brief description of this category"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Category"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
