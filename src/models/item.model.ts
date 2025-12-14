import {
	pgTable,
	varchar,
	timestamp,
	text,
	decimal,
	serial,
} from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export const items = pgTable("items", {
	id: serial("id").primaryKey(),
	item_code: varchar("item_code", { length: 256 }).notNull().unique(),
	item_name: varchar("item_name", { length: 256 }).notNull(),
	price: decimal("price", {
		precision: 15,
		scale: 2,
	}).notNull(),
	category: varchar("category", { length: 256 }).notNull(),
	specifications: text("specifications").notNull(),
	unit: varchar("unit", { length: 256 }).notNull(),
	created_at: timestamp("created_at").defaultNow(),
	updated_at: timestamp("updated_at").defaultNow(),
	reference: text("reference").notNull(),
});

export type Item = InferSelectModel<typeof items>;
export type NewItem = InferInsertModel<typeof items>;
