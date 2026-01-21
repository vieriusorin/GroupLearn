/**
 * Admin Quick Actions Component
 */

import { QuickActionButton } from "@/components/admin/QuickActionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AdminQuickActions = () => {
  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionButton
            href="/admin/domains"
            icon="🌐"
            label="Create Domain"
          />
          <QuickActionButton
            href="/admin/categories"
            icon="📁"
            label="Add Category"
          />
          <QuickActionButton
            href="/admin/flashcards"
            icon="🎴"
            label="Add Flashcard"
          />
          <QuickActionButton
            href="/admin/groups"
            icon="👥"
            label="Create Group"
          />
          <QuickActionButton
            href="/admin/users"
            icon="👤"
            label="Manage Users"
          />
        </div>
      </CardContent>
    </Card>
  );
};
