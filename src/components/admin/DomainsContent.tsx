"use client";

import { DomainCard } from "@/components/admin/DomainCard";
import { EmptyState } from "@/components/admin/EmptyState";
import type { Domain } from "@/infrastructure/database/schema";

interface DomainsContentProps {
  domains: Domain[];
  domainToDelete: Domain | null;
  isDeleting: boolean;
  onEdit: (domain: Domain) => void;
  onDelete: (id: number) => void;
  onCreateClick: () => void;
}

export const DomainsContent = ({
  domains,
  domainToDelete,
  isDeleting,
  onEdit,
  onDelete,
  onCreateClick,
}: DomainsContentProps) => {
  if (domains.length === 0) {
    return (
      <EmptyState
        icon="🌐"
        title="No domains yet"
        description="Create your first domain to start organizing learning content"
        actionLabel="+ Create Domain"
        onAction={onCreateClick}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {domains.map((domain) => (
        <DomainCard
          key={domain.id}
          domain={domain}
          onEdit={onEdit}
          onDelete={onDelete}
          isDeleting={isDeleting && domainToDelete?.id === domain.id}
        />
      ))}
    </div>
  );
};
