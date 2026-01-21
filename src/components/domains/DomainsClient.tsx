"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOptimistic, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createCategory,
  createDomain,
  deleteCategory,
  deleteDomain,
  getCategories,
} from "@/presentation/actions/content";

type Domain = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  createdBy?: string | null;
};

type Category = {
  id: number;
  domainId: number;
  name: string;
  description: string | null;
  createdAt: string;
};

type Props = {
  initialDomains: Domain[];
};

export function DomainsClient({ initialDomains }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Domain state
  const [selectedDomainId, setSelectedDomainId] = useState<number | null>(
    initialDomains.length > 0 ? initialDomains[0].id : null,
  );
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [domains, setDomains] = useState(initialDomains);
  const [optimisticDomains, addOptimisticDomain] = useOptimistic(
    domains,
    (state, newDomain: Domain) => [...state, newDomain],
  );

  // Category state
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Form state
  const [domainName, setDomainName] = useState("");
  const [domainDescription, setDomainDescription] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load categories when domain is selected
  const loadCategories = async (domainId: number) => {
    setCategoriesLoading(true);
    setError(null);
    try {
      const result = await getCategories(domainId);
      if (result.success) {
        setCategories(result.data as Category[]);
      } else {
        setError(result.error || "Failed to load categories");
      }
    } catch (_err) {
      setError("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Handle domain selection
  const handleSelectDomain = (domainId: number) => {
    setSelectedDomainId(domainId);
    loadCategories(domainId);
  };

  // Handle create domain
  const handleCreateDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Optimistic update
    const tempDomain: Domain = {
      id: Date.now(), // temporary ID
      name: domainName,
      description: domainDescription || null,
      createdAt: new Date().toISOString(),
    };
    addOptimisticDomain(tempDomain);

    startTransition(async () => {
      const result = await createDomain(domainName, domainDescription || null);

      if (result.success) {
        // Refresh the page to get updated data
        router.refresh();
        setDomainDialogOpen(false);
        setDomainName("");
        setDomainDescription("");
      } else {
        setError(result.error || "Failed to create domain");
        // Remove optimistic update on error
        setDomains(domains);
      }
    });
  };

  // Handle delete domain
  const handleDeleteDomain = async (domainId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this domain and all its categories and flashcards?",
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteDomain(domainId);

      if (result.success) {
        if (selectedDomainId === domainId) {
          setSelectedDomainId(null);
          setCategories([]);
        }
        router.refresh();
      } else {
        setError(result.error || "Failed to delete domain");
      }
    });
  };

  // Handle create category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDomainId) return;

    setError(null);
    startTransition(async () => {
      const result = await createCategory(
        selectedDomainId,
        categoryName,
        categoryDescription || null,
      );

      if (result.success) {
        setCategoryDialogOpen(false);
        setCategoryName("");
        setCategoryDescription("");
        // Reload categories
        await loadCategories(selectedDomainId);
      } else {
        setError(result.error || "Failed to create category");
      }
    });
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this category and all its flashcards?",
      )
    ) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteCategory(categoryId);

      if (!result.success) {
        setError(result.error || "Failed to delete category");
        return;
      }

      // Reload categories on success
      if (selectedDomainId) {
        await loadCategories(selectedDomainId);
      }
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Loading indicator */}
      {isPending && (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
          Loading...
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Domains & Categories</h1>
          <p className="text-muted-foreground">
            Organize your flashcards into domains and categories
          </p>
        </div>

        {/* Create Domain Dialog */}
        <Dialog open={domainDialogOpen} onOpenChange={setDomainDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Domain</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Domain</DialogTitle>
              <DialogDescription>
                Add a new learning domain to organize your flashcards
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDomain} className="space-y-4">
              <div>
                <Label htmlFor="domain-name">Name</Label>
                <Input
                  id="domain-name"
                  value={domainName}
                  onChange={(e) => setDomainName(e.target.value)}
                  placeholder="e.g., JavaScript, Biology, Spanish"
                  required
                  disabled={isPending}
                />
              </div>
              <div>
                <Label htmlFor="domain-description">
                  Description (optional)
                </Label>
                <Textarea
                  id="domain-description"
                  value={domainDescription}
                  onChange={(e) => setDomainDescription(e.target.value)}
                  placeholder="Brief description of this domain"
                  disabled={isPending}
                />
              </div>
              <Button type="submit" disabled={isPending || !domainName.trim()}>
                {isPending ? "Creating..." : "Create Domain"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main content grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Domains List */}
        <Card>
          <CardHeader>
            <CardTitle>Domains</CardTitle>
            <CardDescription>
              Select a domain to view its categories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {optimisticDomains.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No domains yet. Create one to get started!
              </p>
            ) : (
              optimisticDomains.map((domain) => (
                <div
                  key={domain.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent ${
                    selectedDomainId === domain.id
                      ? "bg-accent border-primary"
                      : ""
                  }`}
                  onClick={() => handleSelectDomain(domain.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{domain.name}</h3>
                      {domain.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {domain.description}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDomain(domain.id);
                      }}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Categories List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Categories</CardTitle>
                <CardDescription>
                  {selectedDomainId
                    ? "Manage categories in this domain"
                    : "Select a domain to view categories"}
                </CardDescription>
              </div>
              {selectedDomainId && (
                <Dialog
                  open={categoryDialogOpen}
                  onOpenChange={setCategoryDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button>Create Category</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Category</DialogTitle>
                      <DialogDescription>
                        Add a category to organize flashcards within this domain
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCategory} className="space-y-4">
                      <div>
                        <Label htmlFor="category-name">Name</Label>
                        <Input
                          id="category-name"
                          value={categoryName}
                          onChange={(e) => setCategoryName(e.target.value)}
                          placeholder="e.g., Functions, Arrays, Objects"
                          required
                          disabled={isPending}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-description">
                          Description (optional)
                        </Label>
                        <Textarea
                          id="category-description"
                          value={categoryDescription}
                          onChange={(e) =>
                            setCategoryDescription(e.target.value)
                          }
                          placeholder="Brief description of this category"
                          disabled={isPending}
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isPending || !categoryName.trim()}
                      >
                        {isPending ? "Creating..." : "Create Category"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {!selectedDomainId ? (
              <p className="text-sm text-muted-foreground">
                Select a domain to view its categories
              </p>
            ) : categoriesLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading categories...
              </p>
            ) : categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories yet. Create one to get started!
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {categories.map((category) => (
                  <div key={category.id} className="p-3 rounded-lg border">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium">{category.name}</h3>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
