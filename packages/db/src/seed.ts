// =============================================================================
// packages/db/src/seed.ts
// Development seed — creates a demo org, user, and project.
// Run: npm run db:seed (from packages/db)
// =============================================================================

import { prisma } from "./client";
import {
  OrgPlan,
  UserStatus,
  ProjectType,
  ProjectStatus,
  WorkflowStatus,
  TriggerType,
} from "@prisma/client";

async function main() {
  console.log("🌱 Seeding database...");

  // ── 1. Demo User ───────────────────────────────────────────────────────────
  const user = await prisma.user.upsert({
    where: { email: "demo@oneatlas.dev" },
    update: {},
    create: {
      clerkId: "user_seed_demo_001",
      email: "demo@oneatlas.dev",
      name: "Demo User",
      emailVerified: true,
      status: UserStatus.ACTIVE,
    },
  });
  console.log("✓ User created:", user.email);

  // ── 2. Demo Organization ───────────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { slug: "acme" },
    update: {},
    create: {
      name: "Acme Corp",
      slug: "acme",
      plan: OrgPlan.PRO,
      ownerId: user.id,
      maxApps: 20,
      maxWorkflows: 50,
      maxMembers: 25,
    },
  });
  console.log("✓ Organization created:", org.name);

  // ── 3. Org Membership ─────────────────────────────────────────────────────
  await prisma.orgMember.upsert({
    where: { orgId_userId: { orgId: org.id, userId: user.id } },
    update: {},
    create: {
      orgId: org.id,
      userId: user.id,
      role: "OWNER",
      acceptedAt: new Date(),
    },
  });
  console.log("✓ OrgMember linked");

  // ── 4. Demo Project ────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { subdomain: "crm-acme" },
    update: {},
    create: {
      orgId: org.id,
      name: "CRM Dashboard",
      slug: "crm",
      description: "Customer relationship management with contacts, companies, and deal pipeline",
      type: ProjectType.CRUD_APP,
      status: ProjectStatus.ACTIVE,
      prompt: "Build a CRM with contacts, companies, and a deal pipeline with stages: Lead, Qualified, Proposal, Closing, Won, Lost",
      subdomain: "crm-acme",
      metadata: {
        tables: ["contacts", "companies", "deals", "stages"],
        pages: ["dashboard", "contacts", "companies", "pipeline"],
        aiModel: "gpt-4o-mini",
        generatedAt: new Date().toISOString(),
      },
    },
  });
  console.log("✓ Project created:", project.name);

  // ── 5. Project Env Vars ────────────────────────────────────────────────────
  await prisma.projectEnvVar.upsert({
    where: { projectId_key: { projectId: project.id, key: "APP_NAME" } },
    update: {},
    create: {
      projectId: project.id,
      key: "APP_NAME",
      value: "Acme CRM",
      isSecret: false,
    },
  });
  console.log("✓ Project env vars created");

  // ── 6. Demo Workflow ───────────────────────────────────────────────────────
  await prisma.workflow.upsert({
    where: { id: "seed_workflow_001" },
    update: {},
    create: {
      id: "seed_workflow_001",
      projectId: project.id,
      name: "New Deal Slack Notification",
      description: "Send a Slack message when a new deal is created",
      status: WorkflowStatus.ACTIVE,
      triggerType: TriggerType.DATABASE_EVENT,
      definition: {
        nodes: [
          {
            id: "trigger",
            type: "trigger",
            triggerType: "DATABASE_EVENT",
            config: { table: "deals", event: "INSERT" },
          },
          {
            id: "slack_notify",
            type: "action",
            provider: "SLACK",
            config: {
              channel: "#sales",
              message: "🎉 New deal created: {{deal.name}} — {{deal.value}}",
            },
          },
        ],
        edges: [{ from: "trigger", to: "slack_notify" }],
      },
    },
  });
  console.log("✓ Workflow created");

  // ── 7. Deployment ──────────────────────────────────────────────────────────
  await prisma.deployment.create({
    data: {
      projectId: project.id,
      version: 1,
      status: "LIVE",
      env: "PRODUCTION",
      cfWorkerName: "crm-acme-worker",
      deployedUrl: "https://crm-acme.oneatlas.app",
      buildDuration: 4200,
      deployedAt: new Date(),
    },
  });
  console.log("✓ Deployment created");

  // --- Template dashboard demo data -----------------------------------------
  const demoOrgId = "demo-org-001";
  const baseDate = new Date();
  const daysAgo = (days: number, hours = 0) =>
    new Date(baseDate.getTime() - (days * 24 + hours) * 60 * 60 * 1000);
  const pick = <T>(items: readonly T[], index: number): T => {
    const item = items[index % items.length];
    if (item === undefined) {
      throw new Error("Seed array cannot be empty");
    }
    return item;
  };

  const demoOrg = await prisma.organization.upsert({
    where: { id: demoOrgId },
    update: {
      name: "OneAtlas Demo Templates",
      slug: "demo-templates",
      plan: OrgPlan.PRO,
      ownerId: user.id,
      maxApps: 50,
      maxWorkflows: 100,
      maxMembers: 25,
    },
    create: {
      id: demoOrgId,
      name: "OneAtlas Demo Templates",
      slug: "demo-templates",
      plan: OrgPlan.PRO,
      ownerId: user.id,
      maxApps: 50,
      maxWorkflows: 100,
      maxMembers: 25,
    },
  });

  await prisma.orgMember.upsert({
    where: { orgId_userId: { orgId: demoOrg.id, userId: user.id } },
    update: { role: "OWNER" },
    create: {
      orgId: demoOrg.id,
      userId: user.id,
      role: "OWNER",
      acceptedAt: new Date(),
    },
  });

  const templateProjects = [
    { id: "demo-project-support", slug: "support", name: "Support Queue", type: ProjectType.CRUD_APP, templateId: "support" },
    { id: "demo-project-crm", slug: "crm-template", name: "Sales CRM", type: ProjectType.CRUD_APP, templateId: "crm" },
    { id: "demo-project-ecom", slug: "ecommerce", name: "Ecommerce Console", type: ProjectType.CRUD_APP, templateId: "ecommerce" },
    { id: "demo-project-ats", slug: "ats", name: "ATS Pipeline", type: ProjectType.CRUD_APP, templateId: "ats" },
    { id: "demo-project-finance", slug: "finance", name: "Finance Dashboard", type: ProjectType.DASHBOARD, templateId: "finance" },
    { id: "demo-project-logistics", slug: "logistics", name: "Logistics Control", type: ProjectType.DASHBOARD, templateId: "logistics" },
    { id: "demo-project-pm", slug: "project-management", name: "Project Management", type: ProjectType.CRUD_APP, templateId: "project_management" },
    { id: "demo-project-edu", slug: "education", name: "Education Portal", type: ProjectType.DASHBOARD, templateId: "education" },
    { id: "demo-project-health", slug: "healthcare", name: "Healthcare Workspace", type: ProjectType.CRUD_APP, templateId: "healthcare" },
    { id: "demo-project-analytics", slug: "analytics", name: "Analytics Report", type: ProjectType.DASHBOARD, templateId: "analytics" },
  ];

  for (const templateProject of templateProjects) {
    await prisma.project.upsert({
      where: { id: templateProject.id },
      update: {
        orgId: demoOrg.id,
        name: templateProject.name,
        slug: templateProject.slug,
        type: templateProject.type,
        status: ProjectStatus.ACTIVE,
        metadata: { templateId: templateProject.templateId, seeded: true },
      },
      create: {
        id: templateProject.id,
        orgId: demoOrg.id,
        name: templateProject.name,
        slug: templateProject.slug,
        description: `${templateProject.name} demo project`,
        type: templateProject.type,
        status: ProjectStatus.ACTIVE,
        prompt: `Demo data project for ${templateProject.name}`,
        subdomain: `${templateProject.slug}-demo`,
        metadata: { templateId: templateProject.templateId, seeded: true },
      },
    });

    await prisma.projectDashboardConfig.upsert({
      where: { id: `dashboard-config-${templateProject.templateId}` },
      update: {
        orgId: demoOrg.id,
        projectId: templateProject.id,
        templateId: templateProject.templateId,
        layout: { density: "comfortable", columns: 12, sections: ["kpis", "chart", "primary-list"] },
        theme: { mode: "light", accent: "#635BFF" },
        widgets: [
          { id: "overview", enabled: true, span: 4 },
          { id: "trend", enabled: true, span: 8 },
          { id: "recent", enabled: true, span: 12 },
        ],
        updatedBy: user.id,
      },
      create: {
        id: `dashboard-config-${templateProject.templateId}`,
        orgId: demoOrg.id,
        projectId: templateProject.id,
        templateId: templateProject.templateId,
        layout: { density: "comfortable", columns: 12, sections: ["kpis", "chart", "primary-list"] },
        theme: { mode: "light", accent: "#635BFF" },
        widgets: [
          { id: "overview", enabled: true, span: 4 },
          { id: "trend", enabled: true, span: 8 },
          { id: "recent", enabled: true, span: 12 },
        ],
        createdBy: user.id,
        updatedBy: user.id,
      },
    });
  }

  const ticketStatuses = ["open", "closed", "pending"];
  const ticketPriorities = ["low", "normal", "high", "urgent"];
  const ticketSubjects = ["Login fails on Safari", "Invoice export missing tax", "Webhook returns 500", "Bulk import stuck", "SSO redirect loop"];
  for (let i = 0; i < 20; i += 1) {
    const status = pick(ticketStatuses, i);
    await prisma.supportTicket.upsert({
      where: { id: `seed-support-ticket-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-support",
        ticketNumber: `SUP-${4800 + i}`,
        subject: pick(ticketSubjects, i),
        status,
        priority: pick(ticketPriorities, i),
        channel: i % 3 === 0 ? "chat" : i % 3 === 1 ? "email" : "phone",
        customerName: ["Maya Patel", "Jordan Lee", "Ava Chen", "Noah Smith"][i % 4],
        assignedTo: ["Priya", "Daniel", "Sam"][i % 3],
        resolvedAt: status === "closed" ? daysAgo(i % 12, 3) : null,
      },
      create: {
        id: `seed-support-ticket-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-support",
        ticketNumber: `SUP-${4800 + i}`,
        subject: pick(ticketSubjects, i),
        status,
        priority: pick(ticketPriorities, i),
        channel: i % 3 === 0 ? "chat" : i % 3 === 1 ? "email" : "phone",
        customerId: `customer-${(i % 8) + 1}`,
        customerName: ["Maya Patel", "Jordan Lee", "Ava Chen", "Noah Smith"][i % 4],
        assignedTo: ["Priya", "Daniel", "Sam"][i % 3],
        resolvedAt: status === "closed" ? daysAgo(i % 12, 3) : null,
        createdAt: daysAgo(i % 30, i % 8),
      },
    });
  }

  for (let i = 0; i < 10; i += 1) {
    const active = i % 3 !== 0;
    await prisma.supportChat.upsert({
      where: { id: `seed-support-chat-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-support",
        status: active ? "active" : "ended",
        agentName: ["Priya", "Daniel", "Sam", "Nina"][i % 4],
        aiHandled: i % 2 === 0,
        endedAt: active ? null : daysAgo(i + 1, 2),
      },
      create: {
        id: `seed-support-chat-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-support",
        status: active ? "active" : "ended",
        agentId: `agent-${(i % 4) + 1}`,
        agentName: ["Priya", "Daniel", "Sam", "Nina"][i % 4],
        customerId: `customer-${(i % 8) + 1}`,
        aiHandled: i % 2 === 0,
        startedAt: daysAgo(i % 10, i),
        endedAt: active ? null : daysAgo(i + 1, 2),
        createdAt: daysAgo(i % 10, i),
      },
    });
  }

  const dealStages = ["lead", "qualified", "proposal", "won", "lost"];
  for (let i = 0; i < 15; i += 1) {
    const stage = pick(dealStages, i);
    await prisma.crmDeal.upsert({
      where: { id: `seed-crm-deal-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-crm",
        title: `${["Acme", "Northwind", "Helix", "Lumen", "Mosaic"][i % 5]} expansion`,
        value: 12000 + i * 3750,
        stage,
        contactName: ["Rhea Kapoor", "Ben Carter", "Lina Gomez", "Owen Park"][i % 4],
        assignedTo: ["Isha", "Marco", "Elena"][i % 3],
        closedAt: stage === "won" || stage === "lost" ? daysAgo(i + 2) : null,
      },
      create: {
        id: `seed-crm-deal-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-crm",
        title: `${["Acme", "Northwind", "Helix", "Lumen", "Mosaic"][i % 5]} expansion`,
        value: 12000 + i * 3750,
        stage,
        contactName: ["Rhea Kapoor", "Ben Carter", "Lina Gomez", "Owen Park"][i % 4],
        assignedTo: ["Isha", "Marco", "Elena"][i % 3],
        closedAt: stage === "won" || stage === "lost" ? daysAgo(i + 2) : null,
        createdAt: daysAgo((i * 2) % 30),
      },
    });
  }

  for (let i = 0; i < 20; i += 1) {
    const name = pick(["Rhea Kapoor", "Ben Carter", "Lina Gomez", "Owen Park", "Tara Singh"], i);
    await prisma.crmContact.upsert({
      where: { id: `seed-crm-contact-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-crm",
        name,
        email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
        company: ["Acme", "Northwind", "Helix", "Lumen"][i % 4],
        status: i % 6 === 0 ? "inactive" : "active",
      },
      create: {
        id: `seed-crm-contact-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-crm",
        name,
        email: `${name.toLowerCase().replace(" ", ".")}@example.com`,
        phone: `+1-555-010${i % 10}`,
        company: ["Acme", "Northwind", "Helix", "Lumen"][i % 4],
        status: i % 6 === 0 ? "inactive" : "active",
        createdAt: daysAgo(i % 30),
      },
    });
  }

  const orderStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
  for (let i = 0; i < 25; i += 1) {
    const status = pick(orderStatuses, i);
    await prisma.ecomOrder.upsert({
      where: { id: `seed-ecom-order-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-ecom",
        orderNumber: `EC-${9200 + i}`,
        customerName: ["Maya Patel", "Noah Smith", "Ava Chen", "Leo Martin"][i % 4],
        status,
        total: 49 + i * 18.75,
        itemCount: (i % 5) + 1,
        fulfilledAt: status === "shipped" || status === "delivered" ? daysAgo(i % 15, 4) : null,
      },
      create: {
        id: `seed-ecom-order-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-ecom",
        orderNumber: `EC-${9200 + i}`,
        customerName: ["Maya Patel", "Noah Smith", "Ava Chen", "Leo Martin"][i % 4],
        status,
        total: 49 + i * 18.75,
        itemCount: (i % 5) + 1,
        fulfilledAt: status === "shipped" || status === "delivered" ? daysAgo(i % 15, 4) : null,
        createdAt: daysAgo(i % 30),
      },
    });
  }

  for (let i = 0; i < 15; i += 1) {
    await prisma.ecomProduct.upsert({
      where: { id: `seed-ecom-product-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-ecom",
        name: `${["Walnut Desk", "Mesh Chair", "Standing Riser", "Task Lamp", "Cable Tray"][i % 5]} ${i + 1}`,
        sku: `SKU-${1200 + i}`,
        stock: (i * 17) % 140,
        price: 29 + i * 11.5,
        status: i % 7 === 0 ? "archived" : "active",
      },
      create: {
        id: `seed-ecom-product-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-ecom",
        name: `${["Walnut Desk", "Mesh Chair", "Standing Riser", "Task Lamp", "Cable Tray"][i % 5]} ${i + 1}`,
        sku: `SKU-${1200 + i}`,
        stock: (i * 17) % 140,
        price: 29 + i * 11.5,
        status: i % 7 === 0 ? "archived" : "active",
        createdAt: daysAgo(i % 30),
      },
    });
  }

  const candidateStages = ["applied", "screening", "interview", "offer", "hired", "rejected"];
  for (let i = 0; i < 20; i += 1) {
    const name = pick(["Amara Rao", "Ethan Brooks", "Sofia Kim", "Mateo Silva", "Nora Ali"], i);
    await prisma.atsCandidate.upsert({
      where: { id: `seed-ats-candidate-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-ats",
        name,
        email: `${name.toLowerCase().replace(" ", ".")}@talent.example`,
        role: ["Product Designer", "Backend Engineer", "Sales Lead", "Data Analyst"][i % 4],
        stage: pick(candidateStages, i),
        recruiterId: `recruiter-${(i % 3) + 1}`,
        interviewAt: i % 3 === 0 ? daysAgo(i % 20) : null,
      },
      create: {
        id: `seed-ats-candidate-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-ats",
        name,
        email: `${name.toLowerCase().replace(" ", ".")}@talent.example`,
        role: ["Product Designer", "Backend Engineer", "Sales Lead", "Data Analyst"][i % 4],
        stage: pick(candidateStages, i),
        recruiterId: `recruiter-${(i % 3) + 1}`,
        interviewAt: i % 3 === 0 ? daysAgo(i % 20) : null,
        createdAt: daysAgo(i % 30),
      },
    });
  }

  for (let i = 0; i < 30; i += 1) {
    const type = i % 3 === 0 ? "income" : "expense";
    await prisma.financeTransaction.upsert({
      where: { id: `seed-finance-transaction-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-finance",
        type,
        amount: type === "income" ? 2500 + i * 120 : 85 + i * 19,
        category: type === "income" ? "Subscription" : ["Software", "Payroll", "Travel", "Cloud"][i % 4],
        description: type === "income" ? "Customer subscription payment" : "Operating expense",
        date: daysAgo(i % 30),
      },
      create: {
        id: `seed-finance-transaction-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-finance",
        type,
        amount: type === "income" ? 2500 + i * 120 : 85 + i * 19,
        category: type === "income" ? "Subscription" : ["Software", "Payroll", "Travel", "Cloud"][i % 4],
        description: type === "income" ? "Customer subscription payment" : "Operating expense",
        date: daysAgo(i % 30),
        createdAt: daysAgo(i % 30),
      },
    });
  }

  const shipmentStatuses = ["pending", "in_transit", "delayed", "delivered"];
  for (let i = 0; i < 20; i += 1) {
    const status = pick(shipmentStatuses, i);
    await prisma.logisticsShipment.upsert({
      where: { id: `seed-logistics-shipment-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-logistics",
        trackingNo: `TRK${740000 + i}`,
        origin: ["Dallas", "Chicago", "Atlanta", "Phoenix"][i % 4],
        destination: ["Seattle", "Boston", "Miami", "Denver"][i % 4],
        status,
        carrier: ["DHL", "FedEx", "UPS", "BlueDart"][i % 4],
        estimatedAt: daysAgo(Math.max(0, 10 - (i % 12))),
        deliveredAt: status === "delivered" ? daysAgo(i % 10) : null,
      },
      create: {
        id: `seed-logistics-shipment-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-logistics",
        trackingNo: `TRK${740000 + i}`,
        origin: ["Dallas", "Chicago", "Atlanta", "Phoenix"][i % 4],
        destination: ["Seattle", "Boston", "Miami", "Denver"][i % 4],
        status,
        carrier: ["DHL", "FedEx", "UPS", "BlueDart"][i % 4],
        estimatedAt: daysAgo(Math.max(0, 10 - (i % 12))),
        deliveredAt: status === "delivered" ? daysAgo(i % 10) : null,
        createdAt: daysAgo(i % 30),
      },
    });
  }

  const taskStatuses = ["todo", "in_progress", "done"];
  for (let i = 0; i < 25; i += 1) {
    const status = pick(taskStatuses, i);
    await prisma.pmTask.upsert({
      where: { id: `seed-pm-task-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-pm",
        title: `${["Design review", "API contract", "QA pass", "Launch checklist", "Customer feedback"][i % 5]} ${i + 1}`,
        status,
        priority: ["low", "medium", "high"][i % 3],
        assignedTo: ["Ari", "Dev", "Mina", "Kai"][i % 4],
        dueDate: daysAgo(Math.max(0, 20 - (i % 25))),
        completedAt: status === "done" ? daysAgo(i % 15) : null,
      },
      create: {
        id: `seed-pm-task-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-pm",
        title: `${["Design review", "API contract", "QA pass", "Launch checklist", "Customer feedback"][i % 5]} ${i + 1}`,
        status,
        priority: ["low", "medium", "high"][i % 3],
        assignedTo: ["Ari", "Dev", "Mina", "Kai"][i % 4],
        dueDate: daysAgo(Math.max(0, 20 - (i % 25))),
        completedAt: status === "done" ? daysAgo(i % 15) : null,
        createdAt: daysAgo(i % 30),
      },
    });
  }

  for (let i = 0; i < 10; i += 1) {
    const enrolled = 45 + i * 12;
    await prisma.eduCourse.upsert({
      where: { id: `seed-edu-course-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-edu",
        title: pick(["Product Analytics", "Intro to SQL", "Leadership Lab", "UX Research", "Cloud Foundations"], i),
        instructor: ["Dr. Meera Shah", "Prof. Liam Evans", "Anika Rao"][i % 3],
        enrolled,
        completed: Math.floor(enrolled * (0.35 + (i % 5) * 0.08)),
        status: i % 6 === 0 ? "draft" : "active",
      },
      create: {
        id: `seed-edu-course-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-edu",
        title: pick(["Product Analytics", "Intro to SQL", "Leadership Lab", "UX Research", "Cloud Foundations"], i),
        instructor: ["Dr. Meera Shah", "Prof. Liam Evans", "Anika Rao"][i % 3],
        enrolled,
        completed: Math.floor(enrolled * (0.35 + (i % 5) * 0.08)),
        status: i % 6 === 0 ? "draft" : "active",
        createdAt: daysAgo(i * 2),
      },
    });
  }

  const urgencyLevels = ["normal", "elevated", "high", "critical"];
  for (let i = 0; i < 15; i += 1) {
    await prisma.healthcarePatient.upsert({
      where: { id: `seed-healthcare-patient-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-health",
        name: ["Ivy Stone", "Rohan Mehta", "Clara Hughes", "Eli Grant", "Fatima Noor"][i % 5],
        status: ["waiting", "in_care", "discharged"][i % 3],
        urgency: pick(urgencyLevels, i),
        appointedAt: daysAgo(i % 14, i % 6),
        assignedTo: ["Dr. Rao", "Dr. Miller", "Nurse Asha"][i % 3],
      },
      create: {
        id: `seed-healthcare-patient-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-health",
        name: pick(["Ivy Stone", "Rohan Mehta", "Clara Hughes", "Eli Grant", "Fatima Noor"], i),
        status: pick(["waiting", "in_care", "discharged"], i),
        urgency: pick(urgencyLevels, i),
        appointedAt: daysAgo(i % 14, i % 6),
        assignedTo: ["Dr. Rao", "Dr. Miller", "Nurse Asha"][i % 3],
        createdAt: daysAgo(i % 30),
      },
    });
  }

  const analyticsEvents = ["page_view", "signup", "checkout", "invite_sent", "report_export"];
  for (let i = 0; i < 50; i += 1) {
    await prisma.analyticsEvent.upsert({
      where: { id: `seed-analytics-event-${i + 1}` },
      update: {
        orgId: demoOrg.id,
        projectId: "demo-project-analytics",
        event: pick(analyticsEvents, i),
        value: Number((10 + (i % 17) * 2.75).toFixed(2)),
        source: ["web", "mobile", "api", "import"][i % 4],
        metadata: { region: ["NA", "EU", "APAC"][i % 3], cohort: `week-${(i % 4) + 1}` },
      },
      create: {
        id: `seed-analytics-event-${i + 1}`,
        orgId: demoOrg.id,
        projectId: "demo-project-analytics",
        event: pick(analyticsEvents, i),
        value: Number((10 + (i % 17) * 2.75).toFixed(2)),
        source: ["web", "mobile", "api", "import"][i % 4],
        metadata: { region: ["NA", "EU", "APAC"][i % 3], cohort: `week-${(i % 4) + 1}` },
        createdAt: daysAgo(i % 30, i % 12),
      },
    });
  }

  console.log("Template demo data seeded");

  console.log("\n✅ Seed complete!");
  console.log("   User:    demo@oneatlas.dev");
  console.log("   Org:     Acme Corp (slug: acme)");
  console.log("   App:     https://crm-acme.oneatlas.app");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
