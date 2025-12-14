import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	beforeLoad: async ({ context }) => {
		if (!context.auth.isAuthenticated) {
			throw redirect({ to: "login" });
		}

		if (context.roles.length !== 0) {
			throw redirect({ to: "/dashboard" });
		}

		throw redirect({ to: "/not-allowed" });
	},
});
