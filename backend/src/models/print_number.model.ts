import {
	integer,
	text,
	timestamp,
	boolean,
	pgTable,
	primaryKey,
	serial,
} from "drizzle-orm/pg-core";
import {
	relations,
	type InferInsertModel,
	type InferSelectModel,
} from "drizzle-orm";
import { procurements, users } from "./user.model";

export const printNumbers = pgTable("print_number", {
	id: serial("id").primaryKey(),
	print_number: text("print_number").notNull(),
	person_in_charge: integer("person_in_charge")
		.notNull()
		.references(() => users.id),
	proof_photo: text("proof_photo"), // Foto Bukti Penerimaan
	created_at: timestamp("created_at").notNull().defaultNow(),
	updated_at: timestamp("updated_at").notNull().defaultNow(),
	receive_date: timestamp("receive_date"),
	is_active: boolean("is_active").notNull().default(true),
});

// Create a junction table for the many-to-many relationship
export const printNumberToProcurements = pgTable(
	"print_number_to_procurements",
	{
		print_number_id: integer("print_number_id")
			.notNull()
			.references(() => printNumbers.id),
		procurement_id: integer("procurement_id")
			.notNull()
			.references(() => procurements.id),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.print_number_id, t.procurement_id] }),
	}),
);

export const printNumberRelations = relations(
	printNumbers,
	({ one, many }) => ({
		person_in_charge: one(users, {
			fields: [printNumbers.person_in_charge],
			references: [users.id],
		}),
		procurementItems: many(printNumberToProcurements),
	}),
);

export const printNumberToProcurementsRelations = relations(
	printNumberToProcurements,
	({ one }) => ({
		printNumber: one(printNumbers, {
			fields: [printNumberToProcurements.print_number_id],
			references: [printNumbers.id],
		}),
		procurement: one(procurements, {
			fields: [printNumberToProcurements.procurement_id],
			references: [procurements.id],
		}),
	}),
);

// Type definitions
export type PrintNumber = InferSelectModel<typeof printNumbers>;
export type NewPrintNumber = InferInsertModel<typeof printNumbers>;
export type PrintNumberToProcurement = InferSelectModel<
	typeof printNumberToProcurements
>;
export type NewPrintNumberToProcurement = InferInsertModel<
	typeof printNumberToProcurements
>;
