import { queryOptions } from "@tanstack/react-query";
import api from "../lib/axios";

export const getListBarangByPrintNumber = async (printNumberId: number) => {
	const response = await api.get(`/print-number/${printNumberId}/items`);
	return response.data;
};

export const uploadPhotoForPrintNumber = async (
	printNumberId: number,
	photo: File,
) => {
	const formData = new FormData();
	formData.append("photo", photo);

	const response = await api.post(
		`/print-number/${printNumberId}/photo`,
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);
	return response.data;
};

export const deletePhotoForPrintNumber = async (printNumberId: number) => {
	const response = await api.delete(`/print-number/${printNumberId}/photo`);
	return response.data;
};

export const getPrintNumberData = queryOptions({
	queryKey: ["printNumberData"],
	queryFn: async () => {
		const response = await api.get("/print-number");
		return response.data;
	},
	staleTime: 1000 * 60 * 5,
});

export const getPrintNumberIds = async () => {
	const response = await api.get("/print-number/ids");
	return response.data;
};

export const associateToProcurement = async (
	printNumber: string,
	procurementIds: number[],
	personInCharge: number,
) => {
	const response = await api.post("/print-number/associate-procurements", {
		printNumber,
		procurementIds,
		personInCharge,
	});
	return response.data;
};
