import type React from "react";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
	placeholder?: string;
	className?: string;
	onSearch?: (value: string) => void;
	value?: string;
}

export function SearchBar({
	placeholder = "Search...",
	className = "",
	onSearch,
	value,
}: SearchBarProps) {
	const [searchTerm, setSearchTerm] = useState(value || "");

	useEffect(() => {
		if (value !== undefined && value !== searchTerm) {
			setSearchTerm(value);
		}
	}, [value]);

	const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setSearchTerm(newValue);
		if (onSearch) {
			onSearch(newValue);
		}
	};

	return (
		<div className={`relative ${className}`}>
			<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder={placeholder}
				className="pl-10 w-full"
				value={searchTerm}
				onChange={handleSearch}
			/>
		</div>
	);
}
