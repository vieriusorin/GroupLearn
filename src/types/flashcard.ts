/**
 * Flashcard Management Types
 */

import type { AdminFlashcard } from "@/lib/types";

export interface FlashcardModalProps {
  flashcard: AdminFlashcard | null;
  categoryId: number;
  onClose: () => void;
  onSaved: () => void;
}
