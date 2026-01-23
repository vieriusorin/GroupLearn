"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, Domain } from "@/infrastructure/database/schema";

interface FlashcardsSelectorsProps {
  domains: Domain[];
  categories: Category[];
  selectedDomainId: number | null;
  selectedCategoryId: number | null;
  onDomainChange: (domainId: number) => void;
  onCategoryChange: (categoryId: number) => void;
}

export const FlashcardsSelectors = ({
  domains,
  categories,
  selectedDomainId,
  selectedCategoryId,
  onDomainChange,
  onCategoryChange,
}: FlashcardsSelectorsProps) => {
  return (
    <Card className="border-2">
      <CardContent className="p-4 space-y-4">
        <div>
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
        </div>

        {categories.length > 0 && (
          <div>
            <Label
              htmlFor="category-select"
              className="text-sm font-medium mb-2 block"
            >
              Select Category
            </Label>
            <Select
              value={selectedCategoryId?.toString() || ""}
              onValueChange={(value) => onCategoryChange(Number(value))}
            >
              <SelectTrigger id="category-select" className="w-full max-w-md">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
