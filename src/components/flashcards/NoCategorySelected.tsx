import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const NoCategorySelected = () => {
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Link href="/domains">
        <Button variant="ghost" className="mb-4">
          ← Back to Domains
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>No Category Selected</CardTitle>
          <CardDescription>
            Please select a category from the domains page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/domains">
            <Button>Go to Domains</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
