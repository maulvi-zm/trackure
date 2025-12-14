import { UserActivityController } from "@/controllers/user_activity.controller";
import { InternalErrorResponseSchema } from "@/types/api.types";
import { UserActivity } from "@/types/user_activity.types";
import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";

const user_activity_route = new OpenAPIHono();
const user_activity_controller = new UserActivityController();

user_activity_route.openapi(
	createRoute({
		method: "get",
		path: "/",
		operationId: "userActivity",
		tags: ["User Activity Logs"],
		description: "Get all user activities logs",
		responses: {
			200: {
				description: "Success - User created",
				content: {
					"application/json": {
						schema: z.array(UserActivity), // Returns the created User object
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
	user_activity_controller.getUsersActivities.bind(user_activity_controller),
);

export { user_activity_route };
