export default function HapusBarang({
	onClose,
	onConfirm,
}: {
	onClose: () => void;
	onConfirm: () => void;
}) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000040] backdrop-blur-sm">
			<div className="bg-white rounded-2xl p-6 w-[90%] max-w-lg shadow-lg  relative">
				<h2 className="text-2xl font-jakarta text-center font-semibold text-[#5188EE] mb-2">
					Kamu Yakin Ingin Menghapus Barang Ini?
				</h2>
				<p className="text-sm font-jakarta text-gray-400 mb-6">
					Aksi ini tidak dapat dibatalkan
				</p>

				<div className="space-y-3">
					<button
						className="w-full bg-[#EE5151] text-white py-2 rounded-lg font-jakarta text-sm hover:bg-red-600"
						onClick={onConfirm}
					>
						Ya, Hapus Barang
					</button>
					<button
						className="w-full bg-gray-100 text-black py-2 rounded-lg font-jakarta text-sm hover:bg-gray-200"
						onClick={onClose}
					>
						Tidak
					</button>
				</div>
			</div>
		</div>
	);
}
