import { db } from "@/db/db";
import { activeOrganization } from "@/models/active_organization.model";
import { organizations } from "@/models/organization.model";
import { userOrganizationRoles } from "@/models/user.model";
import { eq } from "drizzle-orm";

export async function changeOrganization(
	userId: number,
	organizationId: number,
) {
	await db
		.update(activeOrganization)
		.set({ organization_id: organizationId })
		.where(eq(activeOrganization.user_id, userId));

	return true;
}

export async function getCurrentActiveOrganization(user_id: number) {
	const [result] = await db
		.select({
			organizationId: activeOrganization.organization_id,
			organizationName: organizations.name,
		})
		.from(activeOrganization)
		.innerJoin(
			organizations,
			eq(activeOrganization.organization_id, organizations.id),
		)
		.where(eq(activeOrganization.user_id, user_id));

	return result;
}

export async function getAllUserOrganizations(userId: number) {
	return await db
		.select({
			organizationId: userOrganizationRoles.organization_id,
			organizationName: organizations.name,
		})
		.from(userOrganizationRoles)
		.innerJoin(
			organizations,
			eq(organizations.id, userOrganizationRoles.organization_id),
		)
		.where(eq(userOrganizationRoles.user_id, userId));
}
