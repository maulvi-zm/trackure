import { z } from "zod";

// Maybe there will some different api responses in the future, so the response is defined differently

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
});
export type InternalErrorResponse = z.infer<typeof InternalErrorResponseSchema>;
