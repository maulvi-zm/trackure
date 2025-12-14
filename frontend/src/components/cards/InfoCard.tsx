import type { ReactNode } from "react";

interface InfoCardProps {
	icon: ReactNode;
	title: string;
	value: string | number;
}

export function InfoCard({ icon, title, value }: InfoCardProps) {
	return (
		<div className="p-4 flex items-center gap-3 bg-white">
			<div className="w-10 h-10 flex items-center justify-center">{icon}</div>
			<div>
				<p className="text-sm text-gray-500">{title}</p>
				<p className="font-semibold">{value}</p>
			</div>
		</div>
	);
}
