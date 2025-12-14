import { queryOptions } from "@tanstack/react-query";
import api from "../lib/axios";
import type { Barang } from "@/lib/interfaces";

export const updateItem = async (item: Barang) => {
	console.log(item);
	item.price = Number.parseFloat(item.price.toString());
	const response = await api.patch(`/item/${item.id}`, item);
	return response.data;
};

export const createItem = async (newItem: Omit<Barang, "id">) => {
	console.log("Creating item payload:", newItem);
	const itemToSend = {
		...newItem,
		price: Number.parseFloat(newItem.price.toString()),
	};
	const response = await api.post("/item", itemToSend);
	return response.data;
};

export const getItems = queryOptions({
	queryKey: ["Items"],
	queryFn: async () => {
		const response = await api.get("/item");
		if (!response.status) {
			throw new Error("Failed to fetch item data");
		}

		console.log(response);
		return response.data;
	},
});
