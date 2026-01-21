"use client";

import { BookOpen, Calendar, Mail, Shield, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminUser } from "@/presentation/actions/admin";

interface AdminUsersClientProps {
  initialUsers: AdminUser[];
}

/**
 * Admin Users Client Component
 *
 * Displays the list of users with their statistics.
 * This is a read-only view, so no mutations needed.
 */
export function AdminUsersClient({ initialUsers }: AdminUsersClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage user access to learning paths
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Users ({initialUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {initialUsers.length > 0 ? (
            <div className="space-y-4">
              {initialUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">
                        {user.name || "Unnamed User"}
                      </h3>
                      {user.role === "admin" && (
                        <Badge variant="default" className="bg-primary">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {user.total_accessible_paths ??
                          user.approved_paths_count}{" "}
                        accessible paths
                        {user.approved_paths_count > 0 && (
                          <span className="text-xs">
                            ({user.approved_paths_count} approved
                            {user.group_accessible_paths_count &&
                            user.group_accessible_paths_count > 0
                              ? `, ${user.group_accessible_paths_count} via groups`
                              : ""}
                            )
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {user.groups_count} groups
                      </div>
                    </div>
                  </div>
                  <Link href={`/admin/users/${user.id}`}>
                    <Button variant="outline" className="gap-2">
                      <UserCog className="h-4 w-4" />
                      Manage Access
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
