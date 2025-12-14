import type { Context } from "hono";
import type { UserPrintNumberResponse } from "../types/print_number.types"; // CORRECTED Type import path
import {
	getListBarang,
	getPrintNumberS3Key,
	getUserPrintNumbers,
	updatePrintNumberAttachment,
	associateProcurementsWithPrintNumberService,
	isAllDone,
} from "@/services/print_number.service";
import {
	deleteFile,
	FileType,
	getPresignedURL,
	uploadFile,
} from "@/services/file.service";
import { getAllUserPrintNumber } from "@/services/user.service";

export class PrintNumberController {
	async getPrintNumbersForUser(c: Context) {
		try {
			const user = c.get("user").id;

			const printNumbers = await getUserPrintNumbers(user);

			if (printNumbers.length === 0) {
				return c.json([], 200);
			}

			const response: UserPrintNumberResponse = await Promise.all(
				printNumbers.map(async (detail: { id: number; print_number: string; item_photo_url: string | null }) => ({
					id: detail.id,
					printNumber: detail.print_number,
					status: (await isAllDone(detail.print_number))
						? "Dalam proses"
						: "Selesai",
					attachment: getPresignedURL(detail.item_photo_url),
				})),
			);

			return c.json(response, 200);
		} catch (error) {
			console.error("Error fetching Print Number data for user:", error); // Updated log message
			return c.json({ error: "Internal Server Error" }, 500);
		}
	}
	async getItemsForPrintNumber(c: Context) { // RENAMED METHOD
		try {
			const id = Number.parseInt(c.req.param().printNumberId); // param name might change in route
			const barangs = await getListBarang(id);

			return c.json(barangs, 200);
		} catch (error) {
			console.error("Error fetching items for print number:", error); // Updated log message
			return c.json({ error: "Internal Server Error" }, 500);
		}
	}
	async uploadPhotoForPrintNumber(c: Context) {
		try {
			const printNumberId = Number.parseInt(c.req.param("printNumberId")); // param name might change in route

			const user = c.get("user");
			const userId = user.id;
			const organization = user.organizationName;
			const body = await c.req.parseBody();
			const file = body.photo as File;

			if (!file) {
				return c.json({ error: "No file uploaded" }, 400);
			}

			const fileBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(fileBuffer);

			const fileName = file.name;
			const fileType = FileType.IMAGE;

			const s3FilePath = await uploadFile(
				buffer,
				fileName,
				fileType,
				organization,
				userId,
			);

			await updatePrintNumberAttachment(printNumberId, s3FilePath);

			return c.json(
				{
					message: "Photo uploaded successfully",
					printNumberId: printNumberId,
					filePath: s3FilePath,
				},
				200,
			);
		} catch (error) {
			console.error("Error uploading photo for print number:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	}
	async deletePhotoForPrintNumber(c: Context) {
		try {
			const printNumberId = Number.parseInt(c.req.param("printNumberId")); // param name might change in route

			const s3Key = await getPrintNumberS3Key(printNumberId);

			if (s3Key) {
				await deleteFile(s3Key);
				await updatePrintNumberAttachment(printNumberId, null);
			}

			return c.json(
				{ message: "Photo deleted successfully (if existed)" },
				200,
			);
		} catch (error) {
			console.error("Error deleting photo for print number:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	}
	async getAllPrintNumberIds(c: Context) {
		try {
			const user = c.get("user");
			const userId = user.id;
			const organizationId = user.organizationId;

			const printNumberIds = await getAllUserPrintNumber( // This service call might also need to be in print_number.service
				userId,
				organizationId,
			);

			if (printNumberIds.length === 0) {
				return c.json({ error: "No print numbers found" }, 404);
			}

			return c.json(
				printNumberIds.map((item) => ({ id: item.id, name: item.name })),
				200,
			);
		} catch (error) {
			console.error("Error fetching print number IDs:", error);
			return c.json({ error: "Internal Server Error" }, 500);
		}
	}
	async associateProcurementsWithPrintNumber(c: Context) {
		try {
			const body = await c.req.json();

			if (
				!body.printNumber ||
				!Array.isArray(body.procurementIds) ||
				body.procurementIds.length === 0 ||
				!body.personInCharge
			) {
				return c.json(
					{
						success: false,
						error:
							"Invalid request. Required fields: printNumber, procurementIds (array), and personInCharge",
					},
					400,
				);
			}

			const { procurementIds, printNumber, personInCharge } = body;

			const result = await associateProcurementsWithPrintNumberService(
				printNumber.toString(),
				procurementIds.map((id: number | string) =>
					Number.parseInt(id.toString(), 10),
				),
				Number.parseInt(personInCharge.toString(), 10),
			);

			return c.json(result, 200);
		} catch (error) {
			console.error(
				"Error in associateProcurementsWithPrintNumber controller:",
				error,
			);

			if (
				error instanceof Error &&
				error.message === "Print number not found"
			) {
				return c.json({ success: false, error: "Print number not found" }, 404);
			}

			return c.json({ success: false, error: "Internal Server Error" }, 500);
		}
	}
}

export default PrintNumberController; // UPDATED EXPORT 