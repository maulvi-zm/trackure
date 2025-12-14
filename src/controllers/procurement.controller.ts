import type { Context } from "hono";
import { FileType, getPresignedURL, uploadFile } from "@/services/file.service";
import {
	createProcurement,
	getProcurementById,
	approveProcurement,
	rejectProcurement,
	createPurchaseOrder,
	recordVendorDelivery,
	completeProcurement,
	updateProcurement,
	createProcurementWithExistingItem,
	addItemToProcurement,
	confirmProcurementPriceMatch,
	estimatePO,
	getProcurementList,
} from "@/services/procurement.service";
import { createItem } from "@/services/item.service";
import type { NewItem } from "@/models/item.model";
import { getCurrentActiveOrganization } from "@/services/active_organization.service";
import { deductBudget } from "@/services/budget.service";
import { ProcurementListResponseSchema } from "@/types/dashboard_admin.types";

// Define a type for the procurement object returned by the service

export class ProcurementController {
	/**
	 * Get procurement by ID
	 */
	async getProcurement(c: Context) {
		try {
			const procurementId = Number.parseInt(c.req.param("procurementId"));

			if (Number.isNaN(procurementId)) {
				return c.json({ success: false, error: "Invalid procurement ID" }, 400);
			}

			const procurementData = await getProcurementById(procurementId);

			if (!procurementData) {
				return c.json({ success: false, error: "Procurement not found" }, 404);
			}
			const po_document_url = getPresignedURL(procurementData.po_document);
			const bast_document_url = getPresignedURL(procurementData.bast_document);
			return c.json(
				{
					success: true,
					data: {
						...procurementData,
						po_document: po_document_url,
						bast_document: bast_document_url,
					},
				},
				200,
			);
		} catch (error) {
			console.error("Error fetching procurement:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	/**
	 * Create a new procurement request
	 */
	async createProcurement(c: Context) {
		try {
			const userId = c.get("user").id;
			const organizationId = (await getCurrentActiveOrganization(userId))
				.organizationId;

			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			let newProcurement: any;
			const itemExists = c.req.query("item_exists") === "true";
			// Parse form data
			const body = await c.req.json();
			if (!body) {
				return c.json({ success: false, error: "Invalid request body" }, 400);
			}
			if (itemExists) {
				const { item_id, quantity } = body;
				console.log("Creating procurement with existing item:", body);
				// Validate required fields
				if (!item_id || !quantity) {
					return c.json(
						{ success: false, error: "Missing required fields" },
						400,
					);
				}
				newProcurement = await createProcurementWithExistingItem(
					Number.parseInt(quantity.toString()),
					organizationId,
					Number.parseInt(item_id.toString()),
				);
			} else {
				const { reference, quantity, estimated_price } = body;
				console.log("Creating procurement with data:", body);
				// Validate required fields
				if (!reference || !quantity || !estimated_price) {
					return c.json(
						{ success: false, error: "Missing required fields" },
						400,
					);
				}

				newProcurement = await createProcurement(
					Number.parseInt(quantity.toString()),
					userId,
					organizationId,
					reference.toString(),
					Number.parseFloat(estimated_price.toString()),
				);
			}
			if (!newProcurement) {
				return c.json(
					{ success: false, error: "Failed to create procurement" },
					500,
				);
			}

			return c.json({ success: true, data: newProcurement }, 200);
		} catch (error) {
			console.error("Error creating procurement:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	/**
	 * Create a new item and update procurement
	 */
	async addItemToProcurement(c: Context) {
		try {
			const procurementId = Number.parseInt(c.req.param("procurementId"));
			if (Number.isNaN(procurementId)) {
				return c.json({ success: false, error: "Invalid procurement ID" }, 400);
			}
			const newItemData: NewItem = await c.req.json();
			const createdItem = await createItem(newItemData);
			if (!createdItem) {
				return c.json({ success: false, error: "Failed to create item" }, 500);
			}
			const updatedProcurement = await addItemToProcurement(
				procurementId,
				createdItem.id,
			);
			return c.json({ success: true, data: updatedProcurement }, 200);
		} catch (error) {
			console.error("Error adding item to procurement:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	/**
	 * Confirm price match and update procurement status
	 */
	async confirmPriceMatch(c: Context) {
		try {
			const procurementId = Number.parseInt(c.req.param("procurementId"));

			if (Number.isNaN(procurementId)) {
				return c.json({ success: false, error: "Invalid procurement ID" }, 400);
			}

			const updatedProcurement =
				await confirmProcurementPriceMatch(procurementId);

			if (!updatedProcurement) {
				return c.json(
					{ success: false, error: "Failed to confirm price match" },
					500,
				);
			}

			return c.json({ success: true }, 200);
		} catch (error) {
			console.error("Error confirming price match:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	/**
	 * Approve a procurement request
	 */
	async approveProcurement(c: Context) {
		try {
			const procurementId = Number.parseInt(c.req.param("procurementId"));
			const userId = c.get("user").id;
			const organizationId = (await getCurrentActiveOrganization(userId))
				.organizationId;
			if (Number.isNaN(procurementId)) {
				return c.json({ success: false, error: "Invalid procurement ID" }, 400);
			}

			const { notes } = await c.req.json();

			const updatedProcurement = await approveProcurement(procurementId, notes);
			if (!updatedProcurement) {
				return c.json(
					{ success: false, error: "Failed to approve procurement" },
					500,
				);
			}
			const procurement = await getProcurementById(procurementId);
			if (!procurement.item?.price) {
				return c.json(
					{ success: false, error: "Failed to approve procurement" },
					500,
				);
			}
			const amountDeducted =
				procurement.quantity * Number.parseInt(procurement.item?.price);

			const date = new Date();
			const updatedBudget = await deductBudget(
				organizationId,
				amountDeducted,
				date.getFullYear(),
			);
			if (!updatedBudget) {
				return c.json(
					{ success: false, error: "Failed to approve procurement" },
					500,
				);
			}

			return c.json({ success: true }, 200);
		} catch (error) {
			console.error("Error approving procurement:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	/**
	 * Reject a procurement request
	 */
	async rejectProcurement(c: Context) {
		try {
			const procurementId = Number.parseInt(c.req.param("procurementId"));

			if (Number.isNaN(procurementId)) {
				return c.json({ success: false, error: "Invalid procurement ID" }, 400);
			}

			const { notes } = await c.req.json();

			if (!notes) {
				return c.json(
					{ success: false, error: "Rejection reason is required" },
					400,
				);
			}

			const updatedProcurement = await rejectProcurement(procurementId, notes);

			if (!updatedProcurement) {
				return c.json(
					{ success: false, error: "Failed to reject procurement" },
					500,
				);
			}

			return c.json({ success: true }, 200);
		} catch (error) {
			console.error("Error rejecting procurement:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	/**
	 * Create purchase order
	 */
	async createPurchaseOrder(c: Context) {
		try {
			const userId = c.get("user").id;
			const organization = c.get("user").organization_id;
			const procurementId = Number.parseInt(c.req.param("procurementId"));
			if (Number.isNaN(procurementId)) {
				return c.json({ success: false, error: "Invalid procurement ID" }, 400);
			}
			const body = await c.req.parseBody();
			const po_date = body.po_date as string;
			const po_document = body.po_document as File;

			if (!po_date) {
				return c.json({ success: false, error: "PO date is required" }, 400);
			}
			if (!po_document) {
				return c.json({ success: false, error: "No file uploaded" }, 400);
			}

			const fileBuffer = await po_document.arrayBuffer();
			const buffer = Buffer.from(fileBuffer);

			const fileName = po_document.name;
			const fileType = FileType.DOCUMENT;

			const s3FilePath = await uploadFile(
				buffer,
				fileName,
				fileType,
				organization,
				userId,
			);

			const updatedProcurement = await createPurchaseOrder(
				procurementId,
				s3FilePath,
				new Date(po_date),
			);

			if (!updatedProcurement) {
				return c.json(
					{ success: false, error: "Failed to create purchase order" },
					500,
				);
			}

			return c.json({ success: true }, 200);
		} catch (error) {
			console.error("Error creating purchase order:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	async estimatePO(c: Context) {
		try {
			const procurementId = Number.parseInt(c.req.param("procurementId"));

			if (Number.isNaN(procurementId)) {
				return c.json({ success: false, error: "Invalid procurement ID" }, 400);
			}

			const { time_estimation } = await c.req.json();

			if (!time_estimation) {
				return c.json(
					{ success: false, error: "Time estimation is required" },
					400,
				);
			}

			const updatedProcurement = await estimatePO(
				procurementId,
				time_estimation,
			);

			if (!updatedProcurement) {
				return c.json(
					{ success: false, error: "Failed to add time estimation" },
					500,
				);
			}

			return c.json({ success: true }, 200);
		} catch (error) {
			console.error("Error updating PO estimation", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}
	/**
	 * Record vendor delivery
	 */
	async recordVendorDelivery(c: Context) {
		try {
			const userId = c.get("user").id;
			const organization = c.get("user").organization_id;
			const procurementId = Number.parseInt(c.req.param("procurementId"));

			if (Number.isNaN(procurementId)) {
				return c.json({ success: false, error: "Invalid procurement ID" }, 400);
			}

			const body = await c.req.parseBody();
			const bast_document = body.bast_document as File;

			if (!bast_document) {
				return c.json({ success: false, error: "No file uploaded" }, 400);
			}

			const fileBuffer = await bast_document.arrayBuffer();
			const buffer = Buffer.from(fileBuffer);

			const fileName = bast_document.name;
			const fileType = FileType.DOCUMENT;

			const s3FilePath = await uploadFile(
				buffer,
				fileName,
				fileType,
				organization,
				userId,
			);

			const updatedProcurement = await recordVendorDelivery(
				procurementId,
				s3FilePath,
			);

			if (!updatedProcurement) {
				return c.json(
					{ success: false, error: "Failed to record vendor delivery" },
					500,
				);
			}

			return c.json({ success: true }, 200);
		} catch (error) {
			console.error("Error recording vendor delivery:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	/**
	 * Complete procurement process
	 */
	async completeProcurement(c: Context) {
		try {
			const userId = c.get("user").id;
			const organizationId = (await getCurrentActiveOrganization(userId))
				.organizationId;
			const procurementId = Number.parseInt(c.req.param("procurementId"));

			if (Number.isNaN(procurementId)) {
				return c.json({ success: false, error: "Invalid procurement ID" }, 400);
			}

			// Parse form data with file upload
			const body = await c.req.parseBody();
			const { final_note } = body;

			// Validate required fields
			if (!final_note) {
				return c.json(
					{
						success: false,
						error: "Receipt date and receiver name are required",
					},
					400,
				);
			}

			// Process item photo upload - this is where the item photo should be uploaded
			// when the item has arrived to the requester
			let itemPhotoUrl = "";
			const itemPhoto = body.item_photo;
			if (itemPhoto && typeof itemPhoto !== "string") {
				// Check if it's a file object
				const fileBuffer = await itemPhoto
					.arrayBuffer()
					.then((ab) => Buffer.from(ab));

				itemPhotoUrl = await uploadFile(
					fileBuffer,
					itemPhoto.name,
					"IMAGE",
					organizationId.toString(),
					userId.toString(),
				);
			}

			const updatedProcurement = await completeProcurement(
				procurementId,
				final_note.toString(),
			);

			if (!updatedProcurement) {
				return c.json(
					{ success: false, error: "Failed to complete procurement" },
					500,
				);
			}

			return c.json({ success: true }, 200);
		} catch (error) {
			console.error("Error completing procurement:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	/**
	 * General update for procurement
	 */
	async updateProcurement(c: Context) {
		try {
			const procurementId = Number.parseInt(c.req.param("procurementId"));

			if (Number.isNaN(procurementId)) {
				return c.json({ success: false, error: "Invalid procurement ID" }, 400);
			}

			const updateData = await c.req.json();

			const updatedProcurement = await updateProcurement(
				procurementId,
				updateData,
			);

			if (!updatedProcurement) {
				return c.json(
					{ success: false, error: "Failed to update procurement" },
					500,
				);
			}

			return c.json({ success: true }, 200);
		} catch (error) {
			console.error("Error updating procurement:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	// Method from DashboardController
	async getProcurementList(c: Context) {
		try {
			const organizationId = Number(c.req.param("organizationId"));
			const procurementList = await getProcurementList(organizationId);

			const response = ProcurementListResponseSchema.parse({
				success: true,
				procurementList: procurementList,
			});
			return c.json(response, 200);
		} catch (error) {
			return c.json(
				{
					success: false,
					error: "Internal Server Error",
					message: "Error fetching procurement list",
				},
				500,
			);
		}
	}
}
