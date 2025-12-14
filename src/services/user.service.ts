import { db } from "../db/db";
import {
	users,
	userOrganizationRoles,
	roles,
	organizations,
	type User,
	type UserWithRoles,
} from "../models/user.model";
import { and, eq } from "drizzle-orm";
import { getRoleIdbyName } from "./authz.service";
import {
	getOrCreateOrganiztionByName,
	getOrganizationByName,
} from "./organization.service";
import { z } from "@hono/zod-openapi";
import { activeOrganization } from "@/models/active_organization.model";

/**
 * Creates a new user and assigns them a specific role within an organization.
 * Uses a transaction to ensure both user creation and role assignment are atomic.
 *
 * @param username The username for the new user.
 * @param email The email for the new user (must be unique).
 * @param organizationId The ID of the organization to associate the user with.
 * @param roleId The ID of the role to assign the user within the organization.
 * @returns The newly created user object, or undefined if creation failed.
 */
export async function createUserWithRole(
	username: string,
	email: string,
	role: string,
	organization = "STEI",
): Promise<User | undefined> {
	try {
		let user: User | undefined;

		// check if the user already exists
		user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.email, email),
		});

		const roleId = await getRoleIdbyName(role);

		if (!roleId) {
			throw new Error(`Role '${role}' not found.`);
		}

		const organizationId = await getOrCreateOrganiztionByName(organization);

		if (!user) {
			// Insert the new user and return the inserted row
			[user] = await db
				.insert(users)
				.values({
					username,
					email,
				})
				.returning(); // returning() gets the inserted row

			// Insert the entry into the user_organization_roles join table
			await db.insert(userOrganizationRoles).values({
				user_id: user.id,
				organization_id: organizationId,
				role_id: roleId,
			});

			// Insert the entry to the activeOrganization table
			await db.insert(activeOrganization).values({
				user_id: user.id,
				organization_id: organizationId,
			});

			if (!user) {
				throw new Error("Failed to create user.");
			}

			return user;
		}

		const isExist = await db
			.select()
			.from(userOrganizationRoles)
			.where(
				and(
					eq(userOrganizationRoles.user_id, user.id),
					eq(userOrganizationRoles.organization_id, organizationId),
					eq(userOrganizationRoles.role_id, roleId),
				),
			);

		if (isExist.length > 0)
			throw new Error("User, Role, and Organization relation already exist.");

		// Insert the entry into the user_organization_roles join table
		await db.insert(userOrganizationRoles).values({
			user_id: user.id,
			organization_id: organizationId,
			role_id: roleId,
		});

		console.log(
			`User '${username}' created and assigned role ${role} in organization ${organization}.`,
		);
		return user;
	} catch (error) {
		console.error("Error creating user:", error);
		return undefined;
	}
}

/**
 * Deletes a user and their associated entries in the user_organization_roles table.
 * Uses a transaction to ensure both deletions are atomic.
 * Assumes no CASCADE delete is set up on the foreign key in userOrganizationRoles
 * pointing to users. If CASCADE is set, deleting from `users` might be enough.
 *
 * @param userId The ID of the user to delete.
 * @returns True if deletion was successful, False otherwise.
 */
export async function deleteUserById(
	userId: number,
	organizationId: number,
	roleId: number,
): Promise<boolean> {
	try {
		// Check if the user has any other roles in the organization
		const userRoles = await db.query.userOrganizationRoles.findMany({
			where: (userOrganizationRoles, { eq }) =>
				eq(userOrganizationRoles.user_id, userId),
		});

		if (userRoles.length <= 1) {
			throw new Error(
				`User with ID ${userId} only has 1 role, cannot be deleted.`,
			);
		}

		await db
			.delete(userOrganizationRoles)
			.where(
				and(
					eq(userOrganizationRoles.user_id, userId),
					eq(userOrganizationRoles.organization_id, organizationId),
					eq(userOrganizationRoles.role_id, roleId),
				),
			);

		// delete the user from active organization
		const [isActive] = await db
			.select()
			.from(activeOrganization)
			.where(and(eq(activeOrganization.user_id, userId)));

		if (isActive.organization_id === organizationId) {
			// Select other organization
			const orgId = await db
				.select({
					organizationId: userOrganizationRoles.organization_id,
				})
				.from(userOrganizationRoles)
				.where(eq(userOrganizationRoles.user_id, userId));

			// insert first found organization
			await db
				.update(activeOrganization)
				.set({
					organization_id: orgId[0].organizationId,
				})
				.where(eq(activeOrganization.user_id, userId));
		}

		console.log(`User with ID ${userId} deleted successfully.`);
		return true;
	} catch (error) {
		console.error(`Error deleting user with ID ${userId}:`, error);
		return false;
	}
}

/**
 * Updates details for an existing user.
 *
 * @param userId The ID of the user to update.
 * @param data An object containing the fields to update (username, email, isActive).
 * @returns The updated user object, or undefined if the user was not found or update failed.
 */
export async function updateUserDetails(
	userId: number,
	data: {
		username?: string;
		email?: string;
	},
): Promise<User | undefined> {
	try {
		// Check if any update data is provided
		if (Object.keys(data).length === 0) {
			console.log("No update data provided.");
			return undefined;
		}

		// Perform the update and return the updated row
		const [updatedUser] = await db
			.update(users)
			.set(data) // Drizzle automatically maps object keys to columns
			.where(eq(users.id, userId))
			.returning(); // returning() gets the updated row

		if (updatedUser) {
			console.log(`User with ID ${userId} updated successfully.`);
			return updatedUser;
		}
		console.log(`User with ID ${userId} not found.`);
		return undefined;
	} catch (error) {
		console.error(`Error updating user with ID ${userId}:`, error);
		return undefined;
	}
}

/**
 * Retrieves user data along with their roles in different organizations.
 * Performs LEFT JOINs to include related role and organization information.
 *
 * @param userId The ID of the user to retrieve.
 * @returns A UserWithRoles object containing user data and a list of their roles/organizations,
 * or undefined if the user is not found.
 */
export async function getUserDataWithRoles(
	userId: number,
): Promise<UserWithRoles | undefined> {
	try {
		const userData = await db
			.select()
			.from(users)
			.leftJoin(
				userOrganizationRoles,
				eq(users.id, userOrganizationRoles.user_id),
			)
			.leftJoin(roles, eq(userOrganizationRoles.role_id, roles.id))
			.leftJoin(
				organizations,
				eq(userOrganizationRoles.organization_id, organizations.id),
			)
			.where(eq(users.id, userId));

		if (!userData || userData.length === 0) {
			console.log(`User with ID ${userId} not found.`);
			return undefined;
		}

		// Structure the result into the UserWithRoles format
		const userResult: UserWithRoles = {
			id: userData[0].users.id,
			username: userData[0].users.username,
			email: userData[0].users.email,
			created_at: userData[0].users.created_at, // Use camelCase for TypeScript
			updated_at: userData[0].users.updated_at, // Use camelCase for TypeScript
			is_active: userData[0].users.is_active, // Use camelCase for TypeScript
			userOrganizationRoles: [],
		};

		// Iterate through the joined results to build the userOrganizationRoles array
		for (const row of userData) {
			if (row.user_organization_roles && row.roles && row.organizations) {
				userResult.userOrganizationRoles.push({
					user_id: row.user_organization_roles.user_id,
					organization_id: row.user_organization_roles.organization_id,
					role_id: row.user_organization_roles.role_id,
					role: {
						id: row.roles.id,
						name: row.roles.name,
						description: row.roles.description,
					},
					organization: {
						id: row.organizations.id,
						name: row.organizations.name,
					},
				});
			}
		}

		console.log(`Retrieved data for user ID ${userId}.`);
		return userResult;
	} catch (error) {
		console.error(`Error retrieving data for user with ID ${userId}:`, error);
		return undefined;
	}
}

export async function getAllUsers() {
	const data = await db
		.select()
		.from(userOrganizationRoles)
		.innerJoin(users, eq(userOrganizationRoles.user_id, users.id))
		.innerJoin(
			organizations,
			eq(userOrganizationRoles.organization_id, organizations.id),
		)
		.innerJoin(roles, eq(userOrganizationRoles.role_id, roles.id))
		.orderBy(users.id);
	return data;
}

export async function getActiveUserByEmail(email: string) {
	// Validate email using Zod
	const EmailSchema = z.string().email();
	const validatedEmail = EmailSchema.parse(email);

	const [user] = await db
		.select()
		.from(users)
		.where(and(eq(users.email, validatedEmail), eq(users.is_active, true)));

	if (!user) {
		return null;
	}

	const [data] = await db
		.select()
		.from(activeOrganization)
		.innerJoin(
			userOrganizationRoles,
			eq(
				userOrganizationRoles.organization_id,
				activeOrganization.organization_id,
			),
		)
		.innerJoin(users, eq(activeOrganization.user_id, users.id))
		.innerJoin(
			organizations,
			eq(organizations.id, activeOrganization.organization_id),
		)
		.innerJoin(roles, eq(userOrganizationRoles.role_id, roles.id))
		.where(and(eq(users.email, validatedEmail), eq(users.is_active, true)))
		.execute();

	const parsedData = {
		id: data.users.id,
		username: data.users.username,
		email: data.users.email,
		organizationId: data.organizations.id,
		organizationName: data.organizations.name,
	};

	return parsedData;
}

export async function getAllUserPrintNumber(
	userId: number,
	organizationId: number,
) {
	const userOrg = await db
		.select({ organization_id: userOrganizationRoles.organization_id })
		.from(userOrganizationRoles)
		.where(
			and(
				eq(userOrganizationRoles.organization_id, organizationId),
				eq(userOrganizationRoles.user_id, userId),
			),
		);

	if (!userOrg.length) return [];

	return await db
		.select({ id: users.id, name: users.username })
		.from(userOrganizationRoles)
		.innerJoin(users, eq(userOrganizationRoles.user_id, users.id))
		.where(
			and(
				eq(userOrganizationRoles.role_id, 4),
				eq(userOrganizationRoles.organization_id, userOrg[0].organization_id),
			),
		);
}

export async function changeUserActivation(userId: number, isActive: boolean) {
	return await db
		.update(users)
		.set({
			is_active: isActive,
		})
		.where(eq(users.id, userId))
		.returning();
}

export async function addUserRole(
	userId: number,
	roleName: string,
	organizationName: string,
) {
	try {
		// Get role ID from role name
		const roleId = await getRoleIdbyName(roleName);
		if (!roleId) {
			throw new Error(`Role '${roleName}' not found.`);
		}

		// Check if user exists
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
		});

		if (!user) {
			throw new Error(`User with ID ${userId} not found.`);
		}

		// Check if organization exists
		const organization = await getOrganizationByName(organizationName);
		if (!organization || organization.length === 0) {
			throw new Error(`Organization '${organizationName}' not found.`);
		}

		const organizationId = organization[0].id;

		// Check if the role assignment already exists
		const existingRole = await db
			.select()
			.from(userOrganizationRoles)
			.where(
				and(
					eq(userOrganizationRoles.user_id, userId),
					eq(userOrganizationRoles.organization_id, organizationId),
					eq(userOrganizationRoles.role_id, roleId),
				),
			);

		if (existingRole.length > 0) {
			throw new Error("User already has this role in this organization.");
		}

		// Add the new role
		await db.insert(userOrganizationRoles).values({
			user_id: userId,
			organization_id: organizationId,
			role_id: roleId,
		});

		return true;
	} catch (error) {
		console.error("Error adding user role:", error);
		throw error;
	}
}

export async function updateUserRoleAndOrganization(
	userId: number,
	roleName: string,
	organizationName: string,
	oldRoleId: number,
	oldOrganizationId: number,
) {
	try {
		// Get role ID from role name
		const roleId = await getRoleIdbyName(roleName);
		if (!roleId) {
			throw new Error(`Role '${roleName}' not found.`);
		}

		// Check if user exists
		const user = await db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, userId),
		});

		if (!user) {
			throw new Error(`User with ID ${userId} not found.`);
		}

		// Check if organization exists
		const organization = await getOrganizationByName(organizationName);
		if (!organization || organization.length === 0) {
			throw new Error(`Organization '${organizationName}' not found.`);
		}

		const organizationId = organization[0].id;

		// Check if the role assignment already exists
		const existingRole = await db
			.select()
			.from(userOrganizationRoles)
			.where(
				and(
					eq(userOrganizationRoles.user_id, userId),
					eq(userOrganizationRoles.organization_id, organizationId),
					eq(userOrganizationRoles.role_id, roleId),
				),
			);

		if (existingRole.length > 0) {
			throw new Error("User already has this role in this organization.");
		}

		// Update the role and organization
		await db
			.update(userOrganizationRoles)
			.set({
				role_id: roleId,
				organization_id: organizationId,
			})
			.where(
				and(
					eq(userOrganizationRoles.user_id, userId),
					eq(userOrganizationRoles.role_id, oldRoleId),
					eq(userOrganizationRoles.organization_id, oldOrganizationId),
				),
			);

		return true;
	} catch (error) {
		console.error("Error updating user role and organization:", error);
		throw error;
	}
}
