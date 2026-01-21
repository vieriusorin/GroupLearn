import { Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Domain } from "@/types/domain";

type Props = {
  domains: Domain[];
  selectedDomainId: number | null;
  onSelectDomainId: (id: number) => void;
  onDeleteDomain: (id: number) => void;
  isLoading: boolean;
  isDeleting: boolean;
};

export const DomainsList = ({
  domains,
  selectedDomainId,
  onSelectDomainId,
  onDeleteDomain,
  isLoading,
  isDeleting,
}: Props) => {
  return (
    <Card className="md:col-span-1" aria-busy={isLoading}>
      <CardHeader>
        <CardTitle>Domains</CardTitle>
        <CardDescription>Select a domain to view categories</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading domains...</p>
        ) : domains.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No domains yet. Create one to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {domains.map((domain) => (
              <div
                key={domain.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedDomainId === domain.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent"
                }`}
                onClick={() => onSelectDomainId(domain.id)}
                aria-pressed={selectedDomainId === domain.id}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{domain.name}</h3>
                    {domain.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {domain.description}
                      </p>
                    )}
                  </div>
                  <ConfirmDialog
                    trigger={
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete domain ${domain.name}`}
                        onClick={(e) => e.stopPropagation()}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    title="Delete Domain?"
                    description={`Are you sure you want to delete "${domain.name}"? This will also delete all categories and flashcards within this domain. This action cannot be undone.`}
                    onConfirm={() => onDeleteDomain(domain.id)}
                    confirmText="Delete"
                    variant="destructive"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
