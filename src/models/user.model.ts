import {
	integer,
	pgTable,
	varchar,
	timestamp,
	text,
	boolean,
	primaryKey,
	serial,
} from "drizzle-orm/pg-core";
import {
	relations,
	type InferInsertModel,
	type InferSelectModel,
} from "drizzle-orm";
import { organizations } from "./organization.model";
import { procurements } from "./procurement.model";
import { userActivityLogs } from "./user_activity_log.model";
import { Role as roleEnum } from "../types/authz.types";

export const users = pgTable("users", {
	id: serial("id").primaryKey(),
	username: varchar("username", { length: 256 }).notNull(),
	email: varchar("email", { length: 256 }).notNull().unique(),
	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
	is_active: boolean("is_active").notNull().default(true),
});

export const userRelations = relations(users, ({ many }) => ({
	procurements: many(procurements),
	logs: many(userActivityLogs),
	userOrganizationRoles: many(userOrganizationRoles),
}));

export const roles = pgTable("roles", {
	id: integer("id").primaryKey(),
	name: varchar("name", {
		length: 256,
		enum: Object.values(roleEnum) as [string, ...string[]],
	}).notNull(),
	description: text("description").notNull(),
});

export const roleRelations = relations(roles, ({ many }) => ({
	userOrganizationRoles: many(userOrganizationRoles),
}));

export const userOrganizationRoles = pgTable(
	"user_organization_roles",
	{
		user_id: integer("user_id")
			.notNull()
			.references(() => users.id),
		organization_id: integer("organization_id")
			.notNull()
			.references(() => organizations.id),
		role_id: integer("role_id")
			.notNull()
			.references(() => roles.id),
	},
	(table) => [
		primaryKey({
			name: "unq_user_org_role",
			columns: [table.user_id, table.organization_id, table.role_id],
		}),
	],
);

export const userOrganizationRoleRelations = relations(
	userOrganizationRoles,
	({ one }) => ({
		user: one(users, {
			fields: [userOrganizationRoles.user_id],
			references: [users.id],
		}),
		role: one(roles, {
			fields: [userOrganizationRoles.role_id],
			references: [roles.id],
		}),
		organization: one(organizations, {
			fields: [userOrganizationRoles.organization_id],
			references: [organizations.id],
		}),
	}),
);

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
export type Role = InferSelectModel<typeof roles>;
export type NewRole = InferInsertModel<typeof roles>;
export type UserOrganizationRole = InferSelectModel<
	typeof userOrganizationRoles
>;
export type NewUserOrganizationRole = InferInsertModel<
	typeof userOrganizationRoles
>;
export interface UserWithRoles extends User {
	userOrganizationRoles: (UserOrganizationRole & {
		role: Role;
		organization: {
			id: number;
			name: string;
		};
	})[];
}

export { organizations, procurements };
