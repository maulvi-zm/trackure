import { useState } from "react";
import { DataTable } from "@/components/tables/DataTables";
import Square from "../../assets/icons/3d-square.svg";
import LinkIcon from "../../assets/icons/link.svg";
import TicketIcon from "../../assets/icons/ticket.svg";
import { UploadModals } from "./UploadModals";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import ItemListTable from "./ItemListTableProps";
import { useQueryClient } from "@tanstack/react-query";
import {
	getListBarangByPrintNumber,
	uploadPhotoForPrintNumber,
	deletePhotoForPrintNumber,
} from "@/api/printNumber";
import InputSearch from "../InputSearch";

export interface DummyItem {
	id: string;
	itemName: string;
	itemCode: string;
	category: string;
	quantity: number;
	unit: string;
}

export interface PrintNumberItem {
	id: number;
	printNumber: string;
	attachment: string | null;
	status: string;
	items?: DummyItem[];
}

export interface PrintNumberProps {
	isLoading: boolean;
	error: Error | null;
	data?: PrintNumberItem[] | null;
}

export default function PrintNumber({
	data,
	isLoading,
	error,
}: PrintNumberProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [showItemDetails, setShowItemDetails] = useState(false);
	const [selectedItem, setSelectedItem] = useState<PrintNumberItem | null>(
		null,
	);
	const [showUploadModal, setShowUploadModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [selectedItemForUpload, setSelectedItemForUpload] =
		useState<PrintNumberItem | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [itemToDelete, setItemToDelete] = useState<PrintNumberItem | null>(
		null,
	);
	const queryClient = useQueryClient();

	// Fallback dummy items in case API returns empty (optional)
	const dummyItems: Record<string, DummyItem[]> = {
		default: [],
	};

	const handleUploadClick = (item: PrintNumberItem) => {
		setSelectedItemForUpload(item);
		setShowUploadModal(true);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files?.[0]) {
			const file = e.target.files[0];
			setSelectedFile(file);

			// Create a preview URL
			const fileUrl = URL.createObjectURL(file);
			setPreviewUrl(fileUrl);
		}
	};

	const handleUploadConfirm = () => {
		setShowUploadModal(false);
		setShowConfirmModal(true);
	};

	const handleUploadSubmit = async () => {
		if (selectedFile && selectedItemForUpload) {
			try {
				await uploadPhotoForPrintNumber(selectedItemForUpload.id, selectedFile);

				// Refresh dashboard data after successful upload
				queryClient.invalidateQueries({ queryKey: ["printNumberData"] });
			} catch (error) {
				console.error("Error uploading photo:", error);
			} finally {
				setShowConfirmModal(false);
				setSelectedFile(null);
				setPreviewUrl(null);
				setSelectedItemForUpload(null);
			}
		}
	};

	const closeUploadModal = () => {
		setShowUploadModal(false);
		setSelectedFile(null);
		setPreviewUrl(null);
	};

	const closeConfirmModal = () => {
		setShowConfirmModal(false);
	};

	const handleViewItem = async (item: PrintNumberItem) => {
		try {
			const barangData = await getListBarangByPrintNumber(item.id);
			const mappedItems: DummyItem[] = barangData.map(
				(
					barang: {
						item_name: string;
						quantity: number;
						unit: string;
					},
					index: number,
				) => ({
					id: String(index),
					itemName: barang.item_name,
					itemCode: "-",
					category: "-",
					quantity: barang.quantity,
					unit: barang.unit,
				}),
			);

			const enhancedItem = {
				...item,
				items: mappedItems.length > 0 ? mappedItems : dummyItems.default,
			};
			setSelectedItem(enhancedItem);
			setShowItemDetails(true);
		} catch (error) {
			console.error("Error fetching barang list:", error);
		}
	};

	const closeModal = () => {
		setShowItemDetails(false);
		setSelectedItem(null);
	};

	const columns = [
		{
			accessorKey: "printNumber",
			header: () => (
				<div className="flex items-center gap-2">
					<span>Print Number</span>
					<img
						src={TicketIcon || "/placeholder.svg"}
						alt="Ticket Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			enableSorting: true,
		},
		{
			accessorKey: "status",
			header: () => (
				<div className="flex items-center gap-2">
					<span>Status</span>
					<img
						src={Square || "/placeholder.svg"}
						alt="Status Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			enableSorting: true,
		},
		{
			accessorKey: "attachment",
			header: () => (
				<div className="flex items-center gap-2">
					<span>Attachment</span>
					<img
						src={LinkIcon || "/placeholder.svg"}
						alt="Link Icon"
						className="w-4 h-4"
					/>
				</div>
			),
			cell: ({ row }: { row: { original: PrintNumberItem } }) => {
				const { attachment, status } = row.original;
				return attachment ? (
					<div className="flex items-center gap-2">
						<a
							href={attachment}
							className="text-blue-600 hover:underline"
							target="_blank"
							rel="noopener noreferrer"
						>
							Lihat Foto
						</a>{" "}
						{status !== "Selesai" && (
							<button
								type="button"
								className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
								onClick={() => openDeleteModal(row.original)}
							>
								Hapus
							</button>
						)}
					</div>
				) : (
					<button
						type="button"
						className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600"
						onClick={() => {
							handleUploadClick(row.original);
						}}
					>
						Unggah Foto
					</button>
				);
			},
		},
		{
			id: "actions",
			header: () => <span>Barang</span>,
			cell: ({ row }: { row: { original: PrintNumberItem } }) => (
				<button
					type="button"
					onClick={() => handleViewItem(row.original)}
					className="px-3 py-1 text-blue-600 rounded-md hover:underline"
				>
					Lihat Barang
				</button>
			),
		},
	];

	// Filter data based on search
	// const filteredData =
	// 	data?.printNumber?.filter((item) =>
	// 		item.itemName.toLowerCase().includes(searchTerm.toLowerCase()),
	// 	) || [];

	// Delete photo handler
	const handleDeletePhoto = async (item: PrintNumberItem) => {
		try {
			await deletePhotoForPrintNumber(item.id);
			queryClient.invalidateQueries({ queryKey: ["printNumberData"] });
		} catch (error) {
			console.error("Error deleting photo:", error);
		}
	};

	const openDeleteModal = (item: PrintNumberItem) => {
		setItemToDelete(item);
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		setShowDeleteModal(false);
		setItemToDelete(null);
	};

	return (
		<div className="flex flex-col gap-y-4">
			{/* Header */}
			<div className="flex justify-between items-center">
				<h2 className="text-2xl font-semibold">Print Number</h2>
			</div>

			<InputSearch 
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					placeholder="Cari nama barang"
				/>

			{/* Loading state */}
			{isLoading && (
				<div className="flex items-center justify-center py-10">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
				</div>
			)}

			{/* Error state */}
			{error && (
				<div className="text-center py-10 text-red-500">
					<p>Terjadi kesalahan saat memuat data</p>
					<button
						type="button"
						onClick={() => window.location.reload()}
						className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
					>
						Coba Lagi
					</button>
				</div>
			)}

			{/* Data table */}
			{!isLoading && !error && data && (
				<div className="overflow-x-auto">
					<DataTable
						columns={columns}
						data={data}
						className="w-full"
						searchTerm={searchTerm}
						pageSize={Math.max(1, Math.floor((window.innerHeight - 140) / 60))}
					/>
				</div>
			)}

			{/* Item Details Modal */}
			{showItemDetails && selectedItem && (
				<div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold">Detail Barang</h3>
							<button
								type="button"
								onClick={closeModal}
								className="text-gray-500 hover:text-gray-700"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<title>Svg</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div className="space-y-4">
							<div className="border-b pb-2">
								<p className="text-sm text-gray-500">Print Number</p>
								<p className="font-medium">{selectedItem.printNumber}</p>
							</div>

							<div className="border-b pb-2">
								<p className="text-sm text-gray-500">Status</p>
								<p className="font-medium">{selectedItem.status}</p>
							</div>

							{selectedItem.attachment && (
								<div className="border-b pb-2">
									<p className="text-sm text-gray-500">Attachment</p>
									<a
										href={selectedItem.attachment}
										className="text-blue-600 hover:underline"
										target="_blank"
										rel="noopener noreferrer"
									>
										Lihat Attachment
									</a>
								</div>
							)}

							{/* Daftar Barang Section */}
							<ItemListTable items={selectedItem.items} />
						</div>

						<div className="mt-6 flex justify-end">
							<button
								type="button"
								onClick={closeModal}
								className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
							>
								Tutup
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Import the Upload Modals Component */}
			<UploadModals
				showUploadModal={showUploadModal}
				showConfirmModal={showConfirmModal}
				selectedItemForUpload={selectedItemForUpload}
				selectedFile={selectedFile}
				previewUrl={previewUrl}
				closeUploadModal={closeUploadModal}
				closeConfirmModal={closeConfirmModal}
				handleFileChange={handleFileChange}
				handleUploadConfirm={handleUploadConfirm}
				handleUploadSubmit={handleUploadSubmit}
				handleDeletePhoto={handleDeletePhoto}
				itemToDelete={itemToDelete}
			/>

			{/* Delete Confirmation Modal */}
			<DeleteConfirmationModal
				showDeleteModal={showDeleteModal}
				itemToDelete={itemToDelete}
				closeDeleteModal={closeDeleteModal}
				handleDeletePhoto={handleDeletePhoto}
			/>
		</div>
	);
}
