/**
 * Domain Types
 */

export interface Domain {
  id: number;
  name: string;
  description: string | null;
  is_public: number;
  group_id: number | null;
  created_at: string;
  created_by?: string | null;
  creator_name?: string;
  category_count?: number;
}

export interface DomainFormData {
  name: string;
  description: string;
  is_public: boolean;
  group_id: number | null;
}

export interface CreateDomainInput {
  name: string;
  description: string | null;
  is_public?: boolean;
  group_id?: number | null;
}

export interface UpdateDomainInput extends CreateDomainInput {
  id: number;
}

export interface DomainCardProps {
  domain: Domain;
  onEdit: (domain: Domain) => void;
  onDelete: (id: number) => void;
  isDeleting?: boolean;
}

export interface DomainModalProps {
  domain: Domain | null;
  onClose: () => void;
  onSaved: () => void;
}
