import { z } from "zod";

export const UserPrintNumberRequestSchema = z.object({
	userId: z.number(),
});

export const UserPrintNumberResponseSchema = z.array(
	z.object({
		printNumber: z.string(),
		attachment: z.string().nullable(),
		status: z.string(),
	}),
);

export type UserPrintNumberRequest = z.infer<
	typeof UserPrintNumberRequestSchema
>;
export type UserPrintNumberResponse = z.infer<
	typeof UserPrintNumberResponseSchema
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

export const ListBarangResponseSchema = z.array(
	z.object({
		item_name: z.string(),
		quantity: z.number(),
		unit: z.string(),
	}),
);

export type ListBarangResponse = z.infer<typeof ListBarangResponseSchema>;

export const PhotoUploadResponseSchema = z.object({
	message: z.string(),
	printNumberId: z.number(),
	filePath: z.string(),
});

export type PhotoUploadResponse = z.infer<typeof PhotoUploadResponseSchema>;

export const PhotoDeleteResponseSchema = z.object({
	message: z.string(),
});

export type PhotoDeleteResponse = z.infer<typeof PhotoDeleteResponseSchema>;

export const PrintNumberIdsResponseSchema = z.array(
	z.object({
		id: z.number(),
		name: z.string(),
	}),
);

export const AssociateProcurementsRequestSchema = z.object({
	printNumber: z.string(),
	procurementIds: z.array(z.number()),
	personInCharge: z
		.union([z.number(), z.string()])
		.transform((val) => Number(val)),
});

export const AssociateProcurementsResponseSchema = z.object({
	success: z.boolean(),
	message: z.string(),
});

export type PrintNumberIdsResponse = z.infer<
	typeof PrintNumberIdsResponseSchema
>; 