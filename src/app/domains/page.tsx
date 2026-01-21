import { DomainsClient } from "@/components/domains/DomainsClient";
import { getDomains } from "@/presentation/actions/content";

export default async function DomainsPage() {
  const domainsResult = await getDomains();

  if (!domainsResult.success) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded">
          <p className="font-medium">Failed to load domains</p>
          <p className="text-sm">{domainsResult.error}</p>
        </div>
      </div>
    );
  }

  return <DomainsClient initialDomains={domainsResult.data} />;
}
