import dynamic from "next/dynamic";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getCategories,
  getDomains,
  getFlashcards,
} from "@/presentation/actions/content";

const AdminFlashcardsClient = dynamic(() =>
  import("@/components/admin/AdminFlashcardsClient").then((mod) => ({
    default: mod.AdminFlashcardsClient,
  })),
);

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

  const domains = domainsResult.data.domains || [];
  const firstDomain: AdminDomainDto | null =
    domains.length > 0 ? domains[0] : null;

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
      initialDomains={domains}
      initialSelectedDomainId={firstDomain?.id || null}
      initialCategories={initialCategories}
      initialSelectedCategoryId={firstCategory?.id || null}
      initialFlashcards={initialFlashcards}
    />
  );
}
