import type {
  Category,
  Domain,
  Flashcard,
  NewCategory,
  NewDomain,
  NewFlashcard,
  StrugglingQueue,
} from "@/infrastructure/database/schema";

export type DomainWithStats = Domain & {
  categoryCount: number;
  flashcardCount?: number;
};

export type DomainWithCreator = Domain & {
  creatorName?: string | null;
  createdBy?: string | null;
};

export type DomainWithGroup = Domain & {
  groupId?: number | null;
  isPublic?: boolean;
};

export type DomainExtended = Domain & {
  categoryCount?: number;
  flashcardCount?: number;
  creatorName?: string | null;
  createdBy?: string | null;
  groupId?: number | null;
  isPublic?: boolean;
};

export type DomainFormInput = Pick<Domain, "name" | "description">;

export type CreateDomainInput = Omit<NewDomain, "id" | "createdAt"> & {
  isPublic?: boolean;
  groupId?: number | null;
};

export type UpdateDomainInput = Partial<CreateDomainInput> & {
  id: number;
};

export type CategoryWithDomain = Category & {
  domain: Pick<Domain, "id" | "name">;
};

export type CategoryWithFlashcardCount = Category & {
  flashcardCount: number;
};

export type CategoryExtended = Category & {
  domain?: Pick<Domain, "id" | "name">;
  flashcardCount?: number;
  displayOrder?: number;
};

export type CategoryFormInput = Pick<Category, "name" | "description">;

export type CreateCategoryInput = Omit<NewCategory, "id" | "createdAt">;

export type UpdateCategoryInput = Partial<CreateCategoryInput> & {
  id: number;
};

export type FlashcardWithCategory = Flashcard & {
  category: Pick<Category, "id" | "name">;
};

export type FlashcardWithDomain = Flashcard & {
  category: CategoryWithDomain;
};

export type FlashcardAdmin = Flashcard & {
  displayOrder?: number;
  isActive?: boolean;
};

export type FlashcardFormInput = Pick<
  Flashcard,
  "question" | "answer" | "difficulty"
>;

export type CreateFlashcardInput = Omit<NewFlashcard, "id" | "createdAt">;

export type UpdateFlashcardInput = Partial<CreateFlashcardInput> & {
  id: number;
};

export type StrugglingQueueWithFlashcard = StrugglingQueue & {
  flashcard: Pick<Flashcard, "id" | "question" | "answer" | "difficulty">;
};

export type ReviewSession = {
  flashcard: Flashcard;
  category: Category;
  domain: Domain;
  reviewMode: "learn" | "review" | "cram";
  isStruggling: boolean;
};

/**
 * Flashcard item for admin/list views
 * Based on Drizzle Flashcard type
 */
export type FlashcardListItem = Pick<
  Flashcard,
  "id" | "categoryId" | "question" | "answer" | "difficulty"
> & {
  computedDifficulty: Flashcard["computedDifficulty"];
  createdAt: string; // ISO string
};

/**
 * Get flashcards result
 * Returned when fetching flashcards with pagination
 */
export type GetFlashcardsResult = {
  flashcards: FlashcardListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Get domains result
 * Returned when fetching all domains
 */
export type GetDomainsResult = {
  domains: Array<{
    id: number;
    name: string;
    description: string | null;
    createdAt: string; // ISO string
    createdBy: string | null;
  }>;
};

/**
 * Domain item for create/update results
 * Based on Drizzle Domain type
 */
export type DomainItem = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string; // ISO string
  createdBy: string | null;
};

/**
 * Create domain result
 * Returned when creating a new domain
 */
export type CreateDomainResult = {
  success: boolean;
  data: DomainItem;
};

/**
 * Update domain result
 * Returned when updating a domain
 */
export type UpdateDomainResult = {
  success: boolean;
  data: DomainItem;
};

/**
 * Flashcard item for create/update results
 * Based on Drizzle Flashcard type
 */
export type FlashcardItem = Pick<
  Flashcard,
  "id" | "categoryId" | "question" | "answer" | "difficulty"
> & {
  computedDifficulty: Flashcard["computedDifficulty"];
  createdAt: string; // ISO string
};

/**
 * Create flashcard result
 * Returned when creating a new flashcard
 */
export type CreateFlashcardResult = {
  success: boolean;
  data: Omit<FlashcardItem, "computedDifficulty">;
};

/**
 * Update flashcard result
 * Returned when updating a flashcard
 */
export type UpdateFlashcardResult = {
  success: boolean;
  data: FlashcardItem;
};

/**
 * Bulk create flashcards error item
 */
export type BulkCreateFlashcardError = {
  index: number;
  question: string;
  error: string;
};

/**
 * Bulk create flashcards result
 * Returned when bulk creating flashcards
 */
export type BulkCreateFlashcardsResult = {
  success: boolean;
  created: number;
  failed: number;
  errors: BulkCreateFlashcardError[];
  data: Array<Pick<FlashcardItem, "id" | "question" | "answer" | "difficulty">>;
};

/**
 * Category item for create/update results
 * Based on Drizzle Category type
 */
export type CategoryItem = Pick<
  Category,
  "id" | "domainId" | "name" | "description"
> & {
  createdAt: string; // ISO string
};

/**
 * Create category result
 * Returned when creating a new category
 */
export type CreateCategoryResult = {
  success: boolean;
  data: CategoryItem;
};

/**
 * Update category result
 * Returned when updating a category
 */
export type UpdateCategoryResult = {
  success: boolean;
  data: CategoryItem;
};

/**
 * Delete result
 * Returned when deleting content items
 */
export type DeleteResult = {
  success: boolean;
  message: string;
};

/**
 * Category list item
 * Based on Drizzle Category type
 */
export type CategoryListItem = Pick<
  Category,
  "id" | "domainId" | "name" | "description" | "isDeprecated"
> & {
  createdAt: string; // ISO string
  flashcardCount?: number;
};

/**
 * Get categories result
 * Returned when fetching categories for a domain
 */
export type GetCategoriesResult = {
  categories: CategoryListItem[];
};
