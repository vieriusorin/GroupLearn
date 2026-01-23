import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Category } from "@/infrastructure/database/schema";

type Props = {
  selectedDomainId: number | null;
  categories: Category[];
  onDeleteCategory: (id: number) => void;
  isLoading: boolean;
  isDeleting: boolean;
  right?: React.ReactNode;
};

export const CategoriesList = ({
  selectedDomainId,
  categories,
  onDeleteCategory,
  isLoading,
  isDeleting,
  right,
}: Props) => {
  const router = useRouter();

  return (
    <Card className="md:col-span-2" aria-busy={isLoading}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Categories</CardTitle>
            <CardDescription>
              {selectedDomainId
                ? "Manage categories and flashcards"
                : "Select a domain to view categories"}
            </CardDescription>
          </div>
          {right}
        </div>
      </CardHeader>
      <CardContent>
        {!selectedDomainId ? (
          <p className="text-sm text-muted-foreground">
            Select a domain from the left to view its categories
          </p>
        ) : isLoading ? (
          <p className="text-sm text-muted-foreground">Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No categories yet. Create one to start adding flashcards!
          </p>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category.id} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/flashcards?categoryId=${category.id}`)
                      }
                    >
                      Manage Cards
                    </Button>
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          aria-label={`Delete category ${category.name}`}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      title="Delete Category?"
                      description={`Are you sure you want to delete "${category.name}"? This will also delete all flashcards within this category. This action cannot be undone.`}
                      onConfirm={() => onDeleteCategory(category.id)}
                      confirmText="Delete"
                      variant="destructive"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
