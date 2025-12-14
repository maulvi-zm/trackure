import type { Context } from "hono";
import {
	createUserWithRole,
	deleteUserById,
	updateUserDetails,
	getUserDataWithRoles,
	getAllUsers,
	changeUserActivation,
	addUserRole,
	updateUserRoleAndOrganization,
} from "../services/user.service";
import type {
	ChangeUserActivationRequestSchema,
	CreateUserRequestSchema,
	DeleteUserRequestSchema,
	UserResponseDataSchema,
} from "@/types/user.types";

/**
 * Controller class for handling User related requests.
 * This class provides methods for creating, deleting, updating, and retrieving user data.
 */
export class UserController {
	/**
	 * Handles the request to create a new user and assign a role in an organization.
	 * Expects username, email, organizationId, and roleId in the request body.
	 *
	 * @param c The Hono Context object.
	 * @returns A Hono Response object with the created user data or an error.
	 */
	async createUser(c: Context) {
		try {
			const body = await c.req.json<CreateUserRequestSchema>();
			const { username, email, organization, role } = body;

			// Call the service function to create the user
			const newUser = await createUserWithRole(
				username,
				email,
				role,
				organization,
			);

			if (newUser) {
				// Return the newly created user
				return c.json(newUser, 201); // 201 Created
			}

			// Handle cases where user creation failed (e.g., email already exists)
			return c.json(
				{
					success: false,
					error: "Failed to create user. Email might already be in use.",
				},
				400,
			);
		} catch (error) {
			console.error("Error in UserController.createUser:", error);
			return c.json({ success: false, error: "Internal Server Error" }, 500);
		}
	}

	/**
	 * Handles the request to delete a user by ID.
	 * Expects the user ID as a route parameter.
	 *
	 * @param c The Hono Context object.
	 * @returns A Hono Response object indicating success or failure.
	 */
	async deleteUser(c: Context) {
		try {
			// Get the user ID from the route parameters
			const body = await c.req.json<DeleteUserRequestSchema>();
			const { userId, organizationId, roleId } = body;

			// Validate the user ID
			if (Number.isNaN(userId)) {
				return c.json({ success: false, error: "Invalid user ID" }, 400);
			}

			// Call the service function to delete the user
			const success = await deleteUserById(userId, organizationId, roleId);

			if (success) {
				// Return success message
				return c.json(
					{
						success: true,
						message: `User with ID ${userId} deleted successfully.`,
					},
					200,
				);
			}

			// Handle case where user was not found
			return c.json(
				{ success: false, error: `User with ID ${userId} not found.` },
				404,
			); // 404 Not Found
		} catch (error) {
			console.error("Error in UserController.deleteUser:", error);
			return c.json({ success: false, error: "Internal Server Error" }, 500);
		}
	}

	/**
	 * Handles the request to update user details by ID.
	 * Expects the user ID as a route parameter and update data in the request body.
	 *
	 * @param c The Hono Context object.
	 * @returns A Hono Response object with the updated user data or an error.
	 */
	async updateUser(c: Context) {
		try {
			const body = await c.req.json<{
				userId: number;
				username?: string;
				email?: string;
				roleName?: string;
				organizationName?: string;
				oldRoleId?: number;
				oldOrganizationId?: number;
			}>();
			const {
				userId,
				username,
				email,
				roleName,
				organizationName,
				oldRoleId,
				oldOrganizationId,
			} = body;

			// Validate the user ID
			if (Number.isNaN(userId)) {
				return c.json({ success: false, error: "Invalid user ID" }, 400);
			}

			// Update user details if provided
			if (username || email) {
				const updatedUser = await updateUserDetails(userId, {
					username,
					email,
				});
				if (!updatedUser) {
					return c.json(
						{ success: false, error: `User with ID ${userId} not found.` },
						404,
					);
				}
			}

			// Update role and organization if provided
			if (roleName && organizationName && oldRoleId && oldOrganizationId) {
				try {
					await updateUserRoleAndOrganization(
						userId,
						roleName,
						organizationName,
						oldRoleId,
						oldOrganizationId,
					);
				} catch (error) {
					if (error instanceof Error) {
						return c.json({ success: false, error: error.message }, 400);
					}
					throw error;
				}
			}

			// Get the updated user data
			const updatedUserData = await getUserDataWithRoles(userId);
			if (!updatedUserData) {
				return c.json(
					{ success: false, error: `User with ID ${userId} not found.` },
					404,
				);
			}

			return c.json({ success: true, data: updatedUserData }, 200);
		} catch (error) {
			console.error("Error in UserController.updateUser:", error);
			return c.json({ success: false, error: "Internal Server Error" }, 500);
		}
	}

	/**
	 * Handles the request to get user data and roles by ID.
	 * Expects the user ID as a route parameter.
	 *
	 * @param c The Hono Context object.
	 * @returns A Hono Response object with the user data and roles or an error.
	 */
	async getUserWithRoles(c: Context) {
		try {
			// Get the user ID from the route parameters
			const userId = Number.parseInt(c.req.param("id"));

			// Validate the user ID
			if (Number.isNaN(userId)) {
				return c.json({ success: false, error: "Invalid user ID" }, 400);
			}

			// Call the service function to get user data with roles
			const userWithRoles = await getUserDataWithRoles(userId);

			if (userWithRoles) {
				// Return the user data with roles
				return c.json({ success: true, data: userWithRoles }, 200);
			}

			// Handle case where user was not found
			return c.json(
				{ success: false, error: `User with ID ${userId} not found.` },
				404,
			); // 404 Not Found
		} catch (error) {
			console.error("Error in UserController.getUserWithRoles:", error);
			return c.json({ success: false, error: "Internal Server Error" }, 500);
		}
	}
	async getAllUsers(c: Context) {
		try {
			const userData = await getAllUsers();
			const parsedData: UserResponseDataSchema[] = userData.map((user) => ({
				userId: user.users.id,
				username: user.users.username,
				organizationId: user.user_organization_roles.organization_id,
				organizationName: user.organizations.name,
				roleId: user.roles.id,
				roleName: user.roles.name,
				email: user.users.email,
				isActive: user.users.is_active,
			}));

			return c.json({ success: true, data: parsedData }, 200);
		} catch (error) {
			console.error("Error in UserController.getAllUsers:", error);
			return c.json({ success: false, error: "Internal Server Error" }, 500);
		}
	}
	async changeUserActivation(c: Context) {
		try {
			const body = await c.req.json<ChangeUserActivationRequestSchema>();
			const { userId, is_active } = body;

			const [userData] = await changeUserActivation(userId, is_active);

			return c.json(userData, 200);
		} catch (error) {
			console.error("Error in UserController.getAllUsers:", error);
			return c.json({ success: false, error: "Internal Server Error" }, 500);
		}
	}
	async addUserRole(c: Context) {
		try {
			const body = await c.req.json<{
				userId: number;
				roleName: string;
				organizationName: string;
			}>();
			const { userId, roleName, organizationName } = body;

			// Validate the user ID
			if (Number.isNaN(userId)) {
				return c.json({ success: false, error: "Invalid user ID" }, 400);
			}

			await addUserRole(userId, roleName, organizationName);

			return c.json(
				{
					success: true,
					message: `Role ${roleName} added successfully for user ${userId} in organization ${organizationName}`,
				},
				200,
			);
		} catch (error) {
			console.error("Error in UserController.addUserRole:", error);
			if (error instanceof Error) {
				return c.json({ success: false, error: error.message }, 400);
			}
			return c.json({ success: false, error: "Internal Server Error" }, 500);
		}
	}
}
