import { z } from "zod";

export const KaprodiDashboardRequestSchema = z.object({
	userId: z.number(),
});

export const BudgetSummarySchema = z.object({
	totalBudget: z.number(),
	estimatedRemainingBudget: z.number(),
	realRemainingBudget: z.number(),
	year: z.number(),
});

export const ProcurementSummarySchema = z.object({
	onGoing: z.number(),
	rejected: z.number(),
	completed: z.number(),
	total: z.number(),
});

export const ProcurementItemSchema = z.object({
	itemCode: z.string(),
	itemName: z.string(),
	quantity: z.number(),
	receiverName: z.string(),
	photoUrl: z.string().optional(),
	status: z.string(),
});

export const KaprodiDashboardResponseSchema = z.object({
	success: z.boolean(),
	organizationName: z.string(),
	budget: BudgetSummarySchema,
	procurements: ProcurementSummarySchema,
	recentItems: z.array(ProcurementItemSchema),
});

export type KaprodiDashboardRequest = z.infer<
	typeof KaprodiDashboardRequestSchema
>;
export type BudgetSummary = z.infer<typeof BudgetSummarySchema>;
export type ProcurementSummary = z.infer<typeof ProcurementSummarySchema>;
export type ProcurementItem = z.infer<typeof ProcurementItemSchema>;
export type KaprodiDashboardResponse = z.infer<
	typeof KaprodiDashboardResponseSchema
>;

export const UnauthorizedResponseSchema = z.object({
	error: z.string(),
});

export const BadRequestResponseSchema = z.object({
	error: z.string(),
});

export const InternalErrorResponseSchema = z.object({
	error: z.string(),
});
