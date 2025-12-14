import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import SidebarNavButton from "./SidebarNavButton";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useOrganizationStore } from "@/stores/useOrganization";
import { ChevronDown } from "lucide-react";
import LogIcon from "../assets/icons/chart-2.svg";
import DashboardIcon from "../assets/icons/element-4.svg";
import BanyakPenggunaIcon from "../assets/icons/profile-2user.svg";
import TicketIcon from "../assets/icons/ticket.svg";
import { LogOut } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

const SidebarMenu = () => {
	const queryClient = useQueryClient();
	const [isOpen, _setIsOpen] = useState<boolean>(true);
	const { user, userProfile, fetchUserProfile, isLoading } = useAuth();
	  useEffect(() => {
    if (!userProfile && !isLoading) {
      fetchUserProfile();
    }
  }, [userProfile, fetchUserProfile, isLoading]);


	const organizations = useOrganizationStore((state) => state.organizations);
	const activeOrganization = useOrganizationStore(
		(state) => state.activeOrganization,
	);
	const roles = useOrganizationStore((state) => state.roles);
	const changeActiveOrganization = useOrganizationStore(
		(state) => state.changeActiveOrganization,
	);

	const handleOrganizationChange = async (orgId: number) => {
		await changeActiveOrganization(orgId);
		queryClient.invalidateQueries();
	};

	  if (isLoading) {
    return <div className="flex justify-center items-center p-4">Loading...</div>;
  }

  if (!user) {
    return <div className="p-4 text-red-500">Not authenticated</div>;
  }
	return (
		<motion.div
			animate={{ width: isOpen ? 240 : 60 }}
			transition={{ type: "spring", stiffness: 200, damping: 25 }}
			className="h-screen bg-[#5188EE] p-4 overflow-hidden space-y-4 flex flex-col justify-between"
		>
			<div className="flex flex-col">
				<div
					className={cn(
						"w-full flex items-center",
						isOpen ? "justify-between pb-2" : "justify-center pb-4",
					)}
				>
					<h1 className="text-2xl font-bold font-jakarta text-white">
						Trackure
					</h1>
				</div>
				<div className="w-full flex flex-col gap-y-2">
					{(roles.includes("REQUESTER") || roles.includes("DEVELOPER")) && (
						<>
							{isOpen && (
								<p className="text-xs text-slate-50 font-jakarta pt-4">
									Pemohon
								</p>
							)}
							<SidebarNavButton
								isOpen={isOpen}
								icon={DashboardIcon}
								label="Dashboard"
								route="/dashboard"
							/>
						</>
					)}
					{(roles.includes("ADMIN") || roles.includes("DEVELOPER")) && (
						<>
							{isOpen && (
								<p className="text-xs text-slate-50 font-jakarta pt-4">Admin</p>
							)}
							<SidebarNavButton
								isOpen={isOpen}
								icon={DashboardIcon}
								label="Organisasi"
								route="/anggaran"
							/>
							<SidebarNavButton
								isOpen={isOpen}
								icon={DashboardIcon}
								label="Daftar Barang"
								route="/daftar-barang"
							/>
						</>
					)}
					{(roles.includes("SUPER_ADMIN") || roles.includes("DEVELOPER")) && (
						<>
							{isOpen && (
								<p className="text-xs text-slate-50 font-jakarta pt-4">
									Super Admin
								</p>
							)}
							<SidebarNavButton
								isOpen={isOpen}
								icon={BanyakPenggunaIcon}
								label="Daftar Pengguna"
								route="/manajemen-user"
							/>
							<SidebarNavButton
								isOpen={isOpen}
								icon={LogIcon}
								label="Log Aktivitas"
								route="/aktivitas-log"
							/>
						</>
					)}

					{(roles.includes("USER_PRINT_NUMBER") ||
						roles.includes("DEVELOPER")) && (
						<>
							{isOpen && (
								<p className="text-xs text-slate-50 font-jakarta pt-4">
									User Print Number
								</p>
							)}
							<SidebarNavButton
								isOpen={isOpen}
								icon={TicketIcon}
								label="Print Number"
								route="/print-number"
							/>
						</>
					)}
				</div>
			</div>
			<div className="flex flex-col items-start justify-start gap-y-4">
				
				<motion.div
					className="text-white font-jakarta flex w-full items-center justify-start gap-x-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
				>
					<img
						src={userProfile?.photo}
						alt="Super Admin Avatar"
						className="object-cover size-[38px] border-[1px] border-white rounded-full"
					/>
					<p className="text-sm">{user?.name}</p>
				</motion.div>
				{isOpen && (
						<div className="flex flex-col">
							{organizations.length > 1 && (
								<Select
									value={activeOrganization?.organizationName ?? ""}
									onValueChange={async (val) => {
										const selectedOrg = organizations.find(
											(org) => org.organizationName === val,
										);
										if (selectedOrg) {
											await handleOrganizationChange(
												selectedOrg.organizationId,
											);
										}
									}}
								>
									<SelectTrigger
										className="text-sm focus-visible:ring-transparent border-none outline-none p-0 m-0 shadow-none -translate-y-2 cursor-pointer text-white/80"
										isArrow={false}
									>
										<SelectValue
											placeholder={activeOrganization?.organizationName}
										/>
										<ChevronDown className="text-white/80 h-2 w-2 " />
									</SelectTrigger>
									<SelectContent className="text-white">
										{organizations.map((org) => (
											<SelectItem
												key={org.organizationId}
												value={org.organizationName}
												className="text-slate-600"
											>
												{org.organizationName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							)}
						</div>
					)}
				<Button
					variant={"outline"}
					className="w-full flex justify-between items-center bg-white/10 text-white border-white/40 hover:bg-white/20 hover:text-white cursor-pointer"
					onClick={() => {
						localStorage.clear();
						sessionStorage.clear();
						window.location.href = "/login"; // ganti path jika perlu
					}}
				>
					<span>Keluar</span>
					<LogOut />
				</Button>
			</div>
		</motion.div>
	);
};

export default SidebarMenu;
