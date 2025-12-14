import type { PrintNumberItem } from "./PrintNumber";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UploadModalsProps {
	showUploadModal: boolean;
	showConfirmModal: boolean;
	selectedItemForUpload: PrintNumberItem | null;
	selectedFile: File | null;
	previewUrl: string | null;
	closeUploadModal: () => void;
	closeConfirmModal: () => void;
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleUploadConfirm: () => void;
	handleUploadSubmit: () => void;
	handleDeletePhoto: (item: PrintNumberItem) => void;
	itemToDelete: PrintNumberItem | null;
}

export const UploadModals = ({
	showUploadModal,
	showConfirmModal,
	selectedItemForUpload,
	selectedFile,
	previewUrl,
	closeUploadModal,
	closeConfirmModal,
	handleFileChange,
	handleUploadConfirm,
	handleUploadSubmit,
}: UploadModalsProps) => {
	const [error, setError] = useState<string | null>(null);

	const validateFile = (file: File | null) => {
		if (!file) {
			setError("File harus dipilih");
			return false;
		}

		// Check file type
		if (!file.type.startsWith("image/")) {
			setError("File harus berupa gambar");
			return false;
		}

		// Check file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			setError("Ukuran file maksimal 5MB");
			return false;
		}

		setError(null);
		return true;
	};

	const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0] || null;
		if (validateFile(file)) {
			handleFileChange(e);
		} else {
			// Clear the file input
			e.target.value = "";
		}
	};

	const handleConfirmUpload = () => {
		if (validateFile(selectedFile)) {
			handleUploadConfirm();
		}
	};

	return (
		<>
			{/* Upload Modal */}
			{showUploadModal && selectedItemForUpload && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000040] backdrop-blur-xs">
					<div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
						<button
							type="button"
							onClick={closeUploadModal}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
							aria-label="Close"
						>
							&times;
						</button>

						<h2 className="text-xl font-jakarta font-semibold text-[#5188EE] mb-6">
							Unggah Foto
						</h2>

						<div className="mb-4">
							<p className="block font-jakarta mb-1">Print Number</p>
							<p className="font-medium">{selectedItemForUpload.printNumber}</p>
						</div>

						<div className="mb-4">
							<p className="block font-jakarta mb-1">Pilih Foto</p>
							<input
								type="file"
								accept="image/*"
								onChange={handleFileInputChange}
								className={cn(
									"w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100",
									error && "border-red-500",
								)}
							/>
							{error && <p className="text-red-500 text-xs mt-1">{error}</p>}
						</div>

						{previewUrl && (
							<div className="mb-4">
								<p className="block font-jakarta mb-1">Preview</p>
								<div className="border rounded-lg p-2 bg-gray-50">
									<img
										src={previewUrl}
										alt="Preview"
										className="mx-auto max-h-48 object-contain"
									/>
								</div>
							</div>
						)}

						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={closeUploadModal}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-jakarta text-sm"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleConfirmUpload}
								disabled={!selectedFile}
								className={`px-4 py-2 rounded-md font-jakarta text-sm ${
									selectedFile
										? "bg-[#5188EE] text-white hover:bg-blue-600"
										: "bg-gray-200 text-gray-400 cursor-not-allowed"
								}`}
							>
								Unggah
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Confirmation Modal */}
			{showConfirmModal && selectedFile && selectedItemForUpload && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000040] backdrop-blur-xs">
					<div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
						<button
							type="button"
							onClick={closeConfirmModal}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
							aria-label="Close"
						>
							&times;
						</button>

						<h2 className="text-xl font-jakarta font-semibold text-[#5188EE] mb-6">
							Konfirmasi Unggah
						</h2>

						<div className="mb-6 text-center">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-12 w-12 mx-auto text-yellow-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>svg</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
							<p className="text-sm text-gray-500 mt-4">
								Apakah Anda yakin ingin mengunggah foto ini untuk Print Number{" "}
								{selectedItemForUpload.printNumber}?
							</p>
						</div>

						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={closeConfirmModal}
								className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-jakarta text-sm"
							>
								Batal
							</button>
							<button
								type="button"
								onClick={handleUploadSubmit}
								className="px-4 py-2 bg-[#5188EE] text-white rounded-md hover:bg-blue-600 font-jakarta text-sm"
							>
								Ya, Unggah
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};
