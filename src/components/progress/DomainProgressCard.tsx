"use client";

import type { DashboardStats } from "@/application/dtos";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface DomainProgressCardProps {
  stats: DashboardStats | undefined;
}

export const DomainProgressCard = ({ stats }: DomainProgressCardProps) => {
  if (!stats?.domainsProgress || stats.domainsProgress.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Domain Progress</CardTitle>
          <CardDescription>
            Track your learning across different domains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No domains yet. Create your first domain to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domain Progress</CardTitle>
        <CardDescription>
          Track your learning across different domains
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stats.domainsProgress.map((domainProgress) => {
            const masteryPercent =
              domainProgress.totalCards > 0
                ? Math.round(
                    (domainProgress.masteredCards / domainProgress.totalCards) *
                      100,
                  )
                : 0;

            return (
              <div key={domainProgress.domain.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {domainProgress.domain.name}
                    </h3>
                    {domainProgress.domain.description && (
                      <p className="text-sm text-muted-foreground">
                        {domainProgress.domain.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">
                      {domainProgress.totalCards} cards
                    </Badge>
                    <Badge
                      variant={
                        domainProgress.dueCards > 0 ? "destructive" : "default"
                      }
                    >
                      {domainProgress.dueCards} due
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Mastery</span>
                    <span className="font-medium">{masteryPercent}%</span>
                  </div>
                  <Progress value={masteryPercent} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
