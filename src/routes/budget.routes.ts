import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { BudgetController } from "@/controllers/budget.controller";
import { createAuthzMiddleware } from "@/middlewares/authz.middleware";
import { Role } from "@/types/authz.types";
import { z } from "zod";
import {
	BadRequestResponseSchema,
	InternalErrorResponseSchema,
	NotFoundResponseSchema,
} from "@/types/api.types";

const budget_route = new OpenAPIHono();
const budget_controller = new BudgetController();

// Update budget route
budget_route.openapi(
	createRoute({
		method: "put",
		path: "/organization/:organizationId",
		middleware: createAuthzMiddleware([Role.ADMIN, Role.DEVELOPER]),
		operationId: "updateOrganizationBudget",
		tags: ["budgets"],
		description: "Update organization's budget for a specific year",
		request: {
			params: z.object({
				organizationId: z.string().transform(Number),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							totalBudget: z.number().positive(),
							year: z.number().int().min(2000),
						}),
					},
				},
			},
		},
		responses: {
			200: {
				description: "Budget updated successfully",
				content: {
					"application/json": {
						schema: z.object({
							success: z.literal(true),
							data: z.object({
								id: z.number(),
								organization_id: z.number().nullable(),
								total_budget: z.string(),
								remaining_budget: z.string(),
								year: z.number(),
								created_at: z.date(),
								updated_at: z.date(),
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
			404: {
				description: "Not Found - Budget not found",
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
	budget_controller.updateOrganizationBudget.bind(budget_controller),
);

export default budget_route;
