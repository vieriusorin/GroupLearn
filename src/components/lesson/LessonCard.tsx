"use client";

import type { LessonCardProps } from "@/types/lesson";

export const LessonCard = ({
  title,
  content,
  variant = "question",
}: LessonCardProps) => {
  const borderColor =
    variant === "answer" ? "border-green-500" : "border-primary";
  const titleColor =
    variant === "answer" ? "text-green-600 dark:text-green-400" : "";

  return (
    <section aria-labelledby={`${variant}-heading`}>
      <div className={`rounded-lg border-2 ${borderColor} p-8 bg-card`}>
        <h2
          id={`${variant}-heading`}
          className={`text-2xl font-bold mb-4 ${titleColor}`}
        >
          {title}
        </h2>
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
};
