import type { PrintNumberItem } from "./PrintNumber";

interface DeleteConfirmationModalProps {
	showDeleteModal: boolean;
	itemToDelete: PrintNumberItem | null;
	closeDeleteModal: () => void;
	handleDeletePhoto: (item: PrintNumberItem) => void;
}

export const DeleteConfirmationModal = ({
	showDeleteModal,
	itemToDelete,
	closeDeleteModal,
	handleDeletePhoto,
}: DeleteConfirmationModalProps) => {
	if (!showDeleteModal || !itemToDelete) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000040] backdrop-blur-xs">
			<div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg">
				<button
					type="button"
					onClick={closeDeleteModal}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
					aria-label="Close"
				>
					&times;
				</button>

				<h2 className="text-xl font-jakarta font-semibold text-[#5188EE] mb-6">
					Konfirmasi Hapus
				</h2>

				<div className="mb-6 text-center">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-12 w-12 mx-auto text-red-500"
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
						Apakah Anda yakin ingin menghapus foto untuk Print Number{" "}
						{itemToDelete.printNumber}?
					</p>
				</div>

				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={closeDeleteModal}
						className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-jakarta text-sm"
					>
						Batal
					</button>
					<button
						type="button"
						onClick={() => {
							handleDeletePhoto(itemToDelete);
							closeDeleteModal();
						}}
						className="px-4 py-2 bg-[#5188EE] text-white rounded-md hover:bg-blue-600 font-jakarta text-sm"
					>
						Ya, Hapus
					</button>
				</div>
			</div>
		</div>
	);
};
