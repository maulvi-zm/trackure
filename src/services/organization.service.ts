import { db } from "@/db/db";
import { eq, and, desc, count } from "drizzle-orm";
import { budgets } from "@/models/budget.model";
import { procurements, ProcurementStatus } from "@/models/procurement.model";
import { items } from "@/models/item.model";
import type {
	BudgetSummary,
	ProcurementSummary,
	ProcurementItem,
} from "../types/dashboard_kaprodi.types";
import { organizations } from "@/models/organization.model";
import type { Role } from "@/types/authz.types";
import { roles, userOrganizationRoles, users } from "@/models/user.model";
import {
	printNumbers,
	printNumberToProcurements,
} from "@/models/print_number.model";
import type { NewBudget } from "@/models/budget.model";
import { createBudget, getOrCreateCurrentYearBudget } from "./budget.service";
import type { ProgramStudiSummary } from "@/types/dashboard_admin.types";

export async function getOrganizationById(organizationId: number) {
	const organization = await db
		.select()
		.from(organizations)
		.where(eq(organizations.id, organizationId))
		.limit(1);

	if (organization.length === 0) {
		throw new Error("Organization not found");
	}

	return organization[0];
}

export async function getOrCreateOrganiztionByName(organizationName: string) {
	const organization = await db
		.select()
		.from(organizations)
		.where(eq(organizations.name, organizationName))
		.limit(1);

	if (organization.length > 0) {
		return organization[0].id;
	}

	try {
		const org = await createOrganization(organizationName);
		return org[0].id;
	} catch (error) {
		throw new Error("Failed to create organization");
	}
}

export async function getOrganizationByName(organizationName: string) {
	return await db
		.select()
		.from(organizations)
		.where(eq(organizations.name, organizationName))
		.limit(1);
}

export async function createOrganization(organizationName: string) {
	const newOrganization = await db
		.insert(organizations)
		.values({
			name: organizationName,
		})
		.returning();

	// Create initial budget for the new organization
	await createBudget(newOrganization[0].id);

	return newOrganization;
}

export async function getBudgetSummary(
    organizationId: number,
): Promise<BudgetSummary> {
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

    if (budgetData.length === 0) {
        return {
            totalBudget: 0,
            estimatedRemainingBudget: 0,
            realRemainingBudget: 0,
            year: currentYear,
        };
    }

    const procurementCosts = await db
        .select({
            estimated_price: procurements.estimated_price,
            quantity: procurements.quantity,
        })
        .from(procurements)
        .where(eq(procurements.organization, organizationId));

    const totalEstimatedCosts = procurementCosts.reduce((total, procurement) => {
        return total + (Number(procurement.estimated_price) * procurement.quantity);
    }, 0);

    const estimatedRemainingBudget = Number(budgetData[0].remaining_budget) - totalEstimatedCosts;

    return {
        totalBudget: Number(budgetData[0].total_budget),
        estimatedRemainingBudget: estimatedRemainingBudget,
        realRemainingBudget: Number(budgetData[0].remaining_budget),
        year: budgetData[0].year,
    };
}

export async function getProcurementSummary(
	organizationId: number,
): Promise<ProcurementSummary> {
	const procurementsList = await db
		.select()
		.from(procurements)
		.where(eq(procurements.organization, organizationId));

	let onGoing = 0;
	let rejected = 0;
	let completed = 0;

	for (const proc of procurementsList) {
		if (proc.status === ProcurementStatus.PENGAJUAN_DITOLAK) {
			rejected++;
		} else if (proc.status === ProcurementStatus.PENYERAHAN_BARANG) {
			completed++;
		} else {
			onGoing++;
		}
	}

	return {
		onGoing,
		rejected,
		completed,
		total: procurementsList.length,
	};
}

export async function getRecentProcurementItems(
    organizationId: number,
): Promise<ProcurementItem[]> {
    const procurementItemsData = await db
        .select({
            id: procurements.id,
            itemCode: items.item_code,
            itemName: items.item_name,
            quantity: procurements.quantity,
            receiverName: users.username,
            photoUrl: printNumbers.proof_photo,
            status: procurements.status,
			reference: procurements.reference
        })
        .from(procurements)
        .leftJoin(items, eq(procurements.item_id, items.id))  
        .leftJoin(
            printNumberToProcurements,
            eq(procurements.id, printNumberToProcurements.procurement_id),
        )
        .leftJoin(
            printNumbers,
            eq(printNumberToProcurements.print_number_id, printNumbers.id),
        )
        .leftJoin(users, eq(printNumbers.person_in_charge, users.id))
        .where(eq(procurements.organization, organizationId))
        .orderBy(desc(procurements.updated_at))
        .limit(10);

    return procurementItemsData.map((item) => ({
        id: item.id,
        itemCode: item.itemCode || "",  
        itemName: item.itemName || "",  
        quantity: item.quantity,
        receiverName: item.receiverName || "",
        photoUrl: item.photoUrl || "",
        status: item.status,
		reference: item.reference || "",
    }));
}

/**
 * Get the organization IDs where user has a specific role
 * @returns Array of organization IDs
 */
export async function getUserOrganizationsWithRole(
	userId: number,
	role: Role,
): Promise<number[]> {
	const userOrgsResult = await db
		.select({
			organizationId: userOrganizationRoles.organization_id,
			roleName: roles.name,
		})
		.from(userOrganizationRoles)
		.innerJoin(roles, eq(userOrganizationRoles.role_id, roles.id))
		.where(eq(userOrganizationRoles.user_id, userId));

	return userOrgsResult
		.filter((result) => result.roleName === role)
		.map((result) => result.organizationId);
}

export async function getAllUserOrganizations(userId: number) {
	return await db
		.select({
			organizationId: organizations.id,
			organizationName: organizations.name,
		})
		.from(userOrganizationRoles)
		.innerJoin(
			organizations,
			eq(userOrganizationRoles.organization_id, organizations.id),
		)
		.where(eq(userOrganizationRoles.user_id, userId));
}

export async function getAllOrganization() {
	return await db.select().from(organizations);
}

export async function updateOrganization(
	organizationId: number,
	newName: string,
) {
	const updatedOrganization = await db
		.update(organizations)
		.set({ name: newName })
		.where(eq(organizations.id, organizationId))
		.returning();

	if (updatedOrganization.length === 0) {
		throw new Error("Organization not found");
	}

	return updatedOrganization[0];
}

export async function deleteOrganization(organizationId: number) {
	const deletedOrganization = await db
		.delete(organizations)
		.where(eq(organizations.id, organizationId))
		.returning();

	if (deletedOrganization.length === 0) {
		throw new Error("Organization not found");
	}

	return deletedOrganization[0];
}

export async function addOrganizationBudget(
	organizationId: number,
	totalBudget: number,
	remainingBudget: number,
	year: number,
) {
	const newBudget: NewBudget = {
		organization_id: organizationId,
		total_budget: totalBudget.toString(),
		remaining_budget: remainingBudget.toString(),
		year: year,
		created_at: new Date(),
		updated_at: new Date(),
	};

	const insertedBudget = await db.insert(budgets).values(newBudget).returning();

	return insertedBudget[0];
}

export async function getProgramStudiSummaries(): Promise<
	ProgramStudiSummary[]
> {
	const allPrograms = await db
		.select({
			id: organizations.id,
			name: organizations.name,
		})
		.from(organizations);

	const summariesPromises = allPrograms.map(async (program) => {
		const budgetData = await getOrCreateCurrentYearBudget(program.id);

		const remainingBudget = Number(budgetData.remaining_budget);

		const procurementStatusCounts = await db
			.select({
				status: procurements.status,
				count: count(),
			})
			.from(procurements)
			.where(eq(procurements.organization, program.id))
			.groupBy(procurements.status);

		// Convert to the status record format we need
		const statusCounts: Record<string, number> = {};
		for (const statusCount of procurementStatusCounts) {
			statusCounts[statusCount.status] = Number(statusCount.count);
		}

		const totalProcurements = Object.values(statusCounts).reduce(
			(sum, count) => sum + count,
			0,
		);

		return {
			organizationId: program.id,
			organization: program.name,
			total_budget: Number(budgetData.total_budget),
			year: budgetData.year,
			remaining_budget: remainingBudget,
			procurements_total: totalProcurements,
			status: statusCounts,
		} as ProgramStudiSummary;
	});

	// Wait for all the program summaries to complete
	return await Promise.all(summariesPromises);
}
