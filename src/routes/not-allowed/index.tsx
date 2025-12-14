import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Ban, Grid2x2Icon } from "lucide-react";

export const Route = createFileRoute("/not-allowed/")({
	beforeLoad: ({ context }) => {
		if (!context.auth.isAuthenticated) throw redirect({ to: "/login" });

		if (context.roles.length !== 0) throw redirect({ to: "/dashboard" });
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { clearSessionStorage } = useAuth();

	return (
		<div className="h-screen w-screen bg-[#5188EE] flex flex-col md:flex-row items-center justify-center gap-12">
			<Ban className="w-40 h-40 text-white" />
			<div className="w-[80%] md:w-1/4 text-white flex flex-col gap-4 text-center md:text-left">
				<h1 className="text-3xl font-semibold">
					You're not allowed to access this website! Please contact SPSI Admin.
				</h1>
				<Button
					className="bg-white text-[#5188ee] w-fit hover:cursor-pointer hover:bg-white hover:text-[#5188ee]"
					onClick={async () => {
						await clearSessionStorage();
						window.location.href = "/login";
					}}
				>
					<Grid2x2Icon size={16} />
					Login with another account
				</Button>
			</div>
		</div>
	);
}
