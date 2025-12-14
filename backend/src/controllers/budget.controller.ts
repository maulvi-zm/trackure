import type { Context } from "hono";
import { updateBudget } from "../services/budget.service";

export class BudgetController {
	async updateOrganizationBudget(c: Context) {
		try {
			const organizationId = Number.parseInt(c.req.param("organizationId"));
			const { totalBudget, year } = await c.req.json();

			if (!totalBudget || !year) {
				return c.json(
					{
						success: false,
						error: "Total budget and year are required",
					},
					400,
				);
			}

			const updatedBudget = await updateBudget(
				organizationId,
				totalBudget,
				year,
			);

			return c.json(
				{
					success: true,
					data: updatedBudget,
				},
				200,
			);
		} catch (error) {
			if (error instanceof Error) {
				if (error.message === "Budget not found") {
					return c.json(
						{
							success: false,
							error: error.message,
						},
						404,
					);
				}
			}
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
