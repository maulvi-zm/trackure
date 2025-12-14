import { describe, expect, test, beforeEach, mock } from "bun:test";
import {
	getCurrentYearBudget,
	createBudget,
	getOrCreateCurrentYearBudget,
	updateBudget,
	deductBudget,
} from "@/services/budget.service";
import type { Budget } from "@/models/budget.model";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const createMockDb = (returnValue: any) => ({
	select: mock(() => ({
		from: mock(() => ({
			where: mock(() => ({
				limit: mock(() => Promise.resolve(returnValue)),
			})),
		})),
	})),
	insert: mock(() => ({
		values: mock(() => ({
			returning: mock(() => Promise.resolve(returnValue)),
		})),
	})),
	update: mock(() => ({
		set: mock(() => ({
			where: mock(() => ({
				returning: mock(() => Promise.resolve(returnValue)),
			})),
		})),
	})),
});

describe("Budget Service", () => {
	const mockDate = new Date("2025-01-01");

	beforeEach(() => {
		mock.restore();
		global.Date = class extends Date {
			constructor() {
				super();
				// biome-ignore lint/correctness/noConstructorReturn: <explanation>
				return mockDate;
			}
		} as DateConstructor;
	});

	describe("getCurrentYearBudget", () => {
		test("should return current year budget", async () => {
			const mockBudget: Budget = {
				id: 1,
				organization_id: 1,
				total_budget: "1000",
				remaining_budget: "500",
				year: 2025,
				created_at: mockDate,
				updated_at: mockDate,
			};

			const mockDb = createMockDb([mockBudget]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const result = await getCurrentYearBudget(1);
			expect(result).toEqual(mockBudget);
		});

		test("should return undefined when no budget exists", async () => {
			const mockDb = createMockDb([]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const result = await getCurrentYearBudget(1);
			expect(result).toBeUndefined();
		});
	});

	describe("createBudget", () => {
		test("should create new budget with default values", async () => {
			const expectedBudget = {
				organization_id: 1,
				total_budget: "0",
				remaining_budget: "0",
				year: 2025,
				created_at: mockDate,
				updated_at: mockDate,
			};

			const mockDb = createMockDb([expectedBudget]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const result = await createBudget(1);
			expect(result).toEqual(expectedBudget);
		});
	});

	describe("getOrCreateCurrentYearBudget", () => {
		test("should return existing budget if exists", async () => {
			const mockBudget: Budget = {
				id: 1,
				organization_id: 1,
				total_budget: "1000",
				remaining_budget: "500",
				year: 2025,
				created_at: mockDate,
				updated_at: mockDate,
			};

			const mockDb = createMockDb([mockBudget]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const result = await getOrCreateCurrentYearBudget(1);
			expect(result).toEqual(mockBudget);
		});

		test("should create new budget if none exists", async () => {
			const mockDb = createMockDb([]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const expectedBudget = {
				organization_id: 1,
				total_budget: "0",
				remaining_budget: "0",
				year: 2025,
				created_at: mockDate,
				updated_at: mockDate,
			};

			const secondMockDb = createMockDb([expectedBudget]);
			mock.module("@/db/db", () => ({ db: secondMockDb }));

			const result = await getOrCreateCurrentYearBudget(1);
			expect(result).toEqual(expectedBudget);
		});
	});

	describe("updateBudget", () => {
		test("should update budget total and remaining amount", async () => {
			const currentBudget: Budget = {
				id: 1,
				organization_id: 1,
				total_budget: "1000",
				remaining_budget: "500",
				year: 2025,
				created_at: mockDate,
				updated_at: mockDate,
			};

			const mockDb = createMockDb([currentBudget]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const updatedBudget = {
				...currentBudget,
				total_budget: "2000",
				remaining_budget: "1500",
				updated_at: mockDate,
			};

			const updateMockDb = createMockDb([updatedBudget]);
			mock.module("@/db/db", () => ({ db: updateMockDb }));

			const result = await updateBudget(1, 2000, 2025);
			expect(result).toEqual(updatedBudget);
		});

		test("should throw error when budget not found", async () => {
			const mockDb = createMockDb([]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			await expect(updateBudget(1, 2000, 2025)).rejects.toThrow(
				"Budget not found",
			);
		});
	});

	describe("deductBudget", () => {
		test("should deduct amount from remaining budget", async () => {
			const currentBudget: Budget = {
				id: 1,
				organization_id: 1,
				total_budget: "1000",
				remaining_budget: "500",
				year: 2025,
				created_at: mockDate,
				updated_at: mockDate,
			};

			const mockDb = createMockDb([currentBudget]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const updatedBudget = {
				...currentBudget,
				remaining_budget: "300",
				updated_at: mockDate,
			};

			const updateMockDb = createMockDb([updatedBudget]);
			mock.module("@/db/db", () => ({ db: updateMockDb }));

			const result = await deductBudget(1, 200, 2025);
			expect(result).toEqual(updatedBudget);
		});

		test("should throw error when amount is negative", async () => {
			await expect(deductBudget(1, -100, 2025)).rejects.toThrow(
				"Amount cannot be negative",
			);
		});

		test("should throw error when deduction exceeds remaining budget", async () => {
			const currentBudget: Budget = {
				id: 1,
				organization_id: 1,
				total_budget: "1000",
				remaining_budget: "500",
				year: 2025,
				created_at: mockDate,
				updated_at: mockDate,
			};

			const mockDb = createMockDb([currentBudget]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			await expect(deductBudget(1, 600, 2025)).rejects.toThrow(
				"Amount deducted surpass the remaining budget",
			);
		});
	});
});
