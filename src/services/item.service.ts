import { db } from "@/db/db";
import { items, type Item, type NewItem } from "@/models/item.model";
import { eq } from "drizzle-orm";

/**
 * Creates a new item in the database.
 * @param db - The Drizzle database connection instance.
 * @param newItem - The data for the new item.
 * @returns A promise that resolves with the created item.
 */
export async function createItem(newItem: NewItem): Promise<Item | undefined> {
	try {
		const result = await db.insert(items).values(newItem).returning();

		return result[0];
	} catch (error) {
		console.error("Error creating item:", error);
		throw error;
	}
}

/**
 * Updates an existing item in the database by its ID.
 * @param db - The Drizzle database connection instance.
 * @param id - The ID of the item to update.
 * @param updatedItemData - The data to update the item with.
 * @returns A promise that resolves with the updated item, or undefined if not found.
 */
export async function updateItem(
	id: number,
	updatedItemData: Partial<NewItem>,
): Promise<Item | undefined> {
	try {
		const result = await db
			.update(items)
			.set(updatedItemData)
			.where(eq(items.id, id))
			.returning();

		return result[0];
	} catch (error) {
		console.error(`Error updating item with ID ${id}:`, error);
		throw error;
	}
}

/**
 * Deletes an item from the database by its ID.
 * @param db - The Drizzle database connection instance.
 * @param id - The ID of the item to delete.
 * @returns A promise that resolves with the deleted item, or undefined if not found.
 */
export async function deleteItem(id: number): Promise<Item | undefined> {
	try {
		const result = await db
			.delete(items)
			.where(eq(items.id, id)) // Use eq for comparison
			.returning(); // Use .returning() to get the deleted item back

		// Drizzle returning() returns an array, so we take the first element
		return result[0];
	} catch (error) {
		console.error(`Error deleting item with ID ${id}:`, error);
		throw error;
	}
}

export async function getItemById(id: number) {
	return await db.select().from(items).where(eq(items.id, id)).limit(1);
}

export async function getAllItems() {
	return await db.select().from(items);
}
