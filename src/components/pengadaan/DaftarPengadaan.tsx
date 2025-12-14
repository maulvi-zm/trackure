/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTable } from "@/components/tables/DataTables";
import Calendar from "../../assets/icons/calendar.svg";
import DollarCircle from "../../assets/icons/dollar-circle.svg";
import Square from "../../assets/icons/3d-square.svg";
import Group from "../../assets/icons/group.svg";
import InfoCircle from "../../assets/icons/info-circle.svg";
import Coin from "../../assets/icons/coin.svg";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { useState, useMemo, useEffect } from "react";
import { Check } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { ProcurementStatus } from "@/lib/interfaces";
import { associateToProcurement, getPrintNumberIds } from "@/api/printNumber";

interface Procurement {
	id: number;
	nama: string;
	organisasi: string;
	bidang: string;
	qty: number;
	jumlah: number;
	tanggal: string;
	status: string;
	referensi: string;
	aksi: string;
}

interface UserPrintNumber {
	id: number;
	name: string;
}

interface DaftarPengadaanProps {
	isLoading: boolean;
	error: Error | null;
	data?: {
		success: boolean;
		procurementList: Procurement[];
	} | null;
}

export default function DaftarPengadaan({
	isLoading,
	error,
	data,
}: DaftarPengadaanProps) {
	const [selectedYear, setSelectedYear] = useState<string>("all");
	const [selectedStatus, setSelectedStatus] = useState<string>("all");
	const [selectedRows, setSelectedRows] = useState<
		{ id: number; procurementId: number }[]
	>([]);
	const [printNumbers, setPrintNumbers] = useState<UserPrintNumber[]>([]);
	const [selectedPrintNumberId, setSelectedPrintNumberId] =
		useState<string>("");
	const [printNumber, setPrintNumber] = useState("");

	// Fetch print number IDs from API
	useEffect(() => {
		const fetchPrintNumberIds = async () => {
			try {
				const response = await getPrintNumberIds();
				if (response) {
					setPrintNumbers(response);
				} else {
					console.error("Unexpected print number IDs format:", response);
					setPrintNumbers([]);
				}
			} catch (error) {
				console.error("Failed to fetch print number IDs:", error);
				setPrintNumbers([]);
			}
		};

		fetchPrintNumberIds();
	}, []);

	const years = useMemo(() => {
		if (!data?.procurementList) return [];
		const uniqueYears = new Set(
			data.procurementList.map((item) => new Date(item.tanggal).getFullYear()),
		);
		return Array.from(uniqueYears).sort((a, b) => b - a);
	}, [data?.procurementList]);

	const statuses = useMemo(() => {
		if (!data?.procurementList) return [];
		const uniqueStatuses = new Set(
			data.procurementList.map((item) => item.status),
		);
		return Array.from(uniqueStatuses);
	}, [data?.procurementList]);

	const filteredData = useMemo(() => {
		if (!data?.procurementList) return [];
		return data.procurementList.filter((item) => {
			const itemYear = new Date(item.tanggal).getFullYear().toString();
			const yearMatch = selectedYear === "all" || itemYear === selectedYear;
			const statusMatch =
				selectedStatus === "all" || item.status === selectedStatus;
			return yearMatch && statusMatch;
		});
	}, [data?.procurementList, selectedYear, selectedStatus]);

	// Custom Checkbox component
	const CustomCheckbox = ({
		checked,
		onChange,
	}: { checked: boolean; onChange: () => void }) => {
		return (
			<div
				className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center ${checked ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
				onClick={onChange}
			>
				{checked && <Check className="h-3 w-3 text-white" />}
			</div>
		);
	};

	// Handle row selection
	const toggleRowSelection = (id: number) => {
		setSelectedRows((prevSelected) => {
			const isSelected = prevSelected.some((row) => row.id === id);
			if (isSelected) {
				return prevSelected.filter((row) => row.id !== id);
			}

			return [...prevSelected, { id, procurementId: id }];
		});
	};

	const columns = [
		{
			id: "selection",
			cell: ({ row }: { row: { original: Procurement } }) => {
				const id = row.original.id;
				const status = row.original.status;

				if (status === ProcurementStatus.PENYERAHAN_BARANG) {
					return (
						<div className="flex justify-center mr-2">
							<CustomCheckbox
								checked={selectedRows.some((row) => row.id === id)}
								onChange={() => toggleRowSelection(id)}
							/>
						</div>
					);
				}
			},
			enableSorting: false,
		},
		{
			accessorKey: "nama",
			header: () => (
				<div className="flex items-center gap-2">
					<span>Nama Barang</span>
					<img
						src={Square || "/placeholder.svg"}
						alt="Square Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			enableSorting: true,
		},
		{
			accessorKey: "bidang",
			header: () => (
				<div className="flex items-center gap-2">
					<span>Kategori Barang</span>
					<img
						src={Square || "/placeholder.svg"}
						alt="Square Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			enableSorting: true,
		},
		{
			accessorKey: "qty",
			header: () => (
				<div className="flex items-center gap-2">
					<span>Qty</span>
					<img
						src={Coin || "/placeholder.svg"}
						alt="Quantity Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			enableSorting: true,
		},
		{
			accessorKey: "jumlah",
			header: () => (
				<div className="flex items-center gap-2">
					<span>Total Harga</span>
					<img
						src={DollarCircle || "/placeholder.svg"}
						alt="Dollar Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			enableSorting: true,
			cell: ({ row }: { row: { original: Procurement } }) => {
				const amount = row.original.jumlah;
				const formattedAmount = new Intl.NumberFormat("id-ID").format(amount);
				return <span>{formattedAmount}</span>;
			},
		},
		{
			accessorKey: "referensi",
			header: () => (
				<div className="flex items-center gap-2">
					<span>Referensi</span>
					<img
						src={Square || "/placeholder.svg"}
						alt="Square Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			cell: ({ row }: { row: { original: Procurement } }) => {
				const href = row.original.referensi;
				return (
					<a
						href={href}
						target="_blank"
						rel="noreferrer"
						className="hover:underline text-blue-600"
					>
						Referensi
					</a>
				);
			},
			enableSorting: true,
		},
		{
			accessorKey: "tanggal",
			header: () => (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<span>Tanggal</span>
						<img
							src={Calendar || "/placeholder.svg"}
							alt="Calendar Icon"
							className="w-4 h-4"
						/>
					</div>
					<select
						value={selectedYear}
						onChange={(e) => setSelectedYear(e.target.value)}
						className="text-sm border rounded px-2 py-1"
					>
						<option value="all">Semua Tahun</option>
						{years.map((year) => (
							<option key={year} value={year}>
								{year}
							</option>
						))}
					</select>
				</div>
			),
			enableSorting: true,
			cell: ({ row }: { row: { original: Procurement } }) => {
				const date = new Date(row.original.tanggal);
				const formattedDate = date.toLocaleDateString("id-ID", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
				});
				return <span>{formattedDate}</span>;
			},
		},
		{
			accessorKey: "status",
			header: () => (
				<div className="flex flex-col gap-2">
					<div className="flex items-center gap-2">
						<span>Status</span>
						<img
							src={Group || "/placeholder.svg"}
							alt="Group Icon"
							className="w-4 h-4"
						/>
					</div>
					<select
						value={selectedStatus}
						onChange={(e) => setSelectedStatus(e.target.value)}
						className="text-sm border rounded px-2 py-1"
					>
						<option value="all">Semua Status</option>
						{statuses.map((status) => (
							<option key={status} value={status}>
								{status}
							</option>
						))}
					</select>
				</div>
			),
			cell: ({ row }: { row: { original: Procurement } }) => {
				const status = row.original.status;
				let statusColor = "";

				switch (status) {
					case "Selesai":
						statusColor = "text-green-600 bg-green-50 border-green-200";
						break;
					case "Proses":
						statusColor = "text-amber-600 bg-amber-50 border-amber-200";
						break;
					case "Verifikasi":
						statusColor = "text-blue-600 bg-blue-50 border-blue-200";
						break;
					default:
						statusColor = "text-gray-600 bg-gray-50 border-gray-200";
				}

				return (
					<span
						className={cn(
							"px-3 py-1 rounded-full text-sm font-medium border",
							statusColor,
						)}
					>
						{status}
					</span>
				);
			},
		},
		{
			accessorKey: "aksi",
			header: () => (
				<div className="flex items-center gap-2">
					<span>Aksi</span>
					<img
						src={InfoCircle || "/placeholder.svg"}
						alt="Info Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			cell: ({ row }: { row: { original: Procurement } }) => {
				return (
					<Link
						type="button"
						className="text-blue-600 hover:underline font-medium"
						to={`/pengajuan/${row.original.id}`}
					>
						Detail
					</Link>
				);
			},
		},
	];

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
					<p className="mt-4 text-gray-600">Memuat data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center text-red-500">
					<p>Terjadi kesalahan saat memuat data.</p>
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
		<div className="w-full h-full flex flex-col">
			<DataTable columns={columns} data={filteredData} className="w-full" />

			{(!filteredData || filteredData.length === 0) && (
				<div className="text-center py-10 text-gray-500">
					<p>Tidak ada data pengadaan yang tersedia</p>
				</div>
			)}

			{/* Show selected count if any */}
			{selectedRows.length > 0 && (
				<div className="bg-blue-50 p-4 rounded-md flex items-center mt-4">
					<span className="font-medium pl-2">
						{selectedRows.length} item terpilih
					</span>
					<div className="ml-auto flex flex-col items-end">
						<div className="flex items-center space-x-4">
							<div className="flex items-center">
								<label
									htmlFor="userPrintNumber"
									className="text-sm text-gray-600 mr-2"
								>
									Pilih ID user print number:
								</label>
								<Select
									value={selectedPrintNumberId}
									onValueChange={setSelectedPrintNumberId}
								>
									<SelectTrigger
										id="userPrintNumber"
										className="relative w-20 border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-lg"
									>
										<SelectValue placeholder="ID..." />
									</SelectTrigger>
									<SelectContent className="max-h-48 overflow-y-auto">
										{printNumbers.map((item) => (
											<SelectItem
												key={item.id}
												value={item.id.toString()}
												className="cursor-pointer select-none active:bg-blue-100 hover:bg-transparent"
											>
												{`${item.id} - ${item.name}`}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="flex items-center">
								<label
									htmlFor="printNumber"
									className="text-sm text-gray-600 mr-2"
								>
									Masukkan print number:
								</label>
								<input
									type="text"
									id="printNumber"
									value={printNumber}
									onChange={(e) => setPrintNumber(e.target.value)}
									className="w-50 border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
									placeholder="Print number"
								/>
							</div>
						</div>
						<div className="pt-3">
							<button
								type="button"
								disabled={!selectedPrintNumberId || !printNumber}
								className={`text-sm rounded-md px-4 py-1.5 font-medium ${
									!selectedPrintNumberId || !printNumber
										? "bg-gray-300 text-gray-500 cursor-not-allowed"
										: "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
								}`}
								onClick={async () => {
									try {
										const procurementIds = selectedRows.map(
											(row) => row.procurementId,
										);

										// Single API call to associate procurements and assign person
										const response = await associateToProcurement(
											printNumber,
											procurementIds,
											Number.parseInt(selectedPrintNumberId, 10),
										);
										if (response.success) {
											setSelectedRows([]);
											setPrintNumber("");
											setSelectedPrintNumberId("");
											window.location.reload();
										} else {
											throw new Error(
												response.error || "Failed to process the request",
											);
										}
									} catch (error) {
										console.error("Failed to process selections:", error);
										alert(
											error instanceof Error
												? error.message
												: "Failed to process. Please try again.",
										);
									}
								}}
							>
								Proses
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
