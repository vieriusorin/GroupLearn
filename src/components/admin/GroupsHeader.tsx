"use client";

import { Button } from "@/components/ui/button";

interface GroupsHeaderProps {
  onCreateClick: () => void;
}

export const GroupsHeader = ({ onCreateClick }: GroupsHeaderProps) => {
  return (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold">Groups</h1>
        <p className="text-muted-foreground mt-1">
          Manage learning groups and members
        </p>
      </div>
      <Button onClick={onCreateClick} aria-label="Create a new group">
        + Create Group
      </Button>
    </header>
  );
};
