import DaftarBarang from "@/components/admin-daftar-barang/DaftarBarang";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getItems } from "@/api/item";
export const Route = createLazyFileRoute("/_authenticated/daftar-barang/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { data, isLoading, error } = useQuery(getItems);
	return <DaftarBarang data={data} isLoading={isLoading} error={error} />;
}
