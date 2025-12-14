import { z } from "@hono/zod-openapi";

// Define Zod schema for an Item
export const Item = z.object({
	price: z.string(),
	id: z.number(),
	item_code: z.string(),
	item_name: z.string(),
	category: z.string(),
	specifications: z.string(),
	unit: z.string(),
	created_at: z.date(),
	updated_at: z.date(),
	reference: z.string(),
});

// Define Zod schema for creating an Item (usually omits ID)
export const CreateItem = z.object({
	item_code: z.string(),
	item_name: z.string(),
	category: z.string(),
	specifications: z.string(),
	unit: z.string(),
	reference: z.string(),
});

// Define Zod schema for updating an Item (all fields optional)
export const UpdateItem = z.object({
	name: z.string().optional().openapi({ example: "Updated Item Name" }),
	price: z.number().optional().openapi({ example: 150.0 }),
	// Add other item properties for update
});

export type ItemSchema = z.infer<typeof Item>;
export type CreateItemSchema = z.infer<typeof CreateItem>;
export type UpdateItemSchema = z.infer<typeof UpdateItem>;
