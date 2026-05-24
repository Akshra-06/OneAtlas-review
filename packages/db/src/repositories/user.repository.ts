// =============================================================================
// packages/db/src/repositories/user.repository.ts
// Data-access layer for User and related auth models.
// All membership queries are scoped by orgId (multi-tenant).
// =============================================================================

import { prisma } from "../client";
import type { Prisma, User, UserSession, OrgMember } from "@prisma/client";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FindUsersInOrgParams {
  orgId: string;
  page?: number;
  limit?: number;
}

export interface UserWithMembership extends User {
  memberships: OrgMember[];
}

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export class UserRepository {
  // -------------------------------------------------------------------------
  // Core CRUD
  // -------------------------------------------------------------------------

  /** Find a user by their internal id. */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /** Find a user by Clerk external id. */
  async findByClerkId(clerkId: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { clerkId } });
  }

  /** Find a user by email address. */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /** Create a new user record. */
  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({ data });
  }

  /** Update an existing user. */
  async update(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  }

  /** Hard-delete a user by id. */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({ where: { id } });
  }

  // -------------------------------------------------------------------------
  // Org-scoped queries (multi-tenant)
  // -------------------------------------------------------------------------

  /** List all users that belong to a given org. */
  async findByOrgId(
    orgId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ data: User[]; total: number }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where: { memberships: { some: { orgId } } },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({
        where: { memberships: { some: { orgId } } },
      }),
    ]);

    return { data, total };
  }

  /** Find a single user within an org (confirms membership). */
  async findByIdInOrg(id: string, orgId: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: {
        id,
        memberships: { some: { orgId } },
      },
    });
  }

  // -------------------------------------------------------------------------
  // Sessions
  // -------------------------------------------------------------------------

  /** Create a user session record. */
  async createSession(
    data: Prisma.UserSessionCreateInput
  ): Promise<UserSession> {
    return prisma.userSession.create({ data });
  }

  /** Delete a session by Clerk session id. */
  async deleteSessionByClerkId(clerkSession: string): Promise<UserSession> {
    return prisma.userSession.delete({ where: { clerkSession } });
  }

  /** Update user's lastActiveAt timestamp. */
  async touch(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { lastActiveAt: new Date() },
    });
  }
}
