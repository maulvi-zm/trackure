// Library Import
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createItem, updateItem } from "@/api/item";
// Component Import
import {
	DataTable,
	type DataTableColumn,
} from "@/components/tables/DataTables";
import InputSearch from "../InputSearch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
// Icon Import
import BoxIcon from "@/assets/icons/box.svg";
import MoneyIcon from "@/assets/icons/anggaran.svg";
import InfoIcon from "@/assets/icons/3d-square.svg";
import CodeIcon from "@/assets/icons/3d-square.svg";
import AddIcon from "@/assets/icons/box-add.svg";
import Satuan from "@/assets/icons/bubble.svg";
import Kategori from "@/assets/icons/3d-cube-scan1.svg";
import { Link } from "lucide-react";
// Function Import
import AddBarang from "./AddBarang";
import EditBarang from "./EditBarang";
import HapusBarang from "./HapusBarang";
// Interface Import
import type { Barang } from "@/lib/interfaces";
import { useToast } from "@/hooks/useToast";

export default function DaftarBarang({
	data,
	isLoading,
	error,
}: {
	data: Barang[] | undefined;
	isLoading: boolean;
	error: Error | null;
}) {
	const [searchTerm, setSearchTerm] = useState("");
	const [showForm, setShowForm] = useState(false);
	const [showEditForm, setShowEditForm] = useState(false)
	const [showEdit, setShowEdit] = useState<Barang | null>(null);
	const [showDelete, setShowDelete] = useState<Barang | null>(null);
	const { success, error: errorToast } = useToast();
	const queryClient = useQueryClient();

	const updateMutation = useMutation({
		mutationFn: updateItem,
		onSuccess: (_updatedItemData, _variables) => {
			queryClient.invalidateQueries({ queryKey: ["items"] });
			success("Barang berhasil diperbarui");
			setShowEdit(null);
		},
		onError: (err, _variables, _context) => {
			errorToast(`Gagal memperbarui barang: ${err}`);
		},
	});

	const createMutation = useMutation({
		mutationFn: createItem,
		onSuccess: (_newItemData, _variables) => {
			queryClient.invalidateQueries({ queryKey: ["items"] });
			success("Barang berhasil ditambahkan");
			setShowForm(false);
		},
		onError: (err, _variables, _context) => {
			errorToast(`Gagal menambahkan barang: ${err}`);
		},
	});

	if (isLoading) {
		return <p className="p-4 text-gray-500">Memuat data barang...</p>;
	}

	if (error) {
		return <p className="p-4 text-red-500">Gagal memuat data barang</p>;
	}

	const filteredData = (data ?? []).filter(
		(item) =>
			item.item_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.specifications.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const handleUpdateBarang = async (updatedBarang: Barang) => {
		await updateMutation.mutateAsync(updatedBarang);
	};

	const handleAddBarang = async (newItem: Omit<Barang, "id">) => {
		await createMutation.mutateAsync(newItem);
	};

	const columns: DataTableColumn<Barang>[] = [
		{
			accessorKey: "item_code",
			header: (
				<div className="flex items-center font-jakarta gap-2">
					<span>Kode Barang</span>
					<img src={CodeIcon} alt="Kode" className="h-4 w-4" />
				</div>
			),
		},
		{
			accessorKey: "item_name",
			header: (
				<div className="flex items-center font-jakarta gap-2">
					<span>Nama Barang</span>
					<img src={BoxIcon} alt="Nama" className="h-4 w-4" />
				</div>
			),
		},
		{
			accessorKey: "price",
			header: (
				<div className="flex items-center font-jakarta gap-2">
					<span>Harga Satuan</span>
					<img src={MoneyIcon} alt="Harga" className="h-4 w-4" />
				</div>
			),
			cell: ({row}) => (
				<p>Rp {row.original.price}</p>
			)
		},
		{
			accessorKey: "unit",
			header: (
				<div className="flex items-center font-jakarta gap-2">
					<span>Satuan</span>
					<img src={Satuan} alt="Satuan" className="h-4 w-4" />
				</div>
			),
		},
		{
			accessorKey: "specifications",
			header: (
				<div className="flex items-center font-jakarta gap-2">
					<span>Spesifikasi</span>
					<img src={InfoIcon} alt="Spesifikasi" className="h-4 w-4" />
				</div>
			),
			cell: ({ row }) => (
				<Dialog>
					<DialogTrigger asChild>
						<button className="text-[#5188EE] text-sm cursor-pointer">Lihat Spesifikasi</button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle className="font-jakarta text-[#5188EE]">Spesifikasi</DialogTitle>
						</DialogHeader>
						<p>{row.original.specifications}</p>
					</DialogContent>
				</Dialog>
			),
		},
		{
			accessorKey: "category",
			header: (
				<div className="flex items-center font-jakarta gap-2">
					<span>Kelompok Bidang</span>
					<img src={Kategori} alt="Spesifikasi" className="h-4 w-4" />
				</div>
			),
		},
		{
			accessorKey: "reference",
			header: (
				<div className="flex items-center font-jakarta gap-2">
					<span>Referensi</span>
					<Link size={16} />
				</div>
			),
		},
		{
			header: "Aksi",
			accessorKey: "aksi",
			cell: ({ row }) => {
				const item = row.original;
				return (
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => {
								setShowEdit(item)
								setShowEditForm(true)
							}}
							className="px-3 py-1 text-white bg-[#5188EE] rounded-lg font-jakarta text-sm hover:bg-blue-500 cursor-pointer"
						>
							Edit
						</button>
					</div>
				);
			},
		},
	];

	return (
		<div className="flex flex-col gap-y-4">
			<div className="flex items-center">
				<h2 className="text-2xl font-jakarta font-semibold">Daftar Barang</h2>
			</div>

			<div className="flex gap-x-2 items-center">
				<InputSearch 
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Cari barang"
				/>
				<button
					type="button"
					onClick={() => setShowForm(true)}
					className="shrink-0 flex items-center gap-2 px-4 py-2 bg-[#5188EE] text-white font-jakarta rounded-md hover:bg-[#3b6ed8] text-sm cursor-pointer"
				>
					<img src={AddIcon} alt="Tambah" className="h-4 w-4" />
					Tambah Barang
				</button>
			</div>

			<DataTable 
				columns={columns} 
				data={filteredData} 
				pageSize={Math.max(1, Math.floor((window.innerHeight - 100) / 60))}
			/>

			{/* Render modals */}
			{showForm && (
				<AddBarang
					open={showForm}
					onClose={() => setShowForm(false)}
					onSave={handleAddBarang}
					isAdding={createMutation.isPending}
					addError={createMutation.error}
				/>
			)}

			{showEdit && (
				<EditBarang
					open={showEditForm}
					barang={showEdit}
					onClose={() => setShowEdit(null)}
					onSave={handleUpdateBarang}
					isSaving={updateMutation.isPending}
					saveError={updateMutation.error}
				/>
			)}

			{showDelete && (
				<HapusBarang
					onClose={() => setShowDelete(null)}
					onConfirm={() => {
						console.log("Hapus:", showDelete);
						// TODO: Add mutation for delete here
						setShowDelete(null);
					}}
				/>
			)}

			{/* Optionally, display mutation loading/error feedback outside the modal */}
			{updateMutation.isPending && <p>Sedang menyimpan perubahan...</p>}
			{updateMutation.isError && (
				<p className="text-red-500">
					Gagal menyimpan perubahan: {updateMutation.error.message}
				</p>
			)}
		</div>
	);
}
