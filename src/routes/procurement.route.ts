import { ProcurementController } from "@/controllers/procurement.controller";
import { createAuthzMiddleware } from "@/middlewares/authz.middleware";
import { InternalErrorResponseSchema } from "@/types/api.types";
import { Role } from "@/types/authz.types";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import {
	ProcurementListResponseSchema,
	BadRequestResponseSchema,
	UnauthorizedResponseSchema,
} from "@/types/dashboard_admin.types";

const procurement_route = new OpenAPIHono();
const procurement_controller = new ProcurementController();

procurement_route.openapi(
	createRoute({
		method: "post",
		path: "/",
		operationId: "createProcurement",
		tags: ["Procurement"],
		description: "Create a new procurement",
		middleware: createAuthzMiddleware([Role.REQUESTER]),
		parameters: [
			{
				name: "item_exists",
				in: "query",
				required: false,
				schema: {
					type: "boolean",
					default: false,
				},
				description:
					"If true, use item_id format. If false, use reference and estimated_price format.",
			},
		],
		request: {
			body: {
				content: {
					"application/json": {
						schema: z.union([
							z.object({
								quantity: z.number(),
								reference: z.string(),
								estimated_price: z.string(),
							}),
							z.object({
								item_id: z.string(),
								quantity: z.number(),
							}),
						]),
					},
				},
				required: true,
				description: "Procurement details",
			},
		},
		responses: {
			200: {
				description: "Success - Procurement created",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							data: z.object({
								id: z.number(),
								quantity: z.number().nullable(),
								organization: z.number().nullable(),
								reference: z.string().nullable(),
								estimated_price: z.string().nullable(),
								status: z.string().nullable(),
								created_at: z.string().nullable(),
								updated_at: z.string().nullable(),
							}),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Missing fields",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.createProcurement.bind(procurement_controller),
);

// Get procurement by ID
procurement_route.openapi(
	createRoute({
		method: "get",
		path: "/:procurementId",
		operationId: "getProcurement",
		tags: ["Procurement"],
		description: "Get procurement details by ID",
		middleware: createAuthzMiddleware([Role.REQUESTER, Role.ADMIN]),
		request: {
			params: z.object({
				procurementId: z.string().describe("Procurement ID"),
			}),
		},
		responses: {
			200: {
				description: "Success - Procurement found",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							data: z.object({
								id: z.number(),
								quantity: z.number().nullable(),
								organization: z.number().nullable(),
								reference: z.string().nullable(),
								estimated_price: z.string().nullable(),
							}),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid ID",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
						}),
					},
				},
			},
			404: {
				description: "Not Found - Procurement not found",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.getProcurement.bind(procurement_controller),
);

procurement_route.openapi(
	createRoute({
		method: "post",
		path: "/:procurementId/addItem",
		operationId: "addItemToProcurement",
		tags: ["Procurement"],
		description: "Create an item and add it to a procurement",
		middleware: createAuthzMiddleware([Role.ADMIN]),
		request: {
			params: z.object({
				procurementId: z.string().describe("Procurement ID"),
			}),
		},
		responses: {
			200: {
				description: "Success - Item added to procurement",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid ID",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.addItemToProcurement.bind(procurement_controller),
);

procurement_route.openapi(
	createRoute({
		method: "patch",
		path: "/:procurementId/confirmPriceMatch",
		operationId: "confirmPriceMatch",
		tags: ["Procurement"],
		description: "Confirm price match for a procurement",
		middleware: createAuthzMiddleware([Role.ADMIN]),
		request: {
			params: z.object({
				procurementId: z.string().describe("Procurement ID"),
			}),
		},
		responses: {
			200: {
				description: "Success - Price match confirmed",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid ID",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.confirmPriceMatch.bind(procurement_controller),
);

// Approve procurement
procurement_route.openapi(
	createRoute({
		method: "patch",
		path: "/:procurementId/approve",
		operationId: "approveProcurement",
		tags: ["Procurement"],
		description: "Approve a procurement request",
		middleware: createAuthzMiddleware([Role.ADMIN]),
		request: {
			params: z.object({
				procurementId: z.string().describe("Procurement ID"),
			}),
		},
		responses: {
			200: {
				description: "Success - Procurement approved",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid ID",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.approveProcurement.bind(procurement_controller),
);

// Reject procurement
procurement_route.openapi(
	createRoute({
		method: "patch",
		path: "/:procurementId/reject",
		operationId: "rejectProcurement",
		tags: ["Procurement"],
		description: "Reject a procurement request",
		middleware: createAuthzMiddleware([Role.ADMIN]),
		request: {
			params: z.object({
				procurementId: z.string().describe("Procurement ID"),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							notes: z.string().describe("Rejection reason"),
						}),
					},
				},
				required: true,
				description: "Rejection details",
			},
		},
		responses: {
			200: {
				description: "Success - Procurement rejected",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid ID or missing reason",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.rejectProcurement.bind(procurement_controller),
);

// Create purchase order
procurement_route.openapi(
	createRoute({
		method: "patch",
		path: "/:procurementId/createPO",
		operationId: "createPurchaseOrder",
		tags: ["Procurement"],
		description: "Create a purchase order for a procurement",
		middleware: createAuthzMiddleware([Role.ADMIN]),
		request: {
			params: z.object({
				procurementId: z.string().describe("Procurement ID"),
			}),
			body: {
				content: {
					"multipart/form-data": {
						schema: z.object({
							po_document: z.any(),
							po_date: z.string().describe("Purchase Order date"),
						}),
					},
				},
				required: true,
				description: "Purchase Order details",
			},
		},
		responses: {
			200: {
				description: "Success - Purchase Order created",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid ID or missing required fields",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.createPurchaseOrder.bind(procurement_controller),
);

procurement_route.openapi(
	createRoute({
		method: "patch",
		path: "/:procurementId/estimatePO",
		operationId: "estimatePurchaseOrder",
		tags: ["Procurement"],
		description: "Estimate a purchase order for a procurement",
		middleware: createAuthzMiddleware([Role.ADMIN]),
		request: {
			params: z.object({
				procurementId: z.string().describe("Procurement ID"),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							time_estimation: z
								.string()
								.describe("Estimated Purchase Order number"),
						}),
					},
				},
				required: true,
				description: "Purchase Order details",
			},
		},
		responses: {
			200: {
				description: "Success - Purchase Order estimated",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid ID or missing required fields",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.estimatePO.bind(procurement_controller),
);

// Record vendor delivery
procurement_route.openapi(
	createRoute({
		method: "patch",
		path: "/:procurementId/recordDelivery",
		operationId: "recordVendorDelivery",
		tags: ["Procurement"],
		description: "Record vendor delivery for a procurement",
		middleware: createAuthzMiddleware([Role.ADMIN]),
		request: {
			params: z.object({
				procurementId: z.string().describe("Procurement ID"),
			}),
			body: {
				content: {
					"multipart/form-data": {
						schema: z.object({
							bast_document: z
								.instanceof(File)
								.optional()
								.describe("BAST document file"),
						}),
					},
				},
				required: true,
				description: "Delivery details",
			},
		},
		responses: {
			200: {
				description: "Success - Vendor delivery recorded",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid ID or missing required fields",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.recordVendorDelivery.bind(procurement_controller),
);

// Complete procurement
procurement_route.openapi(
	createRoute({
		method: "patch",
		path: "/:procurementId/complete",
		operationId: "completeProcurement",
		tags: ["Procurement"],
		description: "Complete a procurement process",
		middleware: createAuthzMiddleware([Role.ADMIN]),
		request: {
			params: z.object({
				procurementId: z.string().describe("Procurement ID"),
			}),
			body: {
				content: {
					"application/json": {
						schema: z.object({
							final_note: z.string().describe("Final note for completion"),
						}),
					},
				},
				required: true,
				description: "Completion details",
			},
		},
		responses: {
			200: {
				description: "Success - Procurement completed",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid ID or missing required fields",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.completeProcurement.bind(procurement_controller),
);

// General update procurement
procurement_route.openapi(
	createRoute({
		method: "put",
		path: "/:procurementId",
		operationId: "updateProcurement",
		tags: ["Procurement"],
		description: "Update a procurement",
		middleware: createAuthzMiddleware([Role.ADMIN]),
		request: {
			params: z.object({
				procurementId: z.string().describe("Procurement ID"),
			}),
			body: {
				content: {
					"application/json": {
						schema: z
							.object({
								quantity: z.number().optional(),
								organization: z.number().optional(),
								reference: z.string().optional(),
								estimated_price: z.string().optional(),
								status: z.string().optional(),
								notes: z.string().optional(),
								// Allow updating any field that's not handled by specific endpoints
							})
							.passthrough(),
					},
				},
				required: true,
				description: "Fields to update",
			},
		},
		responses: {
			200: {
				description: "Success - Procurement updated",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request - Invalid ID",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
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
	procurement_controller.updateProcurement.bind(procurement_controller),
);

// route for getting procurement list (moved from dashboard_admin.route.ts)
procurement_route.openapi(
	createRoute({
		method: "get",
		path: "/organization/:organizationId",
		middleware: createAuthzMiddleware([Role.ADMIN, Role.DEVELOPER]),
		operationId: "getAdminProcurementList",
		tags: ["Procurement"],
		description:
			"Get list of procurements for admin dashboard filtered by organization and current year",
		request: {
			params: z.object({
				organizationId: z.string().transform(Number),
			}),
		},
		responses: {
			200: {
				description: "Success - Returns procurement list data",
				content: {
					"application/json": {
						schema: ProcurementListResponseSchema,
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
	procurement_controller.getProcurementList.bind(procurement_controller),
);

export { procurement_route };
