import { getActivityLogs } from "@/api/activityLog";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/aktivitas-log/")({
	beforeLoad: ({ context }) => {
		if (context.roles.includes("REQUESTER")) {
			throw redirect({
				to: "/dashboard",
			});
		}
		if (context.roles.includes("ADMIN")) {
			throw redirect({
				to: "/anggaran",
			});
		}
		if (context.roles.includes("USER_PRINT_NUMBER")) {
			throw redirect({
				to: "/print-number",
			});
		}
	},
	loader: ({ context }) => context.queryClient.ensureQueryData(getActivityLogs),
});
