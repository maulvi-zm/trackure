import {
	changeOrganization,
	getCurrentActiveOrganization,
} from "@/services/active_organization.service";
import {
	getAllOrganization,
	getAllUserOrganizations,
	updateOrganization,
	deleteOrganization,
	addOrganizationBudget,
	createOrganization,
} from "@/services/organization.service";
import type { Context } from "hono";

export class OrganizationController {
	async changeOrganization(c: Context) {
		try {
			const userId = c.get("user").id;
			const orgId = Number.parseInt(c.req.param().organizationId);
			const success = await changeOrganization(userId, orgId);

			return c.json(success, 200);
		} catch (error) {
			console.error(error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}
	async getAllUserOrganization(c: Context) {
		try {
			const userId = c.get("user").id;
			const result = await getAllUserOrganizations(userId);

			return c.json(result, 200);
		} catch (error) {
			console.error(error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}
	async getActiveOrganization(c: Context) {
		try {
			const userId = c.get("user").id;
			const result = await getCurrentActiveOrganization(userId);

			return c.json(result, 200);
		} catch (error) {
			console.error(error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}
	async getAllOrganization(c: Context) {
		try {
			const result = await getAllOrganization();

			return c.json(result, 200);
		} catch (error) {
			console.error(error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}
	async updateOrganizationHandler(c: Context) {
		try {
			const organizationId = Number.parseInt(c.req.param().organizationId);
			const { name } = await c.req.json();

			const updatedOrganization = await updateOrganization(
				organizationId,
				name,
			);

			return c.json(
				{
					organizationId: updatedOrganization.id,
					newName: updatedOrganization.name,
				},
				200,
			);
		} catch (error) {
			console.error(error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	async deleteOrganizationHandler(c: Context) {
		try {
			const organizationId = Number.parseInt(c.req.param().organizationId);
			const deletedOrganization = await deleteOrganization(organizationId);

			return c.json(
				{
					organizationId: deletedOrganization.id,
				},
				200,
			);
		} catch (error) {
			console.error(error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}
	async addBudgetForOrganization(c: Context) {
		try {
			const { totalBudget, remainingBudget, year } = await c.req.json();
			const organizationId = Number.parseInt(c.req.param().organizationId);

			const newBudget = await addOrganizationBudget(
				organizationId,
				totalBudget,
				remainingBudget,
				year,
			);

			if (!newBudget.organization_id) {
				throw new Error("Failed to associate budget with organization");
			}

			return c.json(
				{
					budgetId: newBudget.id,
					organizationId: newBudget.organization_id,
					totalBudget: newBudget.total_budget,
					remainingBudget: newBudget.remaining_budget,
					year: newBudget.year,
				},
				201,
			);
		} catch (error) {
			console.error(error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}
	async createOrganization(c: Context) {
		try {
			const { name } = await c.req.json();

			if (!name) {
				return c.json(
					{
						success: false,
						error: "Organization name is required",
					},
					400,
				);
			}

			const newOrganization = await createOrganization(name);

			return c.json(
				{
					success: true,
					data: newOrganization[0],
				},
				201,
			);
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "Internal server error",
				},
				500,
			);
		}
	}
}
