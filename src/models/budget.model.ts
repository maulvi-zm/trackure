import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
	decimal,
	integer,
	pgTable,
	serial,
	timestamp,
} from "drizzle-orm/pg-core";
import { organizations } from "./organization.model";

export const budgets = pgTable("budgets", {
	id: serial("id").primaryKey(),
	organization_id: integer("organization_id").references(
		() => organizations.id,
	),
	total_budget: decimal("total_budget", { precision: 15, scale: 2 }).notNull(),
	remaining_budget: decimal("remaining_budget", {
		precision: 15,
		scale: 2,
	}).notNull(),
	year: integer("year").notNull(),
	created_at: timestamp("created_at").notNull(),
	updated_at: timestamp("updated_at").notNull(),
});

export type Budget = InferSelectModel<typeof budgets>;
export type NewBudget = InferInsertModel<typeof budgets>;
