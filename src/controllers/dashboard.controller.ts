import type { Context } from "hono";
import {
	getOrganizationById,
	getBudgetSummary,
	getProcurementSummary,
	getRecentProcurementItems,
	getProgramStudiSummaries,
} from "@/services/organization.service";
import { getCurrentActiveOrganization } from "@/services/active_organization.service";
import type { KaprodiDashboardResponse } from "@/types/dashboard_kaprodi.types";

export class DashboardController {
	async getProgramStudiSummaries(c: Context) {
		try {
			const summaries = await getProgramStudiSummaries();

			return c.json(
				{
					success: true,
					programStudiList: summaries,
				},
				200,
			);
		} catch (error) {
			console.error("Error fetching program studi summaries:", error);
			return c.json(
				{
					success: false,
					error: "Internal Server Error",
					message: error instanceof Error ? error.message : "Unknown error",
				},
				500,
			);
		}
	}
	async getKaprodiDashboard(c: Context) {
		try {
			const userId = c.get("user").id;

			const organizationId = (await getCurrentActiveOrganization(userId))
				.organizationId;

			const organization = await getOrganizationById(organizationId);

			const organizationName = organization.name;

			const budgetData = await getBudgetSummary(organizationId);

			const procurementSummary = await getProcurementSummary(organizationId);

			const recentItems = await getRecentProcurementItems(organizationId);

			const response: KaprodiDashboardResponse = {
				success: true,
				organizationName,
				budget: budgetData,
				procurements: procurementSummary,
				recentItems,
			};

			return c.json(response, 200);
		} catch (error) {
			console.error("Error fetching Kaprodi dashboard data:", error);
			return c.json({ success: false, error: "Internal Server Error" }, 500);
		}
	}
}
