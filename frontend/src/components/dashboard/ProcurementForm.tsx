import type React from "react";
import { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Box, Package, CircleDollarSign } from "lucide-react";
import type { Barang } from "@/lib/interfaces";


export interface NewProcurement {
	item_id?: string;
	quantity: number;
	reference?: string;
	estimated_price?: number;
}

interface FormErrors {
	item_id?: string;
	quantity?: string;
	reference?: string;
	estimated_price?: string;
}

export default function ProcurementForm({
	open,
	onClose,
	onSave,
	itemsData,
}: {
	open: boolean;
	onClose: () => void;
	onSave: (newProcurement: NewProcurement, item_exists: boolean) => void;
	itemsData: Barang[] | undefined;
}) {
	const [itemExists, setItemExists] = useState<boolean>(true);
	const [formData, setFormData] = useState<NewProcurement>({
		item_id: "",
		quantity: 0,
		reference: "",
		estimated_price: 0,
	});
	const [errors, setErrors] = useState<FormErrors>({});

	// Database case states
	const [selectedItemId, setSelectedItemId] = useState<string>("");
	const [itemPrice, setItemPrice] = useState<number>(0);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

	const [totalPrice, setTotalPrice] = useState<number>(0);

	const validateForm = () => {
		const newErrors: FormErrors = {};

		if (itemExists) {
			if (!formData.item_id) {
				newErrors.item_id = "Barang harus dipilih";
			}
		} else {
			if (!formData.reference?.trim()) {
				newErrors.reference = "Referensi harus diisi";
			}
			if (!formData.estimated_price || formData.estimated_price <= 0) {
				newErrors.estimated_price = "Perkiraan harga harus lebih dari 0";
			}
		}

		if (!formData.quantity || formData.quantity <= 0) {
			newErrors.quantity = "Jumlah barang harus lebih dari 0";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value, type } = e.target;
		if (type === "number") {
			setFormData((prev) => ({ ...prev, [name]: Number(value) }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
		// Clear error when user starts typing
		if (errors[name as keyof FormErrors]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }));
		}
	};

	useEffect(() => {
		if (itemExists && selectedItemId) {
			const item = itemsData?.find((item) => item.id === selectedItemId);
			if (item) {
				setItemPrice(item.price);
			}
		}
	}, [selectedItemId, itemExists, itemsData]);

	useEffect(() => {
		if (itemExists || !formData.estimated_price) {
			setTotalPrice(itemPrice * formData.quantity);
		} else {
			setTotalPrice(formData.estimated_price * formData.quantity);
		}
	}, [itemExists, itemPrice, formData.estimated_price, formData.quantity]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validateForm()) {
			onSave(formData, itemExists);
			resetFormData();
		}
	};

	const handleCaseChange = (value: boolean) => {
		setItemExists(value as boolean);
		resetFormData();
	};

	const resetFormData = () => {
		setFormData({
			item_id: "",
			quantity: 0,
			reference: "",
			estimated_price: 0,
		});
		setErrors({});
		setSelectedItemId("");
		setItemPrice(0);
		setSearchTerm("");
		setTotalPrice(0);
	};

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className="rounded-lg max-w-md w-full">
				<DialogHeader>
					<DialogTitle className="text-[#5188EE] text-lg font-jakarta font-semibold">
						Formulir Pengajuan Barang
					</DialogTitle>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-2">
					<RadioGroup
						value={itemExists ? "database" : "non-database"}
						onValueChange={(value: string) =>
							handleCaseChange(value === "database")
						}
						className="flex space-x-4 pb-2"
					>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value={"database"} id="database" />
							<Label htmlFor="database" className="font-jakarta text-slate-600">
								Barang ada di Database
							</Label>
						</div>
						<div className="flex items-center space-x-2">
							<RadioGroupItem value="non-database" id="non-database" />
							<Label htmlFor="non-database" className="font-jakarta text-slate-600">
								Barang tidak ada di Database
							</Label>
						</div>
					</RadioGroup>

					{itemExists ? (
						<>
							<div className="flex flex-col gap-y-2 relative">
								<label className="font-jakarta text-sm text-[#474747]" htmlFor="item_id">
									Identitas Barang
								</label>
								<div className="relative">
									<Input
										id="item_search"
										placeholder="Cari barang berdasarkan ID atau nama"
										startIcon={Box}
										iconClassName="text-[#DDDDDD]"
										className={cn(
											"font-jakarta focus-visible:ring-transparent ",
											errors.item_id && "border-red-500",
										)}
										value={searchTerm}
										onChange={(e) => {
											setSearchTerm(e.target.value);
											setIsDropdownOpen(true);
										}}
										onFocus={() => setIsDropdownOpen(true)}
										onBlur={() => {
											setTimeout(() => setIsDropdownOpen(false), 200);
										}}
									/>			
								</div>

								{errors.item_id && (
									<p className="text-red-500 text-xs py-1">{errors.item_id}</p>
								)}

								{isDropdownOpen && searchTerm && (
									<div className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
										{itemsData
											?.filter(
												(item) =>
													item.id
														.toString()
														.toLowerCase()
														.includes(searchTerm.toLowerCase()) ||
													item.item_name
														.toLowerCase()
														.includes(searchTerm.toLowerCase()),
											)
											.map((item) => (
												<div
													key={item.id}
													className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-jakarta"
													onClick={() => {
														setSelectedItemId(item.id);
														setFormData((prev) => ({
															...prev,
															item_id: item.id.toString(),
														}));
														setSearchTerm(item.item_name);
														setIsDropdownOpen(false);
														if (errors.item_id) {
															setErrors((prev) => ({
																...prev,
																item_id: undefined,
															}));
														}
													}}
												>
													<div className="text-sm flex justify-start w-full gap-2">
														<span className="font-medium">{item.id}</span>
														<span>{item.item_name}</span>
													</div>
												</div>
											))}
										{itemsData?.filter(
											(item) =>
												item.id
													.toString()
													.toLowerCase()
													.includes(searchTerm.toLowerCase()) ||
												item.item_name
													.toLowerCase()
													.includes(searchTerm.toLowerCase()),
										).length === 0 && (
											<div className="py-2 px-4 text-sm text-gray-500 font-jakarta">
												Tidak ada barang yang cocok
											</div>
										)}
									</div>
								)}
							</div>

							<div className="flex flex-col">
								<label className="text-[#474747] text-sm font-jakarta" htmlFor="price">
									Harga
								</label>
								<Input 
									value={new Intl.NumberFormat("id-ID", {
										style: "currency",
										currency: "IDR",
									}).format(itemPrice)}
									disabled
									className="px-0 disabled:border-muted disabled:text-emerald-700 font-semibold text-lg"
								/>
							</div>
						</>
					) : (
						<>
							<div className="flex flex-col gap-y-2">
								<label className="text-[#474747] text-sm font-jakarta" htmlFor="reference">
									Referensi Barang
								</label>
								<Input
									placeholder="Masukkan Referensi"
									value={formData.reference}
									onChange={handleChange}
									startIcon={Box}
									className={cn(
										"font-jakarta focus-visible:ring-transparent",
										errors.reference && "border-red-500",
									)}
									id="reference"
									name="reference"
								/>
								{errors.reference && (
									<p className="text-red-500 text-xs">
										{errors.reference}
									</p>
								)}
							</div>

							{/* Estimated Price Input */}
							<div className="flex flex-col gap-y-2">
								<label className="text-[#474747] font-jakarta text-sm" htmlFor="estimated-price">
									Perkiraan Harga
								</label>
								<Input
									startIcon={CircleDollarSign}
									placeholder="Masukkan Perkiraan Harga"
									type="number"
									value={formData.estimated_price || ""}
									onChange={handleChange}
									name="estimated_price"
									className={cn(
										"pl-10 font-jakarta focus-visible:ring-transparent",
										errors.estimated_price && "border-red-500",
									)}
									id="estimated-price"
								/>
								{errors.estimated_price && (
									<p className="text-red-500 text-xs mt-1">
										{errors.estimated_price}
									</p>
								)}
							</div>
						</>
					)}

					<div className="flex flex-col gap-y-2">
						<label className="font-jakarta text-sm text-[#474747]" htmlFor="quantity">
							Jumlah Barang
						</label>
						<Input
							placeholder="Masukkan Jumlah"
							type="number"
							value={formData.quantity || ""}
							onChange={handleChange}
							name="quantity"
							min={1}
							startIcon={Package}
							className={cn(
								"font-jakarta focus-visible:ring-transparent",
								errors.quantity && "border-red-500",
							)}
							id="quantity"
						/>
						{errors.quantity && (
							<p className="text-red-500 text-xs mt-1">{errors.quantity}</p>
						)}
					</div>

					{/* Total Price Display - Common for both cases */}
					<div className="flex flex-col">
						<label className="font-jakarta text-sm text-[#474747]" htmlFor="harga">
							Total Harga
						</label>
						<Input 
							value={new Intl.NumberFormat("id-ID", {
								style: "currency",
								currency: "IDR",
							}).format(totalPrice)}
							disabled
							className="px-0 disabled:border-muted disabled:text-emerald-700 font-semibold text-lg"
						/>
					</div>

					{/* Submit Button */}
					<div className="pt-2">
						<Button
							type="submit"
							className="w-full bg-[#5188EE] text-white font-jakarta hover:bg-blue-500 cursor-pointer"
						>
							Ajukan Barang
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
