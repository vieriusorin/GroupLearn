import { z } from "zod";

// ============= Domain Schemas =============
export const createDomainSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  is_public: z.boolean().optional(),
  group_id: z
    .number()
    .int()
    .positive("Group ID must be a positive integer")
    .nullable()
    .optional(),
});

export const updateDomainSchema = z.object({
  id: z.number().int().positive("ID must be a positive integer"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  is_public: z.boolean().optional(),
  group_id: z
    .number()
    .int()
    .positive("Group ID must be a positive integer")
    .nullable()
    .optional(),
});

export const domainFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  is_public: z.boolean(),
  group_id: z.number().nullable().optional(),
});

export const domainIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number").transform(Number),
});

export const deleteDomainQuerySchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number").transform(Number),
  cascade: z.string().optional(),
});

// ============= Category Schemas =============
export const createCategorySchema = z.object({
  domainId: z.number().int().positive("Domain ID must be a positive integer"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
});

export const updateCategorySchema = z.object({
  id: z.number().int().positive("ID must be a positive integer"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
});

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
});

export const categoryIdSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID must be a valid number")
    .transform(Number)
    .pipe(z.number().int().positive("Category ID must be a positive integer")),
});

export const categoryQuerySchema = z.object({
  domainId: z
    .string()
    .regex(/^\d+$/, "Domain ID must be a valid number")
    .transform(Number)
    .pipe(z.number().int().positive("Domain ID must be a positive integer")),
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a valid number")
    .transform(Number)
    .pipe(z.number().int().positive("Page must be a positive integer"))
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a valid number")
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .positive("Limit must be a positive integer")
        .max(100, "Limit cannot exceed 100"),
    )
    .optional(),
});

// ============= Flashcard Schemas =============
export const difficultyEnum = z.enum(["easy", "medium", "hard"]);

export const createFlashcardSchema = z.object({
  categoryId: z
    .number()
    .int()
    .positive("Category ID must be a positive integer"),
  question: z
    .string()
    .min(1, "Question is required")
    .max(1000, "Question must be 1000 characters or less"),
  answer: z
    .string()
    .min(1, "Answer is required")
    .max(2000, "Answer must be 2000 characters or less"),
  difficulty: difficultyEnum.default("medium"),
});

export const updateFlashcardSchema = z.object({
  id: z.number().int().positive("ID must be a positive integer"),
  question: z
    .string()
    .min(1, "Question is required")
    .max(1000, "Question must be 1000 characters or less"),
  answer: z
    .string()
    .min(1, "Answer is required")
    .max(2000, "Answer must be 2000 characters or less"),
  difficulty: difficultyEnum,
});

export const flashcardIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number").transform(Number),
});

export const flashcardQuerySchema = z.object({
  categoryId: z
    .string()
    .regex(/^\d+$/, "Category ID must be a valid number")
    .transform(Number),
  page: z
    .string()
    .regex(/^\d+$/, "Page must be a valid number")
    .transform(Number)
    .optional(),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a valid number")
    .transform(Number)
    .optional(),
});

// Form schema for client-side validation (without categoryId and id)
export const flashcardFormSchema = z.object({
  question: z
    .string()
    .min(1, "Question is required")
    .max(1000, "Question must be 1000 characters or less"),
  answer: z
    .string()
    .min(1, "Answer is required")
    .max(2000, "Answer must be 2000 characters or less"),
  difficulty: difficultyEnum.default("medium"),
});

// ============= Review Schemas =============
export const reviewModeEnum = z.enum(["flashcard", "quiz", "recall"]);

export const reviewQuerySchema = z.object({
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a valid number")
    .transform(Number)
    .optional(),
});

export const submitReviewSchema = z.object({
  flashcardId: z
    .number()
    .int()
    .positive("Flashcard ID must be a positive integer"),
  reviewMode: reviewModeEnum,
  isCorrect: z.boolean(),
});

// ============= Path Schemas =============
export const unlockRequirementTypeEnum = z.enum([
  "none",
  "previous_path",
  "xp_threshold",
]);
export const pathVisibilityEnum = z.enum(["public", "private"]);

export const createPathSchema = z.object({
  domainId: z.number().int().positive("Domain ID must be a positive integer"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  icon: z
    .string()
    .max(50, "Icon must be 50 characters or less")
    .nullable()
    .optional(),
  orderIndex: z
    .number()
    .int()
    .nonnegative("Order index must be non-negative")
    .optional()
    .default(0),
  unlockRequirementType: unlockRequirementTypeEnum.optional().default("none"),
  unlockRequirementValue: z.number().int().positive().nullable().optional(),
  visibility: pathVisibilityEnum.optional().default("public"),
});

export const updatePathSchema = z.object({
  id: z.number().int().positive("ID must be a positive integer"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  icon: z
    .string()
    .max(50, "Icon must be 50 characters or less")
    .nullable()
    .optional(),
  visibility: pathVisibilityEnum.optional(),
});

export const pathIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number").transform(Number),
});

export const pathQuerySchema = z.object({
  domainId: z
    .string()
    .regex(/^\d+$/, "Domain ID must be a valid number")
    .transform(Number),
});

export const assignPathSchema = z.object({
  pathId: z.number().int().positive("Path ID must be a positive integer"),
  isVisible: z.boolean().optional().default(true),
});

export const assignPathFormSchema = z.object({
  pathId: z
    .number()
    .int()
    .positive("Please select a path")
    .refine((val) => val > 0, {
      message: "Please select a path",
    }),
  isVisible: z.boolean().default(true),
});

// ============= Unit Schemas =============
export const createUnitSchema = z.object({
  pathId: z.number().int().positive("Path ID must be a positive integer"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  unitNumber: z
    .number()
    .int()
    .positive("Unit number must be a positive integer"),
  orderIndex: z.number().int().nonnegative("Order index must be non-negative"),
  xpReward: z
    .number()
    .int()
    .positive("XP reward must be a positive integer")
    .optional()
    .default(10),
});

export const updateUnitSchema = z.object({
  id: z.number().int().positive("ID must be a positive integer"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  xpReward: z.number().int().positive("XP reward must be a positive integer"),
});

export const unitIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number").transform(Number),
});

export const unitQuerySchema = z.object({
  pathId: z
    .string()
    .regex(/^\d+$/, "Path ID must be a valid number")
    .transform(Number),
});

// ============= Lesson Schemas =============
export const createLessonSchema = z.object({
  unitId: z.number().int().positive("Unit ID must be a positive integer"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  orderIndex: z.number().int().nonnegative("Order index must be non-negative"),
  xpReward: z
    .number()
    .int()
    .positive("XP reward must be a positive integer")
    .optional()
    .default(5),
  flashcardCount: z
    .number()
    .int()
    .positive("Flashcard count must be a positive integer")
    .optional()
    .default(5),
});

export const updateLessonSchema = z.object({
  id: z.number().int().positive("ID must be a positive integer"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less")
    .nullable()
    .optional(),
  xpReward: z.number().int().positive("XP reward must be a positive integer"),
});

export const lessonIdSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a valid number").transform(Number),
});

export const lessonQuerySchema = z.object({
  unitId: z
    .string()
    .regex(/^\d+$/, "Unit ID must be a valid number")
    .transform(Number),
});

// ============= Lesson Session Schemas =============
export const lessonAnswerSchema = z.object({
  flashcardId: z
    .number()
    .int()
    .positive("Flashcard ID must be a positive integer"),
  isCorrect: z.boolean(),
  timeSpentSeconds: z.number().int().nonnegative().optional(),
});

export const completeLessonSchema = z.object({
  accuracyPercent: z
    .number()
    .int()
    .min(0)
    .max(100, "Accuracy must be between 0 and 100"),
  timeSpentSeconds: z.number().int().nonnegative(),
  heartsRemaining: z
    .number()
    .int()
    .min(0)
    .max(5, "Hearts must be between 0 and 5"),
});

// ============= Progress Schemas =============
export const progressQuerySchema = z.object({
  pathId: z
    .string()
    .regex(/^\d+$/, "Path ID must be a valid number")
    .transform(Number),
});

export const xpHistoryQuerySchema = z.object({
  pathId: z
    .string()
    .regex(/^\d+$/, "Path ID must be a valid number")
    .transform(Number),
  limit: z
    .string()
    .regex(/^\d+$/, "Limit must be a valid number")
    .transform(Number)
    .optional(),
});

// ============= Helper Types =============
export type CreateDomainInput = z.infer<typeof createDomainSchema>;
export type UpdateDomainInput = z.infer<typeof updateDomainSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateFlashcardInput = z.infer<typeof createFlashcardSchema>;
export type UpdateFlashcardInput = z.infer<typeof updateFlashcardSchema>;
export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;

// Path-based types
export type CreatePathInput = z.infer<typeof createPathSchema>;
export type UpdatePathInput = z.infer<typeof updatePathSchema>;
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type LessonAnswerInput = z.infer<typeof lessonAnswerSchema>;
export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;

// ============= Auth Schemas =============
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character",
  );

export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be 100 characters or less"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

// ============= Invitation Schemas =============
export const roleEnum = z.enum(["member", "admin"]);

export const invitationFormSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  role: roleEnum.default("member"),
  selectedPathIds: z.array(z.number().int().positive()).default([]),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ============= Admin User Path Access Schemas =============
export const updateUserPathAccessSchema = z.object({
  pathId: z.number().int().positive("Path ID must be a positive integer"),
  approved: z.boolean(),
});

export type UpdateUserPathAccessInput = z.infer<
  typeof updateUserPathAccessSchema
>;

export type SignInInput = z.infer<typeof signInSchema>;
