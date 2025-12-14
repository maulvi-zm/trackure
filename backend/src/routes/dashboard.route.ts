import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { DashboardController } from "@/controllers/dashboard.controller";
import {
	AdminDashboardResponseSchema,
	BadRequestResponseSchema,
	UnauthorizedResponseSchema,
	InternalErrorResponseSchema,
} from "@/types/dashboard_admin.types";
import { createAuthzMiddleware } from "@/middlewares/authz.middleware";
import { Role } from "@/types/authz.types";
import { KaprodiDashboardResponseSchema } from "@/types/dashboard_kaprodi.types";

const dashboard_route = new OpenAPIHono();
const dashboard_controller = new DashboardController();

// route for getting program studi summaries
dashboard_route.openapi(
	createRoute({
		method: "get",
		path: "/admin",
		middleware: createAuthzMiddleware([Role.ADMIN, Role.DEVELOPER]),
		operationId: "getProgramStudiSummaries",
		tags: ["dashboard"],
		description: "Get program studi summaries for admin dashboard",
		responses: {
			200: {
				description: "Success - Returns program studi summary data",
				content: {
					"application/json": {
						schema: AdminDashboardResponseSchema,
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
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			403: {
				description: "Forbidden - User is not an admin",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
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
	dashboard_controller.getProgramStudiSummaries.bind(dashboard_controller),
);

dashboard_route.openapi(
	createRoute({
		method: "get",
		path: "/pemohon",
		operationId: "getKaprodiDashboard",
		middleware: createAuthzMiddleware([Role.REQUESTER, Role.DEVELOPER]),
		tags: ["dashboard"],
		description: "Get Kaprodi dashboard data",
		responses: {
			200: {
				description: "Success - Returns Kaprodi dashboard data",
				content: {
					"application/json": {
						schema: KaprodiDashboardResponseSchema,
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
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			403: {
				description: "Unauthorized - User is not authorized as Kaprodi",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			404: {
				description:
					"Not Found - User not assigned to any organization as Kaprodi",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
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
	dashboard_controller.getKaprodiDashboard.bind(dashboard_controller),
);

export default dashboard_route;
