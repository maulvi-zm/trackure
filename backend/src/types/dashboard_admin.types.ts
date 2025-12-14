import { z } from "zod";

export type ProcurementJoinResult = {
	procurements: {
		id: number;
		requester_id: number | null;
		study_program_id: number | null;
		detail_id: number | null;
		procurement_number: string;
		status: string;
		created_at: Date;
		updated_at: Date;
		estimated_price: string;
	};
	organizations: {
		id: number;
		name: string;
	} | null;
	items: {
		id: number;
		item_code: string;
		item_name: string;
		price: string;
		category: string;
		specifications: string;
		unit: string;
		created_at: Date;
		updated_at: Date;
		reference: string;
	} | null;
};

export const ProgramStudiSummarySchema = z.object({
	organizationId: z.number(),
	organization: z.string(),
	year: z.number(),
	total_budget: z.number(),
	remaining_budget: z.number(),
	procurements_total: z.number(),
	status: z.record(z.string(), z.number()),
});

export type ProgramStudiSummary = z.infer<typeof ProgramStudiSummarySchema>;

export const AdminDashboardResponseSchema = z.object({
	success: z.boolean(),
	programStudiList: z.array(ProgramStudiSummarySchema),
});

export type AdminDashboardResponse = z.infer<
	typeof AdminDashboardResponseSchema
>;

export const AdminDashboardRequestSchema = z.object({}).optional();
export type AdminDashboardRequest = z.infer<typeof AdminDashboardRequestSchema>;

export const OrganizationDetailRequestSchema = z.object({
	userId: z.number(),
	organizationId: z.number(),
});

export type OrganizationDetailRequest = z.infer<
	typeof OrganizationDetailRequestSchema
>;

export const BudgetSchema = z
	.object({
		total: z.number(),
		remaining: z.number(),
		year: z.number(),
	})
	.nullable();

export const ProcurementStatusCountsSchema = z.object({
	statusCounts: z.record(z.string(), z.number()),
});

export const OrganizationDetailSchema = z.object({
	id: z.number(),
	name: z.string(),
	code: z.string().nullable(),
});

export const OrganizationDetailResponseSchema = z.object({
	success: z.boolean(),
	organization: OrganizationDetailSchema,
	budget: BudgetSchema,
	procurements: ProcurementStatusCountsSchema,
});

export type OrganizationDetailResponse = z.infer<
	typeof OrganizationDetailResponseSchema
>;

export const ProcurementItemSchema = z.object({
	id: z.number(),
	nama: z.string(),
	organisasi: z.string(),
	bidang: z.string(),
	tanggal: z.string(),
	qty: z.number(),
	jumlah: z.number(), // Total amount (quantity * price)
	referensi: z.string().nullable(),
	status: z.string(),
});

export type ProcurementItem = z.infer<typeof ProcurementItemSchema>;

export const ProcurementListResponseSchema = z.object({
	success: z.boolean(),
	procurementList: z.array(ProcurementItemSchema),
});

export type ProcurementListResponse = z.infer<
	typeof ProcurementListResponseSchema
>;

export const UnauthorizedResponseSchema = z.object({
	success: z.literal(false),
	error: z.string(),
});

export type UnauthorizedResponse = z.infer<typeof UnauthorizedResponseSchema>;

export const BadRequestResponseSchema = z.object({
	success: z.literal(false),
	error: z.string(),
});

export type BadRequestResponse = z.infer<typeof BadRequestResponseSchema>;

export const NotFoundResponseSchema = z.object({
	success: z.literal(false),
	error: z.string(),
});

export type NotFoundResponse = z.infer<typeof NotFoundResponseSchema>;

export const InternalErrorResponseSchema = z.object({
	success: z.literal(false),
	error: z.string(),
	message: z.string().optional(),
});

export type InternalErrorResponse = z.infer<typeof InternalErrorResponseSchema>;
