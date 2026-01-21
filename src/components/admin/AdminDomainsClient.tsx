"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteDomain } from "@/presentation/actions/content";
import type { Domain } from "@/types/domain";
import { DeleteDomainDialog } from "./DeleteDomainDialog";
import { DomainModal } from "./DomainModal";
import { DomainsContent } from "./DomainsContent";
import { DomainsHeader } from "./DomainsHeader";
import { ErrorMessage } from "./ErrorMessage";

interface AdminDomainsClientProps {
  initialDomains: Array<{
    id: number;
    name: string;
    description: string | null;
    createdAt: string;
    createdBy?: string | null;
  }>;
}

export function AdminDomainsClient({
  initialDomains,
}: AdminDomainsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [domainToDelete, setDomainToDelete] = useState<Domain | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [domains, _setDomains] = useState<Domain[]>(
    initialDomains.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      created_at: d.createdAt,
      created_by: d.createdBy || null,
      is_public: 1,
      group_id: null,
    })),
  );

  const handleDelete = (id: number) => {
    const domain = domains.find((d) => d.id === id);
    if (domain) {
      setDomainToDelete(domain);
    }
  };

  const confirmDelete = async () => {
    if (!domainToDelete) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteDomain(domainToDelete.id);

        if (!result.success) {
          setError(
            result.error || "Failed to delete domain. Please try again.",
          );
          return;
        }

        setDomainToDelete(null);
        router.refresh();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete domain. Please try again.",
        );
      }
    });
  };

  // Handle modal close
  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingDomain(null);
    router.refresh();
  };

  const openCreateModal = () => {
    setShowCreateModal(true);
  };

  const closeDeleteDialog = () => {
    setDomainToDelete(null);
  };

  const dismissError = () => {
    setError(null);
  };

  return (
    <div className="space-y-6">
      <DomainsHeader onCreateClick={openCreateModal} />

      {error && <ErrorMessage message={error} onDismiss={dismissError} />}

      <DomainsContent
        domains={domains}
        domainToDelete={domainToDelete}
        isDeleting={isPending}
        onEdit={setEditingDomain}
        onDelete={handleDelete}
        onCreateClick={openCreateModal}
      />

      {(showCreateModal || editingDomain) && (
        <DomainModal
          domain={editingDomain}
          onClose={handleModalClose}
          onSaved={handleModalClose}
        />
      )}

      <DeleteDomainDialog
        domain={domainToDelete}
        isDeleting={isPending}
        onConfirm={confirmDelete}
        onCancel={closeDeleteDialog}
      />
    </div>
  );
}
