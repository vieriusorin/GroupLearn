import { and, eq } from "drizzle-orm";
import { db } from "../src/infrastructure/database/drizzle";
import { domains, paths } from "../src/infrastructure/database/schema";

interface SeedPath {
  domainName: string;
  name: string;
  description: string;
  icon: string | null;
  orderIndex: number;
  visibility: "public" | "private";
  unlockRequirementType: "none" | "previous_path" | "xp_threshold";
  unlockRequirementValue: number | null;
}

const defaultPaths: SeedPath[] = [
  {
    domainName: "JavaScript",
    name: "Beginner JavaScript",
    description: "Start your JavaScript journey from zero",
    icon: "🌱",
    orderIndex: 0,
    visibility: "public",
    unlockRequirementType: "none",
    unlockRequirementValue: null,
  },
  {
    domainName: "JavaScript",
    name: "Intermediate JavaScript",
    description: "Build on your JavaScript fundamentals",
    icon: "🌱",
    orderIndex: 1,
    visibility: "public",
    unlockRequirementType: "previous_path",
    unlockRequirementValue: null, // Will be set after first path is created
  },
  {
    domainName: "JavaScript",
    name: "Advanced JavaScript",
    description: "Master advanced JavaScript concepts",
    icon: "🌳",
    orderIndex: 2,
    visibility: "public",
    unlockRequirementType: "previous_path",
    unlockRequirementValue: null,
  },
  {
    domainName: "JavaScript",
    name: "Professional JavaScript",
    description: "Become a JavaScript expert",
    icon: "🏆",
    orderIndex: 3,
    visibility: "public",
    unlockRequirementType: "previous_path",
    unlockRequirementValue: null,
  },
  // Spanish Paths
  {
    domainName: "Spanish Language",
    name: "Beginner Spanish",
    description: "Start your Spanish journey",
    icon: "🇪🇸",
    orderIndex: 0,
    visibility: "public",
    unlockRequirementType: "none",
    unlockRequirementValue: null,
  },
];

async function seedPaths() {
  try {
    const createdPaths: { [key: string]: number } = {};

    for (const pathData of defaultPaths) {
      // Find or create domain
      let [domain] = await db
        .select({ id: domains.id })
        .from(domains)
        .where(eq(domains.name, pathData.domainName))
        .limit(1);

      if (!domain) {
        console.log(`Creating domain: ${pathData.domainName}`);
        const [newDomain] = await db
          .insert(domains)
          .values({
            name: pathData.domainName,
            description: `Learn ${pathData.domainName}`,
          })
          .returning({ id: domains.id });
        domain = newDomain;
      }

      const [existingPath] = await db
        .select({ id: paths.id })
        .from(paths)
        .where(
          and(eq(paths.domainId, domain.id), eq(paths.name, pathData.name)),
        )
        .limit(1);

      if (existingPath) {
        console.log(`⚠️  Path "${pathData.name}" already exists, skipping...`);
        createdPaths[pathData.name] = existingPath.id;
        continue;
      }

      let unlockValue = pathData.unlockRequirementValue;
      if (
        pathData.unlockRequirementType === "previous_path" &&
        pathData.orderIndex > 0
      ) {
        const [previousPath] = await db
          .select({ id: paths.id })
          .from(paths)
          .where(
            and(
              eq(paths.domainId, domain.id),
              eq(paths.orderIndex, pathData.orderIndex - 1),
            ),
          )
          .limit(1);

        if (previousPath) {
          unlockValue = previousPath.id;
        }
      }

      console.log(`Creating path: ${pathData.name} (${pathData.visibility})`);
      const [newPath] = await db
        .insert(paths)
        .values({
          domainId: domain.id,
          name: pathData.name,
          description: pathData.description,
          icon: pathData.icon,
          orderIndex: pathData.orderIndex,
          isLocked: false,
          unlockRequirementType:
            pathData.unlockRequirementType === "none"
              ? null
              : pathData.unlockRequirementType,
          unlockRequirementValue: unlockValue,
          visibility: pathData.visibility,
          createdBy: null,
        })
        .returning({ id: paths.id });

      createdPaths[pathData.name] = newPath.id;
    }

    console.log("\n✅ Path seeding completed!");
    console.log(`\nCreated/Updated ${Object.keys(createdPaths).length} paths:`);
    Object.entries(createdPaths).forEach(([name, id]) => {
      console.log(`  - ${name} (ID: ${id})`);
    });
  } catch (error: unknown) {
    console.error(
      "❌ Error seeding paths:",
      error instanceof Error ? error.message : String(error),
    );
    throw error;
  }
}

if (require.main === module) {
  seedPaths()
    .then(() => {
      console.log("\n✅ Seeding script completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Seeding script failed:", error);
      process.exit(1);
    });
}

export { seedPaths };
