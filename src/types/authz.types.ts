import { z } from "@hono/zod-openapi";

export enum Role {
	SUPER_ADMIN = "SUPER_ADMIN",
	ADMIN = "ADMIN",
	REQUESTER = "REQUESTER",
	USER_PRINT_NUMBER = "USER_PRINT_NUMBER",
	DEVELOPER = "DEVELOPER",
}

export const UserRoles = z.object({
	roleId: z.number(),
	roleName: z.string(),
});

export type UserRolesSchema = z.infer<typeof UserRoles>;
