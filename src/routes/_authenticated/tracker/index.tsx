import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/tracker/")({
	beforeLoad: ({ context }) => {
		if (context.roles.includes("USER_PRINT_NUMBER")) {
			throw redirect({
				to: "/print-number",
			});
		}
		if (context.roles.includes("ADMIN")) {
			throw redirect({
				to: "/anggaran",
			});
		}
		if (context.roles.includes("SUPER_ADMIN")) {
			throw redirect({
				to: "/manajemen-user",
			});
		}
	},
});
