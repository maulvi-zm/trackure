"use client";
import type { ReactNode } from "react";
import profilePic from "@/assets/avatar/SuperAdminAvatar.png";

interface DashboardLayoutProps {
	children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
	return (
		<div className="flex flex-col min-h-full overflow-auto">
			{/* Header */}
			<header className="flex justify-between items-center ml-6 mr-6 py-1">
				<h1 className="text-3xl font-bold font-jakarta">Dasbor</h1>
				<div className="flex items-center space-x-3">
					<span className="text-blue-600 font-medium font-jakarta">
						Pemohon
					</span>
					<img
						src={profilePic}
						alt="Admin Profile"
						width={40}
						height={40}
						className="rounded-full border"
					/>
				</div>
			</header>

			{/* Content langsung, tanpa div pembungkus tambahan */}
			<main className="p-6 flex-1">{children}</main>
		</div>
	);
}
