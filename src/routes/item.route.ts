import { ItemController } from "@/controllers/item.controller";
import { createAuthzMiddleware } from "@/middlewares/authz.middleware";
import { Role } from "@/types/authz.types";
import {
	InternalErrorResponseSchema,
	NotFoundResponseSchema,
} from "@/types/dashboard_admin.types";
import { BadRequestResponseSchema } from "@/types/dashboard_kaprodi.types";
import { CreateItem, Item, UpdateItem } from "@/types/item.type";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const item_route = new OpenAPIHono();
const item_controller = new ItemController();

item_route.openapi(
	createRoute({
		method: "post",
		path: "/",
		middleware: createAuthzMiddleware([Role.ADMIN, Role.DEVELOPER]),
		operationId: "createItem",
		tags: ["Items"],
		description: "Create a new item",
		request: {
			body: {
				content: {
					"application/json": {
						schema: CreateItem,
					},
				},
			},
		},
		responses: {
			201: {
				description: "Success - Item created",
				content: {
					"application/json": {
						schema: Item,
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
	item_controller.createItem.bind(item_controller),
);

item_route.openapi(
	createRoute({
		method: "get",
		middleware: createAuthzMiddleware([Role.ADMIN, Role.DEVELOPER]),
		path: "/:itemId",
		operationId: "getItemById",
		tags: ["Items"],
		description: "Get an item by its ID",
		request: {
			params: z.object({
				itemId: z.string().openapi({
					example: "123",
					description: "The ID of the item to retrieve",
				}),
			}),
		},
		responses: {
			200: {
				description: "Success - Item retrieved",
				content: {
					"application/json": {
						schema: Item, // Returns the Item object
					},
				},
			},
			400: {
				description: "Not Found - Item not found",
				content: {
					"application/json": {
						schema: BadRequestResponseSchema,
					},
				},
			},
			404: {
				description: "Not Found - Item not found",
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
	item_controller.getItemById.bind(item_controller),
);

item_route.openapi(
	createRoute({
		method: "get",
		middleware: createAuthzMiddleware([Role.ADMIN, Role.DEVELOPER]),
		path: "/",
		operationId: "getAllItems",
		tags: ["Items"],
		description: "Get all items",
		responses: {
			200: {
				description: "Success - List of items retrieved",
				content: {
					"application/json": {
						schema: z.array(Item),
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
	item_controller.getAllItems.bind(item_controller),
);

// Route to update an item by ID
item_route.openapi(
	createRoute({
		method: "patch",
		middleware: createAuthzMiddleware([Role.ADMIN, Role.DEVELOPER]),
		path: "/:itemId",
		operationId: "updateItem",
		tags: ["Items"],
		description: "Update an item by its ID",
		request: {
			params: z.object({
				itemId: z.string().openapi({
					example: "123",
					description: "The ID of the item to update",
				}),
			}),
			body: {
				content: {
					"application/json": {
						schema: UpdateItem,
					},
				},
			},
		},
		responses: {
			200: {
				description: "Success - Item updated",
				content: {
					"application/json": {
						schema: Item,
					},
				},
			},
			404: {
				description: "Not Found - Item not found",
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
	item_controller.updateItem.bind(item_controller),
);

item_route.openapi(
	createRoute({
		method: "delete",
		middleware: createAuthzMiddleware([Role.ADMIN, Role.DEVELOPER]),
		path: "/:itemId",
		operationId: "deleteItem",
		tags: ["Items"],
		description: "Delete an item by its ID",
		request: {
			params: z.object({
				itemId: z.string().openapi({
					example: "123",
					description: "The ID of the item to delete",
				}),
			}),
		},
		responses: {
			200: {
				description: "Success - Item deleted",
				content: {
					"application/json": {
						schema: z.object({ success: z.boolean() }),
					},
				},
			},
			404: {
				description: "Not Found - Item not found",
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
	item_controller.deleteItem.bind(item_controller),
);

export { item_route };
