import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import SuperAdminHeader from "@/components/super-admin-page/SuperAdminHeader";
import LogActivityTable from "@/components/super-admin-page/LogActivityTable";
import { getActivityLogs } from "@/api/activityLog";

export const Route = createLazyFileRoute("/_authenticated/aktivitas-log/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data, isLoading, error } = useQuery(getActivityLogs);

	return (
		<div className="h-full w-full flex flex-col font-jakarta gap-y-4">
			<SuperAdminHeader judulHalaman="Log Aktivitas" />
			<LogActivityTable data={data} isLoading={isLoading} error={error} />
		</div>
	);
}
