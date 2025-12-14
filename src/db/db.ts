import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as users_roles from "@/models/user.model";
import * as organizations from "@/models/organization.model";
import * as procurements from "@/models/procurement.model";
import * as userActivityLogs from "@/models/user_activity_log.model";
import * as items from "@/models/item.model";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const client = postgres(Bun.env.DATABASE_URL!);

export const db = drizzle(client, {
	schema: {
		...users_roles,
		...organizations,
		...procurements,
		...userActivityLogs,
		...items,
	},
	// logger: process.env.NODE_ENV !== "production",
});
export type Database = typeof db;
