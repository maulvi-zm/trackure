// Library Import
import { useState } from "react";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	type SortingState,
	getFilteredRowModel,
	type FilterFn,
	type ColumnFiltersState,
	getPaginationRowModel,
	type PaginationState,
	useReactTable,
} from "@tanstack/react-table";
import { rankItem } from "@tanstack/match-sorter-utils";
import type { ReactNode } from "@tanstack/react-router";
// Components Import
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "@/components/ui/tooltip";
import {
	Eye,
	ChevronUp,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";

const fuzzyFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
	const itemRank = rankItem(row.getValue(columnId), value);

	addMeta({
		itemRank,
	});

	return itemRank.passed;
};

export type DataTableProps<TData, TValue> = {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	className?: string;
	searchTerm?: string;
	pageSize?: number;
};

export interface DataTableColumn<TData> {
	accessorKey: keyof TData | string;
	header: ReactNode;
	cell?: (props: { row: { original: TData } }) => ReactNode;
}

export function DataTable<TData, TValue>({
	columns,
	data,
	className,
	searchTerm = "",
	pageSize = 10,
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [globalFilter, setGlobalFilter] = useState(searchTerm);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: pageSize,
	});

	if (searchTerm !== globalFilter) {
		setGlobalFilter(searchTerm);
	}

	const table = useReactTable({
		data,
		columns,
		state: {
			sorting,
			globalFilter,
			columnFilters,
			pagination,
		},
		onSortingChange: setSorting,
		onGlobalFilterChange: setGlobalFilter,
		onColumnFiltersChange: setColumnFilters,
		onPaginationChange: setPagination,
		globalFilterFn: fuzzyFilter,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
	});

	return (
		<div className={`size-full ${className}`}>
			<div className="size-full">
				<table className="size-full border-collapse">
					<thead>
						{table.getHeaderGroups().map((headerGroup) => (
							<tr key={headerGroup.id} className="border-b">
								{headerGroup.headers.map((header) => (
									<th
										key={header.id}
										className="pb-4 text-left text-sm font-medium font-jakarta text-slate-600"
									>
										{header.isPlaceholder ? null : (
											<div
												className={`flex items-center gap-2 ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
												onClick={
													header.column.getCanSort()
														? header.column.getToggleSortingHandler()
														: undefined
												}
											>
												{flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}

												{header.column.getCanSort() && (
													<div className="flex flex-col">
														{header.column.getIsSorted() === "asc" ? (
															<ChevronUp className="h-3 w-3" />
														) : header.column.getIsSorted() === "desc" ? (
															<ChevronDown className="h-3 w-3" />
														) : (
															<div className="h-3 w-3 flex flex-col opacity-30">
																<ChevronUp className="h-2 w-2" />
																<ChevronDown className="h-2 w-2" />
															</div>
														)}
													</div>
												)}
											</div>
										)}
									</th>
								))}
							</tr>
						))}
					</thead>
					<tbody>
						{table.getRowModel().rows.length > 0 ? (
							table.getRowModel().rows.map((row) => (
								<tr
									key={row.id}
									className="border-b border-slate-200 hover:bg-slate-50"
								>
									{row.getVisibleCells().map((cell) => (
										<td key={cell.id} className="py-2 font-jakarta text-sm">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</td>
									))}
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={columns.length}
									className="px-4 py-6 text-center font-jakarta text-sm text-muted-foreground"
								>
									Tidak ada data yang ditemukan
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>

			{/* Pagination */}
			<div className="flex items-center justify-between pt-4">
				<div className="flex-1 text-sm text-muted-foreground">
					Menampilkan{" "}
					{table.getFilteredRowModel().rows.length > 0
						? `${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-${Math.min(
								(table.getState().pagination.pageIndex + 1) *
									table.getState().pagination.pageSize,
								table.getFilteredRowModel().rows.length,
							)}`
						: "0"}{" "}
					dari {table.getFilteredRowModel().rows.length} data
				</div>
				<div className="flex items-center space-x-6 lg:space-x-8">
					<div className="flex items-center space-x-2">
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							<span className="sr-only">Halaman sebelumnya</span>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<div className="flex items-center gap-1 font-jakarta">
							<span className="text-sm font-medium">Halaman</span>
							<span className="text-sm font-medium">
								{table.getState().pagination.pageIndex + 1} dari{" "}
								{table.getPageCount()}
							</span>
						</div>
						<Button
							variant="outline"
							className="h-8 w-8 p-0"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							<span className="sr-only">Halaman berikutnya</span>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export function ActionButton({ onClick }: { onClick?: () => void }) {
	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={onClick}
					>
						<Eye className="h-4 w-4" />
						<span className="sr-only">View details</span>
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					<p>View details</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
