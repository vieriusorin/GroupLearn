"use client";

import dynamic from "next/dynamic";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useFlashcardModal } from "@/hooks/admin/useFlashcardModal";
import type { FlashcardModalProps } from "@/presentation/types";

const RichTextEditor = dynamic(
  () =>
    import("@/components/rich-text-editor").then((mod) => ({
      default: mod.RichTextEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[120px] p-3 rounded-md border border-input bg-background animate-pulse" />
    ),
  },
);

export const FlashcardModal = ({
  flashcard,
  categoryId,
  onClose,
  onSaved,
}: FlashcardModalProps) => {
  const { form, saving, isFormValid, hasChanges, onSubmit } = useFlashcardModal(
    {
      flashcard,
      categoryId,
      onSaved,
    },
  );

  function handleClose() {
    if (!saving) {
      onClose();
    }
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {flashcard ? "Edit Flashcard" : "Create Flashcard"}
          </DialogTitle>
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
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Question{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter your question..."
                      rows={3}
                      disabled={saving}
                      className="resize-none"
                      aria-describedby={
                        form.formState.errors.question
                          ? "question-error"
                          : undefined
                      }
                    />
                  </FormControl>
                  <FormMessage id="question-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="answer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Answer{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </FormLabel>
                  <FormControl>
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Enter your answer (supports formatting)..."
                      editable={!saving}
                    />
                  </FormControl>
                  <FormMessage id="answer-error" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="difficulty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Difficulty{" "}
                    <span className="text-destructive" aria-hidden="true">
                      *
                    </span>
                  </FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={saving}
                  >
                    <FormControl>
                      <SelectTrigger
                        aria-describedby={
                          form.formState.errors.difficulty
                            ? "difficulty-error"
                            : undefined
                        }
                      >
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage id="difficulty-error" />
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
                  saving || !isFormValid || (flashcard ? !hasChanges : false)
                }
                aria-label={
                  saving
                    ? "Saving flashcard..."
                    : flashcard
                      ? "Update flashcard"
                      : "Create flashcard"
                }
              >
                {saving ? "Saving..." : flashcard ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
