"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AssignedPathsCardProps {
  groupId: number;
  totalPaths: number;
}

export function AssignedPathsCard({
  groupId,
  totalPaths,
}: AssignedPathsCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Assigned Paths ({totalPaths})
        </h2>
        <Link href={`/admin/groups/${groupId}/paths`}>
          <Button variant="outline" size="sm">
            Manage Paths
          </Button>
        </Link>
      </div>
      <p className="text-gray-600 text-sm">
        View detailed analytics for each assigned learning path
      </p>
    </div>
  );
}
