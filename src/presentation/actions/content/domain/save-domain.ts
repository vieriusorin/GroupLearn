"use server";

import {
  createDomainSchema,
  updateDomainSchema,
} from "@/lib/shared/validation";
import type { ActionResult } from "@/presentation/types/action-result";
import { createDomain } from "./create-domain";
import { updateDomain } from "./update-domain";

type DomainFormState = ActionResult<null>;

export async function saveDomainAction(
  _prevState: DomainFormState,
  formData: FormData,
): Promise<DomainFormState> {
  const idValue = formData.get("id");
  const rawName = formData.get("name");
  const rawDescription = formData.get("description");

  const name = (rawName ? String(rawName) : "").trim();
  const description =
    rawDescription === null || rawDescription === undefined
      ? null
      : String(rawDescription).trim() || null;

  const isPublic = false;
  const groupId: number | null = null;

  if (idValue) {
    const parsed = updateDomainSchema.safeParse({
      id: Number(idValue),
      name,
      description,
      is_public: isPublic,
      group_id: groupId,
    });

    if (!parsed.success) {
      const validationErrors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path.join(".") || "root";
        if (!validationErrors[field]) {
          validationErrors[field] = [];
        }
        validationErrors[field].push(issue.message);
      }

      return {
        success: false,
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        validationErrors,
      };
    }

    const result = await updateDomain(
      parsed.data.id,
      parsed.data.name,
      parsed.data.description ?? null,
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        code: result.code,
        validationErrors: result.validationErrors,
      };
    }

    return {
      success: true,
      data: null,
    };
  }

  const parsed = createDomainSchema.safeParse({
    name,
    description,
    is_public: isPublic,
    group_id: groupId,
  });

  if (!parsed.success) {
    const validationErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path.join(".") || "root";
      if (!validationErrors[field]) {
        validationErrors[field] = [];
      }
      validationErrors[field].push(issue.message);
    }

    return {
      success: false,
      error: "Validation failed",
      code: "VALIDATION_ERROR",
      validationErrors,
    };
  }

  const result = await createDomain(
    parsed.data.name,
    parsed.data.description ?? null,
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error,
      code: result.code,
      validationErrors: result.validationErrors,
    };
  }

  return {
    success: true,
    data: null,
  };
}
