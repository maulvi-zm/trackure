import { db } from "./db";
import { userActivityLogs } from "@/models/user_activity_log.model";
import { userOrganizationRoles, users, roles } from "@/models/user.model";
import { procurements, ProcurementStatus } from "@/models/procurement.model";
import { items } from "@/models/item.model";
import { budgets } from "@/models/budget.model";
import { faker } from "@faker-js/faker";
import { organizations } from "@/models/organization.model";
import { Role } from "@/types/authz.types";
import { activeOrganization } from "@/models/active_organization.model";
import {
	printNumbers,
	printNumberToProcurements,
} from "@/models/print_number.model";

async function seed() {
	console.log("Starting database seeding...");

	// Clear existing data in the right order to respect foreign key constraints
	await db.delete(userActivityLogs);
	await db.delete(printNumberToProcurements);
	await db.delete(printNumbers);
	await db.delete(userOrganizationRoles);
	await db.delete(activeOrganization);
	await db.delete(procurements);
	await db.delete(items);
	await db.delete(budgets);
	await db.delete(users);
	await db.delete(organizations);
	await db.delete(roles);

	console.log("Seeding roles...");
	const roleValues = [
		{
			id: 1,
			name: Role.SUPER_ADMIN,
			description: "Full access to all systems",
		},
		{
			id: 2,
			name: Role.ADMIN,
			description: "Administrative access to organizational data",
		},
		{
			id: 3,
			name: Role.REQUESTER,
			description: "Can create and track procurement requests",
		},
		{
			id: 4,
			name: Role.USER_PRINT_NUMBER,
			description: "Can generate and assign print numbers",
		},
		{
			id: 5,
			name: "DEVELOPER",
			description: "Can generate and assign print numbers",
		},
	];
	await db.insert(roles).values(roleValues);

	console.log("Seeding organizations...");
	const orgNames = [
		{ name: "Computer Science", code: "CS" },
		{ name: "Electrical Engineering", code: "EE" },
		{ name: "Mechanical Engineering", code: "ME" },
		{ name: "Civil Engineering", code: "CE" },
		{ name: "Information Systems", code: "IS" },
	];

	const insertedOrgs = await db
		.insert(organizations)
		.values(orgNames)
		.returning();

	const [steiORG] = await db
		.insert(organizations)
		.values({ name: "STEI", code: "STEI" })
		.returning();

	console.log("Seeding users...");
	// Create enough users for all our organizations (5 orgs * 4 users per org = 20 users)
	const userValues = Array(20)
		.fill(null)
		.map((_, index) => ({
			username: faker.internet.userName(),
			email: faker.internet.email(),
			created_at: faker.date.past(),
			updated_at: faker.date.recent(),
			is_active: Math.random() > 0.1, // 90% active
		}));

	const insertedUsers = await db.insert(users).values(userValues).returning();

	const emailDeveloper = [
		{
			username: "Maulvi",
			email: "13522122@mahasiswa.itb.ac.id",
		},
		{
			username: "Maha",
			email: "13522134@mahasiswa.itb.ac.id",
		},
		{
			username: "Chika",
			email: "13522148@mahasiswa.itb.ac.id",
		},
		{
			username: "Qiya",
			email: "13522163@mahasiswa.itb.ac.id",
		},
		{
			username: "Owen",
			email: "13522131@mahasiswa.itb.ac.id",
		},
		{
			username: "Akmal",
			email: "13522161@mahasiswa.itb.ac.id",
		},
	];

	const insertedDeveloper = await db
		.insert(users)
		.values(emailDeveloper)
		.returning();
	for (const user of insertedDeveloper) {
		await db.insert(userOrganizationRoles).values({
			user_id: user.id,
			organization_id: insertedOrgs[0].id,
			role_id: 5,
		});
		await db.insert(activeOrganization).values({
			user_id: user.id,
			organization_id: insertedOrgs[0].id,
		});
	}

	console.log("Seeding user organization roles...");

	// Distribute users evenly among organizations (4 users per org)
	// and assign specific roles within each org
	const userOrgRoleValues = [];

	// Assign 4 users to each organization with different roles
	for (let orgIndex = 0; orgIndex < insertedOrgs.length; orgIndex++) {
		const org = insertedOrgs[orgIndex];
		const orgUsers = insertedUsers.slice(orgIndex * 4, (orgIndex + 1) * 4);

		// First user is ADMIN
		userOrgRoleValues.push({
			user_id: orgUsers[0].id,
			organization_id: steiORG.id,
			role_id: 2, // ADMIN role
		});

		// Second user is REQUESTER
		userOrgRoleValues.push({
			user_id: orgUsers[1].id,
			organization_id: org.id,
			role_id: 3, // REQUESTER role
		});

		// Third user is USER_PRINT_NUMBER
		userOrgRoleValues.push({
			user_id: orgUsers[2].id,
			organization_id: org.id,
			role_id: 4, // USER_PRINT_NUMBER role
		});

		// Fourth user is also ADMIN (just to have multiple roles represented)
		userOrgRoleValues.push({
			user_id: orgUsers[3].id,
			organization_id: org.id,
			role_id: 2, // ADMIN role
		});

		for (let i = 0; i < 4; i++) {
			await db.insert(activeOrganization).values({
				user_id: orgUsers[i].id,
				organization_id: org.id,
			});
		}
	}

	await db.insert(userOrganizationRoles).values(userOrgRoleValues);

	console.log("Seeding items...");
	const categories = [
		"IT Equipment",
		"Office Supplies",
		"Laboratory Equipment",
		"Furniture",
		"Software",
		"Books",
		"Stationery",
	];

	const units = ["pcs", "box", "set", "package", "license", "unit"];

	const itemValues = Array(50)
		.fill(null)
		.map((_, idx) => ({
			item_code: generateNumericCode(10), // 10-digit numeric code
			item_name: faker.commerce.productName(),
			price: Number.parseFloat(
				faker.commerce.price({ min: 10, max: 5000, dec: 2 }),
			).toString(),
			category: faker.helpers.arrayElement(categories),
			specifications: faker.commerce.productDescription(),
			unit: faker.helpers.arrayElement(units),
			created_at: faker.date.past(),
			updated_at: faker.date.recent(),
			reference: faker.company.name(),
		}));

	const insertedItems = await db.insert(items).values(itemValues).returning();

	// Get all users with USER_PRINT_NUMBER role (role_id: 4)
	const printNumberUsers = [];
	for (let orgIndex = 0; orgIndex < insertedOrgs.length; orgIndex++) {
		const orgUsers = insertedUsers.slice(orgIndex * 4, (orgIndex + 1) * 4);
		printNumberUsers.push(orgUsers[2]); // The third user in each org has role_id: 4
	}

	console.log("Seeding procurements...");

	const procurementsByStatus = {
		[ProcurementStatus.PENGAJUAN]: [],
		[ProcurementStatus.VERIFIKASI_PENGAJUAN]: [],
		[ProcurementStatus.PENGAJUAN_DITOLAK]: [],
		[ProcurementStatus.PENGIRIMAN_ORDER]: [],
		[ProcurementStatus.PENGIRIMAN_BARANG]: [],
		[ProcurementStatus.PENERIMAAN_BARANG]: [],
		[ProcurementStatus.PENYERAHAN_BARANG]: [],
		[ProcurementStatus.SELESAI]: [],
	};

	// Create procurements with specific status
	for (const status of Object.values(ProcurementStatus)) {
		for (let i = 0; i < 5; i++) {
			// 5 procurements per status
			// Get a random organization
			const orgIndex = faker.number.int({
				min: 0,
				max: insertedOrgs.length - 1,
			});
			const org = insertedOrgs[orgIndex];

			// Get users who belong to this organization
			const orgUserStartIndex = orgIndex * 4;
			const orgUsers = insertedUsers.slice(
				orgUserStartIndex,
				orgUserStartIndex + 4,
			);

			// Select a random user from this organization
			const user = faker.helpers.arrayElement(orgUsers);

			const item = faker.helpers.arrayElement(insertedItems) as {
				id: number;
				price: string;
			};

			const quantity = faker.number.int({ min: 1, max: 100 });
			const estimatedPrice = (
				Number.parseFloat(item.price) *
				quantity *
				1.3
			).toString();

			// Use real image and file URLs
			const poDocumentUrl =
				"https://edunexcontentprodhot.blob.core.windows.net/edunex/2025/69703-Tech-Start-up/339208-Founders-Agreement/file/1743052616561_Founders-Agreement-Legal-Contract-For-Startup?sv=2024-11-04&spr=https&st=2025-03-27T05%3A16%3A58Z&se=2027-03-27T05%3A16%3A58Z&sr=b&sp=r&sig=pP0%2FFE8SRTxTmbeYebvxgsKJqDlrOS%2BWdQeQyLYSweI%3D&rsct=application%2Fpdf";
			const bastDocumentUrl =
				"https://edunexcontentprodhot.blob.core.windows.net/edunex/2025/69703-Tech-Start-up/339208-Founders-Agreement/file/1743052616561_Founders-Agreement-Legal-Contract-For-Startup?sv=2024-11-04&spr=https&st=2025-03-27T05%3A16%3A58Z&se=2027-03-27T05%3A16%3A58Z&sr=b&sp=r&sig=pP0%2FFE8SRTxTmbeYebvxgsKJqDlrOS%2BWdQeQyLYSweI%3D&rsct=application%2Fpdf";
			const reference =
				"https://www.tokopedia.com/grosirmaharani13748/sabun-cuci-mobil";

			// Create base procurement data
			let procurement;

			// Set fields based on status
			switch (status) {
				case ProcurementStatus.VERIFIKASI_PENGAJUAN:
					procurement = {
						requester_id: user.id,
						organization: org.id,
						status: status,
						created_at: faker.date.past(),
						updated_at: faker.date.recent(),
						estimated_price: estimatedPrice,
						reference: reference,
						quantity: quantity,
						request_date: faker.date.past(),
						item_id: item.id,
						verification_date: faker.date.recent(),
						bast_document: bastDocumentUrl,
						bast_date: faker.date.recent(),
						// Other fields can remain undefined
					};
					break;

				case ProcurementStatus.PENGAJUAN_DITOLAK:
					procurement = {
						requester_id: user.id,
						organization: org.id,
						status: status,
						created_at: faker.date.past(),
						updated_at: faker.date.recent(),
						estimated_price: estimatedPrice,
						reference: reference,
						quantity: quantity,
						request_date: faker.date.past(),
						verification_note: faker.lorem.sentence(),
						verification_date: faker.date.recent(),
						// Other fields can remain undefined
					};
					break;

				case ProcurementStatus.PENGIRIMAN_ORDER:
					procurement = {
						requester_id: user.id,
						organization: org.id,
						status: status,
						created_at: faker.date.past(),
						updated_at: faker.date.recent(),
						estimated_price: estimatedPrice,
						reference: reference,
						quantity: quantity,
						request_date: faker.date.past(),
						item_id: item.id,
						verification_date: faker.date.recent(),
					};
					break;

				case ProcurementStatus.PENGIRIMAN_BARANG:
					procurement = {
						requester_id: user.id,
						organization: org.id,
						status: status,
						created_at: faker.date.past(),
						updated_at: faker.date.recent(),
						estimated_price: estimatedPrice,
						reference: reference,
						quantity: quantity,
						request_date: faker.date.past(),
						item_id: item.id,
						verification_date: faker.date.recent(),
						po_document: poDocumentUrl,
						po_date: faker.date.recent(),
					};
					break;

				case ProcurementStatus.PENERIMAAN_BARANG:
					procurement = {
						requester_id: user.id,
						organization: org.id,
						status: status,
						created_at: faker.date.past(),
						updated_at: faker.date.recent(),
						estimated_price: estimatedPrice,
						reference: reference,
						quantity: quantity,
						request_date: faker.date.past(),
						item_id: item.id,
						verification_date: faker.date.recent(),
						po_document: poDocumentUrl,
						po_date: faker.date.recent(),
						time_estimation: `${faker.number.int({ min: 1, max: 30 })} days`,
						time_estimation_date: faker.date.recent(),
					};
					break;

				case ProcurementStatus.PENYERAHAN_BARANG:
					procurement = {
						requester_id: user.id,
						organization: org.id,
						status: status,
						created_at: faker.date.past(),
						updated_at: faker.date.recent(),
						estimated_price: estimatedPrice,
						reference: reference,
						quantity: quantity,
						request_date: faker.date.past(),
						item_id: item.id,
						verification_date: faker.date.recent(),
						po_document: poDocumentUrl,
						po_date: faker.date.recent(),
						time_estimation: `${faker.number.int({ min: 1, max: 30 })} days`,
						time_estimation_date: faker.date.recent(),
						bast_document: bastDocumentUrl,
						bast_date: faker.date.recent(),
					};
					break;
				default:
					procurement = {
						requester_id: user.id,
						organization: org.id,
						status: status,
						created_at: faker.date.past(),
						updated_at: faker.date.recent(),
						estimated_price: estimatedPrice,
						reference: reference,
						quantity: quantity,
						request_date: faker.date.past(),
						// Other fields can remain undefined
					};
					break;
			}

			procurementsByStatus[status].push(procurement);
		}
	}

	// Flatten all procurements
	const allProcurements = Object.values(procurementsByStatus).flat();
	const insertedProcurements = await db
		.insert(procurements)
		.values(allProcurements)
		.returning();

	// Re-organize inserted procurements by status
	const insertedProcurementsByStatus = {};
	for (const proc of insertedProcurements) {
		if (!insertedProcurementsByStatus[proc.status]) {
			insertedProcurementsByStatus[proc.status] = [];
		}
		insertedProcurementsByStatus[proc.status].push(proc);
	}

	console.log("Seeding print numbers and print number to procurements...");

	console.log("Seeding budgets...");
	const currentYear = new Date().getFullYear();

	// First, calculate total procurement costs per organization
	const orgProcurementCosts = {};
	for (const procurement of allProcurements) {
		if (!orgProcurementCosts[procurement.organization]) {
			orgProcurementCosts[procurement.organization] = 0;
		}
		orgProcurementCosts[procurement.organization] += 
			Number(procurement.estimated_price) * procurement.quantity;
	}
	for (const procurement of allProcurements) {
    if (!orgProcurementCosts[procurement.organization]) {
        orgProcurementCosts[procurement.organization] = 0;
    }
    // Find the item price for this procurement
    const item = insertedItems.find(item => item.id === procurement.item_id);
    if (item) {
        // Use actual item price instead of estimated price
        orgProcurementCosts[procurement.organization] += 
            Number(item.price) * procurement.quantity;
    }
}

	const budgetValues = insertedOrgs.map((org) => {
		const totalProcurementCost = orgProcurementCosts[org.id] || 0;
		const minBudget = Math.max(totalProcurementCost * 1.2, 500000); 
		const totalBudget = Number.parseFloat(
			faker.finance.amount({ 
				min: minBudget, 
				max: Math.max(minBudget * 2, 10000000) 
			})
		);

		const remainingBudget = totalBudget - (orgProcurementCosts[org.id] || 0);

		return {
			organization_id: org.id,
			total_budget: totalBudget.toString(),
			remaining_budget: remainingBudget.toString(),
			year: currentYear,
			created_at: faker.date.past(),
			updated_at: faker.date.recent(),
		};
	});

	await db.insert(budgets).values(budgetValues);

	// Create print numbers for procurements that are in PENERIMAAN_BARANG or PENYERAHAN_BARANG status
	const printNumberProcurements = [
		...(insertedProcurementsByStatus[ProcurementStatus.PENERIMAAN_BARANG] ||
			[]),
		...(insertedProcurementsByStatus[ProcurementStatus.PENYERAHAN_BARANG] ||
			[]),
	];

	if (printNumberProcurements.length > 0) {
		const printNumberValues = printNumberProcurements.map((proc, index) => {
			// Get a random user with USER_PRINT_NUMBER role
			const randomPrintNumberUser =
				faker.helpers.arrayElement(printNumberUsers);

			return {
				print_number: generateNumericCode(10), // 10-digit numeric code
				person_in_charge: randomPrintNumberUser.id,
				proof_photo:
					"https://mediakonsumen.com/files/2021/04/20210424_192531-wpp1619414067462.jpg",
				created_at: faker.date.recent(),
				updated_at: faker.date.recent(),
				receive_date: faker.date.recent(),
				is_active: true,
			};
		});

		const insertedPrintNumbers = await db
			.insert(printNumbers)
			.values(printNumberValues)
			.returning();

		// Create print number to procurement relations
		const printNumberToProcurementsValues = [];
		for (let i = 0; i < printNumberProcurements.length; i++) {
			if (i < insertedPrintNumbers.length) {
				printNumberToProcurementsValues.push({
					print_number_id: insertedPrintNumbers[i].id,
					procurement_id: printNumberProcurements[i].id,
				});
			}
		}

		if (printNumberToProcurementsValues.length > 0) {
			await db
				.insert(printNumberToProcurements)
				.values(printNumberToProcurementsValues);
		}
	}

	console.log("Seeding user activity logs...");

	const logValues = [];

	// Create activity logs for users, ensuring they only have activities related to their organization
	for (let orgIndex = 0; orgIndex < insertedOrgs.length; orgIndex++) {
		const org = insertedOrgs[orgIndex];

		// Get users who belong to this organization
		const orgUserStartIndex = orgIndex * 4;
		const orgUsers = insertedUsers.slice(
			orgUserStartIndex,
			orgUserStartIndex + 4,
		);

		// Create 20 activity logs for each organization
		for (let i = 0; i < 20; i++) {
			const user = faker.helpers.arrayElement(orgUsers);
			const userOrgRole = userOrgRoleValues.find(
				(val) => val.user_id === user.id && val.organization_id === org.id,
			);

			logValues.push({
				user_id: user.id,
				organization_id: org.id,
				role_id: userOrgRole ? userOrgRole.role_id : 3, // Default to REQUESTER if not found
				activity: faker.lorem.sentence(),
				timestamp: faker.date.recent(),
			});
		}
	}

	await db.insert(userActivityLogs).values(logValues);

	console.log("Seeding completed successfully!");
}

// Helper function to generate a numeric code of specified length
function generateNumericCode(length: number): string {
	return faker.string.numeric(length);
}

seed()
	.catch((error) => {
		console.error("Error while seeding:", error);
		process.exit(1);
	})
	.finally(async () => {
		console.log("Disconnecting from database");
		// Close connection if needed
		process.exit(0);
	});
