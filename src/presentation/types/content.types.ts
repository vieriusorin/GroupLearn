import type {
  CategoryExtended,
  DomainExtended,
  FlashcardAdmin,
} from "@/application/dtos";
import type {
  Category,
  Domain,
  Flashcard,
} from "@/infrastructure/database/schema";

export interface DomainCardProps {
  domain: DomainExtended | Domain;
  onEdit: (domain: Domain) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export interface DomainModalProps {
  domain: Domain | null;
  onClose: () => void;
  onSaved: () => void;
}

export interface DomainListProps {
  domains: DomainExtended[];
  onEdit: (domain: Domain) => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

export interface CategoryCardProps {
  category: CategoryExtended;
  onEdit: (category: Category) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
  dragHandleProps?: Record<string, unknown>;
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

export interface FlashcardModalProps {
  flashcard: FlashcardAdmin | null;
  categoryId: number;
  onClose: () => void;
  onSaved: () => void;
}

export interface FlashcardCardProps {
  flashcard: Flashcard;
  category?: Category;
  onEdit?: (flashcard: Flashcard) => void;
  onDelete?: (id: number) => void;
  showActions?: boolean;
}
