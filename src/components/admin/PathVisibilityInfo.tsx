"use client";

export const PathVisibilityInfo = () => {
  return (
    <section aria-label="Path visibility information">
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h2 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
          Path Visibility
        </h2>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Visible paths appear in the member's learning interface. Hidden paths
          remain assigned but won't be shown to members.
        </p>
      </div>
    </section>
  );
};
