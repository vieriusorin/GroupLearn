/**
 * Category Management Types
 */

import type { Domain } from "./domain";

export interface Category {
  id: number;
  domain_id: number;
  name: string;
  description: string | null;
  display_order: number;
  created_at: string;
  flashcard_count?: number;
}

export interface CategoryFormData {
  name: string;
  description: string;
}

export interface CreateCategoryInput {
  domainId: number;
  name: string;
  description: string | null;
}

export interface UpdateCategoryInput extends CreateCategoryInput {
  id: number;
  displayOrder?: number;
}

export interface CategoryCardProps {
  category: Category;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  dragHandleProps?: any;
}

export interface CategoryModalProps {
  category: Category | null;
  domainId: number;
  onClose: () => void;
  onSaved: () => void;
}

export interface DomainSelectorProps {
  domains: Domain[];
  selectedDomainId: number | null;
  onDomainChange: (domainId: number) => void;
}
