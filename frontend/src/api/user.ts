import type { UserType } from "@/types/UserType";
import api from "../lib/axios";
import type { RoleResponse } from "@/stores/useOrganization";

export const getRoles = async () => {
	const response = await api.get<RoleResponse[]>("/authz/role", {
		headers: { "Cache-Control": "no-cache" },
	});

	return response.data;
};

export const getUsers = async () => {
	const response = await api.get<{ data: UserType[] }>("/user");
	return response.data.data;
};

export const getActiveUser = async (userId: number, is_active: boolean) => {
	const response = await api.post("/user/active", { userId, is_active });
	return response;
};

export const createUser = async (payload: {
	username: string;
	email: string;
	role: string;
	organization: string;
}) => {
	const response = await api.post("/user", payload);
	return response;
};

export const deleteUser = async (payload: {
	userId: number;
	roleId: number;
	organizationId: number;
}) => {
	const response = await api.delete("/user", { data: payload });
	return response;
};

export const updateUser = async (payload: {
	userId: number;
	username: string;
	email: string;
}) => {
	const response = await api.patch("/user", payload);
	return response;
};

export const addUserRole = async (data: {
	userId: number;
	roleName: string;
	organizationName: string;
}) => {
	const response = await api.post("/user/role", data);
	return response;
};
