import { db } from "@/db/db";
import { items } from "@/models/item.model";
import {
	printNumberToProcurements,
	printNumbers,
} from "@/models/print_number.model";
import { procurements, ProcurementStatus } from "@/models/procurement.model";
import { eq, inArray } from "drizzle-orm";

export async function getUserPrintNumbers(userId: number) {
	try {
		const printnumbers = await db
			.select({
				id: printNumbers.id,
				print_number: printNumbers.print_number,
				item_photo_url: printNumbers.proof_photo,
			})
			.from(printNumbers)
			.where(eq(printNumbers.person_in_charge, userId))
			.orderBy(printNumbers.print_number);

		return printnumbers;
	} catch (error) {
		console.error("Error fetching print numbers:", error);
		throw new Error("Database query failed");
	}
}

export async function getListBarang(printNumberId: number) {
	return await db
		.select({
			item_name: items.item_name,
			quantity: procurements.quantity,
			unit: items.unit,
		})
		.from(printNumbers)
		.innerJoin(
			printNumberToProcurements,
			eq(printNumbers.id, printNumberToProcurements.print_number_id),
		)
		.innerJoin(
			procurements,
			eq(printNumberToProcurements.procurement_id, procurements.id),
		)
		.innerJoin(items, eq(procurements.item_id, items.id))
		.where(eq(printNumbers.id, printNumberId));
}

export async function updatePrintNumberAttachment(
	printNumberId: number,
	s3FilePath: string | null,
) {
	await db
		.update(printNumbers)
		.set({
			proof_photo: s3FilePath,
		})
		.where(eq(printNumbers.id, printNumberId));
}

export async function deletePrintNumberAttachment(printNumberId: number) {
	await db
		.update(printNumbers)
		.set({
			proof_photo: "", // Setting to empty string, assuming this is the desired behavior for deletion
		})
		.where(eq(printNumbers.id, printNumberId));
}

export async function getPrintNumberS3Key(printNumberId: number) {
	const res = await db
		.select({
			photoUrl: printNumbers.proof_photo,
		})
		.from(printNumbers)
		.where(eq(printNumbers.id, printNumberId));

	return res[0]?.photoUrl; // Added optional chaining in case res[0] is undefined
}

export async function getAllPrintNumberIds() {
	try {
		const printNumberData = await db
			.select({
				id: printNumbers.id,
				name: printNumbers.print_number, // Ensuring 'name' field is selected as print_number
			})
			.from(printNumbers)
			.where(eq(printNumbers.is_active, true));

		return printNumberData;
	} catch (error) {
		console.error("Error fetching print number IDs:", error);
		throw new Error("Database query failed");
	}
}

export async function associateProcurementsWithPrintNumberService(
	printNumber: string,
	procurementIds: number[],
	personInCharge: number,
) {
	try {
		return await db.transaction(async (tx) => {
			// Check if print number exists
			const existingPrintNumber = await tx
				.select({ id: printNumbers.id })
				.from(printNumbers)
				.where(eq(printNumbers.print_number, printNumber))
				.limit(1);

			let printNumberId: number;

			if (existingPrintNumber.length === 0) {
				// Create new print number if it doesn't exist
				const [newPrintNumber] = await tx
					.insert(printNumbers)
					.values({
						print_number: printNumber,
						person_in_charge: personInCharge,
						is_active: true,
					})
					.returning({ id: printNumbers.id });

				printNumberId = newPrintNumber.id;
			} else {
				printNumberId = existingPrintNumber[0].id;
				// Update person in charge for existing print number
				await tx
					.update(printNumbers)
					.set({ person_in_charge: personInCharge })
					.where(eq(printNumbers.id, printNumberId));
			}

			// Associate procurements
			const values = procurementIds.map((procurementId) => ({
				print_number_id: printNumberId,
				procurement_id: procurementId,
			}));

			await tx.insert(printNumberToProcurements).values(values);

			// Update procurement status
			await tx
				.update(procurements)
				.set({ status: "Barang Diserahkan" })
				.where(inArray(procurements.id, procurementIds));

			return {
				success: true,
				message:
					existingPrintNumber.length === 0
						? `Successfully created print number "${printNumber}", associated ${procurementIds.length} procurements, and assigned to person ${personInCharge}`
						: `Successfully associated ${procurementIds.length} procurements with existing print number "${printNumber}" and assigned to person ${personInCharge}`,
			};
		});
	} catch (error) {
		console.error("Error associating procurements with print number:", error);
		throw error;
	}
}

export async function isAllDone(printNumber: string) {
	try {
		const statuses = await db
			.select({
				status: procurements.status,
			})
			.from(procurements)
			.innerJoin(
				printNumberToProcurements,
				eq(procurements.id, printNumberToProcurements.procurement_id),
			)
			.innerJoin(
				printNumbers,
				eq(printNumberToProcurements.print_number_id, printNumbers.id),
			)
			.where(eq(printNumbers.print_number, printNumber));

		return statuses.every(
			(item) => item.status === ProcurementStatus.PENYERAHAN_BARANG,
		);
	} catch (error) {
		console.error("Error checking status:", error);
		throw new Error("Database query failed");
	}
} 