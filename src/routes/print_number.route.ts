import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { PrintNumberController } from "@/controllers/print_number.controller";
import {
	UserPrintNumberResponseSchema,
	BadRequestResponseSchema,
	UnauthorizedResponseSchema,
	InternalErrorResponseSchema,
	ListBarangResponseSchema,
	PhotoUploadResponseSchema,
	PhotoDeleteResponseSchema,
	PrintNumberIdsResponseSchema,
	AssociateProcurementsResponseSchema,
	AssociateProcurementsRequestSchema,
} from "../types/print_number.types";
import { createAuthzMiddleware } from "@/middlewares/authz.middleware";
import { Role } from "@/types/authz.types";
import { NotFoundResponseSchema } from "@/types/dashboard_admin.types";

const print_number_route = new OpenAPIHono();
const printNumberController = new PrintNumberController();

print_number_route.openapi(
	createRoute({
		method: "get",
		path: "/",
		middleware: createAuthzMiddleware([Role.DEVELOPER, Role.USER_PRINT_NUMBER]),
		operationId: "getPrintNumbersForUser",
		tags: ["Print Number"],
		description: "Get Print Number entries for the current user",
		responses: {
			200: {
				description: "Success - Returns Print Number data for the user",
				content: {
					"application/json": {
						schema: UserPrintNumberResponseSchema,
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
				description: "Unauthorized - Invalid token or credentials",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			403: {
				description: "Unauthorized - User is not authorized",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			404: {
				description: "Not Found - No data found for the user",
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
	printNumberController.getPrintNumbersForUser.bind(printNumberController),
);

print_number_route.openapi(
	createRoute({
		method: "get",
		path: "/:printNumberId/items",
		middleware: createAuthzMiddleware([Role.DEVELOPER, Role.USER_PRINT_NUMBER]),
		operationId: "getItemsForPrintNumber",
		tags: ["Print Number"],
		description: "Get list of items for a specific print number",
		request: {
			params: z.object({
				printNumberId: z.string().openapi({
					example: "1",
					description: "The ID of the print number",
				}),
			}),
		},
		responses: {
			200: {
				description: "Success - Returns list of items",
				content: {
					"application/json": {
						schema: ListBarangResponseSchema,
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
				description: "Unauthorized - Invalid token or credentials",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			403: {
				description: "Unauthorized - User is not authorized",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			404: {
				description: "Not Found - No data found for the provided print number",
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
	printNumberController.getItemsForPrintNumber.bind(printNumberController),
);

print_number_route.openapi(
	createRoute({
		method: "get",
		path: "/ids",
		middleware: createAuthzMiddleware([Role.DEVELOPER, Role.USER_PRINT_NUMBER]),
		operationId: "getAllPrintNumberIds",
		tags: ["Print Number"],
		description: "Get all existing print number IDs",
		responses: {
			200: {
				description: "Success - Returns array of print number IDs",
				content: {
					"application/json": {
						schema: PrintNumberIdsResponseSchema,
					},
				},
			},
			401: {
				description: "Unauthorized - Invalid token or credentials",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			403: {
				description: "Forbidden - User is not authorized",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			404: {
				description: "Not Found - No print numbers found",
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
	printNumberController.getAllPrintNumberIds.bind(printNumberController),
);

print_number_route.openapi(
	createRoute({
		method: "post",
		path: "/:printNumberId/photo",
		middleware: createAuthzMiddleware([Role.DEVELOPER, Role.USER_PRINT_NUMBER]),
		operationId: "uploadPhotoForPrintNumber",
		tags: ["Print Number"],
		description: "Upload photo for a specific print number",
		request: {
			params: z.object({
				printNumberId: z.string().openapi({
					example: "1",
					description: "The ID of the print number",
				}),
			}),
			body: {
				content: {
					"multipart/form-data": {
						schema: z.object({
							photo: z.any(),
						}),
					},
				},
			},
		},
		responses: {
			200: {
				description: "Success - Photo uploaded successfully",
				content: {
					"application/json": {
						schema: PhotoUploadResponseSchema,
					},
				},
			},
			400: {
				description: "Bad Request - No file uploaded",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema,
					},
				},
			},
			401: {
				description: "Unauthorized - Invalid token or credentials",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			403: {
				description: "Unauthorized - User is not authorized",
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
	printNumberController.uploadPhotoForPrintNumber.bind(printNumberController),
);

print_number_route.openapi(
	createRoute({
		method: "post",
		path: "/associate-procurements",
		middleware: createAuthzMiddleware([Role.DEVELOPER, Role.USER_PRINT_NUMBER]),
		operationId: "associateProcurementsWithPrintNumber",
		tags: ["Print Number"],
		description: "Associate multiple procurements with a print number",
		request: {
			body: {
				content: {
					"application/json": {
						schema: AssociateProcurementsRequestSchema,
					},
				},
			},
		},
		responses: {
			200: {
				description:
					"Success - Procurements successfully associated with print number",
				content: {
					"application/json": {
						schema: AssociateProcurementsResponseSchema,
					},
				},
			},
			400: {
				description: "Bad Request - Invalid input data",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema,
					},
				},
			},
			401: {
				description: "Unauthorized - Invalid token or credentials",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			403: {
				description: "Forbidden - User is not authorized",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			404: {
				description: "Not Found - Print number ID not found",
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
	printNumberController.associateProcurementsWithPrintNumber.bind(
		printNumberController,
	),
);

print_number_route.openapi(
	createRoute({
		method: "delete",
		path: "/:printNumberId/photo",
		middleware: createAuthzMiddleware([Role.DEVELOPER, Role.USER_PRINT_NUMBER]),
		operationId: "deletePhotoForPrintNumber",
		tags: ["Print Number"],
		description: "Delete photo for a specific print number",
		request: {
			params: z.object({
				printNumberId: z.string().openapi({
					example: "1",
					description: "The ID of the print number",
				}),
			}),
		},
		responses: {
			200: {
				description: "Success - Photo deleted successfully",
				content: {
					"application/json": {
						schema: PhotoDeleteResponseSchema,
					},
				},
			},
			401: {
				description: "Unauthorized - Invalid token or credentials",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			403: {
				description: "Unauthorized - User is not authorized",
				content: {
					"application/json": {
						schema: UnauthorizedResponseSchema,
					},
				},
			},
			404: {
				description: "Not Found - No data found for the provided print number",
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
	printNumberController.deletePhotoForPrintNumber.bind(printNumberController),
);

export default print_number_route;

