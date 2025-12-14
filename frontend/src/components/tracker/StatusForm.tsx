import AddKategori from "@/assets/icons/3d-cube-scan1.svg";
import AddBoxSquare from "@/assets/icons/3d-square.svg";
import AddMoneyIcon from "@/assets/icons/anggaran.svg";
import AddBox from "@/assets/icons/box.svg";
import AddSatuan from "@/assets/icons/bubble.svg";
import { type ErrorResponse, ProcurementStatus } from "@/lib/interfaces";
import { Link } from "@tanstack/react-router";
import { MoveUpRight, Upload } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Textarea } from "../ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Barang } from "@/lib/interfaces";
import { useToast } from "@/hooks/useToast";
import { updateItem } from "@/api/item";
import type { AxiosError } from "axios";
import { procurementUpdateApiService } from "@/api/procurement";

export function StatusForm({
	status,
	data,
	refetch,
}: {
	status: ProcurementStatus;
	data: any;
	refetch: () => void;
}) {
	const [PODocument, setPODocument] = useState<File | null>(data.po_document);
	const [PODate, setPODate] = useState<string | null>(data.po_date);
	const [BASTDocument, setBASTDocument] = useState<File | null>(
		data.bast_document,
	);
	const [duration, setDuration] = useState<number>(1);
	const [durationUnit, setDurationUnit] = useState<string>("hari");
	const [approval, setApproval] = useState(false);
	const [verificationNote, setVerificationNote] = useState(
		data.verification_note,
	);
	const { success, error } = useToast();
	const [newItemData, setFormData] = useState<Omit<Barang, "id">>({
		item_code: "",
		item_name: "",
		price: 0,
		specifications: "",
		category: "",
		unit: "",
		reference: "",
	});
	const [showPriceChangeForm, setShowPriceChangeForm] = useState(false);
	const [priceChange, setPriceChange] = useState(data.item.price || 0);
	const queryClient = useQueryClient();

	// Centralized mutation hook with more generic error and success handling
	const procurementMutation = useMutation({
		mutationFn: async ({
			action,
			procurement_id,
			data,
		}: {
			action: keyof typeof procurementUpdateApiService;
			procurement_id: string;
			data?: any;
		}) => {
			const mutationMethod = procurementUpdateApiService[action];
			return mutationMethod(procurement_id, data || {});
		},
		onSuccess: (_updatedItemData, variables) => {
			if (variables.action === "addItem") {
				queryClient.invalidateQueries({ queryKey: ["items"] });
			}
			queryClient.invalidateQueries({
				queryKey: ["Procurement", variables.procurement_id],
			});
			refetch();
			success("Sukses memperbarui status pengadaan");
		},
		onError: (err: AxiosError<ErrorResponse>, _variables, _context) => {
			error(`Gagal memperbarui status pengadaan ${err.response?.data?.error}`);
		},
	});

	const itemMutation = useMutation({
		mutationFn: updateItem,
		onSuccess: (_updatedItemData, _variables) => {
			queryClient.invalidateQueries({ queryKey: ["items"] });
			queryClient.invalidateQueries({ queryKey: ["Procurement", data.id] });
			setShowPriceChangeForm(false);
			success("Barang berhasil diperbarui")
		},
		onError: (err, _variables, _context) => {
			error(`Gagal memperbarui barang: ${err}`)
		},
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleChangeTextArea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handlePODocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const file = e.target.files[0];
			setPODocument(file);
		}
	};
	const handleBASTDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const file = e.target.files[0];
			setBASTDocument(file);
		}
	};

	const handleAddItem = (itemData: Omit<Barang, "id">) => {
		procurementMutation.mutate({
			action: "addItem",
			procurement_id: data.id,
			data: itemData,
		});
	};

	const handleConfirmPriceMatch = () => {
		procurementMutation.mutate({
			action: "confirmPriceMatch",
			procurement_id: data.id,
			data: null,
		});
	};

	const handleRejectStatus = () => {
		procurementMutation.mutate({
			action: "rejectStatus",
			procurement_id: data.id,
			data: { notes: verificationNote },
		});
	};

	const handleApproveStatus = () => {
		procurementMutation.mutate({
			action: "approveStatus",
			procurement_id: data.id,
			data: { notes: verificationNote },
		});
	};

	const handleCreatePO = () => {
		procurementMutation.mutate({
			action: "createPO",
			procurement_id: data.id,
			data: { po_document: PODocument, po_date: PODate },
		});
	};

	const handleEstimatePO = () => {
		procurementMutation.mutate({
			action: "estimatePO",
			procurement_id: data.id,
			data: { time_estimation: `${duration} ${durationUnit}` },
		});
	};
	const handleRecordDelivery = () => {
		procurementMutation.mutate({
			action: "recordDelivery",
			procurement_id: data.id,
			data: { bast_document: BASTDocument },
		});
	};

	const handlePriceChange = async (updatedBarang: Barang) => {
		await itemMutation.mutateAsync(updatedBarang);
	};

	switch (status) {
		case ProcurementStatus.PENGAJUAN:
			return (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<h2 className="text-xl font-medium text-blue-500 mb-4">Form</h2>
					{showPriceChangeForm ? (
						<div>
							<label htmlFor="price-change-form">Sesuaikan harga barang</label>
							<form
								name="price-change-form"
								onSubmit={() =>
									handlePriceChange({ ...data.item, price: priceChange })
								}
							>
								<input
									name="price-change-form"
									type="number"
									value={priceChange}
									onChange={(e) =>
										setPriceChange(Number.parseInt(e.target.value))
									}
									placeholder="Masukkan Harga Master Barang"
									className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
									disabled={procurementMutation.isPending}
									required
								/>
								<button
									type="submit"
									className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									Simpan
								</button>
							</form>
						</div>
					) : data.item_id ? (
						<div className="flex items-center justify-center h-64">
							<p className="text-[#474747]">
								Apakah harga sudah sesuai master barang?
							</p>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setShowPriceChangeForm(true)}
									className="bg-[#474747]/10 text-[#474747] py-2 px-4 flex justify-center"
								>
									Belum dan edit harga
								</button>
								<button
									type="button"
									onClick={() => handleConfirmPriceMatch()}
									className="bg-[#5188EE] text-white py-2 px-4 flex justify-center"
								>
									Sudah dan lanjutkan
								</button>
							</div>
						</div>
					) : (
						<form
							onSubmit={(e: FormEvent) => {
								e.preventDefault();
								handleAddItem(newItemData);
							}}
						>
							<p className="text-sm text-red-500">
								*Barang belum ada di database sehingga harus ditambahkan
								terlebih dahulu
							</p>
							<div className="grid grid-cols-2 gap-x-2 gap-y-4">
								<div>
									<p className="block font-jakarta mb-1">Nama Barang</p>
									<div className="relative">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
											<img src={AddBox} alt="Barang" className="h-4 w-4" />{" "}
										</span>
										<input
											name="item_name"
											type="text"
											value={newItemData.item_name}
											onChange={handleChange}
											placeholder="Masukkan Nama Barang"
											className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
											disabled={procurementMutation.isPending}
											required
										/>
									</div>
								</div>
								<div>
									<p className="block font-jakarta mb-1">Kode Barang</p>
									<div className="relative">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
											<img src={AddBoxSquare} alt="Kode" className="h-4 w-4" />
										</span>
										<input
											name="item_code"
											type="text"
											value={newItemData.item_code}
											onChange={handleChange}
											placeholder="Masukkan Kode Barang"
											className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
											disabled={procurementMutation.isPending}
											required
										/>
									</div>
								</div>

								<div>
									<p className="block font-jakarta mb-1">Kelompok Bidang</p>
									<div className="relative">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
											<img
												src={AddKategori}
												alt="Kategori"
												className="h-4 w-4"
											/>
										</span>
										<input
											name="category"
											type="text"
											value={newItemData.category}
											onChange={handleChange}
											placeholder="Masukkan Kelompok Bidang"
											className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
											disabled={procurementMutation.isPending}
											required
										/>
									</div>
								</div>
								<div>
									<p className="block font-jakarta mb-1">Referensi</p>
									<div className="relative">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
											<img src={AddKategori} alt="Harga" className="h-4 w-4" />
										</span>
										<input
											name="reference"
											value={newItemData.reference}
											onChange={handleChange}
											placeholder="Link atau referensi lainnya"
											className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
											disabled={procurementMutation.isPending}
										/>
									</div>
								</div>
								<div>
									<p className="block font-jakarta mb-1">Harga Satuan</p>
									<div className="relative">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
											<img src={AddMoneyIcon} alt="Harga" className="h-4 w-4" />
										</span>
										<input
											name="price"
											type="number"
											value={newItemData.price}
											onChange={handleChange}
											placeholder="Masukkan Harga Satuan"
											className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
											disabled={procurementMutation.isPending}
											required
										/>
									</div>
								</div>

								<div>
									<p className="block font-jakarta mb-1">Satuan</p>
									<div className="relative">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
											<img
												src={AddSatuan}
												alt="Satuan"
												className="h-4 w-4"
											/>{" "}
										</span>
										<input
											name="unit"
											type="text"
											value={newItemData.unit}
											onChange={handleChange}
											placeholder="Masukkan Satuan"
											className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
											disabled={procurementMutation.isPending}
											required
										/>
									</div>
								</div>
								<div className="col-span-2">
									<p className="block font-jakarta mb-1">Spesifikasi</p>
									<div className="relative">
										<span className="absolute left-3 top-3 transform -translate-y-1/2">
											{" "}
											{/* Adjusted icon position for textarea */}
											<img
												src={AddKategori}
												alt="Spesifikasi"
												className="h-4 w-4"
											/>{" "}
											{/* Using AddKategori */}
										</span>
										<Textarea
											name="specifications" // <--- Name matches Barang key
											value={newItemData.specifications}
											onChange={handleChangeTextArea}
											placeholder="Masukkan Spesifikasi"
											className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
											disabled={procurementMutation.isPending}
										/>
									</div>
								</div>
								<button
									type="submit"
									className="w-full bg-[#5188EE] text-white py-2 rounded-md font-jakarta text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 col-span-2"
									disabled={procurementMutation.isPending}
								>
									{procurementMutation.isPending ? (
										<>Menambahkan...</>
									) : (
										"Tambah Barang"
									)}
								</button>
							</div>
						</form>
					)}
				</div>
			);
		case ProcurementStatus.VERIFIKASI_PENGAJUAN:
			return data.verification_note ? (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<div className="flex flex-col items-center justify-center h-64">
						<p>Catatan Verifikasi</p>
						<p>{data.verification_note}</p>
					</div>
				</div>
			) : (
				<form
					className="p-6 border border-[#DDDDDD] rounded-[12px]"
					onSubmit={(e: FormEvent) => {
						e.preventDefault();
						if (approval) {
							handleApproveStatus();
						} else {
							handleRejectStatus();
						}
					}}
				>
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Form Verifikasi Pengajuan
					</h2>
					<div className="space-y-4">
						<label
							htmlFor="verification-note"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Setujui pengajuan?
						</label>
						<div className="flex items-center gap-4">
							<select
								value={approval ? "approve" : "reject"}
								onChange={(e) => setApproval(e.target.value === "approve")}
							>
								<option value="approve">Setuju</option>
								<option value="reject">Tolak</option>
							</select>
						</div>
					</div>
					{!approval && (
						<div className="space-y-4">
							<label
								htmlFor="verification-note"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Alasan Penolakan
							</label>
							<textarea
								id="verification-note"
								rows={4}
								className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Masukkan alasan penolakan..."
								value={verificationNote}
								onChange={(e) => setVerificationNote(e.target.value)}
							/>
						</div>
					)}
					<button
						type="submit"
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Simpan
					</button>
				</form>
			);
		case ProcurementStatus.PENGAJUAN_DITOLAK:
			return data.verification_note ? (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<div className="flex flex-col items-center justify-center h-64">
						<p>Catatan Verifikasi</p>
						<p>{data.verification_note}</p>
					</div>
				</div>
			) : (
				<form className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Form Verifikasi Pengajuan
					</h2>
					<div className="space-y-4">
						<label
							htmlFor="verification-note"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Catatan Verifikasi
						</label>
						<textarea
							id="verification-note"
							rows={4}
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Masukkan catatan verifikasi..."
							value={verificationNote}
							onChange={(e) => setVerificationNote(e.target.value)}
						/>
					</div>
					<div className="flex justify-end">
						<button
							type="submit"
							className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							Ubah catatan
						</button>
					</div>
				</form>
			);
		case ProcurementStatus.PENGIRIMAN_ORDER:
			return data.po_document || data.po_date ? (
				<div className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<div className="flex items-center justify-center h-64">
						<a href={data.po_document} target="_blank" rel="noreferrer">
							Cek Dokumen PO
						</a>
					</div>
				</div>
			) : (
				<form
					className="p-6 border border-[#DDDDDD] rounded-[12px]"
					onSubmit={(e: FormEvent) => {
						e.preventDefault();
						handleCreatePO();
					}}
				>
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Form Pengiriman Order
					</h2>
					<div className="space-y-4">
						<div>
							<label
								htmlFor="file-upload"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Upload Dokumen PO
							</label>
							<div className="flex items-center gap-2">
								<label
									htmlFor="file-upload"
									className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
								>
									<Upload className="h-4 w-4" />
									<span>Pilih File</span>
								</label>
								<span className="text-sm text-gray-500">
									{PODocument ? PODocument.name : "Tidak ada file dipilih"}
								</span>
							</div>
							<input
								id="file-upload"
								type="file"
								accept=".pdf,application/pdf"
								className="hidden"
								onChange={handlePODocumentChange}
							/>
						</div>
						<div>
							<p className="block font-jakarta mb-1">Waktu PO</p>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
									<img
										src={AddMoneyIcon || "/placeholder.svg"}
										alt="Tanggal"
										className="h-4 w-4"
									/>
								</span>
								<input
									name="po_date"
									type="date"
									value={PODate || ""}
									onChange={(e) => setPODate(e.target.value.toString())}
									className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
									disabled={procurementMutation.isPending}
									required
								/>
							</div>
						</div>
						<button
							type="submit"
							className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							Simpan
						</button>
					</div>
				</form>
			);
		case ProcurementStatus.PENGIRIMAN_BARANG:
			return (
				<div>
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Estimasi PO
					</h2>
					<form
						onSubmit={(e: FormEvent) => {
							e.preventDefault();
							handleEstimatePO();
						}}
					>
						<div className="space-y-4">
							<div>
								<label
									htmlFor="item-delivery-note"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Estimasi waktu pengiriman
								</label>
								<div className="flex gap-2">
									<div className="relative flex-1">
										<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
											<img
												src={AddMoneyIcon || "/placeholder.svg"}
												alt="Durasi"
												className="h-4 w-4"
											/>
										</span>
										<input
											name="duration"
											type="number"
											min="1"
											value={duration}
											onChange={(e) => setDuration(Number(e.target.value))}
											placeholder={"Masukkan durasi"}
											className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
											disabled={procurementMutation.isPending}
											required
										/>
									</div>
									<select
										value={durationUnit}
										onChange={(e) => setDurationUnit(e.target.value)}
										className="border rounded-lg font-jakarta px-3 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed"
										disabled={procurementMutation.isPending}
									>
										<option value="hari">Hari</option>
										<option value="minggu">Minggu</option>
										<option value="bulan">Bulan</option>
									</select>
								</div>
							</div>
							<button
								type="submit"
								className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							>
								Simpan
							</button>
						</div>
					</form>
				</div>
			);
		case ProcurementStatus.PENERIMAAN_BARANG:
			return (
				<form
					className="p-6 border border-[#DDDDDD] rounded-[12px]"
					onSubmit={(e: FormEvent) => {
						e.preventDefault();
						handleRecordDelivery();
					}}
				>
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Form Barang Diterima
					</h2>
					{data.bast_document || data.bast_date ? (
						<div className="flex items-center justify-center h-64">
							<a href={data.po_document} target="_blank" rel="noreferrer">
								Cek Dokumen BAST
							</a>
						</div>
					) : (
						<div className="space-y-4">
							<div>
								<label
									htmlFor="file-upload"
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									Upload Dokumen BAST
								</label>
								<div className="flex items-center gap-2">
									<label
										htmlFor="file-upload"
										className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50"
									>
										<Upload className="h-4 w-4" />
										<span>Pilih File</span>
									</label>
									<span className="text-sm text-gray-500">
										{BASTDocument
											? BASTDocument.name
											: "Tidak ada file dipilih"}
									</span>
								</div>
								<input
									id="file-upload"
									type="file"
									accept=".pdf,application/pdf"
									className="hidden"
									onChange={handleBASTDocumentChange}
								/>
							</div>
							<button
								type="submit"
								className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
							>
								Simpan
							</button>
						</div>
					)}
				</form>
			);
		case ProcurementStatus.PENYERAHAN_BARANG:
			return (
				<form className="p-6 border border-[#DDDDDD] rounded-[12px]">
					<h2 className="text-xl font-medium text-blue-500 mb-4">
						Form Barang Diserahkan
					</h2>
					<div className="space-y-4">
						<label
							htmlFor="item-delivered-note"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Print number
						</label>
						{data.print_number ? (
							<p>{data.print_number.id}</p>
						) : (
							<Link
								to={"/anggaran"}
								className="flex gap-2 hover:underline text-blue-500"
							>
								<p>Cetak print number di sini</p>
								<MoveUpRight />
							</Link>
						)}
					</div>
					<div className="space-y-4">
						<label
							htmlFor="verification-note"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Catatan akhir pengadaan
						</label>
						<textarea
							id="verification-note"
							rows={4}
							className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="Masukkan catatan verifikasi..."
						/>
					</div>
					<button
						type="submit"
						className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
					>
						Simpan
					</button>
				</form>
			);
		default:
			return <form>Default Step</form>;
	}
}
