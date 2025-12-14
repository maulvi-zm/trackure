import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { AuthController } from "../controllers/auth.controller";
import { z } from "@hono/zod-openapi";

const auth_route = new OpenAPIHono();
const auth_controller = new AuthController();

const getLoginUrlRoute = auth_route.openapi(
	createRoute({
		method: "get",
		path: "/login-url",
		operationId: "getLoginUrl",
		tags: ["auth"],
		responses: {
			200: {
				description: "Success",
				content: {
					"application/json": {
						schema: z.object({
							loginUrl: z.string(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request",
				content: {
					"application/json": {
						schema: {
							type: "object",
							properties: {
								message: {
									type: "string",
								},
								error: {
									type: "string",
								},
							},
						},
					},
				},
			},
			500: {
				description: "Internal Server Error",
				content: {
					"application/json": {
						schema: z.object({
							message: z.string(),
							error: z.string(),
						}),
					},
				},
			},
		},
	}),
	auth_controller.getLoginUrl,
);

const postCallbackRoute = auth_route.openapi(
	createRoute({
		method: "post",
		path: "/callback",
		operationId: "postCallback",
		tags: ["auth"],
		requestBody: {
			content: {
				"application/json": {
					schema: {
						type: "object",
						properties: {
							code: {
								type: "string",
							},
							state: {
								type: "string",
							},
						},
						required: ["code", "state"],
					},
				},
			},
		},
		responses: {
			200: {
				description: "Success",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
						}),
					},
				},
			},
			400: {
				description: "Bad Request",
				content: {
					"application/json": {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
			},
			403: {
				description: "Forbidden",
				content: {
					"application/json": {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
			},
			500: {
				description: "Internal Server Error",
				content: {
					"application/json": {
						schema: z.object({
							error: z.string(),
						}),
					},
				},
			},
		},
	}),
	auth_controller.postCallback,
);

export { getLoginUrlRoute, postCallbackRoute };
export default auth_route;
