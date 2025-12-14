import { getItems } from "@/api/item";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/daftar-barang/")({
	beforeLoad: ({ context }) => {
		if (context.roles.includes("REQUESTER")) {
			throw redirect({
				to: "/dashboard",
			});
		}
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
	loader: ({ context }) => context.queryClient.ensureQueryData(getItems),
});
