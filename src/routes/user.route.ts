import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { UserController } from "@/controllers/user.controller";
import {
	CreateUserRequest,
	DeleteResponse,
	UpdateUserRequest,
	UsersResponse,
	DeleteUserRequest,
	UpdateUserResponseData,
	CreateUserResponseData,
} from "@/types/user.types";
import {
	BadRequestResponseSchema,
	InternalErrorResponseSchema,
	NotFoundResponseSchema,
} from "@/types/api.types";
import { createAuthzMiddleware } from "@/middlewares/authz.middleware";
import { Role } from "@/types/authz.types";

const user_route = new OpenAPIHono();
const user_controller = new UserController();

user_route.openapi(
	createRoute({
		method: "post",
		path: "/",
		middleware: createAuthzMiddleware([Role.SUPER_ADMIN, Role.DEVELOPER]),
		operationId: "createUser",
		tags: ["users"],
		description: "Create a new user and assign a role in an organization",
		request: {
			body: {
				content: {
					"application/json": {
						schema: CreateUserRequest,
					},
				},
				required: true,
				description: "User details, organization ID, and role ID",
			},
		},
		responses: {
			201: {
				description: "Success - User created",
				content: {
					"application/json": {
						schema: CreateUserResponseData, // Returns the created User object
					},
				},
			},
			400: {
				description: "Bad Request - Missing fields or email already in use",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema, // Can be used for missing fields
					},
				},
			},
			500: {
				description: "Internal Server Error",
				content: {
					"application/json": {
						schema: InternalErrorResponseSchema,
					},
				},
			},
		},
	}),
	user_controller.createUser.bind(user_controller),
);

// Route to delete a user by ID
user_route.openapi(
	createRoute({
		method: "delete",
		path: "/",
		middleware: createAuthzMiddleware([Role.SUPER_ADMIN, Role.DEVELOPER]),
		operationId: "deleteUser",
		tags: ["users"],
		description: "Delete a user by ID",
		request: {
			body: {
				content: {
					"application/json": {
						schema: DeleteUserRequest,
					},
				},
				required: true,
			},
		},
		responses: {
			200: {
				description: "Success - User deleted",
				content: {
					"application/json": {
						schema: DeleteResponse,
					},
				},
			},
			400: {
				description: "Bad Request - Invalid user ID",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema,
					},
				},
			},
			404: {
				description: "Not Found - User not found",
				content: {
					"application/json": {
						schema: NotFoundResponseSchema, // Reusing NotFoundSchema
					},
				},
			},
			500: {
				description: "Internal Server Error",
				content: {
					"application/json": {
						schema: InternalErrorResponseSchema,
					},
				},
			},
		},
	}),
	user_controller.deleteUser.bind(user_controller),
);

// Route to update user details by ID
user_route.openapi(
	createRoute({
		method: "patch",
		path: "/",
		operationId: "updateUser",
		tags: ["users"],
		description: "Update user details by ID",
		request: {
			body: {
				content: {
					"application/json": {
						schema: UpdateUserRequest,
					},
				},
				required: true,
				description: "User details to update",
			},
		},
		responses: {
			200: {
				description: "Success - User updated",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							data: UpdateUserResponseData,
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid user ID or no update data",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema,
					},
				},
			},
			404: {
				description: "Not Found - User not found",
				content: {
					"application/json": {
						schema: NotFoundResponseSchema,
					},
				},
			},
			500: {
				description: "Internal Server Error",
				content: {
					"application/json": {
						schema: InternalErrorResponseSchema,
					},
				},
			},
		},
	}),
	user_controller.updateUser.bind(user_controller),
);

// Route to get user data and roles by ID
user_route.openapi(
	createRoute({
		method: "get",
		path: "/",
		operationId: "get All User",
		tags: ["users"],
		middleware: createAuthzMiddleware([Role.SUPER_ADMIN, Role.DEVELOPER]),
		description: "Get user data and roles by ID",
		responses: {
			200: {
				description: "Success - User data with roles",
				content: {
					"application/json": {
						schema: UsersResponse, // Returns the User object with roles
					},
				},
			},
			400: {
				description: "Bad Request - Invalid user ID",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema,
					},
				},
			},
			404: {
				description: "Not Found - User not found",
				content: {
					"application/json": {
						schema: NotFoundResponseSchema,
					},
				},
			},
			500: {
				description: "Internal Server Error",
				content: {
					"application/json": {
						schema: InternalErrorResponseSchema,
					},
				},
			},
		},
	}),
	user_controller.getAllUsers.bind(user_controller), // Bind the controller method
);

// Route to get user data and roles by ID
user_route.openapi(
	createRoute({
		method: "post",
		path: "/active",
		operationId: "Change user activation",
		tags: ["users"],
		middleware: createAuthzMiddleware([Role.SUPER_ADMIN, Role.DEVELOPER]),
		description: "Get user data and roles by ID",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							userId: z.number(),
							is_active: z.boolean(),
						}),
					},
				},
				required: true,
				description: "User details to update",
			},
		},
		responses: {
			200: {
				description: "Success - User data with roles",
				content: {
					"application/json": {
						schema: CreateUserResponseData,
					},
				},
			},
			400: {
				description: "Bad Request - Invalid user ID",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema,
					},
				},
			},
			404: {
				description: "Not Found - User not found",
				content: {
					"application/json": {
						schema: NotFoundResponseSchema,
					},
				},
			},
			500: {
				description: "Internal Server Error",
				content: {
					"application/json": {
						schema: InternalErrorResponseSchema,
					},
				},
			},
		},
	}),
	user_controller.changeUserActivation.bind(user_controller), // Bind the controller method
);

// Route to add a role for a user
user_route.openapi(
	createRoute({
		method: "post",
		path: "/role",
		operationId: "addUserRole",
		tags: ["users"],
		middleware: createAuthzMiddleware([Role.SUPER_ADMIN, Role.DEVELOPER]),
		description: "Add a new role for a user in an organization",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							userId: z.number(),
							roleName: z.string(),
							organizationName: z.string(),
						}),
					},
				},
				required: true,
				description: "User ID, role name, and organization ID",
			},
		},
		responses: {
			200: {
				description: "Success - Role added",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							message: z.string(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid input or role already exists",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema,
					},
				},
			},
			500: {
				description: "Internal Server Error",
				content: {
					"application/json": {
						schema: InternalErrorResponseSchema,
					},
				},
			},
		},
	}),
	user_controller.addUserRole.bind(user_controller),
);

export default user_route; // Export the route instance
