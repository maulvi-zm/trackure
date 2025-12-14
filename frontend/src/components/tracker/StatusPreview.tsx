import { ProcurementStatus } from "@/lib/interfaces";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function StatusPreview({
	status,
	data,
}: { status: ProcurementStatus; data: any }) {
	switch (status) {
		case ProcurementStatus.PENGAJUAN:
			return (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Detail Pengajuan
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex flex-col gap-4">
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Kode Barang
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{data.item ? data.item.item_code : "-"}
								</p>
							</div>
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Nama Barang
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{data.item ? data.item.item_name : "-"}
								</p>
							</div>
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Harga Nyata Barang
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{data.item_id ? formatCurrency(data.estimated_price) : "-"}
								</p>
							</div>
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Total Nyata
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{data.item_id
										? formatCurrency(data.item.price * data.quantity)
										: "-"}
								</p>
							</div>
						</div>
						<div className="flex flex-col gap-4">
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Link Referensi
								</p>
								<a
									className="text-blue-500 text-sm font-medium underline"
									target="_blank"
									rel="noreferrer"
									href={data.reference}
								>
									Cek barang
								</a>
							</div>
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Kuantitas
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{data.quantity}
								</p>
							</div>
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Estimasi Harga Barang
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{formatCurrency(data.estimated_price)}
								</p>
							</div>

							<div>
								<p className="block text-sm font-medium text-gray-700">
									Estimasi Total Harga
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{formatCurrency(data.quantity * data.estimated_price)}
								</p>
							</div>
						</div>
					</div>
				</div>
			);
		case ProcurementStatus.VERIFIKASI_PENGAJUAN:
			return (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<>
						<h2 className="text-xl font-medium text-blue-500 mb-4">
							Detail Verifikasi Pengajuan
						</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="flex flex-col gap-4">
								<div>
									<p className="block text-sm font-medium text-gray-700">
										Status verifikasi pengajuan
									</p>
									<p className="block text-sm font-medium text-gray-700">
										{data.status == ProcurementStatus.PENGAJUAN_DITOLAK
											? "Ditolak"
											: data.status == ProcurementStatus.VERIFIKASI_PENGAJUAN
												? "-"
												: "Diterima"}
									</p>
								</div>
								<div>
									<p className="block text-sm font-medium text-gray-700">
										Catatan verifikasi
									</p>
									<p className="block text-sm font-medium text-gray-700">
										{data.verification_note || "-"}
									</p>
								</div>
								<div>
									<p className="block text-sm font-medium text-gray-700">
										Update terakhir
									</p>
									<p className="block text-sm font-medium text-gray-700">
										{data.verification_date
											? formatDateTime(new Date(data.verification_date))
											: "-"}
									</p>
								</div>
							</div>
						</div>
					</>
				</div>
			);
		case ProcurementStatus.PENGIRIMAN_ORDER:
			return (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Detail Pengiriman Order
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex flex-col gap-4">
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Update terakhir
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{data.po_date ? formatDateTime(new Date(data.po_date)) : "-"}
								</p>
							</div>
						</div>
					</div>
				</div>
			);
		case ProcurementStatus.PENGIRIMAN_BARANG:
			return (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Detail Pengiriman Barang
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex flex-col gap-4">
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Update terakhir
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{data.time_estimation_date
										? formatDateTime(new Date(data.time_estimation_date))
										: "-"}
								</p>
							</div>
						</div>
					</div>
				</div>
			);
		case ProcurementStatus.PENERIMAAN_BARANG:
			return (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Detail Penerimaan Barang
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex flex-col gap-4">
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Update terakhir
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{data.bast_date
										? formatDateTime(new Date(data.bast_date))
										: "-"}
								</p>
							</div>
						</div>
					</div>
				</div>
			);
		case ProcurementStatus.PENYERAHAN_BARANG:
			return (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Detail Penyerahan Barang
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex flex-col gap-4">
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Bukti Penyerahan Barang
								</p>
								{data.print_number ? (
									<p className="block text-sm font-medium text-gray-700">
										{data.print_number.proof_photo}
									</p>
								) : (
									<p className="block text-sm font-medium text-gray-700">-</p>
								)}
							</div>
						</div>
					</div>
				</div>
			);
		default:
			return (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Detail Verifikasi Pengajuan
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="flex flex-col gap-4">
							<div>
								<p className="block text-sm font-medium text-gray-700">
									Pengajuan diterima
								</p>
								<p className="block text-sm font-medium text-gray-700">
									{data.notes}
								</p>
							</div>
						</div>
					</div>
				</div>
			);
	}
}
