import { getProcurement } from "@/api/procurement";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/pengajuan/$id/")({
	beforeLoad: ({ context }) => {
		if (context.roles.includes("SUPER_ADMIN")) {
			throw redirect({
				to: "/manajemen-user",
			});
		}
		if (context.roles.includes("USER_PRINT_NUMBER")) {
			throw redirect({
				to: "/print-number",
			});
		}
	},
	loader: ({ params, context }) =>
		context.queryClient.ensureQueryData(getProcurement(params.id)),
});
