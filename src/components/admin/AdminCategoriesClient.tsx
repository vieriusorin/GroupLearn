"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import type { CategoryExtended } from "@/application/dtos";
import { toDate } from "@/lib/shared/date-helpers";
import { deleteCategory, getCategories } from "@/presentation/actions/content";
import { CategoriesContent } from "./CategoriesContent";
import { CategoriesHeader } from "./CategoriesHeader";
import { DomainSelector } from "./DomainSelector";
import { ErrorMessage } from "./ErrorMessage";

const CategoryModal = dynamic(
  () =>
    import("./CategoryModal").then((mod) => ({ default: mod.CategoryModal })),
  {
    ssr: false,
  },
);

const DeleteCategoryDialog = dynamic(
  () =>
    import("./DeleteCategoryDialog").then((mod) => ({
      default: mod.DeleteCategoryDialog,
    })),
  {
    ssr: false,
  },
);

interface AdminCategoriesClientProps {
  initialDomains: Array<{
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
  }>;
  initialSelectedDomainId: number | null;
  initialCategories: Array<{
    id: number;
    domainId: number;
    name: string;
    description: string | null;
    createdAt: string;
  }>;
}

export function AdminCategoriesClient({
  initialDomains,
  initialSelectedDomainId,
  initialCategories,
}: AdminCategoriesClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // UI state
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(
    initialSelectedDomainId,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryExtended | null>(null);
  const [categoryToDelete, setCategoryToDelete] =
    useState<CategoryExtended | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Helper function to map category data
  const mapCategory = useCallback(
    (
      c: {
        id: number;
        domainId: number;
        name: string;
        description: string | null;
        createdAt: string;
        isDeprecated?: boolean;
        flashcardCount?: number;
      },
      index?: number,
    ): CategoryExtended => ({
      id: c.id,
      domainId: c.domainId,
      name: c.name,
      description: c.description,
      createdAt: toDate(c.createdAt),
      isDeprecated: c.isDeprecated ?? false,
      displayOrder: index,
      flashcardCount: c.flashcardCount,
    }),
    [],
  );

  // Local state
  const [domains] = useState(
    initialDomains.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      createdAt: toDate(d.createdAt),
    })),
  );

  const [categories, setCategories] = useState<CategoryExtended[]>(
    initialCategories.map((c, index) => mapCategory(c, index)),
  );

  useEffect(() => {
    if (!selectedDomainId) return;

    setIsLoadingCategories(true);
    setError(null);

    startTransition(async () => {
      try {
        const result = await getCategories(selectedDomainId);
        if (result.success) {
          setCategories(
            result.data.map((c, index) =>
              mapCategory(
                {
                  ...c,
                  isDeprecated: c.isDeprecated,
                  flashcardCount: c.flashcardCount,
                },
                index,
              ),
            ),
          );
        } else {
          setError(result.error || "Failed to load categories");
        }
      } catch (_err) {
        setError("Failed to load categories");
      } finally {
        setIsLoadingCategories(false);
      }
    });
    // mapCategory is a stable function that doesn't depend on props/state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDomainId, mapCategory]);

  const handleDelete = (id: number) => {
    const category = categories.find((c) => c.id === id);
    if (category) {
      setCategoryToDelete(category);
    }
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteCategory(categoryToDelete.id);

        if (!result.success) {
          setError(
            result.error || "Failed to delete category. Please try again.",
          );
          return;
        }

        setCategoryToDelete(null);
        if (selectedDomainId) {
          const categoriesResult = await getCategories(selectedDomainId);
          if (categoriesResult.success) {
            setCategories(
              categoriesResult.data.map((c, index) =>
                mapCategory(
                  {
                    ...c,
                    isDeprecated: c.isDeprecated,
                    flashcardCount: c.flashcardCount,
                  },
                  index,
                ),
              ),
            );
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete category. Please try again.",
        );
      }
    });
  };

  const handleReorder = async (_reorderedCategories: CategoryExtended[]) => {
    // TODO: Implement reordering with Server Action
    setError("Reordering not yet implemented in SSR version");
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingCategory(null);
    if (selectedDomainId) {
      startTransition(async () => {
        const result = await getCategories(selectedDomainId);
        if (result.success) {
          setCategories(
            result.data.map((c, index) =>
              mapCategory(
                {
                  ...c,
                  isDeprecated: c.isDeprecated,
                  flashcardCount: c.flashcardCount,
                },
                index,
              ),
            ),
          );
        }
      });
      router.refresh();
    }
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeDeleteDialog = () => {
    setCategoryToDelete(null);
  };

  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="space-y-6">
      <CategoriesHeader
        onCreateClick={openCreateModal}
        disabled={!selectedDomainId}
      />

      {error && <ErrorMessage message={error} onDismiss={dismissError} />}

      <DomainSelector
        domains={domains}
        selectedDomainId={selectedDomainId}
        onDomainChange={setSelectedDomainId}
      />

      {selectedDomainId && (
        <CategoriesContent
          categories={categories}
          isLoading={isLoadingCategories}
          isReordering={false}
          categoryToDelete={categoryToDelete}
          isDeleting={isPending}
          onReorder={handleReorder}
          onEdit={setEditingCategory}
          onDelete={handleDelete}
          onCreateClick={openCreateModal}
        />
      )}

      {(showCreateModal || editingCategory) && selectedDomainId && (
        <CategoryModal
          category={editingCategory}
          domainId={selectedDomainId}
          onClose={handleModalClose}
          onSaved={handleModalClose}
        />
      )}

      <DeleteCategoryDialog
        category={categoryToDelete}
        isDeleting={isPending}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
