import { getProcurements } from "@/api/procurement";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/pengadaan/$orgId/")({
	beforeLoad: ({ context }) => {
		if (context.roles.includes("REQUESTER")) {
			throw redirect({
				to: "/dashboard",
			});
		}
		if (context.roles.includes("USER_PRINT_NUMBER")) {
			throw redirect({
				to: "/print-number",
			});
		}
	},
	loader: ({ context, params }) =>
		context.queryClient.ensureQueryData(getProcurements(Number(params.orgId))),
});
