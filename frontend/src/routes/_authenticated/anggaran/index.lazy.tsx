import { getDashboardAdminOptions } from "@/api/dashboard";
import BudgetDashboard from "@/components/dashboard/BudgetDashboard";
import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/_authenticated/anggaran/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data, isLoading, error } = useQuery(getDashboardAdminOptions);

	return <BudgetDashboard data={data} isLoading={isLoading} error={error} />;
}
