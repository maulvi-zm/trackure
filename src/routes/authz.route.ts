import { AuthorizationController } from "@/controllers/authz.controller";
import { InternalErrorResponseSchema } from "@/types/api.types";
import { UserRoles } from "@/types/authz.types";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const authorization_route = new OpenAPIHono();
const authorization_controller = new AuthorizationController();

authorization_route.openapi(
	createRoute({
		method: "get",
		path: "/role",
		operationId: "getRoles",
		tags: ["Authorization"],
		description: "Get all user active roles",
		responses: {
			200: {
				description: "Success - User created",
				content: {
					"application/json": {
						schema: z.array(UserRoles), // Returns the created User object
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
	authorization_controller.getUserRoles.bind(authorization_controller),
);

export { authorization_route };
