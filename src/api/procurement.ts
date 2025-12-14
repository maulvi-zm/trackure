import type { NewProcurement } from "@/components/dashboard/ProcurementForm";
import api from "../lib/axios";
import { queryOptions } from "@tanstack/react-query";
import type { Barang } from "@/lib/interfaces";

export const createProcurement = async ({
	newProcurement,
	itemExists,
}: { newProcurement: NewProcurement; itemExists: boolean }) => {
	console.log("Creating item payload:", newProcurement);
	const procurementToSend = {
		...newProcurement,
	};
	const response = await api.post(
		`/procurement?item_exists=${itemExists ? "true" : "false"}`,
		procurementToSend,
	);
	return response.data;
};

export const getProcurements = (orgId: number) =>
	queryOptions({
		queryKey: ["Procurements", orgId],
		queryFn: async () => {
			const response = await api.get(`/procurement/organization/${orgId}`);
			if (!response.data.success) {
				throw new Error("Failed to fetch procurement data");
			}
			return response.data;
		},
	});

export const getProcurement = (id: string) =>
	queryOptions({
		queryKey: ["Procurement", id],
		queryFn: async () => {
			const response = await api.get(`/procurement/${id}`);
			if (!response.status) {
				throw new Error("Failed to fetch dashboard data");
			}

			console.log(response);
			return response.data.data;
		},
	});

export const addItem = async (
	procurement_id: string,
	data: Omit<Barang, "id">,
) => {
	const response = await api.post(
		`/procurement/${procurement_id}/addItem`,
		data,
	);
	return response.data;
};

export const confirmPriceMatch = async (procurement_id: string) => {
	const response = await api.patch(
		`/procurement/${procurement_id}/confirmPriceMatch`,
	);
	return response.data;
};

export const rejectStatus = async (
	procurement_id: string,
	data: { notes: string },
) => {
	const response = await api.patch(
		`/procurement/${procurement_id}/reject`,
		data,
	);
	return response.data;
};

export const approveStatus = async (
	procurement_id: string,
	data: { notes: string },
) => {
	const response = await api.patch(
		`/procurement/${procurement_id}/approve`,
		data,
	);
	return response.data;
};

export const createPO = async (
	procurement_id: string,
	data: { po_document: File; po_date: string },
) => {
	const formData = new FormData();
	formData.append("po_document", data.po_document);
	formData.append("po_date", data.po_date);
	const response = await api.patch(
		`/procurement/${procurement_id}/createPO`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);
	return response.data;
};

export const estimatePO = async (
	procurement_id: string,
	data: { time_estimation: string },
) => {
	const response = await api.patch(
		`/procurement/${procurement_id}/estimatePO`,
		data,
	);
	return response.data;
};

export const recordDelivery = async (
	procurement_id: string,
	data: { bast_document: File },
) => {
	const formData = new FormData();
	formData.append("bast_document", data.bast_document);
	const response = await api.patch(
		`/procurement/${procurement_id}/recordDelivery`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);
	return response.data;
};

export const completeProcurement = async (
	procurement_id: string,
	data: { final_note: string },
) => {
	const response = await api.patch(
		`/procurement/${procurement_id}/complete`,
		data,
	);
	return response.data;
};

// Api services related to the update of a procurement
export const procurementUpdateApiService = {
	addItem,
	confirmPriceMatch,
	rejectStatus,
	approveStatus,
	createPO,
	estimatePO,
	recordDelivery,
	completeProcurement,
};
