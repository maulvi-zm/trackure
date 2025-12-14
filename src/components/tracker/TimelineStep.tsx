import type { ReactNode } from "react";

interface TimelineStepProps {
	icon: ReactNode;
	title: string;
	status: "completed" | "current" | "waiting";
	statusLabel?: string;
	isFirst?: boolean;
	isLast?: boolean;
}

export function TimelineStep({
	icon,
	title,
	status,
	statusLabel,
	isFirst = false,
	isLast = false,
}: TimelineStepProps) {
	const getIconContainerClass = () => {
		if (status === "completed" || status === "current") return "bg-blue-500";
		return "bg-white border-1 border-blue-500";
	};

	const getStatusLabelClass = () => {
		if (status === "completed") return "bg-blue-100 text-blue-700";
		if (status === "current") return "bg-green-100 text-green-700";
		return "";
	};

	const defaultStatusLabel =
		status === "completed"
			? "Selesai"
			: status === "current"
				? "Sedang Berlangsung"
				: undefined;

	return (
		<div className="flex flex-col items-center mb-4 relative">
			{/* Connector Line Left */}
			{!isFirst && (
				<div className="absolute top-6 -left-1/2 w-full border-t-2 border-dashed border-blue-300"></div>
			)}

			{/* Connector Line Right */}
			{!isLast && (
				<div className="absolute top-6 -right-1/2 w-full border-t-2 border-dashed border-blue-300"></div>
			)}

			{/* Icon */}
			<div className={`rounded-full p-3 z-10 ${getIconContainerClass()}`}>
				{icon}
			</div>

			{/* Title */}
			<p
				className={`mt-2 text-sm font-medium ${status === "current" ? "text-blue-500" : ""}`}
			>
				{title}
			</p>

			{/* Status Label */}
			{statusLabel && (
				<span
					className={`mt-1 px-3 py-1 rounded-full text-xs ${getStatusLabelClass()}`}
				>
					{statusLabel || defaultStatusLabel}
				</span>
			)}
		</div>
	);
}
