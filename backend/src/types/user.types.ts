import { z } from "zod";

export const CreateUserRequest = z.object({
	username: z.string(),
	email: z.string(),
	organization: z.string().optional(),
	role: z.string(),
});

export const DeleteUserRequest = z.object({
	userId: z.number(),
	organizationId: z.number(),
	roleId: z.number(),
});

export const ChangeUserActivationRequest = z.object({
	userId: z.number(),
	is_active: z.boolean(),
});

export const UpdateUserRequest = z.object({
	userId: z.number(),
	username: z.string().optional(),
	email: z.string().optional(),
	isActive: z.boolean().optional(),
});

export const CreateUserResponseData = z.object({
	id: z.number(),
	username: z.string(),
	email: z.string(),
	updated_at: z.string(),
	is_active: z.boolean(),
});

export const UpdateUserResponseData = z.object({
	id: z.number(),
	username: z.string(),
	email: z.string(),
	is_active: z.boolean(),
});

export const UserResponseData = z.object({
	userId: z.number(),
	username: z.string(),
	organizationId: z.number(),
	organizationName: z.string(),
	roleId: z.number(),
	roleName: z.string(),
	email: z.string(),
	isActive: z.boolean(),
});

export const UsersResponse = z.object({
	success: z.boolean(),
	data: z.array(UserResponseData),
	error: z.string().optional(),
});

export const UserResponse = z.object({
	success: z.boolean(),
	data: UserResponseData,
	error: z.string().optional(),
});

export const DeleteResponse = z.object({
	success: z.boolean(),
	message: z.string().optional(),
	error: z.string().optional(),
});

export type CreateUserRequestSchema = z.infer<typeof CreateUserRequest>;
export type DeleteUserRequestSchema = z.infer<typeof DeleteUserRequest>;
export type ChangeUserActivationRequestSchema = z.infer<
	typeof ChangeUserActivationRequest
>;
export type DeleteResponseSchema = z.infer<typeof DeleteResponse>;
export type UpdateUserRequestSchema = z.infer<typeof UpdateUserRequest>;
export type UserResponseDataSchema = z.infer<typeof UserResponseData>;
export type UserResponseSchema = z.infer<typeof UserResponse>;
export type UsersResponseSchema = z.infer<typeof UsersResponse>;
