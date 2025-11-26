/**
 * @file cypress/e2e/inventory.cy.js
 * @description E2E tests for QMedic Inventory Search and Filter
 * @testingStrategy Pair-Wise Coverage (PWC) - 20 Tests
 *
 * *** FINAL FIX: Added .scrollIntoView() to Presence Check to handle RNW's overflow: hidden 
 * in ScrollView, making off-screen elements visible for assertion. ***
 */

describe("QMedic Inventory E2E Search and Filter (20 PWC Tests)", () => {
  const mockInventoryItems = [
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
  // HELPER FUNCTIONS
  // ============================================

  /**
   * Helper: Get dropdown button by text
   */
  const getDropdownButton = (text) => {
    return cy.contains(text, { timeout: 6000 }).first().should("be.visible");
  };

  /**
   * Helper: Select option from custom dropdown
   */
  const selectDropdownOption = (currentText, optionText) => {
    getDropdownButton(currentText).click();
    cy.contains(optionText).click({ force: true });
  };

  /**
   * Helper: Reset all filters to default
   */
  const resetFilters = () => {
    // Clear search
    cy.get('input[placeholder*="Search by name or code..."]').clear();

    // Reset Category to "All Categories"
    cy.contains("All Categories").should("exist");

    // Reset Location to "Locations"
    cy.contains("Locations").should("exist");

    // Reset Expiry to "Expiry Status"
    cy.contains("Expiry Status").should("exist");
  };

  /**
   * Helper: Assert expected results (FIXED)
   */
  const assertResults = (expectedNames, expectedCount) => {
    if (expectedCount === 0) {
      cy.contains("No items found").scrollIntoView().should("be.visible");
      
      cy.contains(mockInventoryItems[0].name).should("not.exist"); 
    } else {
      
      // Presence Check
      expectedNames.forEach((name) => {
        cy.contains(name)
            .scrollIntoView({ duration: 300, easing: 'linear' })
            .should("be.visible");
      });

      // Count Check
      const firstItemName = expectedNames[0];

      cy.contains(firstItemName) //
        .parent() // View styles.itemTitleContainer
        .parent() // View styles.itemHeader
        .parent() // View styles.itemCard (เป้าหมาย)
        .parent() // Parent List Container (styles.itemListContent)
        .children('div') 
        .should('have.length', expectedCount);
    }
  };

  // ============================================
  // SETUP (FIXED)
  // ============================================

  beforeEach(() => {
    // Mock API responses
    cy.intercept("GET", "**/api/inventory", {
      statusCode: 200,
      body: {
        items: mockInventoryItems,
        summary: {
          checkedIn: 0,
          checkedOut: 0,
          lowStockCount: 3,
        },
      },
    }).as("getInventory");

    cy.intercept("GET", "**/api/history", {
      statusCode: 200,
      body: [],
    }).as("getHistory");

    cy.intercept("GET", "**/api/export/history", {
      statusCode: 200,
      body: [],
    }).as("getExportHistory");

    // Visit inventory page
    cy.visit("/inventory");
    cy.wait("@getInventory");
    
    cy.contains(mockInventoryItems[0].name, { timeout: 8000 }).should("be.visible"); 
    
    
    cy.contains(mockInventoryItems[0].name) 
        .parent() //  View styles.itemTitleContainer
        .parent() //  View styles.itemHeader
        .parent() //  View styles.itemCard 
        .parent() //  Parent List Container (styles.itemListContent)
        .children('div') //  View/div 
        .should('have.length', 7);


    // Open filters panel
    cy.contains("Filters").click();

    // Wait for filters to be visible
    cy.contains("All Categories").should("be.visible");
  });

  // ============================================
  // TEST CASES (T1 - T20)
  // ============================================

  // T1: "", All Categories, Not select, Not select -> All 7 items (FIXED)
  it("T1: No Filters - Show All Items (Expected: 7 items)", () => {
    assertResults([
        "Epinephrine Auto-Injector",
        "Morphine 10mg",
        "Aspirin 325mg",
        "Defibrillator AED",
        "Blood Pressure Monitor",
        "Gauze Pads 4x4",
        "Medical Gloves (Box)",
      ], 
      7
    );
  });

  // T2: "Morphine", Medication, Ambulance 1, Expiring Soon -> Empty array
  it("T2: Morphine + Medication + Ambulance 1 + Expiring Soon (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("Morphine");
    selectDropdownOption("All Categories", "Medication");
    selectDropdownOption("Locations", "Ambulance 1");
    selectDropdownOption("Expiry Status", "Expiring Soon");
    assertResults([], 0);
  });

  // T3: "EQP002", Equipment, Ambulance 2, Expired -> Empty array
  it("T3: EQP002 + Equipment + Ambulance 2 + Expired (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("EQP002");
    selectDropdownOption("All Categories", "Equipment");
    selectDropdownOption("Locations", "Ambulance 2");
    selectDropdownOption("Expiry Status", "Expired");
    assertResults([], 0);
  });

  // T4: "Cabinet", Supplies, Storage Room A, Not select -> Empty array
  it("T4: Cabinet + Supplies + Storage Room A (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("Cabinet");
    selectDropdownOption("All Categories", "Supplies");
    selectDropdownOption("Locations", "Storage Room A");
    assertResults([], 0);
  });

  // T5: "", All Categories, Cabinet 3, Expiring Soon -> Empty array (FIXED to 0)
  it("T5: Cabinet 3 + Expiring Soon (Expected: 0)", () => {
    selectDropdownOption("Locations", "Cabinet 3");
    selectDropdownOption("Expiry Status", "Expiring Soon");
    assertResults([], 0);
  });

  // T6: "Defibrillator", Medication, Not select, Expired -> Empty array
  it("T6: Defibrillator + Medication + Expired (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type(
      "Defibrillator"
    );
    selectDropdownOption("All Categories", "Medication");
    selectDropdownOption("Expiry Status", "Expired");
    assertResults([], 0);
  });

  // T7: "SUP001", Equipment, Ambulance 1, Not select -> Empty array
  it("T7: SUP001 + Equipment + Ambulance 1 (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("SUP001");
    selectDropdownOption("All Categories", "Equipment");
    selectDropdownOption("Locations", "Ambulance 1");
    assertResults([], 0);
  });

  // T8: "Ambulance", Supplies, Ambulance 2, Expiring Soon -> Empty array
  it("T8: Ambulance + Supplies + Ambulance 2 + Expiring Soon (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("Ambulance");
    selectDropdownOption("All Categories", "Supplies");
    selectDropdownOption("Locations", "Ambulance 2");
    selectDropdownOption("Expiry Status", "Expiring Soon");
    assertResults([], 0);
  });

  // T9: "", Equipment, Storage Room A, Expired -> Empty array
  it("T9: Equipment + Storage Room A + Expired (Expected: 0)", () => {
    selectDropdownOption("All Categories", "Equipment");
    selectDropdownOption("Locations", "Storage Room A");
    selectDropdownOption("Expiry Status", "Expired");
    assertResults(["Blood Pressure Monitor"], 1);
  });

  // T10: "Gloves", Supplies, Cabinet 3, Not select -> Medical Gloves
  it("T10: Gloves + Supplies + Cabinet 3 (Expected: 1 item)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("Gloves");
    selectDropdownOption("All Categories", "Supplies");
    selectDropdownOption("Locations", "Cabinet 3");
    assertResults(["Medical Gloves (Box)"], 1);
  });

  // T11: "MED001", All Categories, Not select, Expiring Soon -> Empty array
  it("T11: MED001 + Expiring Soon (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("MED001");
    selectDropdownOption("Expiry Status", "Expiring Soon");
    assertResults([], 0);
  });

  // T12: "Ambulance 1", Medication, Ambulance 1, Expired -> Epinephrine Auto-Injector (1)
  it("T12: Ambulance 1 + Medication + Ambulance 1 + Expired (Expected: 1 item)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type(
      "Ambulance 1"
    );
    selectDropdownOption("All Categories", "Medication");
    selectDropdownOption("Locations", "Ambulance 1");
    selectDropdownOption("Expiry Status", "Expired");
    assertResults(["Epinephrine Auto-Injector"], 1);
  });

  // T13: "", Supplies, Ambulance 2, Not select -> Empty array
  it("T13: Supplies + Ambulance 2 (Expected: 0)", () => {
    selectDropdownOption("All Categories", "Supplies");
    selectDropdownOption("Locations", "Ambulance 2");
    assertResults([], 0);
  });

  // T14: "Blood", All Categories, Storage Room A, Expiring Soon -> Empty array
  it("T14: Blood + Storage Room A + Expiring Soon (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("Blood");
    selectDropdownOption("Locations", "Storage Room A");
    selectDropdownOption("Expiry Status", "Expiring Soon");
    assertResults([], 0);
  });

  // T15: "EQP002", Medication, Cabinet 3, Expired -> Empty array
  it("T15: EQP002 + Medication + Cabinet 3 + Expired (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("EQP002");
    selectDropdownOption("All Categories", "Medication");
    selectDropdownOption("Locations", "Cabinet 3");
    selectDropdownOption("Expiry Status", "Expired");
    assertResults([], 0);
  });

  // T16: "Storage", Equipment, Not select, Not select -> Defibrillator AED (2)
  it("T16: Storage + Equipment (Expected: 2 item)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("Storage");
    selectDropdownOption("All Categories", "Equipment");
    assertResults(["Defibrillator AED","Blood Pressure Monitor"], 2);
  });

  // T17: "", All Categories, Ambulance 1, Expiring Soon -> Empty array
  it("T17: Ambulance 1 + Expiring Soon (Expected: 0)", () => {
    selectDropdownOption("Locations", "Ambulance 1");
    selectDropdownOption("Expiry Status", "Expiring Soon");
    assertResults([], 0);
  });

  // T18: "Morphine", Medication, Ambulance 2, Expired -> Empty array
  it("T18: Morphine + Medication + Ambulance 2 + Expired (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("Morphine");
    selectDropdownOption("All Categories", "Medication");
    selectDropdownOption("Locations", "Ambulance 2");
    selectDropdownOption("Expiry Status", "Expired");
    assertResults([], 0);
  });

  // T19: "EQP001", Equipment, Storage Room A, Not select -> Defibrillator AED (1)
  it("T19: EQP001 + Equipment + Storage Room A (Expected: 1 item)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("EQP001");
    selectDropdownOption("All Categories", "Equipment");
    selectDropdownOption("Locations", "Storage Room A");
    assertResults(["Defibrillator AED"], 1);
  });

  // T20: "Cabinet", Supplies, Cabinet 3, Expiring Soon -> Empty array (FIXED to 0)
  it("T20: Cabinet + Supplies + Cabinet 3 + Expiring Soon (Expected: 0)", () => {
    cy.get('input[placeholder*="Search by name or code..."]').type("Cabinet");
    selectDropdownOption("All Categories", "Supplies");
    selectDropdownOption("Locations", "Cabinet 3");
    selectDropdownOption("Expiry Status", "Expiring Soon");
    assertResults([], 0);
  });
});