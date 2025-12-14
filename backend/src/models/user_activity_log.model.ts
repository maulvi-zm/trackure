import { integer, pgTable, timestamp, text, serial } from "drizzle-orm/pg-core";
import {
	relations,
	type InferInsertModel,
	type InferSelectModel,
} from "drizzle-orm";
import { roles, users } from "./user.model";
import { organizations } from "./organization.model";

export const userActivityLogs = pgTable("user_activity_logs", {
	id: serial("id").primaryKey(),
	user_id: integer("user_id")
		.notNull()
		.references(() => users.id),
	organization_id: integer("organization_id").references(
		() => organizations.id,
	),
	role_id: integer("role_id")
		.notNull()
		.references(() => roles.id),
	activity: text().default(""),
	timestamp: timestamp("created_at").notNull().defaultNow(),
});

export const userActivityLogRelations = relations(
	userActivityLogs,
	({ one }) => ({
		user: one(users, {
			fields: [userActivityLogs.user_id],
			references: [users.id],
		}),
	}),
);

// Type definitions
export type UserActivityLog = InferSelectModel<typeof userActivityLogs>;
export type NewUserActivityLog = InferInsertModel<typeof userActivityLogs>;
