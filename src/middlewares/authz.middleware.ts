import { hasRoles } from "@/services/authz.service";
import type { Role } from "@/types/authz.types";
import type { Context, Next } from "hono";

export const createAuthzMiddleware = (allowedRoles: Role[]) => {
	return async (c: Context, next: Next) => {
		const user = c.get("user");

		if (!user || !hasRoles(allowedRoles, user.id)) {
			console.log("Authz middleware checking roles:", allowedRoles);
			return c.text("Unauthorized", 403);
		}

		await next();
	};
};
