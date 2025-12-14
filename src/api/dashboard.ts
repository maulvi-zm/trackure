import api from "@/lib/axios";
import { queryOptions } from "@tanstack/react-query";

export const getDashboardAdminOptions = queryOptions({
	queryKey: ["AdminDashboardData"],
	queryFn: async () => {
		const response = await api.get("/dashboard/admin");

		if (!response.status) {
			throw new Error("Failed to fetch budget data");
		}

		return response.data;
	},
});
export const getDashboardKaprodi = queryOptions({
	queryKey: ["PemohonDashboardData"],
	queryFn: async () => {
		const response = await api.get("/dashboard/pemohon");
		if (!response.status) {
			throw new Error("Failed to fetch dashboard data");
		}
		return response.data;
	},
	staleTime: 1000 * 60 * 5,
});
