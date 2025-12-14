// Library Import
import { useState } from "react";
// Component Import
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
import { Input } from "@/components/ui/input";
// Type Import
import type { OrganizationType } from "@/types/OganizationType";
import type { UserType } from "@/types/UserType";
// Icon Import
import { BookUser, Box, User } from "lucide-react";

interface AddRoleFormProps {
	open: boolean;
	onSubmit: (data: {
		userId: number;
		roleName: string;
		organizationName: string;
	}) => Promise<void>;
	onCancel: () => void;
	isSubmitting: boolean;
	organizations: OrganizationType[];
	users: UserType[];
}

const AddRoleForm = ({
	open,
	onSubmit,
	onCancel,
	isSubmitting,
	organizations,
	users,
}: AddRoleFormProps) => {
	const [selectedUser, setSelectedUser] = useState<string>("");
	const [selectedRole, setSelectedRole] = useState<string>("");
	const [selectedOrg, setSelectedOrg] = useState<string>("");
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedUser || !selectedRole) return;

		const user = users.find((u) => u.userId.toString() === selectedUser);
		if (!user) return;

		// If role is ADMIN, use STEI as organization
		const organizationName =
			selectedRole === "ADMIN"
				? "STEI"
				: organizations.find((o) => o.id.toString() === selectedOrg)?.name;

		if (!organizationName) return;

		await onSubmit({
			userId: user.userId,
			roleName: selectedRole,
			organizationName,
		});
	};

	const handleRoleChange = (value: string) => {
		setSelectedRole(value);
		// Reset organization selection when role changes
		setSelectedOrg("");
	};

	return (
		<Dialog open={open} onOpenChange={onCancel}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="font-jakarta text-[#5188EE]">
						Tambah Role
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-2">
					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Pilih Pengguna</p>
						<div className="relative">
							<div className="relative">
								<Input
									startIcon={User}
									placeholder="Cari pengguna berdasarkan username atau email"
									className="pl-10 font-jakarta"
									value={searchTerm}
									autoComplete="off"
									autoCorrect="off"
									autoCapitalize="off"
									spellCheck="false"
									type="text"
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

							{isDropdownOpen && searchTerm && (
								<div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-[200px] overflow-y-auto">
									{users
										.filter(
											(user) =>
												user.username
													.toLowerCase()
													.includes(searchTerm.toLowerCase()) ||
												user.email
													.toLowerCase()
													.includes(searchTerm.toLowerCase()),
										)
										.map((user) => (
											<div
												key={user.userId}
												className="p-2 hover:bg-gray-100 cursor-pointer font-jakarta"
												onClick={() => {
													setSelectedUser(user.userId.toString());
													setSearchTerm(`${user.username} (${user.email})`);
													setIsDropdownOpen(false);
												}}
											>
												<div className="flex justify-between w-full gap-4">
													<span className="font-medium">{user.username}</span>
													<span>{user.email}</span>
												</div>
											</div>
										))}
									{users.filter(
										(user) =>
											user.username
												.toLowerCase()
												.includes(searchTerm.toLowerCase()) ||
											user.email
												.toLowerCase()
												.includes(searchTerm.toLowerCase()),
									).length === 0 && (
										<div className="p-2 text-gray-500 font-jakarta">
											Tidak ada pengguna yang cocok
										</div>
									)}
								</div>
							)}
						</div>
					</div>

					<div className="flex flex-col gap-y-2">
						<p className="font-jakarta text-sm text-[#474747]">Pilih Role</p>
						<div className="relative">
							<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
								<BookUser className="h-4 w-4" />
							</span>
							<Select
								value={selectedRole}
								onValueChange={handleRoleChange}
								disabled={isSubmitting}
							>
								<SelectTrigger className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed">
									<SelectValue placeholder="Pilih role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ADMIN">ADMIN</SelectItem>
									<SelectItem value="REQUESTER">REQUESTER</SelectItem>
									<SelectItem value="USER_PRINT_NUMBER">
										USER_PRINT_NUMBER
									</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					{selectedRole !== "ADMIN" && selectedRole !== "" && (
						<div className="mb-6">
							<p className="block font-jakarta mb-1">Pilih Organisasi</p>
							<div className="relative">
								<span className="absolute left-3 top-1/2 transform -translate-y-1/2">
									<Box className="h-4 w-4" />
								</span>
								<Select
									value={selectedOrg}
									onValueChange={setSelectedOrg}
									disabled={isSubmitting}
								>
									<SelectTrigger className="w-full border rounded-lg font-jakarta pl-10 py-2 text-sm focus:outline-[#5188EE] disabled:bg-gray-100 disabled:cursor-not-allowed">
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
												<SelectItem key={org.id} value={org.id.toString()}>
													{org.name}
												</SelectItem>
											))}
									</SelectContent>
								</Select>
							</div>
						</div>
					)}

					<div className="pt-2" />
					<button
						type="submit"
						className="w-full bg-[#5188EE] text-white py-2 rounded-md font-jakarta text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
						disabled={
							isSubmitting ||
							!selectedUser ||
							!selectedRole ||
							(selectedRole !== "ADMIN" && !selectedOrg)
						}
					>
						{isSubmitting ? "Menambahkan..." : "Tambah Role"}
					</button>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddRoleForm;
