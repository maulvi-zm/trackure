import { create } from "zustand";
import {
	clearActiveOrganization,
	getActiveOrganization,
	getUserOrganizations,
} from "@/api/organization";
import { getRoles } from "@/api/user";

export type Role =
	| "REQUESTER"
	| "DEVELOPER"
	| "USER_PRINT_NUMBER"
	| "ADMIN"
	| "SUPER_ADMIN";

export interface Organization {
	organizationId: number;
	organizationName: string;
}

export interface RoleResponse {
	roleId: number;
	roleName: Role;
}

export interface UserState {
	organizations: Organization[];
	activeOrganization: Organization | null;
	roles: Role[];
	fetchRoles: () => Promise<void>;
	fetchOrganizations: () => Promise<void>;
	fetchActiveOrganization: () => Promise<void>;
	setRoles: (roles: Role[]) => void;
	setOrganizations: (organizations: Organization[]) => void;
	setActiveOrganization: (organization: Organization | null) => void;
	changeActiveOrganization: (organizationId: number) => Promise<void>;
	isRequester: boolean;
	isDeveloper: boolean;
	isUserPrintNumber: boolean;
	isAdmin: boolean;
	isLoading: boolean;
	isSuperAdmin: boolean;
}

export const useOrganizationStore = create<UserState>((set, get) => ({
	organizations: [],
	roles: [],
	activeOrganization: null,
	isLoading: false,

	fetchRoles: async () => {
		set({ isLoading: true });
		try {
			const response = await getRoles();
			if (response) {
				const roleNames = response.map((val) => val.roleName);
				set({ roles: roleNames });
			}
		} catch (error) {
			console.error("Error fetching roles:", error);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchOrganizations: async () => {
		set({ isLoading: true });
		try {
			const response = await getUserOrganizations();
			if (response) {
				set({ organizations: response });
			}
		} catch (error) {
			console.error("Error fetching organizations:", error);
		} finally {
			set({ isLoading: false });
		}
	},

	fetchActiveOrganization: async () => {
		set({ isLoading: true });
		try {
			const response = await getActiveOrganization();
			if (response) {
				set({ activeOrganization: response });
			}
		} catch (error) {
			console.error("Error fetching active organization:", error);
		} finally {
			set({ isLoading: false });
		}
	},

	setRoles: (roles) => {
		set({ roles });
	},

	setOrganizations: (organizations) => {
		set({ organizations });
	},

	setActiveOrganization: (organization: Organization | null) => {
		set({ activeOrganization: organization });
	},

	changeActiveOrganization: async (organizationId: number) => {
		set({ isLoading: true });
		try {
			await clearActiveOrganization(organizationId);
			await get().fetchOrganizations(); // Refresh organization list
			await get().fetchActiveOrganization(); // Refresh active organization
			await get().fetchRoles(); // Refresh roles
		} catch (error) {
			console.error("Error changing organization:", error);
		} finally {
			set({ isLoading: false });
		}
	},

	get isRequester() {
		return get().roles.includes("REQUESTER");
	},

	get isDeveloper() {
		return get().roles.includes("DEVELOPER");
	},

	get isUserPrintNumber() {
		return get().roles.includes("USER_PRINT_NUMBER");
	},

	get isAdmin() {
		return get().roles.includes("ADMIN");
	},

	get isSuperAdmin() {
		return get().roles.includes("SUPER_ADMIN");
	},
}));
