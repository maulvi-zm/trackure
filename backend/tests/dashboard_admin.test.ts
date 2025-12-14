import { describe, expect, test, beforeEach, mock } from "bun:test";
import {
  getProgramStudiSummaries,
} from '@/services/organization.service';
import { getProcurementList } from '@/services/procurement.service';
describe('Dashboard Admin Service', () => {
  const mockDate = new Date('2025-01-01');
  
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

  describe('getProgramStudiSummaries', () => {
    test('should return summaries for all program studi', async () => {
      const mockOrganizations = [
        { id: 1, name: 'Program Studi A' },
        { id: 2, name: 'Program Studi B' }
      ];

      const mockStatusCounts = [
        { status: 'PENDING', count: 2 },
        { status: 'APPROVED', count: 3 }
      ];

      const mockBudget = {
        total_budget: "10000",
        remaining_budget: "5000",
        year: 2025
      };

      mock.module("@/services/budget.service", () => ({
        getOrCreateCurrentYearBudget: () => Promise.resolve(mockBudget)
      }));

      let queryCounter = 0;
      mock.module("@/db/db", () => ({
        db: {
          select: () => {
            queryCounter++;
            
            // First query: return organizations
            if (queryCounter === 1) {
              return {
                from: () => Promise.resolve(mockOrganizations)
              };
            } 
            // Subsequent queries: return status counts for each organization
            // biome-ignore lint/style/noUselessElse: <explanation>
                        else {
              return {
                from: () => ({
                  where: () => ({
                    groupBy: () => Promise.resolve(mockStatusCounts)
                  })
                })
              };
            }
          }
        }
      }));

      const result = await getProgramStudiSummaries();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        organizationId: 1,
        organization: 'Program Studi A',
        total_budget: 10000,
        remaining_budget: 5000,
        year: 2025,
        procurements_total: 5,
        status: {
          PENDING: 2,
          APPROVED: 3
        }
      });
    });
  });

  describe('getProcurementList', () => {
    test('should return procurement list for organization', async () => {
      const mockProcurements = [{
        procurements: {
          id: 1,
          estimated_price: "1000",
          quantity: 2,
          reference: "REF001",
          status: "PENDING",
          created_at: mockDate,
          organization: 1
        },
        organizations: {
          id: 1,
          name: "Program Studi A"
        },
        items: {
          id: 1,
          item_name: "Test Item",
          reference: "REF001",
          category: "Test Category"
        }
      }];

      mock.module("@/db/db", () => ({
        db: {
          select: () => ({
            from: () => ({
              leftJoin: () => ({
                leftJoin: () => ({
                  where: () => Promise.resolve(mockProcurements)
                })
              })
            })
          })
        }
      }));

      const result = await getProcurementList(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 1,
        nama: "Test Item",
        referensi: "REF001",
        organisasi: "Program Studi A",
        bidang: "Test Category",
        qty: 2,
        jumlah: 1000,
        tanggal: mockDate.toISOString(),
        status: "PENDING"
      });
    });

    test('should handle missing items data', async () => {
      const mockProcurements = [{
        procurements: {
          id: 1,
          estimated_price: "1000",
          quantity: 2,
          reference: "REF001",
          status: "PENDING",
          created_at: mockDate,
          organization: 1
        },
        organizations: {
          id: 1,
          name: "Program Studi A"
        },
        items: null
      }];

      mock.module("@/db/db", () => ({
        db: {
          select: () => ({
            from: () => ({
              leftJoin: () => ({
                leftJoin: () => ({
                  where: () => Promise.resolve(mockProcurements)
                })
              })
            })
          })
        }
      }));

      const result = await getProcurementList(1);

      expect(result[0]).toEqual({
        id: 1,
        nama: "-",
        referensi: "REF001",
        organisasi: "Program Studi A",
        bidang: "Unknown",
        qty: 2,
        jumlah: 1000,
        tanggal: mockDate.toISOString(),
        status: "PENDING"
      });
    });

    test('should handle invalid price', async () => {
      const mockProcurements = [{
        procurements: {
          id: 1,
          estimated_price: "invalid",
          quantity: 2,
          reference: "REF001",
          status: "PENDING",
          created_at: mockDate,
          organization: 1
        },
        organizations: {
          id: 1,
          name: "Program Studi A"
        },
        items: null
      }];

      mock.module("@/db/db", () => ({
        db: {
          select: () => ({
            from: () => ({
              leftJoin: () => ({
                leftJoin: () => ({
                  where: () => Promise.resolve(mockProcurements)
                })
              })
            })
          })
        }
      }));

      const result = await getProcurementList(1);

      expect(result[0].jumlah).toBe(0);
    });
  });
});