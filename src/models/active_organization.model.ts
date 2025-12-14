import { integer, pgTable } from "drizzle-orm/pg-core";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { users } from "./user.model";
import { organizations } from "./organization.model";

export const activeOrganization = pgTable("active_organization", {
	user_id: integer("user_id")
		.primaryKey()
		.notNull()
		.references(() => users.id),
	organization_id: integer("organization_id")
		.references(() => organizations.id)
		.notNull(),
});

// Type definitions
export type ActiveOrganization = InferSelectModel<typeof activeOrganization>;
export type NewActiveOrganization = InferInsertModel<typeof activeOrganization>;
