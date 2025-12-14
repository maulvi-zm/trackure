// Library Import
import { Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
	createOrganization,
	updateOrganization,
	updateOrganizationBudget,
} from "@/api/organization";
// Component Import
import {
	DataTable,
	type DataTableColumn,
} from "@/components/tables/DataTables";
import OrganizationForm from "./OrganizationForm";
import InputSearch from "../InputSearch";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Interface Import
import type {
	AdminDashboardResponse,
	ProgramStudiSummary,
} from "@/lib/interfaces";
// Icon Import
import ArrowIcon from "../../assets/icons/arrow.svg";
import BookIcon from "../../assets/icons/book.svg";
import DocumentIcon from "../../assets/icons/document.svg";
import InfoIcon from "../../assets/icons/info.svg";
import MoneyIcon from "../../assets/icons/money.svg";
import { CalendarClock,Building2, Calendar } from "lucide-react";
import { useToast } from "@/hooks/useToast";

export default function BudgetDashboard({
	data,
	isLoading,
	error,
}: {
	data: AdminDashboardResponse | undefined;
	isLoading: boolean;
	error: Error | null;
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedYear, setSelectedYear] = useState<number>(
		new Date().getFullYear(),
	);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [showEditForm, setShowEditForm] = useState(false);
	const [selectedOrg, setSelectedOrg] = useState<ProgramStudiSummary | null>(
		null,
	);
	const { success, error: errorToast } = useToast();
	const queryClient = useQueryClient();

	const createOrgMutation = useMutation({
		mutationFn: createOrganization,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["AdminDashboardData"] });
			setShowCreateForm(false);
			success("Organisasi berhasil ditambahkan")
		},
		onError: (err, _variables, _context) => {
			errorToast(`Gagal menambahkan organisasi: ${err}`);
		},
	});

	const updateOrgMutation = useMutation({
		mutationFn: updateOrganization,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["AdminDashboardData"] });
			setShowEditForm(false);
			success("Organisasi berhasil diperbarui")
		},
		onError: (err, _variables, _context) => {
			errorToast(`Gagal memperbarui organisasi: ${err}`);
		},
	});

	const updateBudgetMutation = useMutation({
		mutationFn: updateOrganizationBudget,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["AdminDashboardData"] });
			setShowEditForm(false);
		},
		onError: (err, _variables, _context) => {
			errorToast(`Gagal menambahkan pengadaan: ${err}`);
		},
	});

	const handleCreateOrg = (formData: { name: string }) => {
		createOrgMutation.mutate(formData);
	};

	const handleEditOrg = (formData: {
		name: string;
		totalBudget?: number;
		year?: number;
	}) => {
		if (!selectedOrg) return;

		// Update organization name
		updateOrgMutation.mutate({
			organizationId: selectedOrg.organizationId,
			name: formData.name,
		});

		// Update budget if provided
		if (formData.totalBudget && formData.year) {
			updateBudgetMutation.mutate({
				organizationId: selectedOrg.organizationId,
				totalBudget: formData.totalBudget,
				year: formData.year,
			});
		}
	};

	const years = useMemo(() => {
		if (!data?.programStudiList) return [];
		const uniqueYears = new Set(data.programStudiList.map((item) => item.year));
		return Array.from(uniqueYears).sort((a, b) => b - a);
	}, [data?.programStudiList]);

	const columns: DataTableColumn<ProgramStudiSummary>[] = [
		{
			accessorKey: "organization",
			header: (
				<div className="flex items-center gap-2">
					<span>Program Studi</span>
					<img src={BookIcon} alt="Program Studi" className="h-4 w-4" />
				</div>
			),
		},
		{
			accessorKey: "total_budget",
			header: (
				<div className="flex items-center gap-2">
					<span>Anggaran Dasar</span>
					<img src={MoneyIcon} alt="Sisa Anggaran" className="h-4 w-4" />
				</div>
			),
			cell: ({ row }) => `Rp ${row.original.total_budget.toLocaleString()}`,
		},
		{
			accessorKey: "remaining_budget",
			header: (
				<div className="flex items-center gap-2">
					<span>Sisa Anggaran</span>
					<img src={MoneyIcon} alt="Sisa Anggaran" className="h-4 w-4" />
				</div>
			),
			cell: ({ row }) => `Rp ${row.original.remaining_budget.toLocaleString()}`,
		},
		{
			accessorKey: "year",
			header: (
					<div className="flex items-center gap-2">
						<span>Tahun</span>
						<CalendarClock size={16} />
					</div>
			),
			cell: ({ row }) => row.original.year,
		},
		{
			accessorKey: "procurements_total",
			header: (
				<div className="flex items-center gap-2">
					<span>Total Pengajuan</span>
					<img src={DocumentIcon} alt="Total Pengajuan" className="h-4 w-4" />
				</div>
			),
		},
		{
			header: (
				<div className="flex items-center gap-2">
					<span>Aksi</span>
					<img src={InfoIcon} alt="Info" className="h-4 w-4" />
				</div>
			),
			accessorKey: "action",
			cell: ({ row }) => (
				<div className="flex items-center gap-4">
					<Link
						className="flex items-center gap-2 text-sm font-jakarta text-blue-600 hover:underline"
						to={`/pengadaan/${row.original.organizationId}`}
					>
						<span>Lihat Detail</span>
						<img src={ArrowIcon} alt="Arrow" className="h-5 w-5" />
					</Link>
					<button
						type="button"
						onClick={() => {
							setSelectedOrg(row.original);
							setShowEditForm(true);
						}}
						className="bg-[#5188EE] text-white px-4 py-2 rounded-md font-jakarta text-sm hover:bg-blue-600"
					>
						Edit
					</button>
				</div>
			),
		},
	];

	// Show loading spinner or error message
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

	// Filter data based on search and year
	const filteredData = data?.programStudiList.filter(
		(entry) =>
			entry.organization.toLowerCase().includes(searchTerm.toLowerCase()) &&
			entry.year === selectedYear,
	);

	return (
		<div className="flex flex-col  gap-y-4">
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-semibold">
					Organisasi dan Pemanfaatan Anggaran
				</h2>
			</div>

			{/* Konten dashboard */}
			<div className="flex flex-col gap-x-2 md:flex-row md:items-center md:justify-between">
				<InputSearch 
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Cari program studi atau nama kaprodi"
				/>
				<Select onValueChange={(val) => setSelectedYear(Number(val))}>
					<SelectTrigger className="w-[140px]">
						<Calendar />
						<SelectValue placeholder="Pilih Tahun" />
					</SelectTrigger>
					<SelectContent>
						{years.map((year) => (
							<SelectItem key={year} value={year.toString()}>
								{year}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<Button 
					onClick={() => setShowCreateForm(true)}
					className="bg-[#5188EE] text-white px-4 py-2 rounded-md font-jakarta text-sm hover:bg-blue-500 cursor-pointer"
				>
					<Building2 />
					Tambah Organisasi
				</Button>
			</div>

			<DataTable 
				columns={columns} 
				data={filteredData || []} 
				pageSize={Math.max(1, Math.floor((window.innerHeight - 140) / 60))}
			/>

			{showCreateForm && (
				<OrganizationForm
					open={showCreateForm}
					onClose={() => setShowCreateForm(false)}
					onSave={handleCreateOrg}
					isAdding={createOrgMutation.isPending}
					addError={createOrgMutation.error as Error}
					mode="create"
				/>
			)}

			{showEditForm && selectedOrg && (
				<OrganizationForm
					open={showEditForm}
					onClose={() => {
						setShowEditForm(false);
						setSelectedOrg(null);
					}}
					onSave={handleEditOrg}
					isAdding={
						updateOrgMutation.isPending || updateBudgetMutation.isPending
					}
					addError={
						(updateOrgMutation.error as Error) ||
						(updateBudgetMutation.error as Error)
					}
					initialData={{
						name: selectedOrg.organization,
						totalBudget: selectedOrg.total_budget,
						year: selectedOrg.year,
					}}
					mode="edit"
				/>
			)}
		</div>
	);
}
