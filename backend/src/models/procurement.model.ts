import {
	integer,
	pgTable,
	varchar,
	timestamp,
	text,
	decimal,
	serial,
} from "drizzle-orm/pg-core";
import { users } from "./user.model";
import { organizations } from "./organization.model";
import { items } from "./item.model";
import {
	relations,
	type InferInsertModel,
	type InferSelectModel,
} from "drizzle-orm";

export enum ProcurementStatus {
	PENGAJUAN = "Pengajuan",
	VERIFIKASI_PENGAJUAN = "Verifikasi Pengajuan",
	PENGAJUAN_DITOLAK = "Pengajuan Ditolak",
	PENGIRIMAN_ORDER = "Pengiriman Order",
	PENGIRIMAN_BARANG = "Pengiriman Barang",
	PENERIMAAN_BARANG = "Penerimaan Barang",
	PENYERAHAN_BARANG = "Penyerahan Barang",
	SELESAI = "Selesai",
}

export const procurements = pgTable("procurements", {
	// Core Fields
	id: serial("id").primaryKey(),
	requester_id: integer("requester_id").references(() => users.id),
	organization: integer("organization").references(() => organizations.id),
	status: varchar("status", {
		length: 256,
		enum: Object.values(ProcurementStatus) as [string, ...string[]],
	}).notNull(),
	created_at: timestamp("created_at").notNull(),
	updated_at: timestamp("updated_at").notNull(),

	// Initial Request Fields
	estimated_price: decimal("estimated_price", {
		precision: 15,
		scale: 2,
	}).notNull(), // Estimasi Harga oleh Pemohon
	reference: varchar("reference", { length: 2048 }), // URL Referensi atau kode master barang
	quantity: integer("quantity").notNull(), // Qty
	request_date: timestamp("request_date").notNull(), // Tgl. Permohonan

	// Verified Request Fields
	item_id: integer("item_id").references(() => items.id),
	verification_note: text("verification_note"), // Keterangan
	verification_date: timestamp("verification_date"), // Tgl. Verifikasi

	// PO Fields (simplified, no separate table)
	po_document: varchar("po_document", { length: 512 }), // Dok. PO
	po_date: timestamp("po_date"), // Tgl. PO

	time_estimation: varchar("time_estimation", { length: 265 }), // Estimasi Waktu Pengiriman
	time_estimation_date: timestamp("time_estimation_date"), // Tgl. Estimasi Waktu Pengiriman

	// Receipt Fields
	bast_document: varchar("bast_document", { length: 512 }), // Dok. BAST
	bast_date: timestamp("bast_date"), // Tgl. BAST

	// Finalization Fields
	final_note: text("final_note"), // Keterangan
});

export const procurementRelations = relations(procurements, ({ one }) => ({
	requester: one(users, {
		fields: [procurements.requester_id],
		references: [users.id],
	}),
	organization: one(organizations, {
		fields: [procurements.organization],
		references: [organizations.id],
	}),
	item: one(items, {
		fields: [procurements.item_id],
		references: [items.id],
	}),
}));

export type NewProcurement = InferInsertModel<typeof procurements>;
export type Procurement = InferSelectModel<typeof procurements>;
