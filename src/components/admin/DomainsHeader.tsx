"use client";

import { Button } from "@/components/ui/button";

interface DomainsHeaderProps {
  onCreateClick: () => void;
}

export const DomainsHeader = ({ onCreateClick }: DomainsHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Domains</h1>
        <p className="text-muted-foreground mt-1">
          Manage learning domains and their content
        </p>
      </div>
      <Button onClick={onCreateClick} aria-label="Create new domain">
        + Create Domain
      </Button>
    </div>
  );
};
