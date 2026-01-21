"use client";

import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorMessage = ({ message, onDismiss }: ErrorMessageProps) => {
  return (
    <div
      className="bg-red-50 border border-red-200 rounded-lg p-4"
      aria-live="polite"
    >
      <div className="flex items-center gap-2">
        <span className="text-red-700 font-medium">⚠️ {message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          aria-label="Dismiss error message"
          className="ml-auto h-6 w-6 p-0"
        >
          ×
        </Button>
      </div>
    </div>
  );
};
