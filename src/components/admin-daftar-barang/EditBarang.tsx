// Library Import
import { useState } from "react";
import { Link } from "lucide-react";
// Icon Import
import Box from "@/assets/icons/box.svg";
import BoxSquare from "@/assets/icons/3d-square.svg";
import MoneyIcon from "@/assets/icons/money.svg";
import Satuan from "@/assets/icons/bubble.svg";
import Kategori from "@/assets/icons/3d-cube-scan1.svg";
// Interface Import
import type { Barang } from "@/lib/interfaces";
// Component Import
import { Textarea } from "../ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EditBarang({
	open,
	onClose,
	barang,
	onSave,
	isSaving,
	saveError,
}: {
	open: boolean;
	onClose: () => void;
	barang: Barang;
	onSave: (updated: Barang) => void;
	isSaving: boolean;
	saveError: Error | null;
}) {
	const [formData, setFormData] = useState<Barang>(barang);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		const fieldMap: { [key: string]: keyof Barang } = {
			kode: "item_code",
			nama: "item_name",
			item_code: "item_code",
			item_name: "item_name",
			price: "price",
			unit: "unit",
			category: "category",
			specifications: "specifications",
			reference: "reference",
		};

		const fieldName = fieldMap[name] || (name as keyof Barang);

		setFormData((prev) => ({
			...prev,
			[fieldName]: fieldName === "price" ? Number(value) : value,
		}));
	};

	const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		const fieldMap: { [key: string]: keyof Barang } = {
			specifications: "specifications",
			reference: "reference",
		};
		const fieldName = fieldMap[name] || (name as keyof Barang);

		setFormData((prev) => ({ ...prev, [fieldName]: value }));
	};

	const handleSubmit = () => {
		onSave(formData);
	};

	const isFormDisabled = isSaving;

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="font-jakarta text-[#5188EE]">
						Edit Barang
					</DialogTitle>
				</DialogHeader>
				
				<div className="flex flex-col gap-y-2">
					{/* Kode Barang */}
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Kode Barang</p>
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
								<img src={BoxSquare} alt="Kode" className="h-4 w-4" />
							</span>
							<input
								name="item_code" // <--- Changed name to match Barang key
								type="text"
								value={formData.item_code}
								onChange={handleChange}
								placeholder="Masukkan Kode Barang"
								className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
								disabled={isFormDisabled}
							/>
						</div>
					</div>

					<div className="w-full flex gap-x-2">
						{/* Nama Barang */}
						<div className="flex flex-col gap-y-2 w-full">
							<p className="font-jakarta text-sm text-[#474747]">Nama Barang</p>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
									<img src={Box} alt="Barang" className="h-4 w-4" />
								</span>
								<input
									name="item_name"
									type="text"
									value={formData.item_name}
									onChange={handleChange}
									placeholder="Masukkan Nama Barang"
									className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
									disabled={isFormDisabled}
								/>
							</div>
						</div>

						{/* Harga Satuan */}
						<div className="flex flex-col gap-y-2 w-full">
							<p className="font-jakarta text-sm text-[#474747]">Harga Satuan</p>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
									<img src={MoneyIcon} alt="Harga" className="h-4 w-4" />
								</span>
								<input
									name="price"
									type="text"
									value={formData.price}
									onChange={handleChange}
									placeholder="Masukkan Harga Satuan"
									className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
									disabled={isFormDisabled} // <--- Disable input while saving
								/>
							</div>
						</div>
					</div>
		
					{/* Satuan */}
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Satuan</p>
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
								<img src={Satuan} alt="Satuan" className="h-4 w-4" />
							</span>
							<input
								name="unit" // <--- Changed name to match Barang key
								type="text"
								value={formData.unit}
								onChange={handleChange}
								placeholder="Masukkan Satuan"
								className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
								disabled={isFormDisabled} // <--- Disable input while saving
							/>
						</div>
					</div>

					{/* Spesifikasi */}
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Spesifikasi</p>
						<div className="relative">
							<span className="absolute left-3 top-[50%]  transform -translate-y-1/2">
								{" "}
								<Link size={16} />
							</span>
							<Textarea
								name="specifications"
								value={formData.specifications}
								onChange={handleChangeTextArea}
								placeholder="Masukkan Spesifikasi"
								className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
								disabled={isFormDisabled} // <--- Disable input while saving
							/>
						</div>
					</div>

					{/* Kategori (Kelompok Bidang) */}
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Kelompok Bidang</p>
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
								<img src={Kategori} alt="Kategori" className="h-4 w-4" />
							</span>
							<input
								name="category"
								type="text"
								value={formData.category}
								onChange={handleChange}
								placeholder="Masukkan Kelompok Bidang"
								className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
								disabled={isFormDisabled} // <--- Disable input while saving
							/>
						</div>
					</div>

					{/* Reference */}
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Referensi</p>
						<div className="relative">
							<span className="absolute left-3 top-[50%] transform -translate-y-1/2">
								{" "}
								<img src={Kategori} alt="Referensi" className="h-4 w-4" />{" "}
							</span>
							<Textarea
								name="reference"
								value={formData.reference}
								onChange={handleChangeTextArea}
								placeholder="Masukkan Referensi (Link, Dokumen, dll.)"
								className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
								disabled={isFormDisabled} // <--- Disable input while saving
							/>
						</div>
					</div>
				</div>

				{/* --- End Form Fields --- */}

				{/* Error Message */}
				{saveError && (
					<p className="text-red-500 text-sm mb-4">
						Gagal menyimpan perubahan:{" "}
						{saveError.message || "Terjadi kesalahan"}
					</p>
				)}

				<button
					type="button"
					className="w-full bg-[#5188EE] text-white py-2 rounded-md font-jakarta text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2" // Added flex/center/gap for loading text/spinner
					onClick={handleSubmit}
					disabled={isSaving} // <--- Disable button while saving
				>
					{isSaving ? (
						<>
							{/* Optional: Add a spinner icon here */}
							{/* <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg> */}
							Menyimpan...
						</>
					) : (
						"Simpan Perubahan"
					)}
				</button>
			</DialogContent>
		</Dialog>
	);
}
