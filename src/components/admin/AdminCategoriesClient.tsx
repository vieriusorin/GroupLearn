"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { deleteCategory, getCategories } from "@/presentation/actions/content";
import type { Category } from "@/types/category";
import { CategoriesContent } from "./CategoriesContent";
import { CategoriesHeader } from "./CategoriesHeader";
import { CategoryModal } from "./CategoryModal";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { DomainSelector } from "./DomainSelector";
import { ErrorMessage } from "./ErrorMessage";

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
  const _router = useRouter();
  const [isPending, startTransition] = useTransition();

  // UI state
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(
    initialSelectedDomainId,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Local state
  const [domains] = useState(
    initialDomains.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      created_at: d.createdAt,
      created_by: null,
      is_public: 1,
      group_id: null,
    })),
  );

  const [categories, setCategories] = useState<Category[]>(
    initialCategories.map((c) => ({
      id: c.id,
      domain_id: c.domainId,
      name: c.name,
      description: c.description,
      created_at: c.createdAt,
      display_order: 0,
    })),
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
            result.data.map((c) => ({
              id: c.id,
              domain_id: c.domainId,
              name: c.name,
              description: c.description,
              created_at: c.createdAt,
              display_order: 0,
            })),
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
  }, [selectedDomainId]);

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
              categoriesResult.data.map((c) => ({
                id: c.id,
                domain_id: c.domainId,
                name: c.name,
                description: c.description,
                created_at: c.createdAt,
                display_order: 0,
              })),
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

  const handleReorder = async (_reorderedCategories: Category[]) => {
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
            result.data.map((c) => ({
              id: c.id,
              domain_id: c.domainId,
              name: c.name,
              description: c.description,
              created_at: c.createdAt,
              display_order: 0,
            })),
          );
        }
      });
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
