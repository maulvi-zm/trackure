import type { Context } from "hono";
import {
	createItem,
	updateItem,
	deleteItem,
	getItemById,
	getAllItems,
} from "@/services/item.service";
import type { NewItem } from "@/models/item.model";

export class ItemController {
	/**
	 * Handles the request to create a new item.
	 * Expects item data in the request body.
	 * @param c - The Hono context object.
	 * @returns A Hono response with the created item or error.
	 */
	async createItem(c: Context) {
		try {
			const newItemData: NewItem = await c.req.json();
			const createdItem = await createItem(newItemData);

			// Return a JSON response with the created item
			return c.json(createdItem, 201);
		} catch (error) {
			console.error("Error in createItem controller:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	/**
	 * Handles the request to update an existing item by its ID.
	 * Expects the item ID in the request parameters and updated data in the body.
	 * @param c - The Hono context object.
	 * @returns A Hono response with the updated item or error.
	 */
	async updateItem(c: Context) {
		try {
			const id = Number.parseInt(c.req.param().itemId);
			if (Number.isNaN(id)) {
				return c.json({ success: false, error: "Invalid item ID" }, 400);
			}

			const { created_at, updated_at, ...updatedItemData }: Partial<NewItem> =
				await c.req.json();

			const updatedItem = await updateItem(id, updatedItemData);

			if (!updatedItem) {
				return c.json({ success: false, error: "Item not found" }, 404);
			}

			return c.json(updatedItem, 200);
		} catch (error) {
			console.error("Error in updateItem controller:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	/**
	 * Handles the request to delete an item by its ID.
	 * Expects the item ID in the request parameters.
	 * @param c - The Hono context object.
	 * @returns A Hono response with the deleted item or error.
	 */
	async deleteItem(c: Context) {
		try {
			const id = Number.parseInt(c.req.param().itemId);
			if (Number.isNaN(id)) {
				return c.json({ success: false, error: "Invalid item ID" }, 400);
			}

			const deletedItem = await deleteItem(id);

			if (!deletedItem) {
				return c.json({ success: false, error: "Item not found" }, 404); // Not Found
			}

			// Return a JSON response with the deleted item
			return c.json(deletedItem, 200);
		} catch (error) {
			// Log the error and return a JSON response with the error message
			console.error("Error in deleteItem controller:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	async getItemById(c: Context) {
		try {
			const id = Number.parseInt(c.req.param().itemId);
			if (Number.isNaN(id)) {
				return c.json({ success: false, error: "Invalid item ID" }, 400);
			}

			// Assuming you have a getItemById service function
			const item = await getItemById(id);

			if (!item || item.length === 0) {
				return c.json({ success: false, error: "Item not found" }, 404);
			}

			return c.json(item[0], 200);
		} catch (error) {
			console.error("Error in getItemById controller:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}

	async getAllItems(c: Context) {
		try {
			const allItems = await getAllItems();
			return c.json(allItems, 200);
		} catch (error) {
			console.error("Error in getAllItems controller:", error);
			return c.json({ success: false, error: (error as Error).message }, 500);
		}
	}
}
