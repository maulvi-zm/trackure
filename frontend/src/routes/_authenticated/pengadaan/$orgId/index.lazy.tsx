import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import SuperAdminHeader from "@/components/super-admin-page/SuperAdminHeader";
import DaftarPengadaan from "@/components/pengadaan/DaftarPengadaan";
import { getProcurements } from "@/api/procurement";

export const Route = createLazyFileRoute("/_authenticated/pengadaan/$orgId/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { orgId } = Route.useParams();
	const { data, isLoading, error } = useQuery(getProcurements(Number(orgId)));

	return (
		<div className="h-full w-full flex flex-col font-jakarta gap-y-4">
			<SuperAdminHeader judulHalaman="Pengadaan" />
			<DaftarPengadaan data={data} isLoading={isLoading} error={error} />
		</div>
	);
}
