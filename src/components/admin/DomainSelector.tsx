"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DomainSelectorProps } from "@/presentation/types";

export function DomainSelector({
  domains,
  selectedDomainId,
  onDomainChange,
}: DomainSelectorProps) {
  const router = useRouter();

  if (domains.length === 0) {
    return (
      <Card className="border-2 border-yellow-500/50 bg-yellow-500/10">
        <CardContent className="p-4">
          <p className="text-yellow-600 dark:text-yellow-400 mb-2">
            No domains found. Please create a domain first.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/domains")}
          >
            Go to Domains
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardContent className="p-4">
        <Label
          htmlFor="domain-select"
          className="text-sm font-medium mb-2 block"
        >
          Select Domain
        </Label>
        <Select
          value={selectedDomainId?.toString() || ""}
          onValueChange={(value) => onDomainChange(Number(value))}
        >
          <SelectTrigger id="domain-select" className="w-full max-w-md">
            <SelectValue placeholder="Select a domain" />
          </SelectTrigger>
          <SelectContent>
            {domains.map((domain) => (
              <SelectItem key={domain.id} value={domain.id.toString()}>
                {domain.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
