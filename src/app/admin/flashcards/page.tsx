import { AdminFlashcardsClient } from "@/components/admin/AdminFlashcardsClient";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getCategories,
  getDomains,
  getFlashcards,
} from "@/presentation/actions/content";
import type {
  AdminCategoryDto,
  AdminDomainDto,
  AdminFlashcardDto,
} from "@/presentation/types";

export default async function AdminFlashcardsPage() {
  const domainsResult = await getDomains();

  if (!domainsResult.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Manage Flashcards</h1>
          <p className="text-muted-foreground">
            Create and manage flashcards within categories
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {domainsResult.error || "Failed to load domains. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const firstDomain: AdminDomainDto | null =
    domainsResult.data.length > 0 ? domainsResult.data[0] : null;

  let initialCategories: AdminCategoryDto[] = [];
  let firstCategory: AdminCategoryDto | null = null;
  let initialFlashcards: AdminFlashcardDto[] = [];

  if (firstDomain) {
    const categoriesResult = await getCategories(firstDomain.id);
    if (categoriesResult.success) {
      initialCategories = categoriesResult.data;
      firstCategory =
        initialCategories.length > 0 ? initialCategories[0] : null;
    }
  }

  if (firstCategory) {
    const flashcardsResult = await getFlashcards(firstCategory.id);
    if (flashcardsResult.success) {
      initialFlashcards = flashcardsResult.data.flashcards;
    }
  }

  return (
    <AdminFlashcardsClient
      initialDomains={domainsResult.data}
      initialSelectedDomainId={firstDomain?.id || null}
      initialCategories={initialCategories}
      initialSelectedCategoryId={firstCategory?.id || null}
      initialFlashcards={initialFlashcards}
    />
  );
}
