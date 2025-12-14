import { OrganizationController } from "@/controllers/organization.controller";
import { createAuthzMiddleware } from "@/middlewares/authz.middleware";
import {
	BadRequestResponseSchema,
	InternalErrorResponseSchema,
} from "@/types/api.types";
import { Role } from "@/types/authz.types";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const organization_route = new OpenAPIHono();
const organization_controller = new OrganizationController();

organization_route.openapi(
	createRoute({
		method: "post",
		path: "/change/:organizationId",
		operationId: "changeOrganization",
		tags: ["Organizations"],
		description: "Get all user active roles",
		request: {
			params: z.object({
				organizationId: z.string(),
			}),
		},
		responses: {
			200: {
				description: "Success - User created",
				content: {
					"application/json": {
						schema: z.boolean(), // Returns the created User object
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
	organization_controller.changeOrganization.bind(organization_controller),
);

organization_route.openapi(
	createRoute({
		method: "get",
		path: "/user",
		operationId: "getOrganizations",
		tags: ["Organizations"],
		description: "Get all user organizations",
		responses: {
			200: {
				description: "Success - User created",
				content: {
					"application/json": {
						schema: z.array(
							z.object({
								organizationId: z.number(),
								organizationName: z.string(),
							}),
						), // Returns the created User object
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
	organization_controller.getAllUserOrganization.bind(organization_controller),
);

organization_route.openapi(
	createRoute({
		method: "get",
		path: "/",
		operationId: "getOrganizations",
		tags: ["Organizations"],
		description: "Get all organizations",
		responses: {
			200: {
				description: "Success - User created",
				content: {
					"application/json": {
						schema: z.array(
							z.object({
								id: z.number(),
								name: z.string(),
								code: z.string().nullable(),
							}),
						), // Returns the created User object
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
	organization_controller.getAllOrganization.bind(organization_controller),
);

organization_route.openapi(
	createRoute({
		method: "get",
		path: "/active",
		operationId: "getOrganizations",
		tags: ["Organizations"],
		description: "Get all user organizations",
		responses: {
			200: {
				description: "Success - User created",
				content: {
					"application/json": {
						schema: z.object({
							organizationId: z.number(),
							organizationName: z.string(),
						}),
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
	organization_controller.getActiveOrganization.bind(organization_controller),
);

organization_route.openapi(
	createRoute({
		method: "put",
		path: "/:organizationId",
		operationId: "updateOrganizations",
		tags: ["Organizations"],
		description: "Update organization",
		responses: {
			200: {
				description: "Success - Organization Updated",
				content: {
					"application/json": {
						schema: z.object({
							organizationId: z.number(),
							newName: z.string(),
						}),
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
	organization_controller.updateOrganizationHandler.bind(
		organization_controller,
	),
);

organization_route.openapi(
	createRoute({
		method: "delete",
		path: "/:organizationId",
		operationId: "deleteOrganizations",
		tags: ["Organizations"],
		description: "Delete organization",
		responses: {
			200: {
				description: "Success - Organization Deleted",
				content: {
					"application/json": {
						schema: z.object({
							organizationId: z.number(),
						}),
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
	organization_controller.deleteOrganizationHandler.bind(
		organization_controller,
	),
);

organization_route.openapi(
	createRoute({
		method: "post",
		path: "/:organizationId/budget",
		operationId: "addOrganizationBudget",
		tags: ["Organizations", "Budgets"],
		description: "Add a budget for an organization",
		responses: {
			201: {
				description: "Success - Budget Created",
				content: {
					"application/json": {
						schema: z.object({
							budgetId: z.number(),
							organizationId: z.number(),
							totalBudget: z.string(),
							remainingBudget: z.string(),
							year: z.number(),
						}),
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
	organization_controller.addBudgetForOrganization.bind(
		organization_controller,
	),
);

organization_route.openapi(
	createRoute({
		method: "post",
		path: "/",
		middleware: createAuthzMiddleware([Role.ADMIN, Role.DEVELOPER]),
		operationId: "createOrganization",
		tags: ["organizations"],
		description: "Create a new organization",
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.object({
							name: z.string().min(1),
						}),
					},
				},
			},
		},
		responses: {
			201: {
				description: "Organization created successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: z.literal(true),
							data: z.object({
								id: z.number(),
								name: z.string(),
							}),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Missing or invalid parameters",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema,
					},
				},
			},
			401: {
				description: "Unauthorized - Invalid authentication",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema,
					},
				},
			},
			403: {
				description: "Forbidden - User is not authorized",
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
	organization_controller.createOrganization.bind(organization_controller),
);
export { organization_route };
