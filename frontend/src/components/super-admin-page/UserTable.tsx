// Library Import
import { useMemo, useState } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/useToast";
// Utils Import
import { cn } from "@/lib/utils";
// Types Import
import type { UserType } from "@/types/UserType";
import type { OrganizationType } from "@/types/OganizationType";
// Icon Import
import { Pencil, Trash } from "lucide-react";
import AttachIcon from "../../assets/icons/attach-circle.svg";
import EmailIcon from "../../assets/icons/sms.svg";
import CheckIcon from "../../assets/icons/tick-square.svg";
import UserIcon from "../../assets/icons/user-table.svg";
import UserTagIcon from "../../assets/icons/user-tag.svg";
import UserWhiteIcon from "../../assets/icons/user-white.svg";
// Component Import
import { DataTable } from "../tables/DataTables";
import { Button } from "../ui/button";
import CreateUserForm, { type UserFormState } from "./CreateUserForm";
import EditUserForm from "./EditUserForm";
import {
	createUser,
	deleteUser,
	getActiveUser,
	updateUser,
	addUserRole,
} from "@/api/user";
import AddRoleForm from "./AddRoleForm";
import InputSearch from "../InputSearch";

type UserTableData = {
	id: number;
	username: string;
	email: string;
	role: string;
	assign: string;
	status: string;
	originalUser: UserType;
};

interface UserTableProps {
	users?: UserType[];
	isLoading: boolean;
	error: Error | null;
	organizations: OrganizationType[];
	isLoadingOrgs: boolean;
}

const UserTable = ({
	users = [],
	isLoading,
	error,
	organizations,
}: UserTableProps) => {
	const queryClient = useQueryClient();

	const [formState, setFormState] = useState<UserFormState>({
		username: "",
		email: "",
		role: "",
		organisasi: "",
		oldRoleId: 0,
		oldOrganizationId: 0,
	});

	const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
	const [isEditFormOpen, setIsEditFormOpen] = useState(false);
	const [isDeleteOpen, setIsDeleteOpen] = useState(false);
	const [isAddRoleFormOpen, setIsAddRoleFormOpen] = useState(false);

	// --- Manual Loading States (Keep for Create/Delete/Update) ---
	const [isCreating, setIsCreating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isAddingRole, setIsAddingRole] = useState(false);
	const [search, setSearch] = useState("");
	const { success, error: errorToast } = useToast();
	// --- End Manual Loading States ---

	// State to track which user's status is being updated
	const [updatingStatusUserId, setUpdatingStatusUserId] = useState<
		number | null
	>(null);

	const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

	// Map the fetched UserType data to the table data format
	const tableData: UserTableData[] = users.map((user: UserType) => ({
		id: user.userId,
		username: user.username,
		email: user.email,
		role: user.roleName,
		assign: user.organizationName || "-",
		status: user.isActive ? "Aktif" : "Tidak Aktif",
		originalUser: user,
	}));

	// --- Calculate Email Counts for Conditional Delete ---
	const emailCounts = useMemo(() => {
		const counts: { [key: string]: number } = {};
		for (const user of users) {
			counts[user.email] = (counts[user.email] || 0) + 1;
		}
		return counts;
	}, [users]);

	// --- React Query Mutations ---

	// Mutation for updating user active status
	const updateStatusMutation = useMutation({
		mutationFn: ({
			userId,
			is_active,
		}: { userId: number; is_active: boolean }) => {
			return getActiveUser(userId, is_active);
		},
		onMutate: async ({ userId, is_active }) => {
			setUpdatingStatusUserId(userId);

			await queryClient.cancelQueries({ queryKey: ["users"] });

			const previousUsers = queryClient.getQueryData<UserType[]>(["users"]);

			queryClient.setQueryData<UserType[]>(["users"], (oldUsers) => {
				if (!oldUsers) return previousUsers;

				return oldUsers.map((user) =>
					user.userId === userId ? { ...user, isActive: is_active } : user,
				);
			});

			return { previousUsers };
		},
		onSuccess: (_variables) => {
			setUpdatingStatusUserId(null);
			queryClient.invalidateQueries({ queryKey: ["users"] });
			success("Status berhasil diperbarui");
		},
		onError: (err, _variables, context) => {
			if (context?.previousUsers) {
				queryClient.setQueryData<UserType[]>(["users"], context.previousUsers);
			}
			errorToast(`Status gagal diperbarui: ${err}`);
		},
	});

	// --- Handlers ---

	const handleCreateUser = async (formData: UserFormState) => {
		setIsCreating(true);
		try {
			const payload = {
				username: formData.username,
				email: formData.email,
				role: formData.role,
				organization: formData.role === "ADMIN" ? "STEI" : formData.organisasi,
			};
			await createUser(payload);
			setIsCreateFormOpen(false);
			setFormState({
				username: "",
				email: "",
				role: "",
				organisasi: "",
				oldRoleId: 0,
				oldOrganizationId: 0,
			});
			queryClient.invalidateQueries({ queryKey: ["users"] });
		} catch (error) {
			console.error("Error creating user:", error);
		} finally {
			setIsCreating(false);
		}
	};

	const handleDeleteUser = async () => {
		if (!selectedUser) {
			console.error("No user selected for deletion.");
			return;
		}

		const currentEmailCount = emailCounts[selectedUser.email] || 0;
		if (currentEmailCount <= 1) {
			console.warn(
				"User is no longer a duplicate or only appears once. Delete cancelled.",
			);
			setIsDeleteOpen(false);
			setSelectedUser(null);
			return;
		}

		setIsDeleting(true);
		try {
			const payload = {
				userId: selectedUser.userId,
				roleId: selectedUser.roleId,
				organizationId: selectedUser.organizationId,
			};

			await deleteUser(payload);
			console.log("User deleted successfully!");
			setIsDeleteOpen(false);
			setSelectedUser(null);
			queryClient.invalidateQueries({ queryKey: ["users"] });
		} catch (error) {
			console.error("Error deleting user:", error);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleUpdateUser = async (formData: UserFormState) => {
		if (!selectedUser) return;

		setIsUpdating(true);
		try {
			const payload = {
				userId: selectedUser.userId,
				username: formData.username,
				email: formData.email,
				roleName: formData.role,
				organizationName: formData.organisasi,
				oldRoleId: formData.oldRoleId,
				oldOrganizationId: formData.oldOrganizationId,
			};
			await updateUser(payload);
			setIsEditFormOpen(false);
			setSelectedUser(null);
			queryClient.invalidateQueries({ queryKey: ["users"] });
		} catch (error) {
			console.error("Error updating user:", error);
		} finally {
			setIsUpdating(false);
		}
	};

	const handleAddRole = async (data: {
		userId: number;
		roleName: string;
		organizationName: string;
	}) => {
		setIsAddingRole(true);
		try {
			await addUserRole(data);
			setIsAddRoleFormOpen(false);
			queryClient.invalidateQueries({ queryKey: ["users"] });
		} catch (error) {
			console.error("Error adding role:", error);
		} finally {
			setIsAddingRole(false);
		}
	};

	const onEditClick = (user: UserType) => {
		setSelectedUser(user);
		setFormState({
			username: user.username,
			email: user.email,
			role: user.roleName,
			organisasi: user.organizationName || "",
			oldRoleId: user.roleId,
			oldOrganizationId: user.organizationId,
		});
		setIsEditFormOpen(true);
	};

	const onDeleteClick = (user: UserType) => {
		if (emailCounts[user.email] > 1) {
			setSelectedUser(user);
			setIsDeleteOpen(true);
		} else {
			console.warn(
				`Cannot delete user ${user.username}. Email ${user.email} is not duplicated.`,
			);
		}
	};

	const columnHelper = createColumnHelper<UserTableData>();

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const columns = useMemo(
		() => [
			columnHelper.accessor((row) => row.username, {
				id: "username",
				header: () => (
					<div className="flex items-center gap-x-2">
						Username <img src={UserIcon} alt="User Icon" className="w-4 h-4" />
					</div>
				),
				cell: (info) => info.getValue(),
			}) as ColumnDef<UserTableData, unknown>,
			columnHelper.accessor((row) => row.email, {
				id: "email",
				header: () => (
					<div className="flex items-center gap-x-2">
						Email
						<img src={EmailIcon} alt="Email Icon" className="w-4 h-4" />
					</div>
				),
				cell: (info) => info.getValue(),
			}) as ColumnDef<UserTableData, unknown>,
			columnHelper.accessor((row) => row.role, {
				id: "role",
				header: () => (
					<div className="flex items-center gap-x-2">
						Role
						<img src={UserTagIcon} alt="Role Icon" className="w-4 h-4" />
					</div>
				),
				cell: (info) => info.getValue(),
			}) as ColumnDef<UserTableData, unknown>,
			columnHelper.accessor((row) => row.assign, {
				id: "assign",
				header: () => (
					<div className="flex items-center gap-x-2">
						Organization
						<img src={AttachIcon} alt="Assign Icon" className="w-4 h-4" />
					</div>
				),
				cell: (info) => info.getValue(),
			}) as ColumnDef<UserTableData, unknown>,
			columnHelper.accessor((row) => row.status, {
				id: "status",
				header: () => (
					<div className="flex items-center gap-x-2">
						Status
						<img src={CheckIcon} alt="Status Icon" className="w-4 h-4" />
					</div>
				),
				cell: ({ row }) => {
					const user = row.original.originalUser;
					const isAktif = user.isActive;
					const isUpdatingThisUser = updatingStatusUserId === user.userId;
					const isAnyOperationActive =
						isCreating ||
						isDeleting ||
						isUpdating ||
						updateStatusMutation.isPending;

					return (
						<button
							type="button"
							className={cn(
								"inline-flex items-center justify-center rounded-full px-2 py-1 border text-xs cursor-pointer transition-colors duration-150",
								isAktif
									? "bg-emerald-50 text-emerald-600 border-emerald-400 hover:bg-emerald-100"
									: "bg-slate-50 text-slate-600 border-slate-400 hover:bg-slate-100",
								(isUpdatingThisUser || isAnyOperationActive) &&
									"opacity-50 cursor-not-allowed",
							)}
							onClick={() => {
								if (!isUpdatingThisUser && !isAnyOperationActive) {
									const newStatus = !isAktif;
									updateStatusMutation.mutate({
										userId: user.userId,
										is_active: newStatus,
									});
								}
							}}
							disabled={isUpdatingThisUser || isAnyOperationActive}
						>
							{isUpdatingThisUser
								? "Mengubah..."
								: isAktif
									? "Aktif"
									: "Tidak Aktif"}
						</button>
					);
				},
			}) as ColumnDef<UserTableData, unknown>,
			columnHelper.display({
				id: "aksi",
				header: () => <div className="flex items-center gap-x-2">Aksi</div>,
				cell: ({ row }) => {
					const isEmailDuplicated = emailCounts[row.original.email] > 1;
					const isCurrentRowBeingDeleted =
						isDeleting && selectedUser?.userId === row.original.id;
					const isAnyOperationActive =
						isCreating ||
						isDeleting ||
						isUpdating ||
						updateStatusMutation.isPending;

					return (
						<div className="flex gap-x-2">
							<Button
								onClick={() => onEditClick(row.original.originalUser)}
								size={"sm"}
								variant={"outline"}
								className="cursor-pointer text-xs border-[#5188EE] text-[#5188EE] hover:text-[#5188EE]/90"
								disabled={isAnyOperationActive}
							>
								Edit <Pencil className="w-2 h-2 ml-1" />
							</Button>

							{isEmailDuplicated && (
								<Button
									onClick={() => onDeleteClick(row.original.originalUser)}
									size={"sm"}
									variant={"destructive"}
									className="cursor-pointer text-xs"
									disabled={isAnyOperationActive}
								>
									{isCurrentRowBeingDeleted ? (
										"Menghapus..."
									) : (
										<>
											Hapus Role <Trash className="w-2 h-2 ml-1" />
										</>
									)}
								</Button>
							)}
						</div>
					);
				},
			}) as ColumnDef<UserTableData, unknown>,
		],
		[
			emailCounts,
			isCreating,
			isDeleting,
			isUpdating,
			selectedUser,
			updateStatusMutation.isPending,
			updatingStatusUserId,
		],
	);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
					<p className="mt-4 text-gray-600">Memuat data...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center text-red-500">
					<p>Terjadi kesalahan saat memuat data.</p>
					<button
						type="button"
						className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
						onClick={() => window.location.reload()}
					>
					Coba Lagi
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full h-full flex flex-col gap-y-4">
			{/* Input and Add User Button */}
			<div className="w-full flex items-center gap-x-2">
				<InputSearch 
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Cari nama pengguma"
				/>
				<Button
					className="bg-[#5188EE] hover:bg-[#5188EE]/90 cursor-pointer text-white h-full"
					onClick={() => {
						setFormState({
							username: "",
							email: "",
							role: "",
							organisasi: "",
							oldRoleId: 0,
							oldOrganizationId: 0,
						});
						setIsCreateFormOpen(true);
					}}
					disabled={
						isCreating ||
						isDeleting ||
						isUpdating ||
						updateStatusMutation.isPending
					}
				>
					<img src={UserWhiteIcon} alt="User Icon" className="w-4 h-4" />
					<span>Daftarkan Pengguna</span>
				</Button>

				<Button
					className="bg-emerald-600 hover:bg-emerald-600/90 cursor-pointer text-white h-full"
					onClick={() => setIsAddRoleFormOpen(true)}
					disabled={
						isCreating ||
						isDeleting ||
						isUpdating ||
						updateStatusMutation.isPending
					}
				>
					<img src={UserWhiteIcon} alt="User Icon" className="w-4 h-4" />
					<span>Tambah Role</span>
				</Button>
			</div>

			{/* Data Table */}
			<DataTable
				data={tableData}
				searchTerm={search}
				columns={columns}
				pageSize={Math.max(1, Math.floor((window.innerHeight - 140) / 60))}
			/>

			{/* Create User Form */}
			{isCreateFormOpen && (
				<CreateUserForm
					open={isCreateFormOpen}
					onSubmit={handleCreateUser}
					onCancel={() => setIsCreateFormOpen(false)}
					isSubmitting={isCreating || updateStatusMutation.isPending}
					organizations={organizations}
				/>
			)}

			{/* Delete Confirmation Dialog */}
			{isDeleteOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-[#00000040] backdrop-blur-xs">
					<div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-lg max-h-[90vh] overflow-y-auto">
						<button
							type="button"
							onClick={() => setIsDeleteOpen(false)}
							className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
							aria-label="Close"
							disabled={isDeleting || updateStatusMutation.isPending}
						>
							&times;
						</button>

						<h2 className="text-xl font-jakarta font-semibold text-red-600 mb-6">
							Konfirmasi Hapus Role
						</h2>

						<p className="text-sm text-slate-600 mb-6">
							Apakah Anda yakin ingin menghapus role{" "}
							<strong>{selectedUser?.roleName} </strong> dari{" "}
							<strong>{selectedUser?.username} </strong> di{" "}
							<strong>{selectedUser?.organizationName}</strong>? Tindakan ini
							tidak dapat dibatalkan.
						</p>

						<div className="flex gap-x-4">
							<button
								type="button"
								className="flex-1 py-2 rounded-md font-jakarta text-sm border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
								onClick={() => setIsDeleteOpen(false)}
								disabled={isDeleting || updateStatusMutation.isPending}
							>
								Batal
							</button>
							<button
								type="button"
								className="flex-1 bg-red-600 text-white py-2 rounded-md font-jakarta text-sm hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
								onClick={handleDeleteUser}
								disabled={isDeleting || updateStatusMutation.isPending}
							>
								{isDeleting ? "Menghapus..." : "Hapus"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Edit User Dialog */}
			{isEditFormOpen && (
				<EditUserForm
					open={isEditFormOpen}
					onSubmit={handleUpdateUser}
					onCancel={() => {
						setIsEditFormOpen(false);
						setSelectedUser(null);
					}}
					isSubmitting={isUpdating || updateStatusMutation.isPending}
					initialData={formState}
					organizations={organizations}
				/>
			)}

			{/* Add Role Form */}
			{isAddRoleFormOpen && (
				<AddRoleForm
					open={isAddRoleFormOpen}
					onSubmit={handleAddRole}
					onCancel={() => setIsAddRoleFormOpen(false)}
					isSubmitting={isAddingRole}
					organizations={organizations}
					users={[...new Map(users.map((user) => [user.email, user])).values()]}
				/>
			)}
		</div>
	);
};

export default UserTable;
