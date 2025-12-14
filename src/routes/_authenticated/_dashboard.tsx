import { createFileRoute, Outlet } from "@tanstack/react-router";
import profilePic from "@/assets/avatar/SuperAdminAvatar.png";

export const Route = createFileRoute("/_authenticated/_dashboard")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col min-h-full overflow-auto">
			<header className="flex justify-between items-center ml-6 mr-6 py-1">
				<h1 className="text-3xl font-bold font-jakarta">Dasbor</h1>
				<div className="flex items-center space-x-3">
					<span className="text-blue-600 font-semibold font-jakarta">
						Pemohon
					</span>
					<img
						src={profilePic}
						alt="Admin Profile"
						width={40}
						height={40}
						className="rounded-full border"
					/>
				</div>
			</header>
			<div className="p-6 flex-1">
				<Outlet />
			</div>
		</div>
	);
}
