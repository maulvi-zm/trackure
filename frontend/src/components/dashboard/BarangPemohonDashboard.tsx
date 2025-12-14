"use client";
// Library Import
import { useState, type JSX } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProcurement } from "@/api/procurement";
import CountUp from 'react-countup';
// Component Import
import {
	DataTable,
	type DataTableColumn,
} from "@/components/tables/DataTables";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "../ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@radix-ui/react-tooltip";
import { Badge } from "../ui/badge";
import ProcurementForm, { type NewProcurement } from "./ProcurementForm";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import InputSearch from "../InputSearch";
// Icons Import
import EmptyWalletIcon from "../../assets/icons/empty-wallet.svg";
import TruckTimeIcon from "../../assets/icons/truck-time.svg";
import BoxAddIcon from "@/assets/icons/box-add.svg";
import InfoIcon from "../../assets/icons/info.svg";
import ArrowIcon from "../../assets/icons/arrow.svg";
import BoxIcon from "@/assets/icons/box.svg";
import AttachCircleIcon from "@/assets/icons/attach-circle.svg";
import CoinIcon from "@/assets/icons/coin.svg";
import UserIcon from "@/assets/icons/user.svg";
import GalleryIcon from "@/assets/icons/gallery.svg";
import { Funnel } from 'lucide-react';
// Utils Import
import { formatCurrency } from "@/lib/utils";
// Interface Import
import { ProcurementStatus, type PemohonDashboardData } from "@/lib/interfaces";
import type { Barang } from "@/lib/interfaces";
import { useToast } from "@/hooks/useToast";

export default function BarangPemohonDashboard({
	dashboardData,
	itemsData,
}: {
	dashboardData: {
		data: PemohonDashboardData | undefined;
		isLoading: boolean;
		error: Error | null;
	};
	itemsData: {
		data: Barang[] | undefined;
		isLoading: boolean;
		error: Error | null;
	};
}) {
	const [formOpen, setFormOpen] = useState(false);
	const queryClient = useQueryClient();
	const { success, error: errorToast } = useToast();
	const handleAddProcurement = async (
		newProcurement: NewProcurement,
		itemExists: boolean,
	) => {
		await createMutation.mutateAsync({ newProcurement, itemExists });
		setFormOpen(false);
	};

	const createMutation = useMutation({
		mutationFn: createProcurement,
		onSuccess: (_newProcurementData, _variables) => {
			queryClient.invalidateQueries({ queryKey: ["PemohonDashboardData"] });
			success("Pengadaan berhasil ditambahkan");
		},
		onError: (err, _variables, _context) => {
			errorToast(`Gagal menambahkan pengadaan: ${err}`);
		},
	});

	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [selectedImageUrl, setSelectedImageUrl] = useState("");
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("");

	const openImageModal = (url: string) => {
		setSelectedImageUrl(url);
		setImageModalOpen(true);
	};

	const statistics = dashboardData.data
		? [
				{
					title: "Anggaran Tersedia Estimasi",
					value: formatCurrency(dashboardData.data.budget.estimatedRemainingBudget),
					icon: EmptyWalletIcon,
					borderColor: "rgba(81, 136, 238, 0.1)",
				},
				{
					title: "Anggaran Tersedia Riil",
					value: formatCurrency(dashboardData.data.budget.realRemainingBudget),
					icon: EmptyWalletIcon,
					borderColor: "rgba(81, 136, 238, 0.1)",
				},
				{
					title: "Pengajuan On-Going/Ditolak/Selesai",
					value: `${dashboardData.data.procurements.onGoing}/${dashboardData.data.procurements.rejected}/${dashboardData.data.procurements.completed}`,
					icon: TruckTimeIcon,
					borderColor: "rgba(238, 144, 81, 0.1)",
				},
			]
		: [];

	const columns: DataTableColumn<{
		id: string;
		itemCode: string;
		itemName: string;
		quantity: number;
		receiverName: string;
		photoUrl: string;
		status: string;
		action?: JSX.Element;
		reference: string;
	}>[] = [
		{
			accessorKey: "itemCode",
			header: (
				<div className="flex items-center gap-2">
					<span>Kode Item</span>
					<img
						src={BoxIcon || "/placeholder.svg"}
						alt="Kode Item Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			cell: ({ row }) => row.original.itemCode || <span className="text-muted-foreground">Tidak Tersedia</span>,
		},
		{
			accessorKey: "itemName",
			header: (
				<div className="flex items-center gap-2">
					<span>Nama/Referensi</span>
					<img
						src={AttachCircleIcon || "/placeholder.svg"}
						alt="Nama Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			cell: ({ row }) => row.original.itemName || <a href={row.original.reference} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Referensi barang</a> || "-",
		},
		{
			accessorKey: "quantity",
			header: (
				<div className="flex items-center gap-2">
					<span>Qty</span>
					<img
						src={CoinIcon || "/placeholder.svg"}
						alt="Qty Icon"
						className="w-4 h-4"
					/>
				</div>
			),
		},
		{
			accessorKey: "receiverName",
			header: (
				<div className="flex items-center gap-2">
					<span>Nama Penerima</span>
					<img
						src={UserIcon || "/placeholder.svg"}
						alt="Nama Penerima Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			cell: ({ row }) => row.original.receiverName || "-",
		},
		{
			accessorKey: "photoUrl",
			header: (
				<div className="flex items-center gap-2">
					<span>Foto Barang</span>
					<img
						src={GalleryIcon || "/placeholder.svg"}
						alt="Foto Barang Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			cell: ({ row }) =>
				row.original.photoUrl ? (
					<button
						type="button"
						onClick={() => openImageModal(row.original.photoUrl)}
						className="text-blue-500 hover:underline cursor-pointer"
					>
						<img
							src={row.original.photoUrl || "/placeholder.svg"}
							alt={`${row.original.itemName}`}
							className="h-10 aspect-video"
						/>
					</button>
				) : (
					<span className="text-muted-foreground">Tidak tersedia</span>
				),
		},
		{
			accessorKey: "status",
			header: (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-4">
								<span>Status</span>
								<img
									src={InfoIcon || "/placeholder.svg"}
									alt="Status Icon"
									className="w-4 h-4"
								/>
							</div>
						</TooltipTrigger>
						<TooltipContent
							side="top"
							className="border-accent bg-white border-2 p-2 rounded-md w-fit"
						>
							Status pengadaan barang
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			),
			cell: ({ row }) => {
				const status = row.original.status;
				let statusColor = "bg-gray-200 text-gray-700";
				switch (status) {
					case ProcurementStatus.PENGAJUAN:
						statusColor = "bg-blue-100 text-blue-800";
						break;
					case ProcurementStatus.VERIFIKASI_PENGAJUAN:
						statusColor = "bg-yellow-100 text-yellow-800";
						break;
					case ProcurementStatus.PENGAJUAN_DITOLAK:
						statusColor = "bg-red-100 text-red-800";
						break;
					case ProcurementStatus.PENGIRIMAN_ORDER:
						statusColor = "bg-purple-100 text-purple-800";
						break;
					case ProcurementStatus.PENGIRIMAN_BARANG:
						statusColor = "bg-indigo-100 text-indigo-800";
						break;
					case ProcurementStatus.PENERIMAAN_BARANG:
						statusColor = "bg-teal-100 text-teal-800";
						break;
					case ProcurementStatus.PENYERAHAN_BARANG:
						statusColor = "bg-green-100 text-green-800";
						break;
					default:
						statusColor = "bg-gray-100 text-gray-800";
				}
				return (
					<Badge
						className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
					>
						{status}
					</Badge>
				);
			},
		},
		{
			header: (
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<div className="flex items-center gap-2">
								<span>Aksi</span>
								<img
									src={InfoIcon || "/placeholder.svg"}
									alt="Info"
									className="h-4 w-4"
								/>
							</div>
						</TooltipTrigger>
						<TooltipContent
							side="top"
							className="border-accent bg-white border-2 p-2 rounded-md"
						>
							<p>Tindakan yang dapat dilakukan pada pengajuan</p>
						</TooltipContent>
					</Tooltip>
				</TooltipProvider>
			),
			accessorKey: "action",
			cell: ({ row }) => (
				<Link
					type="button"
					className="flex items-center gap-2 rounded-full transition"
					to={`/pengajuan/${row.original.id}`}
				>
					<span className="text-sm font-jakarta">Lihat Detail</span>
					<img
						src={ArrowIcon || "/placeholder.svg"}
						alt="Arrow"
						className="h-5 w-5"
					/>
				</Link>
			),
		},
	];

	const filteredData =
		dashboardData.data?.recentItems.filter((item) => {
			// Apply status filter
			if (
				statusFilter &&
				statusFilter !== "All" &&
				item.status !== statusFilter
			) {
				return false;
			}

			// Apply search filter (case insensitive)
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				return (
					item.itemCode.toLowerCase().includes(query) ||
					item.itemName.toLowerCase().includes(query) ||
					(item.receiverName && item.receiverName.toLowerCase().includes(query))
				);
			}

			return true;
		}) || [];

	if (dashboardData.isLoading || itemsData.isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
					<p className="mt-4 text-gray-600">Memuat data...</p>
				</div>
			</div>
		);
	}

	if (dashboardData.error || itemsData.error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center text-red-500">
					<p>Terjadi kesalahan saat memuat dashboardData.data.</p>
					<button
						type="button"
						className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
						onClick={() => window.location.reload()}
					>
						Coba Lagi
					</button>
				</div>
			</div>
		);
	}
	return (
		<div className="font-jakarta flex flex-col gap-y-4">
			{/* Title */}
			{dashboardData.data && (
				<div className="shrink-0">
					<h2 className="text-2xl font-bold font-jakarta text-gray-800">
						{dashboardData.data.organizationName}
					</h2>
					<p className="text-slate-600 text-sm font-jakarta">
						Tahun Anggaran {dashboardData.data.budget.year}
					</p>
				</div>
			)}

			{/* Statistics */}
			<div className="shrink-0 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{dashboardData.data &&
					statistics.map((stat, index) => (
						<div
							key={(index + stat.title).toString()}
							className="p-4 rounded-lg flex flex-col border border-[#DDDDDD] gap-y-2"
						>
							<div className="w-full flex justify-between items-center">
								<p className="text-slate-600 font-medium font-jakarta">
									{stat.title}
								</p>
								<div
									style={{ backgroundColor: stat.borderColor }}
									className="flex items-center justify-center w-6 h-6 rounded-full "
								>
									<img
										src={stat.icon || "/placeholder.svg"}
										alt={stat.title}
										className="w-4 h-4"
									/>
								</div>
							</div>
							<p className="text-2xl font-bold font-jakarta text-gray-600">
								{stat.title === "Anggaran Tersedia" ? (
									<span>
										Rp <CountUp
										end={Number(
											stat.value
												.replace(/[^0-9.,]/g, "") 
												.replace(/\./g, "")    
												.replace(",", ".")        
										)}
									/> 
									</span>
								) : (
									<CountUp end={Number(stat.value)} />
								)}
							</p>
						</div>
					))}
			</div>

			{/* Permohonan Table */}
			<div className="flex-1 min-h-0 rounded-lg border p-4 flex flex-col gap-y-4">
				<div className="flex justify-between items-center">
					<h3 className="text-xl font-jakarta font-semibold text-gray-800">
						Daftar Pengajuan
					</h3>
					<Button
						className="bg-[#5188EE] hover:bg-[#5188EE]/90 cursor-pointer text-white flex items-center"
						onClick={() => setFormOpen(true)}
					>
						<img
							src={BoxAddIcon || "/placeholder.svg"}
							alt="Tambah"
							className="w-4 h-4"
						/>
						<span>Ajukan Barang</span>
					</Button>
				</div>

				{dashboardData.data && dashboardData.data.recentItems.length > 0 ? (
					<>
						<div className="flex gap-x-2 items-center">
							<InputSearch 
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Cari kode item, nama item, atau nama penerima..."
							/>
							<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="w-[200px] h-full flex items-center justify-start">
									<Funnel />
									<SelectValue placeholder="Filter Status" className="placeholder:text-sm text-sm" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="All">Semua Status</SelectItem>
									<SelectItem value={ProcurementStatus.PENGAJUAN}>
										Pengajuan
									</SelectItem>
									<SelectItem value={ProcurementStatus.VERIFIKASI_PENGAJUAN}>
										Verifikasi Pengajuan
									</SelectItem>
									<SelectItem value={ProcurementStatus.PENGAJUAN_DITOLAK}>
										Pengajuan Ditolak
									</SelectItem>
									<SelectItem value={ProcurementStatus.PENGIRIMAN_ORDER}>
										Pengiriman Order
									</SelectItem>
									<SelectItem value={ProcurementStatus.PENGIRIMAN_BARANG}>
										Pengiriman Barang
									</SelectItem>
									<SelectItem value={ProcurementStatus.PENERIMAAN_BARANG}>
										Penerimaan Barang
									</SelectItem>
									<SelectItem value={ProcurementStatus.PENYERAHAN_BARANG}>
										Penyerahan Barang
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{filteredData.length > 0 ? (
							<DataTable
								columns={columns}
								data={filteredData}
								pageSize={Math.max(1, Math.floor((window.innerHeight - 400) / 60))}
							/>
						) : (
							<div className="flex flex-col items-center justify-center py-8 text-center">
								<img
									src={BoxIcon || "/placeholder.svg"}
									alt="No Data"
									className="w-16 h-16 opacity-30"
								/>
								<div className="flex flex-col items-center gap-y-2">
									<p className="text-slate-600 font-jakarta text-center">
										Tidak ada data yang sesuai dengan filter
									</p>
									<p className="text-slate-400 text-sm font-jakarta text-center">
										Coba ubah filter atau kata kunci pencarian
									</p>
								</div>
							</div>
						)}
					</>
				) : (
					<div className="flex flex-col items-center justify-center py-8 text-center">
						<img
							src={BoxIcon || "/placeholder.svg"}
							alt="No Data"
							className="w-16 h-16 opacity-30"
						/>
						<div className="flex flex-col items-center gap-y-2">
							<p className="text-slate-600 font-jakarta text-center">
								Belum ada data pengajuan
							</p>
							<p className="text-slate-400 text-sm font-jakarta text-center">
								Ajukan pengajuan barang baru untuk memulai
							</p>
						</div>
					</div>
				)}
			</div>

			{/* Popup Gambar */}
			<Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
				<DialogContent className="p-0 bg-transparent border-none shadow-none">
					{selectedImageUrl && (
						<img
							src={selectedImageUrl || "/placeholder.svg"}
							alt="Foto Barang"
							className="w-full h-auto rounded-md"
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Form Dialog */}
			<ProcurementForm
				open={formOpen}
				onClose={() => setFormOpen(false)}
				onSave={handleAddProcurement}
				itemsData={itemsData.data}
			/>
		</div>
	);
}
