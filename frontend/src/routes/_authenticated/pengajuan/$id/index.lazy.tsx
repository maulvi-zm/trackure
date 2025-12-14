import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import ArrowCircle from "@/assets/icons/arrow-circle-left.svg";
import { InfoCard } from "@/components/cards/InfoCard";
import NoPemohon from "@/assets/icons/no-pemohon.svg";
import TglPemohon from "@/assets/icons/tgl-pemohon.svg";
import TotalHarga from "@/assets/icons/total-harga.svg";
import StatusPengajuan from "@/assets/icons/status-pengajuan.svg";
import { CheckCircle, FileText, Truck } from "lucide-react";
import { ProcurementStatus, UserRole } from "@/lib/interfaces";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency, formatDate, isStatusPassed } from "@/lib/utils";
import { StatusForm } from "@/components/tracker/StatusForm";
import { StatusPreview } from "@/components/tracker/StatusPreview";
import { LogActivity } from "@/components/tracker/LogActivity";
import { ProcessDetail } from "@/components/tracker/ProcessDetail";
import { getProcurement } from "@/api/procurement";
export const Route = createLazyFileRoute("/_authenticated/pengajuan/$id/")({
	component: RouteComponent,
});

function RouteComponent() {
	const { id } = Route.useParams();
	const { data, isLoading, error, refetch } = useQuery(getProcurement(id));
	const { roles } = Route.useRouteContext();
	const [activeStatus, setActiveStatus] = useState<ProcurementStatus | null>(
		null,
	);
	useEffect(() => {
		if (data) {
			setActiveStatus(data.status);
		}
	}, [data]);

	const statusTimeline = [
		{
			icon: <FileText className="h-5 w-5" />,
			title: ProcurementStatus.PENGAJUAN,
		},
		{
			icon: <CheckCircle className="h-5 w-5" />,
			title: ProcurementStatus.VERIFIKASI_PENGAJUAN,
		},
		{
			icon: <CheckCircle className="h-5 w-5" />,
			title: ProcurementStatus.PENGIRIMAN_ORDER,
		},
		{
			icon: <Truck className="h-5 w-5" />,
			title: ProcurementStatus.PENGIRIMAN_BARANG,
		},
		{
			icon: <CheckCircle className="h-5 w-5" />,
			title: ProcurementStatus.PENERIMAAN_BARANG,
		},
		{
			icon: <FileText className="h-5 w-5" />,
			title: ProcurementStatus.PENYERAHAN_BARANG,
		},
		{
			icon: <FileText className="h-5 w-5" />,
			title: ProcurementStatus.SELESAI,
		},
	];

	if (isLoading || !activeStatus) {
		return <div className="container p-4 mx-auto">Loading...</div>;
	}

	if (error) {
		return (
			<div className="container p-4 mx-auto">
				<p className="text-red-500">Error: {error.message}</p>
			</div>
		);
	}

	return (
		<div className="container flex-row p-4 mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div className="flex items-center gap-3">
					<Link to={"/dashboard"} className="rounded-full p-2 border">
						<img
							src={ArrowCircle || "/placeholder.svg"}
							alt="Back"
							className="w-5 h-5"
						/>
					</Link>
					<h1 className="text-2xl font-bold">Detail Pengajuan</h1>
				</div>
				<div className="flex items-center gap-2">
					<span className="text-blue-500 font-medium">{roles || "User"}</span>
				</div>
			</div>
			{/* Info Cards */}
			<div className="flex flex-wrap justify-between w-full border border-[#DDDDDD] rounded-[12px] p-4">
				<InfoCard
					icon={
						<img
							src={NoPemohon || "/placeholder.svg"}
							className="w-full h-full"
							alt="Icon"
						/>
					}
					title="Nomor Pengajuan"
					value={data.id}
				/>

				<InfoCard
					icon={
						<img
							src={TglPemohon || "/placeholder.svg"}
							className="w-full h-full"
							alt="Icon"
						/>
					}
					title="Tanggal Pengajuan"
					value={formatDate(new Date(data.created_at))}
				/>

				<InfoCard
					icon={
						<img
							src={TotalHarga || "/placeholder.svg"}
							className="w-full h-full"
							alt="Icon"
						/>
					}
					title="Total Harga Asumsi"
					value={formatCurrency(data.estimated_price * data.quantity)}
				/>

				<InfoCard
					icon={
						<img
							src={TotalHarga || "/placeholder.svg"}
							className="w-full h-full"
							alt="Icon"
						/>
					}
					title="Total Harga Nyata"
					value={
						data.item_id
							? formatCurrency(Number.parseInt(data.item.price) * data.quantity)
							: "Belum ada"
					}
				/>

				<InfoCard
					icon={
						<img
							src={StatusPengajuan || "/placeholder.svg"}
							className="w-full h-full"
							alt="Icon"
						/>
					}
					title="Status Sekarang"
					value={data.status}
				/>
			</div>

			{/* Timeline */}
			<div className="border border-[#DDDDDD] rounded-[12px] p-4">
				{statusTimeline.length > 0 && (
					<div className="relative px-4 py-2">
						<div className="absolute top-6 left-0 right-0 border-t-2 border-dashed border-blue-300" />
						<div className="flex justify-between relative">
							{statusTimeline.map((status) => (
								<button
									type="button"
									key={status.title}
									className={`flex flex-col items-center ${
										isStatusPassed(
											data.status as ProcurementStatus,
											status.title as ProcurementStatus,
										)
											? "cursor-pointer"
											: "cursor-not-allowed"
									}`}
									onClick={() => {
										if (
											status.title === ProcurementStatus.VERIFIKASI_PENGAJUAN &&
											data.status === ProcurementStatus.PENGAJUAN_DITOLAK
										) {
											setActiveStatus(ProcurementStatus.PENGAJUAN_DITOLAK);
										} else {
											setActiveStatus(status.title);
										}
									}}
									disabled={
										!isStatusPassed(
											data.status as ProcurementStatus,
											status.title as ProcurementStatus,
										)
									}
								>
									{/* Icon */}
									<div
										className={`rounded-full p-3 z-10 ${
											data.status === ProcurementStatus.PENGAJUAN_DITOLAK &&
											status.title === ProcurementStatus.VERIFIKASI_PENGAJUAN
												? "bg-red-500 text-white"
												: isStatusPassed(
															data.status as ProcurementStatus,
															status.title as ProcurementStatus,
														)
													? "bg-blue-500 text-white"
													: "bg-white border-1 border-blue-500 text-blue-500"
										}`}
									>
										{status.icon}
									</div>

									{/* Title */}
									<p
										className={`mt-2 text-sm font-medium ${
											data.status === ProcurementStatus.PENGAJUAN_DITOLAK &&
											status.title === ProcurementStatus.VERIFIKASI_PENGAJUAN
												? "text-red-500"
												: isStatusPassed(
															data.status as ProcurementStatus,
															status.title as ProcurementStatus,
														)
													? "text-blue-500"
													: ""
										}`}
									>
										{status.title}
									</p>
								</button>
							))}
						</div>
					</div>
				)}
			</div>
			{/* Detail Process and Activity Log */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6 ">
				{/* Detail Process - Conditional rendering based on role */}
				{roles == UserRole.ADMIN ? (
					<StatusForm status={activeStatus} data={data} refetch={refetch} />
				) : (
					<ProcessDetail status={activeStatus} data={data} />
				)}
				{/* Activity Log - Conditional rendering based on role */}
				{roles == UserRole.ADMIN ? (
					<StatusPreview status={activeStatus} data={data} />
				) : (
					<LogActivity />
				)}
			</div>
		</div>
	);
}
