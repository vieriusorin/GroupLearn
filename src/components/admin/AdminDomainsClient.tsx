"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import type { Domain } from "@/infrastructure/database/schema";
import { deleteDomain } from "@/presentation/actions/content";
import { DomainsContent } from "./DomainsContent";
import { DomainsHeader } from "./DomainsHeader";
import { ErrorMessage } from "./ErrorMessage";

const DeleteDomainDialog = dynamic(
  () =>
    import("./DeleteDomainDialog").then((mod) => ({
      default: mod.DeleteDomainDialog,
    })),
  {
    ssr: false,
  },
);

const DomainModal = dynamic(
  () => import("./DomainModal").then((mod) => ({ default: mod.DomainModal })),
  {
    ssr: false,
  },
);

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

  const [domains, setDomains] = useState<Domain[]>(
    initialDomains.map((d) => ({
      id: d.id,
      name: d.name,
      description: d.description,
      createdAt: new Date(d.createdAt),
    })),
  );

  useEffect(() => {
    setDomains(
      initialDomains.map((d) => ({
        id: d.id,
        name: d.name,
        description: d.description,
        createdAt: new Date(d.createdAt),
      })),
    );
  }, [initialDomains]);

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
