import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ProcurementStatus } from "./interfaces";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("id-ID", {
		style: "currency",
		currency: "IDR",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(amount);
};

/**
 * Checks if a given step has been passed based on the current status
 * @param currentStatus The current procurement status
 * @param statusToCheck The step we want to check if it's passed
 * @returns Boolean indicating if the step has been passed
 */
export function isStatusPassed(
	currentStatus: ProcurementStatus,
	statusToCheck: ProcurementStatus,
): boolean {
	// Get the indices of the statuses in the enum
	const statusValues = Object.values(ProcurementStatus);
	const currentIndex = statusValues.indexOf(currentStatus);
	const checkIndex = statusValues.indexOf(statusToCheck);

	// Special case: if the current status is "PENGAJUAN_DITOLAK",
	// only the "PENGAJUAN" and "VERIFIKASI_PENGAJUAN" step is considered passed
	if (currentStatus === ProcurementStatus.PENGAJUAN_DITOLAK) {
		return (
			statusToCheck === ProcurementStatus.PENGAJUAN ||
			statusToCheck === ProcurementStatus.VERIFIKASI_PENGAJUAN
		);
	}

	// For normal flow, a step is passed if its index is less than or equal to the current status index
	return checkIndex <= currentIndex;
}

const indonesianMonths = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

export function formatDateTime(date: Date): string {
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const seconds = date.getSeconds().toString().padStart(2, "0");
	const day = date.getDate();
	const month = indonesianMonths[date.getMonth()];
	const year = date.getFullYear();

	return `${hours}:${minutes}:${seconds} ${day} ${month} ${year}`;
}

export function formatDate(date: Date): string {
	const day = date.getDate();
	const month = indonesianMonths[date.getMonth()];
	const year = date.getFullYear();

	return `${day} ${month} ${year}`;
}

export function formatTime(date: Date): string {
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const seconds = date.getSeconds().toString().padStart(2, "0");

	return `${hours}:${minutes}:${seconds}`;
}
