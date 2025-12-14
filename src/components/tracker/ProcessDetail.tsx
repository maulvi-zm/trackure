import { ProcurementStatus } from "@/lib/interfaces";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function ProcessDetail({
	status,
	data,
}: { status: ProcurementStatus; data: any }) {
	switch (status) {
		case ProcurementStatus.PENGAJUAN:
			return (
				<div className=" gap-y-4 grid grid-cols-2">
					<div className="text-lg font-semibold col-span-2">
						Detail {ProcurementStatus.PENGAJUAN}
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Kode Barang</div>
						<div className="text-gray-500">
							{data.item ? data.item.item_code : "-"}
						</div>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Link Referensi Barang</div>
						<a className="text-gray-500" href={data.item.reference}>
							{data.item.reference}
						</a>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Nama Barang</div>
						<div className="text-gray-500">{data.item.item_name}</div>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Kategori Barang</div>
						<div className="text-gray-500">{data.item.category}</div>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Kuantitas (unit)</div>
						<div className="text-gray-500">
							{data.quantity} ({data.item.unit})
						</div>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Harga Barang</div>
						<div className="text-gray-500">
							{formatCurrency(data.item.price)}
						</div>
					</div>
					<div className="flex flex-col gap-y-2 col-span-2">
						<div className="text-gray-700">Spesifikasi Barang</div>
						<div className="text-gray-500">{data.item.specifications}</div>
					</div>
				</div>
			);
		case ProcurementStatus.VERIFIKASI_PENGAJUAN:
			return (
				<div className="flex flex-col gap-y-4">
					<div className="text-lg font-semibold">Detail Verifikasi Barang</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Alasan</div>
						<div className="text-gray-500">
							{data.item.verification_note || "-"}
						</div>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-500">
							Diverifikasi pada{" "}
							{formatDateTime(new Date(data.verification_date))}
						</div>
					</div>
				</div>
			);
		case ProcurementStatus.PENGAJUAN_DITOLAK:
			return (
				<div className="flex flex-col gap-y-4">
					<div className="text-lg font-semibold">
						Detail Penolakan Pengajuan
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Alasan</div>
						<div className="text-gray-500">{data.item.verification_note}</div>
					</div>
				</div>
			);
		case ProcurementStatus.PENGIRIMAN_ORDER:
			return (
				<div className="flex flex-col gap-y-4">
					<div className="text-lg font-semibold">Detail Pengiriman Order</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Dokumen PO</div>
						<a
							href={data.po_document}
							className="text-blue-500 hover:underline flex gap-2"
						>
							<p>Buka PDF di tab baru</p> <ArrowUpRight />
						</a>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-500">
							Diunggah pada {formatDateTime(new Date(data.po_date))}
						</div>
					</div>
				</div>
			);
		case ProcurementStatus.PENGIRIMAN_BARANG:
			return (
				<div className="flex flex-col gap-y-4">
					<div className="text-lg font-semibold">Detail Pengiriman Barang</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Estimasi waktu pengiriman</div>
						<div className="text-gray-500">{data.time_estimation}</div>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-500">
							Ditambahkan pada{" "}
							{formatDateTime(new Date(data.time_estimation_date))}
						</div>
					</div>
				</div>
			);
		case ProcurementStatus.PENERIMAAN_BARANG:
			return (
				<div className="flex flex-col gap-y-4">
					<div className="text-lg font-semibold">Detail Penerimaan Barang</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Dokumen BAST</div>
						<a
							href={data.bast_document}
							className="text-blue-500 hover:underline flex gap-2"
						>
							<p>Buka BAST di tab baru</p> <ArrowUpRight />
						</a>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-500">
							Diunggah pada {formatDateTime(new Date(data.bast_date))}
						</div>
					</div>
				</div>
			);
		case ProcurementStatus.PENYERAHAN_BARANG:
			return (
				<div className="flex flex-col gap-y-4">
					<div className="text-lg font-semibold">Detail Penyerahan Barang</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Print number</div>
						<div className="text-gray-500">{data.item.id}</div>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Foto bukti penyerahan barang</div>
						<img
							className="h-64 w-full object-cover"
							src="https://cdn.images.express.co.uk/img/dynamic/67/590x/secondary/Man-Utd-news-Cristiano-Ronaldo-SIU-celebration-Brighton-goal-3918291.jpg?r=1645034779588"
							alt={data.item.item_name}
						/>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Catatan</div>
						<div className="text-gray-500">{data.final_note}</div>
					</div>
				</div>
			);
		default:
			return (
				<div className="flex flex-col gap-y-4">
					<div className="text-lg font-semibold">Detail Verifikasi Barang</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Proses 1</div>
						<div className="text-gray-500">Deskripsi proses 1</div>
					</div>
					<div className="flex flex-col gap-y-2">
						<div className="text-gray-700">Proses 2</div>
						<div className="text-gray-500">Deskripsi proses 2</div>
					</div>
				</div>
			);
	}
}
