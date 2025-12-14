export interface PemohonDashboardData {
	success: boolean;
	organizationName: string;
	budget: {
		totalBudget: number;
		estimatedRemainingBudget: number;
		realRemainingBudget: number;
		year: number;
	};
	procurements: {
		onGoing: number;
		rejected: number;
		completed: number;
		total: number;
	};
	recentItems: {
		id: string;
		itemCode: string;
		itemName: string;
		quantity: number;
		receiverName: string;
		photoUrl: string;
		status: string;
		reference: string;
	}[];
}

export enum ProcurementStatus {
	PENGAJUAN = "Pengajuan",
	VERIFIKASI_PENGAJUAN = "Verifikasi Pengajuan",
	PENGAJUAN_DITOLAK = "Pengajuan Ditolak",
	PENGIRIMAN_ORDER = "Pengiriman Order",
	PENGIRIMAN_BARANG = "Pengiriman Barang",
	PENERIMAAN_BARANG = "Penerimaan Barang",
	PENYERAHAN_BARANG = "Penyerahan Barang",
	SELESAI = "Selesai",
}

export enum UserRole {
	LEADER = "LEADER",
	ADMIN = "ADMIN",
	SUPER_ADMIN = "SUPER_ADMIN",
	DEVELOPER = "DEVELOPER",
	USER_PRINT_NUMBER = "USER_PRINT_NUMBER",
}

export interface AdminDashboardResponse {
	success: boolean;
	programStudiList: ProgramStudiSummary[];
}

export interface ProgramStudiSummary {
	year: number;
	total_budget: number;
	organizationId: number;
	organization: string;
	remaining_budget: number;
	procurements_total: number;
	status: Record<string, number>;
}

export interface ActivityLogData {
	id: number;
	userId: number;
	email: string;
	role: string;
	organization: string;
	activity: string;
	timestamp: string;
}

export interface ErrorResponse {
	success: boolean;
	error: string;
}

export interface Barang {
	id: string;
	item_code: string;
	item_name: string;
	price: number;
	specifications: string;
	category: string;
	unit: string;
	reference: string;
}
