import { db } from "../db/db";
import { budgets } from "@/models/budget.model";
import { eq, and } from "drizzle-orm";
import type { NewBudget } from "@/models/budget.model";

export async function getCurrentYearBudget(organizationId: number) {
	const currentYear = new Date().getFullYear();

	const budgetData = await db
		.select()
		.from(budgets)
		.where(
			and(
				eq(budgets.organization_id, organizationId),
				eq(budgets.year, currentYear),
			),
		)
		.limit(1);

	return budgetData[0];
}

export async function createBudget(organizationId: number): Promise<NewBudget> {
	const currentYear = new Date().getFullYear();
	const now = new Date();

	const newBudget: NewBudget = {
		organization_id: organizationId,
		total_budget: "0",
		remaining_budget: "0",
		year: currentYear,
		created_at: now,
		updated_at: now,
	};

	const [createdBudget] = await db
		.insert(budgets)
		.values(newBudget)
		.returning();

	return createdBudget;
}

export async function getOrCreateCurrentYearBudget(organizationId: number) {
	const existingBudget = await getCurrentYearBudget(organizationId);

	if (!existingBudget) {
		return await createBudget(organizationId);
	}

	return existingBudget;
}

export async function updateBudget(
	organizationId: number,
	totalBudget: number,
	year: number,
) {
	const now = new Date();

	// Get current budget first
	const currentBudget = await getCurrentYearBudget(organizationId);
	if (!currentBudget) {
		throw new Error("Budget not found");
	}

	const oldTotal = Number(currentBudget.total_budget);
	const oldRemaining = Number(currentBudget.remaining_budget);
	const newRemaining = oldRemaining + (totalBudget - oldTotal);

	const updatedBudget = await db
		.update(budgets)
		.set({
			total_budget: totalBudget.toString(),
			remaining_budget: newRemaining.toString(),
			updated_at: now,
		})
		.where(
			and(eq(budgets.organization_id, organizationId), eq(budgets.year, year)),
		)
		.returning();

	if (updatedBudget.length === 0) {
		throw new Error("Failed to update budget");
	}

	return updatedBudget[0];
}

export async function deductBudget(
	organizationId: number,
	amount: number,
	year: number,
) {
	if (amount < 0) {
		throw new Error("Amount cannot be negative");
	}
	const now = new Date();

	// Get current budget first
	const currentBudget = await getCurrentYearBudget(organizationId);
	if (!currentBudget) {
		throw new Error("Budget not found");
	}

	const oldRemaining = Number(currentBudget.remaining_budget);
	const newRemaining = oldRemaining - amount;

	if (newRemaining < 0) {
		throw new Error("Amount deducted surpass the remaining budget");
	}

	const updatedBudget = await db
		.update(budgets)
		.set({
			remaining_budget: newRemaining.toString(),
			updated_at: now,
		})
		.where(
			and(eq(budgets.organization_id, organizationId), eq(budgets.year, year)),
		)
		.returning();

	if (updatedBudget.length === 0) {
		throw new Error("Failed to update budget");
	}

	return updatedBudget[0];
}
