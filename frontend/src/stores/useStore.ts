import { create } from "zustand";

interface StoreState {
	count: number;
	setCount: (newCount: number) => void;
}

export const useStore = create<StoreState>((set) => ({
	count: 0,
	setCount: (newCount) => set({ count: newCount }),
}));
