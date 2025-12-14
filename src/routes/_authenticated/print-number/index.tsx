import { getPrintNumberData } from "@/api/printNumber";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/print-number/")({
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
		if (context.roles.includes("SUPER_ADMIN")) {
			throw redirect({
				to: "/manajemen-user",
			});
		}
	},
	loader: ({ context }) =>
		context.queryClient.ensureQueryData(getPrintNumberData),
});
