import dynamic from "next/dynamic";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCategories, getDomains } from "@/presentation/actions/content";

const AdminCategoriesClient = dynamic(() =>
  import("@/components/admin/AdminCategoriesClient").then((mod) => ({
    default: mod.AdminCategoriesClient,
  })),
);

type Category = {
  id: number;
  domainId: number;
  name: string;
  description: string | null;
  isDeprecated: boolean;
  createdAt: string;
};

export default async function AdminCategoriesPage() {
  const domainsResult = await getDomains();

  if (!domainsResult.success) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Manage Categories</h1>
          <p className="text-muted-foreground">
            Create and organize categories within domains
          </p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            {domainsResult.error || "Failed to load domains. Please try again."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const domains = domainsResult.data.domains || [];
  const firstDomain = domains.length > 0 ? domains[0] : null;

  let initialCategories: Category[] = [];

  if (firstDomain) {
    const categoriesResult = await getCategories(firstDomain.id);
    if (categoriesResult.success) {
      initialCategories = categoriesResult.data;
    }
  }
  return (
    <AdminCategoriesClient
      initialDomains={domains}
      initialSelectedDomainId={firstDomain?.id || null}
      initialCategories={initialCategories}
    />
  );
}
