import { createLazyFileRoute } from "@tanstack/react-router";
import PrintNumber from "@/components/printNumber/PrintNumber";
import { useQuery } from "@tanstack/react-query";
import { getPrintNumberData } from "@/api/printNumber";

export const Route = createLazyFileRoute("/_authenticated/print-number/")({
	component: () => RouteComponent(),
});

function RouteComponent() {
	const { data, isLoading, error } = useQuery(getPrintNumberData);

	return (
		<div className="h-full w-full flex flex-col font-jakarta gap-y-4">
			<PrintNumber data={data} error={error} isLoading={isLoading} />
		</div>
	);
}
