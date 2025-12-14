import type { LucideIcon } from "lucide-react";

interface StatCardProps {
	title: string;
	value: string | number;
	icon?: LucideIcon;
	description?: string;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	className?: string;
}

export function StatCard({
	title,
	value,
	icon: Icon,
	description,
	trend,
	className,
}: StatCardProps) {
	return (
		<div className={`rounded-lg border bg-card p-6 shadow-sm ${className}`}>
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
				{Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
			</div>
			<div className="mt-2">
				<p className="text-2xl font-bold">{value}</p>
				{description && (
					<p className="text-xs text-muted-foreground mt-1">{description}</p>
				)}
				{trend && (
					<div className="flex items-center mt-2">
						<span
							className={`text-xs ${trend.isPositive ? "text-green-500" : "text-red-500"}`}
						>
							{trend.isPositive ? "+" : ""}
							{trend.value}%
						</span>
						<span className="text-xs text-muted-foreground ml-1">
							from last period
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
