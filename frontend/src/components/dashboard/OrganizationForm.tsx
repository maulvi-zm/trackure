// Library Import
import { useState } from "react";
// Components Import
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// Icon Import
import AddBox from "@/assets/icons/box.svg";
import AddMoneyIcon from "@/assets/icons/anggaran.svg";

interface OrganizationFormProps {
	open: boolean;
	onClose: () => void;
	onSave: (data: { name: string; totalBudget?: number; year?: number }) => void;
	isAdding?: boolean;
	addError?: Error | null;
	initialData?: {
		name?: string;
		totalBudget?: number;
		year?: number;
	};
	mode: "create" | "edit";
}

export default function OrganizationForm({
	open,
	onClose,
	onSave,
	isAdding = false,
	addError = null,
	initialData,
	mode,
}: OrganizationFormProps) {
	const [formData, setFormData] = useState({
		name: initialData?.name || "",
		totalBudget: initialData?.totalBudget || 0,
		year: initialData?.year || new Date().getFullYear(),
	});

	const [displayBudget, setDisplayBudget] = useState(
		initialData?.totalBudget?.toLocaleString() || "0",
	);

	// Add validation state
	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = "Nama Organisasi harus diisi";
		}

		if (
			mode === "edit" &&
			(!formData.totalBudget || formData.totalBudget <= 0)
		) {
			newErrors.totalBudget = "Total Anggaran harus lebih dari 0";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		if (name === "totalBudget") {
			// Remove commas and convert to number
			const numericValue = value.replace(/,/g, "");
			if (numericValue === "" || /^\d+$/.test(numericValue)) {
				setDisplayBudget(
					numericValue === "" ? "0" : Number(numericValue).toLocaleString(),
				);
				setFormData((prev) => ({
					...prev,
					[name]: numericValue === "" ? 0 : Number(numericValue),
				}));
			}
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: name === "name" ? value : Number(value),
			}));
		}

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
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-[#5188EE] font-jakarta">
						{mode === "create" ? "Tambah Organisasi" : "Edit Organisasi"}
					</DialogTitle>
				</DialogHeader>

				{/* Nama Organisasi */}
				<div className="flex flex-col gap-y-2">
					<p className="font-jakarta text-sm text-[#474747]">Nama Organisasi</p>
					<div className="relative">
						<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
							<img src={AddBox} alt="Organisasi" className="h-4 w-4" />
						</span>
						<input
							name="name"
							type="text"
							value={formData.name}
							onChange={handleChange}
							placeholder="Masukkan Nama Organisasi"
							className={`w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed ${
								errors.name ? "border-red-500" : ""
							}`}
							disabled={isFormDisabled}
						/>
					</div>
					{errors.name && (
						<p className="text-red-500 text-xs mt-1">{errors.name}</p>
					)}
				</div>

				{mode === "edit" && (
					<>
						{/* Total Budget */}
						<div className="mb-4">
							<p className="block font-jakarta mb-1">Total Anggaran</p>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
									<img src={AddMoneyIcon} alt="Anggaran" className="h-4 w-4" />
								</span>
								<input
									name="totalBudget"
									type="text"
									value={displayBudget}
									onChange={handleChange}
									placeholder="Masukkan Total Anggaran"
									className={`w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed ${
										errors.totalBudget ? "border-red-500" : ""
									}`}
									disabled={isFormDisabled}
								/>
							</div>
							{errors.totalBudget && (
								<p className="text-red-500 text-xs mt-1">
									{errors.totalBudget}
								</p>
							)}
						</div>
					</>
				)}

				{/* Error Message */}
				{addError && (
					<p className="text-red-500 text-sm mb-4">
						{mode === "create"
							? "Gagal menambahkan organisasi"
							: "Gagal mengedit organisasi"}
						: {addError.message || "Terjadi kesalahan"}
					</p>
				)}

				<button
					type="button"
					className="w-full bg-[#5188EE] text-white py-2 rounded-md font-jakarta text-sm hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
					onClick={handleSubmit}
					disabled={isAdding}
				>
					{isAdding ? (
						<>{mode === "create" ? "Menambahkan..." : "Menyimpan..."}</>
					) : mode === "create" ? (
						"Tambah Organisasi"
					) : (
						"Simpan Perubahan"
					)}
				</button>
			</DialogContent>
		</Dialog>
	);
}
