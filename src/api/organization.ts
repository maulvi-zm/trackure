import type { Organization } from "@/stores/useOrganization";
import type { OrganizationType } from "@/types/OganizationType";
import api from "../lib/axios";

export const getUserOrganizations = async () => {
	const response = await api.get<Organization[]>("/organization/user");
	return response.data;
};

export const getOrganizations = async () => {
	const res = await api.get<OrganizationType[]>("/organization");
	return res.data;
};

export const getActiveOrganization = async () => {
	const response = await api.get<Organization>("/organization/active");
	return response.data;
};

export const clearActiveOrganization = async (organizationId: number) => {
	const response = await api.post(`/organization/change/${organizationId}`);
	return response.data;
};

export const createOrganization = async (newOrg: { name: string }) => {
	const response = await api.post("/organization", newOrg);
	return response.data;
};

export const updateOrganization = async (data: {
	organizationId: number;
	name: string;
}) => {
	const response = await api.put(`/organization/${data.organizationId}`, {
		name: data.name,
	});
	return response.data;
};

export const updateOrganizationBudget = async (data: {
	organizationId: number;
	totalBudget: number;
	year: number;
}) => {
	const response = await api.put(
		`/budget/organization/${data.organizationId}`,
		{
			totalBudget: data.totalBudget,
			year: data.year,
		},
	);
	return response.data;
};
