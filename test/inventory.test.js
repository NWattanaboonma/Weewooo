/**
 * @file test/inventory.spec.js
 * @description Unit tests for Search and Filter functionality (Logic Only)
 * @author 
 * @date 2024-11-25
 * @testingStrategy Pair-Wise Coverage (PWC) - 20 Tests
 */

// ============================================
// REAL DATABASE DATA
// ============================================
const realDatabaseItems = [
  // MED001: Ambulance 1, Expires 2025-09-29 (Expired)
  {
    dbId: 1,
    id: "MED001",
    name: "Epinephrine Auto-Injector",
    category: "Medication",
    quantity: 5,
    lastScanned: "10/21/2025",
    status: "In Stock",
    expiryDate: "2025-09-29",
    location: "Ambulance 1",
  },
  // MED002: Ambulance 1, Expires 2027-01-07
  {
    dbId: 2,
    id: "MED002",
    name: "Morphine 10mg",
    category: "Medication",
    quantity: 10,
    lastScanned: "10/21/2025",
    status: "In Stock",
    expiryDate: "2027-01-07",
    location: "Ambulance 1",
  },
  // MED003: Ambulance 2, Expires 2025-11-11 (Not Expiring Soon by logic)
  {
    dbId: 3,
    id: "MED003",
    name: "Aspirin 325mg",
    category: "Medication",
    quantity: 20,
    lastScanned: "10/21/2025",
    status: "In Stock",
    expiryDate: "2025-11-11",
    location: "Ambulance 2",
  },
  // EQP001: Storage Room A, Expires 2026-02-03 (ต้องเปลี่ยน Location)
  {
    dbId: 4,
    id: "EQP001",
    name: "Defibrillator AED",
    category: "Equipment",
    quantity: 2,
    lastScanned: "10/21/2025",
    status: "Low Stock",
    expiryDate: "2026-02-03",
    location: "Storage Room A", 
  },
  // EQP002: Cabinet 3, Expires 2023-04-20 (Expired) (ต้องเปลี่ยน Location)
  {
    dbId: 5,
    id: "EQP002",
    name: "Blood Pressure Monitor",
    category: "Equipment",
    quantity: 3,
    lastScanned: "10/20/2025",
    status: "Low Stock",
    expiryDate: "2023-04-20",
    location: "Storage Room A", 
  },
  // SUP001: Cabinet 3, Expires 2026-10-21
  {
    dbId: 6,
    id: "SUP001",
    name: "Gauze Pads 4x4",
    category: "Supplies",
    quantity: 50,
    lastScanned: "10/21/2025",
    status: "In Stock",
    expiryDate: "2026-10-21",
    location: "Cabinet 3",
  },
  // SUP002: Cabinet 3, Expires 2025-11-20 (Not Expiring Soon by logic)
  {
    dbId: 7,
    id: "SUP002",
    name: "Medical Gloves (Box)",
    category: "Supplies",
    quantity: 1,
    lastScanned: "10/19/2025",
    status: "Low Stock",
    expiryDate: "2025-11-20",
    location: "Cabinet 3",
  },
];

// ============================================
// IMPORT FILTER FUNCTION
// ============================================
const { filterInventoryItems } = require('@/app/utils/inventoryFilters');

// ============================================
// UNIT TESTS - 20 PWC TEST CASES
// Test Requirements: PWC = 5 × 4 = 20 tests
// ============================================
describe('Search and Filter - Pair-Wise Coverage (20 Tests)', () => {

  // T1: "", All Categories, Not select, Not select -> All 7 items
  test('T1: No Filters - Show All Items', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "", "All Categories", "Locations", "Expiry Status"
    );
    expect(result).toHaveLength(7);
  });

  // T2: "Morphine", Medication, Ambulance 1, Expiring Soon -> Empty array
  test('T2: Search Morphine with conflicting Expiry', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "Morphine", "Medication", "Ambulance 1", "Expiring Soon"
    );
    expect(result).toHaveLength(0);
  });

  // T3: "EQP002", Equipment, Ambulance 2, Expired -> Empty array (Location conflict)
  test('T3: Search Expired ID with conflicting Location', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "EQP002", "Equipment", "Ambulance 2", "Expired"
    );
    expect(result).toHaveLength(0);
  });

  // T4: "Cabinet", Supplies, Storage Room A, Not select -> Empty array (Location conflict)
  test('T4: Search Location Keyword with conflicting Location filter', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "Cabinet", "Supplies", "Storage Room A", "Expiry Status"
    );
    expect(result).toHaveLength(0);
  });

  // T5: "", All Categories, Cabinet 3, Expiring Soon -> Empty array
  test('T5: Filter Cabinet 3 with Expiring Soon', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "", "All Categories", "Cabinet 3", "Expiring Soon"
    );
    expect(result).toHaveLength(0);
  });

  // T6: "Defibrillator", Medication, Not select, Expired -> Empty array (Category conflict)
  test('T6: Search Defibrillator as Medication with Expired', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "Defibrillator", "Medication", "Locations", "Expired"
    );
    expect(result).toHaveLength(0);
  });

  // T7: "SUP001", Equipment, Ambulance 1, Not select -> Empty array (Category conflict)
  test('T7: Search Supply ID as Equipment in Ambulance 1', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "SUP001", "Equipment", "Ambulance 1", "Expiry Status"
    );
    expect(result).toHaveLength(0);
  });

  // T8: "Ambulance", Supplies, Ambulance 2, Expiring Soon -> Empty array
  test('T8: Search Location Keyword as Supplies with Expiring Soon', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "Ambulance", "Supplies", "Ambulance 2", "Expiring Soon"
    );
    expect(result).toHaveLength(0);
  });

  // T9: "", Equipment, Storage Room A, Expired -> Empty array
  test('T9: Filter Equipment in Storage Room A - Expired', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "", "Equipment", "Storage Room A", "Expired"
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Blood Pressure Monitor');
  });

  // T10: "Gloves", Supplies, Cabinet 3, Not select -> Medical Gloves
  test('T10: Search Gloves in Cabinet 3', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "Gloves", "Supplies", "Cabinet 3", "Expiry Status"
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Medical Gloves (Box)');
  });

  // T11: "MED001", All Categories, Not select, Expiring Soon -> Empty array
  test('T11: Search MED001 with Expiring Soon filter', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "MED001", "All Categories", "Locations", "Expiring Soon"
    );
    expect(result).toHaveLength(0);
  });

  // T12: "Ambulance 1", Medication, Ambulance 1, Expired -> Empty array
  test('T12: Search and Filter Ambulance 1 with Expired', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "Ambulance 1", "Medication", "Ambulance 1", "Expired"
    );
    expect(result).toHaveLength(0);
  });

  // T13: "", Supplies, Ambulance 2, Not select -> Empty array
  test('T13: Filter Supplies in Ambulance 2', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "", "Supplies", "Ambulance 2", "Expiry Status"
    );
    expect(result).toHaveLength(0);
  });

  // T14: "Blood", All Categories, Storage Room A, Expiring Soon -> Empty array
  test('T14: Search Blood in Storage Room A with Expiring Soon', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "Blood", "All Categories", "Storage Room A", "Expiring Soon"
    );
    expect(result).toHaveLength(0);
  });

  // T15: "EQP002", Medication, Cabinet 3, Expired -> Empty array (Category conflict)
  test('T15: Search Equipment ID as Medication in Cabinet 3 with Expired', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "EQP002", "Medication", "Cabinet 3", "Expired"
    );
    expect(result).toHaveLength(0);
  });

  // T16: "Storage", Equipment, Not select, Not select -> Defibrillator AED
  test('T16: Search Equipment by Location Keyword', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "Storage", "Equipment", "Locations", "Expiry Status"
    );
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Defibrillator AED','Blood Pressure Monitor');
  });

  // T17: "", All Categories, Ambulance 1, Expiring Soon -> Empty array
  test('T17: Filter Ambulance 1 with Expiring Soon', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "", "All Categories", "Ambulance 1", "Expiring Soon"
    );
    expect(result).toHaveLength(0);
  });

  // T18: "Morphine", Medication, Ambulance 2, Expired -> Empty array (Location conflict)
  test('T18: Search Morphine in wrong Location with Expired', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "Morphine", "Medication", "Ambulance 2", "Expired"
    );
    expect(result).toHaveLength(0);
  });

  // T19: "EQP001", Equipment, Storage Room A, Not select -> Defibrillator AED
  test('T19: Search Equipment by ID and Location', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "EQP001", "Equipment", "Storage Room A", "Expiry Status"
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Defibrillator AED');
  });

  // T20: "Cabinet", Supplies, Cabinet 3, Expiring Soon -> Gauze Pads, Medical Gloves
  test('T20: Search Cabinet keyword in Cabinet 3 with Expiring Soon', () => {
    const result = filterInventoryItems(
      realDatabaseItems, "Cabinet", "Supplies", "Cabinet 3", "Expiring Soon"
    );
    expect(result).toHaveLength(0);
  });
});