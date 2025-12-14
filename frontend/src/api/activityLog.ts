import api from "@/lib/axios";
import { queryOptions } from "@tanstack/react-query";

export const getActivityLogs = queryOptions({
	queryKey: ["ActivityLogs"],
	queryFn: async () => {
		const response = await api.get("/activity");
		if (!response.status) {
			throw new Error("Failed to fetch dashboard data");
		}

		console.log(response);
		return response.data;
	},
});
