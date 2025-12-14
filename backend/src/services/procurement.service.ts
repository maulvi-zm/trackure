import { db } from "@/db/db";
import { eq, and } from "drizzle-orm";
import { procurements, ProcurementStatus } from "@/models/procurement.model";
import { items } from "@/models/item.model";
import {
	printNumbers,
	printNumberToProcurements,
} from "@/models/print_number.model";
import { users } from "@/models/user.model";
import { organizations } from "@/models/organization.model";
import type { ProcurementItem } from "@/types/dashboard_admin.types";

export async function getProcurementById(procurementId: number) {
	const procurement = await db
		.select()
		.from(procurements)
		.where(eq(procurements.id, procurementId))
		.limit(1);

	if (procurement.length === 0) {
		throw new Error("Procurement not found");
	}

	const itemData = await db
		.select({ items })
		.from(procurements)
		.leftJoin(items, eq(items.id, procurements.item_id))
		.where(eq(procurements.id, procurementId))
		.limit(1);

	const printNumberData = await db
		.select()
		.from(printNumberToProcurements)
		.leftJoin(
			printNumbers,
			eq(printNumbers.id, printNumberToProcurements.print_number_id),
		)
		.leftJoin(users, eq(users.id, printNumbers.person_in_charge))
		.where(eq(printNumberToProcurements.procurement_id, procurementId))
		.limit(1);

	return {
		...procurement[0],
		item: itemData.length > 0 ? itemData[0].items : null,
		print_number:
			printNumberData.length > 0 ? printNumberData[0].print_number : null,
		person_in_charge:
			printNumberData.length > 0 && printNumberData[0].users
				? printNumberData[0].users
				: null,
	};
}

export async function createProcurement(
	quantity: number,
	userId: number,
	organization: number,
	reference: string,
	estimated_price: number,
) {
	try {
		const newProcurement = await db
			.insert(procurements)
			.values({
				quantity: quantity,
				requester_id: userId,
				request_date: new Date(),
				organization: organization,
				reference: reference,
				estimated_price: estimated_price.toString(),
				status: ProcurementStatus.PENGAJUAN,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning();

		return newProcurement[0];
	} catch (error) {
		console.error("Error creating procurement:", error);
		return false;
	}
}

export async function createProcurementWithExistingItem(
	quantity: number,
	organization: number,
	item_id: number,
) {
	try {
		const item = await db
			.select()
			.from(items)
			.where(eq(items.id, item_id))
			.limit(1);
		if (item.length === 0) {
			throw new Error("Item not found");
		}

		const newProcurement = await db
			.insert(procurements)
			.values({
				quantity: quantity,
				request_date: new Date(),
				item_id: item[0].id,
				estimated_price: item[0].price,
				organization: organization,
				status: ProcurementStatus.PENGAJUAN,
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning();

		return newProcurement[0];
	} catch (error) {
		console.error("Error creating procurement:", error);
		return false;
	}
}

export async function addItemToProcurement(
	procurement_id: number,
	item_id: number,
) {
	try {
		const updated = await db
			.update(procurements)
			.set({
				item_id: item_id,
				updated_at: new Date(),
			})
			.where(eq(procurements.id, procurement_id))
			.returning();

		return updated[0];
	} catch (error) {
		console.error("Error adding item to procurement:", error);
		return false;
	}
}

export async function confirmProcurementPriceMatch(procurement_id: number) {
	try {
		const updated = await db
			.update(procurements)
			.set({
				status: ProcurementStatus.VERIFIKASI_PENGAJUAN,
				updated_at: new Date(),
			})
			.where(eq(procurements.id, procurement_id))
			.returning();

		return updated[0];
	} catch (error) {
		console.error("Error confirming price match:", error);
		return false;
	}
}

/**
 * Updates a procurement to Approved status
 */
export async function approveProcurement(
	procurement_id: number,
	verification_note?: string,
) {
	const procurement = await getProcurementById(procurement_id);
	if (procurement.status !== ProcurementStatus.VERIFIKASI_PENGAJUAN) {
		throw new Error("Procurement is not in a state that can be approved");
	}
	try {
		const updated = await db
			.update(procurements)
			.set({
				status: ProcurementStatus.PENGIRIMAN_ORDER,
				verification_note: verification_note,
				updated_at: new Date(),
			})
			.where(eq(procurements.id, procurement_id))
			.returning();

		return updated[0];
	} catch (error) {
		console.error("Error approving procurement:", error);
		return false;
	}
}

/**
 * Updates a procurement to Rejected status
 */
export async function rejectProcurement(
	procurement_id: number,
	verification_note: string,
) {
	const procurement = await getProcurementById(procurement_id);
	if (procurement.status !== ProcurementStatus.VERIFIKASI_PENGAJUAN) {
		throw new Error("Procurement is not in a state that can be rejected");
	}

	try {
		const updated = await db
			.update(procurements)
			.set({
				status: ProcurementStatus.PENGAJUAN_DITOLAK,
				verification_note: verification_note,
				updated_at: new Date(),
			})
			.where(eq(procurements.id, procurement_id))
			.returning();

		return updated[0];
	} catch (error) {
		console.error("Error rejecting procurement:", error);
		return false;
	}
}

/**
 * Updates procurement with PO information
 */
export async function createPurchaseOrder(
	procurement_id: number,
	po_document: string,
	po_date: Date,
) {
	const procurement = await getProcurementById(procurement_id);
	if (procurement.status !== ProcurementStatus.PENGIRIMAN_ORDER) {
		throw new Error("Procurement is not in a state that can create a PO");
	}
	try {
		const updated = await db
			.update(procurements)
			.set({
				status: ProcurementStatus.PENGIRIMAN_BARANG,
				po_date: po_date,
				po_document: po_document,
				updated_at: new Date(),
			})
			.where(eq(procurements.id, procurement_id))
			.returning();

		return updated[0];
	} catch (error) {
		console.error("Error creating purchase order:", error);
		return false;
	}
}

export async function estimatePO(
	procurement_id: number,
	time_estimation: string,
) {
	const procurement = await getProcurementById(procurement_id);
	if (procurement.status !== ProcurementStatus.PENGIRIMAN_BARANG) {
		throw new Error("Procurement is not in a state that can create a PO");
	}
	try {
		const updated = await db
			.update(procurements)
			.set({
				status: ProcurementStatus.PENERIMAAN_BARANG,
				time_estimation,
				time_estimation_date: new Date(),
				updated_at: new Date(),
			})
			.where(eq(procurements.id, procurement_id))
			.returning();

		return updated[0];
	} catch (error) {
		console.error("Error creating purchase order:", error);
		return false;
	}
}
/**
 * Updates procurement with vendor delivery information
 */
export async function recordVendorDelivery(
	procurement_id: number,
	bast_document?: string,
) {
	const procurement = await getProcurementById(procurement_id);
	if (procurement.status !== ProcurementStatus.PENERIMAAN_BARANG) {
		throw new Error(
			"Procurement is not in a state that can record vendor delivery",
		);
	}
	try {
		const updated = await db
			.update(procurements)
			.set({
				status: ProcurementStatus.PENYERAHAN_BARANG,
				bast_document: bast_document,
				bast_date: new Date(),
				updated_at: new Date(),
			})
			.where(eq(procurements.id, procurement_id))
			.returning();

		return updated[0];
	} catch (error) {
		console.error("Error recording vendor delivery:", error);
		return false;
	}
}

/**
 * Updates procurement with final user receipt information
 */
export async function completeProcurement(
	procurement_id: number,
	final_note: string,
) {
	const procurement = await getProcurementById(procurement_id);
	if (procurement.status !== ProcurementStatus.PENYERAHAN_BARANG) {
		throw new Error("Procurement is not in a state that can complete");
	}
	try {
		const updated = await db
			.update(procurements)
			.set({
				status: ProcurementStatus.SELESAI,
				final_note: final_note,
				updated_at: new Date(),
			})
			.where(eq(procurements.id, procurement_id))
			.returning();

		return updated[0];
	} catch (error) {
		console.error("Error completing procurement:", error);
		return false;
	}
}

/**
 * General update function for procurement
 * Use this for updating any fields not covered by the specific functions
 */
export async function updateProcurement(
	procurement_id: number,
	updateData: Partial<
		Omit<typeof procurements.$inferInsert, "id" | "created_at">
	>,
) {
	try {
		const updated = await db
			.update(procurements)
			.set({
				...updateData,
				updated_at: new Date(),
			})
			.where(eq(procurements.id, procurement_id))
			.returning();

		return updated[0];
	} catch (error) {
		console.error("Error updating procurement:", error);
		return false;
	}
}

export async function getProcurementList(
	organizationId: number,
): Promise<ProcurementItem[]> {
	const procurementsData = await db
		.select({
			procurements: procurements,
			organizations: organizations,
			items: items,
		})
		.from(procurements)
		.leftJoin(organizations, eq(procurements.organization, organizations.id))
		.leftJoin(items, eq(procurements.item_id, items.id))
		.where(and(eq(procurements.organization, organizationId)));

	return procurementsData.map((row) => {
		const procurement = row.procurements;
		const organization = row.organizations;
		const item = row.items;

		const totalAmount = Number.parseFloat(procurement.estimated_price);

		return {
			id: procurement.id,
			nama: item?.item_name ? item?.item_name : "-",
			referensi: item?.reference ? item?.reference : procurement.reference,
			organisasi: organization?.name || "Unknown",
			bidang: item?.category || "Unknown",
			qty: procurement.quantity,
			jumlah: Number.isNaN(totalAmount) ? 0 : totalAmount,
			tanggal: procurement.created_at.toISOString(),
			status: procurement.status,
		};
	});
}
