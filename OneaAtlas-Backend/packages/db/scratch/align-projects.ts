import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("Aligning project ownership...");
  
  // Find project
  const project = await prisma.project.findFirst({
    where: { slug: "crm" }
  });

  if (!project) {
    console.log("CRM project not found!");
    return;
  }

  console.log(`Original project orgId: ${project.orgId}`);

  // Find active org
  const activeOrg = await prisma.organization.findFirst({
    where: { clerkOrgId: "org_3Dyv0m2Uhru1wAEo1ftXUX8DkVD" }
  });

  if (!activeOrg) {
    console.log("Active organization org_3Dyv0m2Uhru1wAEo1ftXUX8DkVD not found!");
    return;
  }

  console.log(`Target organization ID: ${activeOrg.id}`);

  // Update project
  const updatedProject = await prisma.project.update({
    where: { id: project.id },
    data: { orgId: activeOrg.id }
  });

  console.log(`Successfully updated project orgId to: ${updatedProject.orgId}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
