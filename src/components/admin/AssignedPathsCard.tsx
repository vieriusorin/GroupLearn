"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AssignedPathsCardProps {
  groupId: number;
  totalPaths: number;
}

export const AssignedPathsCard = ({
  groupId,
  totalPaths,
}: AssignedPathsCardProps) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b">
        <CardTitle className="text-xl">Assigned Paths ({totalPaths})</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href={`/admin/groups/${groupId}/paths`}>Manage Paths</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          View detailed analytics for each assigned learning path
        </p>
      </CardContent>
    </Card>
  );
};
