import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import UserTable from "@/components/super-admin-page/UserTable";
import SuperAdminHeader from "@/components/super-admin-page/SuperAdminHeader";
import { getUsers } from "@/api/user";
import { getOrganizations } from "@/api/organization";

export const Route = createLazyFileRoute("/_authenticated/manajemen-user/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data: users, isLoading: isLoadingUsers, error: usersError } = useQuery({
		queryKey: ["users"],
		queryFn: getUsers,
	});

	const { data: organizations = [], isLoading: isLoadingOrgs } = useQuery({
		queryKey: ["organizations"],
		queryFn: getOrganizations,
	});

	return (
		<div className="h-full w-full flex flex-col font-jakarta gap-y-4">
			<SuperAdminHeader judulHalaman="Pengguna" />
			<UserTable 
				users={users} 
				isLoading={isLoadingUsers} 
				error={usersError}
				organizations={organizations}
				isLoadingOrgs={isLoadingOrgs}
			/>
		</div>
	);
}
