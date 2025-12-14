// Library Import
import { useState } from "react";
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

// Form errors type
interface UserFormErrors {
	username?: string;
	email?: string;
	role?: string;
	organisasi?: string;
	oldRoleId?: string;
	oldOrganizationId?: string;
}

// Create User Form Component
const CreateUserForm = ({
	open,
	onSubmit,
	onCancel,
	isSubmitting,
	organizations,
}: {
	open: boolean;
	onSubmit: (data: UserFormState) => void;
	onCancel: () => void;
	isSubmitting: boolean;
	organizations: OrganizationType[];
}) => {
	const [formData, setFormData] = useState<UserFormState>({
		username: "",
		email: "",
		role: "",
		organisasi: "",
		oldRoleId: 0,
		oldOrganizationId: 0,
	});

	const [errors, setErrors] = useState<UserFormErrors>({});

	const validateForm = () => {
		const newErrors: UserFormErrors = {};

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

	const handleChange = (field: keyof UserFormState, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
			...(field === "role" && value === "ADMIN" && { organisasi: "STEI" }),
		}));
		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="font-jakarta text-[#5188EE]">
						Daftarkan Pengguna Baru
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
						<p className="text-sm text-[#474747] font-jakarta">Username</p>
						<div className="relative">
							<Input
								startIcon={User}
								placeholder="Masukkan Username"
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
						<p className="font-jakarta text-[#474747] text-sm">Email</p>
						<div className="relative">
							<Input
								startIcon={Mail}
								placeholder="Masukkan Email"
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
						<p className="font-jakarta text-[#474747] text-sm">Role</p>
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
						<div className="mb-4">
							<p className="block font-jakarta mb-1">Organisasi</p>
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
						className="w-full bg-[#5188EE] mt-2 text-white py-2 rounded-md font-jakarta text-sm hover:bg-blue-500 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Mendaftarkan..." : "Daftarkan Pengguna"}
					</button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default CreateUserForm;
