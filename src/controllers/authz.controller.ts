import { getAllActiveRoles } from "@/services/authz.service";
import type { Context } from "hono";

export class AuthorizationController {
	async getUserRoles(c: Context) {
		try {
			const userId = c.get("user").id;
			const roles = await getAllActiveRoles(userId);

			return c.json(roles, 200);
		} catch (error) {
			console.error(error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}
}
