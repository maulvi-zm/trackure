// Library Import
import { useState } from "react";
// Icon Important
import AddKategori from "@/assets/icons/3d-cube-scan1.svg";
import AddBoxSquare from "@/assets/icons/3d-square.svg";
import AddMoneyIcon from "@/assets/icons/anggaran.svg";
import AddBox from "@/assets/icons/box.svg";
import AddSatuan from "@/assets/icons/bubble.svg";
// Component Import
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// Interface Import
import type { Barang } from "@/lib/interfaces";

export default function AddBarang({
	open,
	onClose,
	onSave,
	isAdding = false,
	addError = null,
}: {
	open: boolean;
	onClose: () => void;
	onSave: (newItem: Omit<Barang, "id">) => void;
	isAdding?: boolean;
	addError?: Error | null;
}) {
	// Initial state for the new item form
	const [formData, setFormData] = useState<Omit<Barang, "id">>({
		item_code: "",
		item_name: "",
		price: 0,
		specifications: "",
		category: "",
		unit: "",
		reference: "",
	});

	// Add validation state
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.item_code.trim()) {
			newErrors.item_code = "Kode Barang harus diisi";
		}
		if (!formData.item_name.trim()) {
			newErrors.item_name = "Nama Barang harus diisi";
		}
		if (!formData.price || formData.price <= 0) {
			newErrors.price = "Harga Satuan harus lebih dari 0";
		}
		if (!formData.specifications.trim()) {
			newErrors.specifications = "Spesifikasi harus diisi";
		}
		if (!formData.category.trim()) {
			newErrors.category = "Kelompok Bidang harus diisi";
		}
		if (!formData.unit.trim()) {
			newErrors.unit = "Satuan harus diisi";
		}
		if (!formData.reference.trim()) {
			newErrors.reference = "Referensi harus diisi";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({ ...prev, [name]: "" }));
		}
	};

	const handleSubmit = () => {
		if (validateForm()) {
			onSave(formData);
		}
	};

	const isFormDisabled = isAdding;

	return (
		<Dialog open={open} onOpenChange={onClose } >
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-[#5188EE] font-jakarta">
						Penambahan Barang	
					</DialogTitle>
				</DialogHeader>

				<div className="flex flex-col gap-y-2">
					{/* Kode Barang */}
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Kode Barang</p>
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
								<img src={AddBoxSquare} alt="Kode" className="h-4 w-4" />{" "}
							</span>
							<input
								name="item_code"
								type="text"
								value={formData.item_code}
								onChange={handleChange}
								placeholder="Masukkan Kode Barang"
								className={`w-full border rounded-lg font-jakarta pl-10 py-2 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed focus-visible:ring-transparent ${
									errors.item_code ? "border-red-500" : ""
								}`}
								disabled={isFormDisabled}
							/>
						</div>
						{errors.item_code && (
							<p className="text-red-500 text-xs mt-1">{errors.item_code}</p>
						)}
					</div>

					{/* Nama Barang */}
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Nama Barang</p>
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
								<img src={AddBox} alt="Barang" className="h-4 w-4" />{" "}
								{/* Using AddBox */}
							</span>
							<input
								name="item_name" // <--- Name matches Barang key
								type="text"
								value={formData.item_name}
								onChange={handleChange}
								placeholder="Masukkan Nama Barang"
								className={`w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed focus-visible:ring-transparent ${
									errors.item_name ? "border-red-500" : ""
								}`}
								disabled={isFormDisabled}
							/>
						</div>
						{errors.item_name && (
							<p className="text-red-500 text-xs mt-1">{errors.item_name}</p>
						)}
					</div>

					<div className="w-full flex gap-x-2">
						{/* Harga Satuan */}
						<div className="w-full flex flex-col gap-y-2">
							<p className="font-jakarta text-sm text-[#474747]">Harga Satuan</p>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
									<img src={AddMoneyIcon} alt="Harga" className="h-4 w-4" />{" "}
									{/* Using AddMoneyIcon */}
								</span>
								<input
									name="price" // <--- Name matches Barang key
									type="number" // Use type="number" for price
									value={formData.price}
									onChange={handleChange}
									placeholder="Masukkan Harga Satuan"
									className={`w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed focus-visible:ring-transparent ${
										errors.price ? "border-red-500" : ""
									}`}
									disabled={isFormDisabled}
								/>
							</div>
							{errors.price && (
								<p className="text-red-500 text-xs mt-1">{errors.price}</p>
							)}
						</div>
						{/* Satuan */}
						<div className="w-full flex flex-col gap-y-2">
							<p className="font-jakarta text-sm text-[#474747]">Satuan</p>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
									<img src={AddSatuan} alt="Satuan" className="h-4 w-4" />{" "}
									{/* Using AddSatuan */}
								</span>
								<input
									name="unit" // <--- Name matches Barang key
									type="text"
									value={formData.unit}
									onChange={handleChange}
									placeholder="Masukkan Satuan"
									className={`w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed ${
										errors.unit ? "border-red-500" : ""
									}`}
									disabled={isFormDisabled}
								/>
							</div>
							{errors.unit && (
								<p className="text-red-500 text-xs mt-1">{errors.unit}</p>
							)}
						</div>
					</div>


					{/* Spesifikasi */}
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Spesifikasi</p>
						<div className="relative">
							<span className="absolute left-3 top-[50%] transform -translate-y-1/2">
								{" "}
								{/* Adjusted icon position for textarea */}
								<img src={AddKategori} alt="Spesifikasi" className="h-4 w-4" />{" "}
								{/* Using AddKategori */}
							</span>
							<Textarea
								name="specifications" // <--- Name matches Barang key
								value={formData.specifications}
								onChange={handleChangeTextArea}
								placeholder="Masukkan Spesifikasi"
								className={`w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed ${
									errors.specifications ? "border-red-500" : ""
								}`}
								disabled={isFormDisabled}
							/>
						</div>
						{errors.specifications && (
							<p className="text-red-500 text-xs mt-1">{errors.specifications}</p>
						)}
					</div>

					{/* Kategori (Kelompok Bidang) */}
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Kelompok Bidang</p>
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
								<img src={AddKategori} alt="Kategori" className="h-4 w-4" />{" "}
								{/* Using AddKategori */}
							</span>
							<input
								name="category" // <--- Name matches Barang key
								type="text"
								value={formData.category}
								onChange={handleChange}
								placeholder="Masukkan Kelompok Bidang"
								className={`w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed ${
									errors.category ? "border-red-500" : ""
								}`}
								disabled={isFormDisabled}
							/>
						</div>
						{errors.category && (
							<p className="text-red-500 text-xs mt-1">{errors.category}</p>
						)}	
					</div>

					{/* Reference */}
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Referensi</p>
						<div className="relative">
							<span className="absolute left-3 top-[50%] transform -translate-y-1/2">
								{" "}
								{/* Adjusted icon position for textarea */}
								<img src={AddKategori} alt="Referensi" className="h-4 w-4" />{" "}
								{/* Using AddKategori */}
							</span>
							<Textarea
								name="reference" // <--- Name matches Barang key
								value={formData.reference}
								onChange={handleChangeTextArea}
								placeholder="Masukkan Referensi (Link, Dokumen, dll.)"
								className={`w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed ${
									errors.reference ? "border-red-500" : ""
								}`}
								disabled={isFormDisabled}
							/>
						</div>
						{errors.reference && (
							<p className="text-red-500 text-xs mt-1">{errors.reference}</p>
						)}
					</div>
				</div>

				{/* --- End Form Fields --- */}

				{/* Error Message */}
				{addError && (
					<p className="text-red-500 text-sm mb-4">
						Gagal menambahkan barang: {addError.message || "Terjadi kesalahan"}
					</p>
				)}

				<button
					type="button"
					className="w-full bg-[#5188EE] text-white py-2 rounded-md font-jakarta text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					onClick={handleSubmit}
					disabled={isAdding} // <--- Disable button while adding
				>
					{isAdding ? (
						<>
							{/* Optional: Add a spinner icon here */}
							Menambahkan...
						</>
					) : (
						"Tambah Barang"
					)}
				</button>
			</DialogContent>
		</Dialog>
	);
}
