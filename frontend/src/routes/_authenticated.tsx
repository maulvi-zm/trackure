import SidebarMenu from "@/components/SidebarMenu";
import Wrapper from "@/components/Wrapper";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated")({
	beforeLoad: ({ context, location }) => {
		if (context.roles.length === 0) throw redirect({ to: "/not-allowed" });

		if (!context.auth.isAuthenticated) {
			throw redirect({
				to: "/login",
				search: {
					redirect: location.href,
				},
			});
		}
	},
	component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
	return (
		<>
			<SidebarMenu />
			<Wrapper>
				<div className="app-layout">
					<main className="content">
						<Outlet />
					</main>
				</div>
			</Wrapper>
		</>
	);
}
