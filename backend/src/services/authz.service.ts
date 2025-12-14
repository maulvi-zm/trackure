import { db } from "@/db/db";
import { activeOrganization } from "@/models/active_organization.model";
import {
	type UserWithRoles,
	roles,
	userOrganizationRoles,
} from "@/models/user.model";
import type { Role } from "@/types/authz.types";
import { and, eq, inArray } from "drizzle-orm";

export async function hasRoles(
	roleArray: Role[],
	userid: number,
): Promise<boolean> {
	const role_ids = await db
		.select({ role_id: roles.id })
		.from(roles)
		.innerJoin(
			userOrganizationRoles,
			eq(roles.id, userOrganizationRoles.role_id),
		)
		.innerJoin(
			activeOrganization,
			eq(
				activeOrganization.organization_id,
				userOrganizationRoles.organization_id,
			),
		)
		.where(and(eq(userOrganizationRoles.user_id, userid)));

	if (!role_ids || role_ids.length === 0) {
		return false;
	}

	const role_names = await db
		.select({ name: roles.name })
		.from(roles)
		.where(
			inArray(
				roles.id,
				role_ids.map((role) => role.role_id),
			),
		);

	return role_names.some((role) => roleArray.includes(role.name as Role));
}

export async function hasRole(userId: number, role: Role): Promise<boolean> {
	const userRolesResult = await db
		.select({
			roleName: roles.name,
		})
		.from(userOrganizationRoles)
		.innerJoin(roles, eq(userOrganizationRoles.role_id, roles.id))
		.where(eq(userOrganizationRoles.user_id, userId));

	return userRolesResult.some((userRole) => userRole.roleName === role);
}

export async function loadUserWithRoles(
	userId: number,
): Promise<UserWithRoles | null> {
	const result = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, userId),
		with: {
			userOrganizationRoles: {
				with: {
					role: true,
					organization: true,
				},
			},
		},
	});

	return result || null;
}

export async function getRoleIdbyName(roleName: string) {
	const role = await db.query.roles.findFirst({
		where: (roles, { eq }) => eq(roles.name, roleName.toUpperCase()),
	});

	if (!role) {
		return null;
	}

	return role.id;
}

/**
 * Get the organization IDs where user has a specific role
 * @returns Array of organization IDs
 */
export async function getUserOrganizationsWithRole(
	userId: number,
	role: Role,
): Promise<number[]> {
	const userOrgsResult = await db
		.select({
			organizationId: userOrganizationRoles.organization_id,
			roleName: roles.name,
		})
		.from(userOrganizationRoles)
		.innerJoin(roles, eq(userOrganizationRoles.role_id, roles.id))
		.where(eq(userOrganizationRoles.user_id, userId));

	return userOrgsResult
		.filter((result) => result.roleName === role)
		.map((result) => result.organizationId);
}

export async function getAllActiveRoles(userId: number) {
	return await db
		.select({
			roleId: userOrganizationRoles.role_id,
			roleName: roles.name,
		})
		.from(activeOrganization)
		.innerJoin(
			userOrganizationRoles,
			eq(
				userOrganizationRoles.organization_id,
				activeOrganization.organization_id,
			),
		)
		.innerJoin(roles, eq(userOrganizationRoles.role_id, roles.id))
		.where(
			and(
				eq(activeOrganization.user_id, userId),
				eq(userOrganizationRoles.user_id, userId),
			),
		);
}
