import { describe, expect, test, beforeEach, mock } from "bun:test";
import {
	changeOrganization,
	getCurrentActiveOrganization,
	getAllUserOrganizations,
} from "@/services/active_organization.service";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const createMockDb = (returnValue: any) => ({
	update: mock(() => ({
		set: mock(() => ({
			where: mock(() => Promise.resolve(returnValue)),
		})),
	})),
	select: mock(() => ({
		from: mock(() => ({
			innerJoin: mock(() => ({
				where: mock(() => Promise.resolve(returnValue)),
			})),
		})),
	})),
});

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const mockEq = mock((a: any, b: any) => ({
	left: a,
	right: b,
	operator: "eq",
}));
mock.module("drizzle-orm", () => ({
	eq: mockEq,
}));

describe("Organization Service", () => {
	beforeEach(() => {
		mock.restore();
	});

	describe("changeOrganization", () => {
		test("should update the active organization for a user", async () => {
			const mockDb = createMockDb(true);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const userId = 1;
			const organizationId = 2;
			const result = await changeOrganization(userId, organizationId);

			expect(result).toBe(true);
		});

		test("should handle database errors", async () => {
			const mockDb = createMockDb(Promise.reject(new Error("Database error")));
			mock.module("@/db/db", () => ({ db: mockDb }));

			const userId = 1;
			const organizationId = 2;
			await expect(changeOrganization(userId, organizationId)).rejects.toThrow(
				"Database error",
			);
		});
	});

	describe("getCurrentActiveOrganization", () => {
		test("should return the current active organization for a user", async () => {
			const mockOrganization = {
				organizationId: 2,
				organizationName: "Test Organization",
			};
			const mockDb = createMockDb([mockOrganization]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const userId = 1;
			const result = await getCurrentActiveOrganization(userId);

			expect(result).toEqual(mockOrganization);
		});

		test("should handle case when no active organization is found", async () => {
			const mockDb = createMockDb([undefined]);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const userId = 1;
			const result = await getCurrentActiveOrganization(userId);

			expect(result).toBeUndefined();
		});
	});

	describe("getAllUserOrganizations", () => {
		test("should return all organizations for a user", async () => {
			const mockOrganizations = [
				{ organizationId: 1, organizationName: "Org 1" },
				{ organizationId: 2, organizationName: "Org 2" },
			];
			const mockDb = createMockDb(mockOrganizations);
			mock.module("@/db/db", () => ({ db: mockDb }));

			const userId = 1;
			const result = await getAllUserOrganizations(userId);

			expect(result).toEqual(mockOrganizations);
		});

		test("should handle database errors", async () => {
			const mockDb = createMockDb(Promise.reject(new Error("Database error")));
			mock.module("@/db/db", () => ({ db: mockDb }));

			const userId = 1;
			await expect(getAllUserOrganizations(userId)).rejects.toThrow(
				"Database error",
			);
		});
	});
});
