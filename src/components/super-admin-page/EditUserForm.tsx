// Library Import
import { useEffect, useState } from "react";
// Icon Import
import { Mail, User } from "lucide-react";
// Utils Import
import { cn } from "@/lib/utils";
// Component Import
import { Input } from "../ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// Type Import
import type { OrganizationType } from "@/types/OganizationType";

// Form state type
export interface UserFormState {
	username: string;
	email: string;
	role: string;
	organisasi: string;
	oldRoleId: number;
	oldOrganizationId: number;
}

// Edit User Form Component
const EditUserForm = ({
	open,
	onSubmit,
	onCancel,
	isSubmitting,
	initialData,
	organizations,
}: {
	open: boolean;
	onSubmit: (data: UserFormState) => void;
	onCancel: () => void;
	isSubmitting: boolean;
	initialData: UserFormState;
	organizations: OrganizationType[];
}) => {
	const [formData, setFormData] = useState({
		username: initialData.username,
		email: initialData.email,
		role: initialData.role,
		organisasi: initialData.organisasi,
		oldRoleId: initialData.oldRoleId,
		oldOrganizationId: initialData.oldOrganizationId,
	});

	const [errors, setErrors] = useState<{
		username?: string;
		email?: string;
		role?: string;
		organisasi?: string;
	}>({});

	const validateForm = () => {
		const newErrors: {
			username?: string;
			email?: string;
			role?: string;
			organisasi?: string;
		} = {};

		if (!formData.username.trim()) {
			newErrors.username = "Username harus diisi";
		}

		if (!formData.email.trim()) {
			newErrors.email = "Email harus diisi";
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = "Format email tidak valid";
		}

		if (!formData.role) {
			newErrors.role = "Role harus dipilih";
		}

		if (formData.role === "REQUESTER" && !formData.organisasi) {
			newErrors.organisasi = "Organisasi harus dipilih untuk User Pemohon";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (validateForm()) {
			onSubmit(formData);
		}
	};

	useEffect(() => {
		setFormData({
			username: initialData.username,
			email: initialData.email,
			role: initialData.role,
			organisasi: initialData.organisasi,
			oldRoleId: initialData.oldRoleId,
			oldOrganizationId: initialData.oldOrganizationId,
		});
	}, [initialData]);

	const handleChange = (
		field: keyof typeof formData,
		value: string | number,
	) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
			// Clear organization if role is not 'User Pemohon'
			...(field === "role" && value === "ADMIN" && { organisasi: "STEI" }),
		}));
		// Clear error when user starts typing
		if (errors[field as keyof typeof errors]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-[#5188EE] font-jakarta">
						Edit Data Pengguna
					</DialogTitle>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSubmit();
					}}
					className="space-y-2"
				>
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Username</p>
						<div className="relative">
							<Input
								startIcon={User}
								placeholder="Username"
								value={formData.username}
								onChange={(e) => handleChange("username", e.target.value)}
								disabled={isSubmitting}
								className={cn(
									"w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed",
									errors.username && "border-red-500",
								)}
							/>
						</div>
						{errors.username && (
							<p className="text-red-500 text-xs mt-1">{errors.username}</p>
						)}
					</div>

					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Email</p>
						<div className="relative">
							<Input
								startIcon={Mail}
								placeholder="Email"
								value={formData.email}
								onChange={(e) => handleChange("email", e.target.value)}
								disabled={isSubmitting}
								className={cn(
									"w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed",
									errors.email && "border-red-500",
								)}
							/>
						</div>
						{errors.email && (
							<p className="text-red-500 text-xs mt-1">{errors.email}</p>
						)}
					</div>

					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Role</p>
						<Select
							value={formData.role}
							onValueChange={(val) => handleChange("role", val)}
							disabled={isSubmitting}
						>
							<SelectTrigger
								className={cn(
									"w-full border rounded-lg font-jakarta py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed",
									errors.role && "border-red-500",
								)}
							>
								<SelectValue placeholder="Pilih role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="ADMIN">Admin</SelectItem>
								<SelectItem value="REQUESTER">User Pemohon</SelectItem>
								<SelectItem value="USER_PRINT_NUMBER">
									User Print Number
								</SelectItem>
							</SelectContent>
						</Select>
						{errors.role && (
							<p className="text-red-500 text-xs mt-1">{errors.role}</p>
						)}
					</div>

					{formData.role !== "ADMIN" && formData.role !== "" && (
						<div className="flex flex-col gap-y-2">
							<p className="font-jakarta text-sm text-[#474747]">Organisasi</p>
							<Select
								value={formData.organisasi}
								onValueChange={(val) => handleChange("organisasi", val)}
								disabled={isSubmitting}
							>
								<SelectTrigger
									className={cn(
										"w-full border rounded-lg font-jakarta py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed",
										errors.organisasi && "border-red-500",
									)}
								>
									<SelectValue placeholder="Pilih organisasi" />
								</SelectTrigger>
								<SelectContent>
									{organizations
										.filter(
											(org) =>
												org.name &&
												org.name.trim() !== "" &&
												org.name !== "STEI",
										)
										.map((org) => (
											<SelectItem key={org.name} value={org.name}>
												{org.name}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
							{errors.organisasi && (
								<p className="text-red-500 text-xs mt-1">{errors.organisasi}</p>
							)}
						</div>
					)}

					<button
						type="submit"
						className="w-full mt-3 bg-[#5188EE] text-white py-2 rounded-md font-jakarta text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
					</button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default EditUserForm;
