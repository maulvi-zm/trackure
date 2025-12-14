import { getuserActivityLogs } from "@/services/user_activity.service";
import type { Context } from "hono";
export class UserActivityController {
	async getUsersActivities(c: Context) {
		try {
			const useracitivites = await getuserActivityLogs();
			return c.json(useracitivites, 200);
		} catch (error) {
			console.error(error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}
}
