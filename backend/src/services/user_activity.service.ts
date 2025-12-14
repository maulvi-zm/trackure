import { db } from "@/db/db";
import { eq } from "drizzle-orm";
import { organizations, roles, users } from "@/models/user.model";
import { userActivityLogs } from "@/models/user_activity_log.model";

export async function createLogs(
	userId: number,
	organizationId: number,
	roleId: number,
	activity: string,
) {
	try {
		await db.insert(userActivityLogs).values({
			user_id: userId,
			organization_id: organizationId,
			role_id: roleId,
			activity: activity,
		});
	} catch (error) {
		return false;
	}

	return true;
}

export async function getuserActivityLogs() {
	return await db
		.select({
			userId: userActivityLogs.user_id,
			email: users.email,
			role: roles.name,
			organization: organizations.name,
			activity: userActivityLogs.activity,
			timestamp: userActivityLogs.timestamp,
			id: userActivityLogs.id,
		})
		.from(userActivityLogs)
		.innerJoin(users, eq(userActivityLogs.user_id, users.id))
		.innerJoin(roles, eq(roles.id, userActivityLogs.role_id))
		.innerJoin(
			organizations,
			eq(organizations.id, userActivityLogs.organization_id),
		);
}
