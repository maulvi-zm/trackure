import { z } from "@hono/zod-openapi";

export const UserActivity = z.object({
	id: z.number(),
	userId: z.number(),
	email: z.string(),
	role: z.string(),
	organization: z.string(),
	activity: z.string().nullable(),
	timestamp: z.date(),
});

export type UserActivitySchema = z.infer<typeof UserActivity>;
