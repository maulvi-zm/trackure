import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import BarangPemohonDashboard from "@/components/dashboard/BarangPemohonDashboard";
import { getDashboardKaprodi } from "@/api/dashboard";
import { getItems } from "@/api/item";
export const Route = createLazyFileRoute("/_authenticated/dashboard/")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		data: dashboardData,
		isLoading: isDashboardLoading,
		error: dashboardError,
	} = useQuery(getDashboardKaprodi);

	const {
		data: itemsData,
		isLoading: isItemsLoading,
		error: itemsError,
	} = useQuery(getItems);

	return (
		<BarangPemohonDashboard
			dashboardData={{
				data: dashboardData,
				isLoading: isDashboardLoading,
				error: dashboardError,
			}}
			itemsData={{
				data: itemsData,
				isLoading: isItemsLoading,
				error: itemsError,
			}}
		/>
	);
}
