import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("=== Organizations ===");
  const orgs = await prisma.organization.findMany();
  console.dir(orgs, { depth: null });

  console.log("\n=== Org Members ===");
  const members = await prisma.orgMember.findMany();
  console.dir(members, { depth: null });

  console.log("\n=== Projects ===");
  const projects = await prisma.project.findMany();
  console.dir(projects, { depth: null });
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
