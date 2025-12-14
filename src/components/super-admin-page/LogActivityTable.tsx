import { DataTable } from "@/components/tables/DataTables";
import User from "../../assets/icons/user-table.svg";
import Email from "../../assets/icons/sms.svg";
import UserTag from "../../assets/icons/user-tag.svg";
import Clock from "../../assets/icons/clock.svg";
import Tag from "../../assets/icons/tag.svg";
import { cn } from "@/lib/utils";
import type { ActivityLogData } from "@/lib/interfaces";

interface LogActivityTableProps {
	isLoading: boolean;
	error: Error | null;
	data?: ActivityLogData[] | null;
}

const LogActivityTable = ({
	isLoading,
	error,
	data,
}: LogActivityTableProps) => {
	const columns = [
		{
			accessorKey: "timestamp",
			header: () => (
				<div className="flex items-center gap-x-2">
					Timestamp
					<img
						src={Clock || "/placeholder.svg"}
						alt="Timestamp Icon"
						className="w-4 h-4 table-text-color"
					/>
				</div>
			),
			enableSorting: true,
			cell: ({ row }: { row: { original: ActivityLogData } }) => {
				const timestamp = new Date(row.original.timestamp);
				const formattedTimestamp = timestamp.toLocaleDateString("id-ID", {
					day: "2-digit",
					month: "2-digit",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
					second: "2-digit",
					hour12: false,
				});
				return <span className="line-clamp-1">{formattedTimestamp}</span>;
			},
		},
		{
			accessorKey: "userId",
			header: () => (
				<div className="flex items-center gap-x-2">
					UserID
					<img
						src={User || "/placeholder.svg"}
						alt="User ID Icon"
						className="w-4 h-4 table-text-color"
					/>
				</div>
			),
			enableSorting: true,
		},
		{
			accessorKey: "email",
			header: () => (
				<div className="flex items-center gap-x-2">
					Email
					<img
						src={Email || "/placeholder.svg"} // Added placeholder fallback
						alt="Email Icon"
						className="w-4 h-4 table-text-color"
					/>
				</div>
			),
			enableSorting: true, // Assuming sorting is desired
		},
		{
			accessorKey: "role",
			header: () => (
				<div className="flex items-center gap-x-2">
					Role
					<img
						src={UserTag || "/placeholder.svg"} // Added placeholder fallback
						alt="Role Icon"
						className="w-4 h-4 table-text-color"
					/>
				</div>
			),
			// Custom cell rendering for role with conditional styling
			cell: ({ row }: { row: { original: ActivityLogData } }) => (
				<div
					className={cn(
						"inline-flex items-center justify-center rounded-full px-2 py-1 border text-xs",
						row.original.role === "ADMIN"
							? "bg-blue-50 text-blue-600 border-blue-400"
							: row.original.role === "REQUESTER"
								? "bg-emerald-50 text-emerald-600 border-emerald-400"
								: row.original.role === "SUPER_ADMIN"
									? "bg-red-50 text-red-600 border-red-400"
									: row.original.role === "USER_PRINT_NUMBER"
										? "bg-orange-50 text-orange-600 border-orange-400"
										: "bg-slate-50 text-slate-600 border-slate-400",
					)}
				>
					{row.original.role}
				</div>
			),
			enableSorting: true, // Assuming sorting is desired
		},
		{
			accessorKey: "activity",
			header: () => (
				<div className="flex items-center gap-x-2">
					Aktivitas
					<img
						src={Tag || "/placeholder.svg"} // Added placeholder fallback
						alt="Activity Icon"
						className="w-4 h-4 table-text-color"
					/>
				</div>
			),
			enableSorting: true, // Assuming sorting is desired
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

	// Handle error state
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
			<DataTable
				columns={columns}
				data={data || []}
				className="w-full"
				pageSize={Math.max(1, Math.floor((window.innerHeight - 200) / 40))}
			/>

			{data?.length === 0 && (
				<div className="text-center py-10 text-gray-500">
					<p>Tidak ada data aktivitas log yang tersedia</p>
				</div>
			)}
		</div>
	);
};

export default LogActivityTable;
