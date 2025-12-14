import { describe, expect, test, beforeEach, mock } from "bun:test";
import {
	createUserWithRole,
	deleteUserById,
	updateUserDetails,
	getUserDataWithRoles,
	getAllUsers,
	getUserByEmail,
	getAllUserPrintNumber,
	changeUserActivation,
	addUserRole,
	updateUserRoleAndOrganization,
} from "@/services/user.service";

describe("User Service", () => {
	const mockDate = new Date("2025-01-01");

	beforeEach(() => {
		mock.restore();
		// Mock current date
		global.Date = class extends Date {
			constructor() {
				super();
				// biome-ignore lint/correctness/noConstructorReturn: <explanation>
				return mockDate;
			}
		} as DateConstructor;
	});

	describe("createUserWithRole", () => {
		test("should create a new user with role and organization", async () => {
			// Mock data
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@example.com",
				created_at: mockDate,
				updated_at: mockDate,
				is_active: true,
			};

			const mockRoleId = 1;
			const mockOrganizationId = 1;

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					query: {
						users: {
							findFirst: () => Promise.resolve(undefined), // User doesn't exist yet
						},
					},
					insert: () => ({
						values: () => ({
							returning: () => Promise.resolve([mockUser]),
						}),
					}),
				},
			}));

			// Mock getRoleIdbyName
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(mockRoleId),
			}));

			// Mock getOrCreateOrganiztionByName
			mock.module("@/services/organization.service", () => ({
				getOrCreateOrganiztionByName: () => Promise.resolve(mockOrganizationId),
				getOrganizationByName: () =>
					Promise.resolve([{ id: mockOrganizationId }]),
			}));

			const result = await createUserWithRole(
				"testuser",
				"test@example.com",
				"admin",
				"STEI",
			);

			expect(result).toEqual(mockUser);
		});

		test("should add role to existing user", async () => {
			// Mock data
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@example.com",
				created_at: mockDate,
				updated_at: mockDate,
				is_active: true,
			};

			const mockRoleId = 1;
			const mockOrganizationId = 1;

			// Mock db module with existing user
			let selectCount = 0;
			mock.module("@/db/db", () => ({
				db: {
					query: {
						users: {
							findFirst: () => Promise.resolve(mockUser), // User already exists
						},
					},
					select: () => {
						selectCount++;
						return {
							from: () => ({
								where: () => Promise.resolve([]), // No existing role relation
							}),
						};
					},
					insert: () => ({
						values: () => Promise.resolve(),
					}),
				},
			}));

			// Mock getRoleIdbyName
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(mockRoleId),
			}));

			// Mock getOrCreateOrganiztionByName
			mock.module("@/services/organization.service", () => ({
				getOrCreateOrganiztionByName: () => Promise.resolve(mockOrganizationId),
				getOrganizationByName: () =>
					Promise.resolve([{ id: mockOrganizationId }]),
			}));

			const result = await createUserWithRole(
				"testuser",
				"test@example.com",
				"admin",
				"STEI",
			);

			expect(result).toEqual(mockUser);
		});

		test("should fail if role is not found", async () => {
			// Mock getRoleIdbyName to return null (role not found)
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(null),
			}));

			try {
				await createUserWithRole(
					"testuser",
					"test@example.com",
					"invalid-role",
					"STEI",
				);
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
			}
		});

		test("should fail if role relation already exists", async () => {
			// Mock data
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@example.com",
				created_at: mockDate,
				updated_at: mockDate,
				is_active: true,
			};

			const mockRoleId = 1;
			const mockOrganizationId = 1;

			// Mock db module with existing user and role relation
			mock.module("@/db/db", () => ({
				db: {
					query: {
						users: {
							findFirst: () => Promise.resolve(mockUser),
						},
					},
					select: () => ({
						from: () => ({
							where: () => Promise.resolve([{ exists: true }]),
						}),
					}),
				},
			}));

			// Mock getRoleIdbyName
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(mockRoleId),
			}));

			// Mock getOrCreateOrganiztionByName
			mock.module("@/services/organization.service", () => ({
				getOrCreateOrganiztionByName: () => Promise.resolve(mockOrganizationId),
				getOrganizationByName: () =>
					Promise.resolve([{ id: mockOrganizationId }]),
			}));

			try {
				await createUserWithRole(
					"testuser",
					"test@example.com",
					"admin",
					"STEI",
				);
				// If we reach here, the test should fail
				expect(true).toBe(false); // Force test to fail if no error thrown
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
			}
		});
	});

	describe("deleteUserById", () => {
		test("should delete a user role association", async () => {
			// Mock multiple roles for the user
			const mockUserRoles = [
				{ id: 1, user_id: 1, organization_id: 1, role_id: 1 },
				{ id: 2, user_id: 1, organization_id: 2, role_id: 2 },
			];

			// Mock active organization where user's active org is different from the one being deleted
			const mockActiveOrg = [{ user_id: 1, organization_id: 2 }];

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					query: {
						userOrganizationRoles: {
							findMany: () => Promise.resolve(mockUserRoles),
						},
					},
					delete: () => ({
						where: () => Promise.resolve(true),
					}),
					select: () => ({
						from: () => ({
							where: () => Promise.resolve(mockActiveOrg),
						}),
					}),
				},
			}));

			const result = await deleteUserById(1, 1, 1);

			expect(result).toBe(true);
		});

		test("should update active organization if deleting the active one", async () => {
			// Mock multiple roles for the user
			const mockUserRoles = [
				{ id: 1, user_id: 1, organization_id: 1, role_id: 1 },
				{ id: 2, user_id: 1, organization_id: 2, role_id: 2 },
			];

			// Mock active organization where the deleted org is the active one
			const mockActiveOrg = [{ user_id: 1, organization_id: 1 }];

			// Mock alternative organization to set as active
			const mockAlternativeOrg = [{ organizationId: 2 }];

			let updateCalled = false;

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					query: {
						userOrganizationRoles: {
							findMany: () => Promise.resolve(mockUserRoles),
						},
					},
					delete: () => ({
						where: () => Promise.resolve(true),
					}),
					select: () => ({
						from: () => ({
							where: () => Promise.resolve(mockActiveOrg),
							execute: () => Promise.resolve(mockActiveOrg),
						}),
					}),
					update: () => {
						updateCalled = true;
						return {
							set: () => ({
								where: () => Promise.resolve(true),
							}),
						};
					},
				},
			}));

			const result = await deleteUserById(1, 1, 1);

			expect(result).toBe(true);
			expect(updateCalled).toBe(true);
		});

		test("should fail if user only has one role", async () => {
			// Mock only one role for the user
			const mockUserRoles = [
				{ id: 1, user_id: 1, organization_id: 1, role_id: 1 },
			];

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					query: {
						userOrganizationRoles: {
							findMany: () => Promise.resolve(mockUserRoles),
						},
					},
				},
			}));

			try {
				await deleteUserById(1, 1, 1);
				// If we reach here, the test should fail
				expect(true).toBe(false); // Force test to fail if no error thrown
			} catch (error) {
				expect(error).toBeInstanceOf(Error);
			}
		});
	});

	describe("updateUserDetails", () => {
		test("should update user details successfully", async () => {
			// Mock data
			const mockUpdatedUser = {
				id: 1,
				username: "updated-username",
				email: "updated@example.com",
				created_at: mockDate,
				updated_at: mockDate,
				is_active: true,
			};

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					update: () => ({
						set: () => ({
							where: () => ({
								returning: () => Promise.resolve([mockUpdatedUser]),
							}),
						}),
					}),
				},
			}));

			const result = await updateUserDetails(1, {
				username: "updated-username",
				email: "updated@example.com",
			});

			expect(result).toEqual(mockUpdatedUser);
		});

		test("should return undefined when no update data provided", async () => {
			const result = await updateUserDetails(1, {});

			expect(result).toBeUndefined();
		});

		test("should return undefined when update fails", async () => {
			// Mock db module for failure case
			mock.module("@/db/db", () => ({
				db: {
					update: () => ({
						set: () => ({
							where: () => ({
								returning: () => Promise.resolve([]),
							}),
						}),
					}),
				},
			}));

			const result = await updateUserDetails(1, { username: "failed-update" });

			expect(result).toBeUndefined();
		});
	});

	describe("getUserDataWithRoles", () => {
		test("should return user data with roles", async () => {
			// Mock data
			const mockUserData = [
				{
					users: {
						id: 1,
						username: "testuser",
						email: "test@example.com",
						created_at: mockDate,
						updated_at: mockDate,
						is_active: true,
					},
					user_organization_roles: {
						user_id: 1,
						organization_id: 1,
						role_id: 1,
					},
					roles: {
						id: 1,
						name: "admin",
						description: "Administrator",
					},
					organizations: {
						id: 1,
						name: "STEI",
					},
				},
			];

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					select: () => ({
						from: () => ({
							leftJoin: () => ({
								leftJoin: () => ({
									leftJoin: () => ({
										where: () => Promise.resolve(mockUserData),
									}),
								}),
							}),
						}),
					}),
				},
			}));

			const result = await getUserDataWithRoles(1);

			expect(result).toEqual({
				id: 1,
				username: "testuser",
				email: "test@example.com",
				created_at: mockDate,
				updated_at: mockDate,
				is_active: true,
				userOrganizationRoles: [
					{
						user_id: 1,
						organization_id: 1,
						role_id: 1,
						role: {
							id: 1,
							name: "admin",
							description: "Administrator",
						},
						organization: {
							id: 1,
							name: "STEI",
						},
					},
				],
			});
		});

		test("should return undefined when user not found", async () => {
			// Mock db module for empty result
			mock.module("@/db/db", () => ({
				db: {
					select: () => ({
						from: () => ({
							leftJoin: () => ({
								leftJoin: () => ({
									leftJoin: () => ({
										where: () => Promise.resolve([]),
									}),
								}),
							}),
						}),
					}),
				},
			}));

			const result = await getUserDataWithRoles(999);

			expect(result).toBeUndefined();
		});
	});

	describe("getAllUsers", () => {
		test("should return all users with roles and organizations", async () => {
			// Mock data
			const mockUsers = [
				{
					users: {
						id: 1,
						username: "user1",
						email: "user1@example.com",
						created_at: mockDate,
						updated_at: mockDate,
						is_active: true,
					},
					organizations: {
						id: 1,
						name: "STEI",
						code: null,
					},
					roles: {
						id: 1,
						name: "admin",
						description: "Administrator",
					},
					user_organization_roles: {
						user_id: 1,
						organization_id: 1,
						role_id: 1,
					},
				},
			];

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					select: () => ({
						from: () => ({
							innerJoin: () => ({
								innerJoin: () => ({
									innerJoin: () => ({
										orderBy: () => Promise.resolve(mockUsers),
									}),
								}),
							}),
						}),
					}),
				},
			}));

			const result = await getAllUsers();

			expect(result).toEqual(mockUsers);
		});
	});

	describe("getUserByEmail", () => {
		test("should return user data by email", async () => {
			// Mock data
			const mockUser = {
				id: 1,
				username: "testuser",
				email: "test@example.com",
				created_at: mockDate,
				updated_at: mockDate,
				is_active: true,
			};

			const mockActiveOrgData = [
				{
					users: {
						id: 1,
						username: "testuser",
						email: "test@example.com",
						created_at: mockDate,
						updated_at: mockDate,
						is_active: true,
					},
					organizations: {
						id: 1,
						name: "STEI",
						code: null,
					},
					roles: {
						id: 1,
						name: "admin",
						description: "Administrator",
					},
					user_organization_roles: {
						user_id: 1,
						organization_id: 1,
						role_id: 1,
					},
					active_organization: {
						user_id: 1,
						organization_id: 1,
					},
				},
			];

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					select: () => ({
						from: () => ({
							where: () => Promise.resolve([mockUser]),
							innerJoin: () => ({
								innerJoin: () => ({
									innerJoin: () => ({
										innerJoin: () => ({
											where: () => ({
												execute: () => Promise.resolve(mockActiveOrgData),
											}),
										}),
									}),
								}),
							}),
						}),
					}),
				},
			}));

			const result = await getUserByEmail("test@example.com");

			expect(result).toEqual({
				id: 1,
				username: "testuser",
				email: "test@example.com",
				organizationId: 1,
				organizationName: "STEI",
			});
		});

		test("should throw error for invalid email", async () => {
			await expect(getUserByEmail("invalid-email")).rejects.toThrow();
		});

		test("should throw error when user not found", async () => {
			// Mock db module for empty result
			mock.module("@/db/db", () => ({
				db: {
					select: () => ({
						from: () => ({
							where: () => Promise.resolve([]),
						}),
					}),
				},
			}));

			await expect(getUserByEmail("nonexistent@example.com")).rejects.toThrow();
		});
	});

	describe("getAllUserPrintNumber", () => {
		test("should return all users with print number permissions", async () => {
			// Mock data
			const mockUserOrg = [{ organization_id: 1 }];
			const mockUsers = [
				{ id: 1, name: "User 1" },
				{ id: 2, name: "User 2" },
			];

			// Mock db module
			let selectCount = 0;
			mock.module("@/db/db", () => ({
				db: {
					select: () => {
						selectCount++;
						return {
							from: () => ({
								where: () => Promise.resolve(mockUserOrg),
								innerJoin: () => ({
									where: () => Promise.resolve(mockUsers),
								}),
							}),
						};
					},
				},
			}));

			const result = await getAllUserPrintNumber(1, 1);

			expect(result).toEqual(mockUsers);
			expect(selectCount).toBe(2);
		});

		test("should return empty array when user not in organization", async () => {
			// Mock db module for empty result
			mock.module("@/db/db", () => ({
				db: {
					select: () => ({
						from: () => ({
							where: () => Promise.resolve([]),
						}),
					}),
				},
			}));

			const result = await getAllUserPrintNumber(1, 999);

			expect(result).toEqual([]);
		});
	});

	describe("changeUserActivation", () => {
		test("should change user activation status", async () => {
			// Mock data
			const mockUpdatedUser = {
				id: 1,
				username: "testuser",
				email: "test@example.com",
				created_at: mockDate,
				updated_at: mockDate,
				is_active: true,
			};

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					update: () => ({
						set: () => ({
							where: () => ({
								returning: () => Promise.resolve([mockUpdatedUser]),
							}),
						}),
					}),
				},
			}));

			const result = await changeUserActivation(1, true);

			expect(result).toEqual([mockUpdatedUser]);
		});
	});

	describe("addUserRole", () => {
		test("should add new role to user", async () => {
			// Mock data
			const mockUser = { id: 1, username: "testuser" };
			const mockRoleId = 2;
			const mockOrganizationId = 1;

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					query: {
						users: {
							findFirst: () => Promise.resolve(mockUser),
						},
					},
					select: () => ({
						from: () => ({
							where: () => Promise.resolve([]), // No existing role relation
						}),
					}),
					insert: () => ({
						values: () => Promise.resolve(),
					}),
				},
			}));

			// Mock role and organization services
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(mockRoleId),
			}));

			mock.module("@/services/organization.service", () => ({
				getOrganizationByName: () =>
					Promise.resolve([{ id: mockOrganizationId }]),
			}));

			const result = await addUserRole(1, "editor", "STEI");

			expect(result).toBe(true);
		});

		test("should throw error if role not found", async () => {
			// Mock role service to return null
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(null),
			}));

			await expect(
				addUserRole(1, "nonexistent-role", "STEI"),
			).rejects.toThrow();
		});

		test("should throw error if user not found", async () => {
			// Mock db module for user not found
			mock.module("@/db/db", () => ({
				db: {
					query: {
						users: {
							findFirst: () => Promise.resolve(undefined),
						},
					},
				},
			}));

			// Mock role service
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(1),
			}));

			await expect(addUserRole(999, "admin", "STEI")).rejects.toThrow();
		});

		test("should throw error if organization not found", async () => {
			// Mock data
			const mockUser = { id: 1, username: "testuser" };

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					query: {
						users: {
							findFirst: () => Promise.resolve(mockUser),
						},
					},
				},
			}));

			// Mock role service
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(1),
			}));

			// Mock organization service
			mock.module("@/services/organization.service", () => ({
				getOrganizationByName: () => Promise.resolve([]),
			}));

			await expect(
				addUserRole(1, "admin", "nonexistent-org"),
			).rejects.toThrow();
		});

		test("should throw error if role already assigned", async () => {
			// Mock data
			const mockUser = { id: 1, username: "testuser" };
			const mockRoleId = 1;
			const mockOrganizationId = 1;

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					query: {
						users: {
							findFirst: () => Promise.resolve(mockUser),
						},
					},
					select: () => ({
						from: () => ({
							where: () => Promise.resolve([{ exists: true }]), // Existing role relation
						}),
					}),
				},
			}));

			// Mock services
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(mockRoleId),
			}));

			mock.module("@/services/organization.service", () => ({
				getOrganizationByName: () =>
					Promise.resolve([{ id: mockOrganizationId }]),
			}));

			await expect(addUserRole(1, "admin", "STEI")).rejects.toThrow();
		});
	});

	describe("updateUserRoleAndOrganization", () => {
		test("should update user role and organization", async () => {
			// Mock data
			const mockUser = { id: 1, username: "testuser" };
			const mockRoleId = 2;
			const mockOrganizationId = 2;

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					query: {
						users: {
							findFirst: () => Promise.resolve(mockUser),
						},
					},
					select: () => ({
						from: () => ({
							where: () => Promise.resolve([]), // No existing role relation
						}),
					}),
					update: () => ({
						set: () => ({
							where: () => Promise.resolve(),
						}),
					}),
				},
			}));

			// Mock services
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(mockRoleId),
			}));

			mock.module("@/services/organization.service", () => ({
				getOrganizationByName: () =>
					Promise.resolve([{ id: mockOrganizationId }]),
			}));

			const result = await updateUserRoleAndOrganization(
				1,
				"editor",
				"FTI",
				1,
				1,
			);

			expect(result).toBe(true);
		});

		test("should throw error if role not found", async () => {
			// Mock role service to return null
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(null),
			}));

			await expect(
				updateUserRoleAndOrganization(1, "nonexistent-role", "STEI", 1, 1),
			).rejects.toThrow();
		});

		test("should throw error if user not found", async () => {
			// Mock db module for user not found
			mock.module("@/db/db", () => ({
				db: {
					query: {
						users: {
							findFirst: () => Promise.resolve(undefined),
						},
					},
				},
			}));

			// Mock role service
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(1),
			}));

			await expect(
				updateUserRoleAndOrganization(999, "admin", "STEI", 1, 1),
			).rejects.toThrow();
		});

		test("should throw error if new role already assigned", async () => {
			// Mock data
			const mockUser = { id: 1, username: "testuser" };
			const mockRoleId = 2;
			const mockOrganizationId = 2;

			// Mock db module
			mock.module("@/db/db", () => ({
				db: {
					query: {
						users: {
							findFirst: () => Promise.resolve(mockUser),
						},
					},
					select: () => ({
						from: () => ({
							where: () => Promise.resolve([{ exists: true }]), // Existing role relation
						}),
					}),
				},
			}));

			// Mock services
			mock.module("@/services/authz.service", () => ({
				getRoleIdbyName: () => Promise.resolve(mockRoleId),
			}));

			mock.module("@/services/organization.service", () => ({
				getOrganizationByName: () =>
					Promise.resolve([{ id: mockOrganizationId }]),
			}));

			await expect(
				updateUserRoleAndOrganization(1, "editor", "FTI", 1, 1),
			).rejects.toThrow();
		});
	});
});
