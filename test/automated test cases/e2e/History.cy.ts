describe("Happy Path Testcases", () => {
  beforeEach(() => {
    // Visit the base URL before each test
    cy.visit("/");
  });

  it("Testcase1", () => {
    // Click Inventory
    cy.contains("Inventory").click();
    // go to the links
    cy.url().should("include", "/inventory");
    // Find the item card for "Gauze Pads 4x4" and interact with it
    cy.contains("Gauze Pads 4x4").scrollIntoView().closest('div:has(input[placeholder="1"])').parent().within(() => {
      cy.get('input[placeholder="1"]').clear().type("5");
      // Now that we are inside the correct card, we can find and click the "Use" button.
      cy.contains("Use").click({ force: true }); 
    });

    cy.contains("History").click();
    // Verify that the history page shows the used item
    cy.url().should("include", "/history");
    cy.contains("Gauze Pads 4x4").should("exist");
    cy.contains("5").should("exist");
  });

  it("Testcase2", () => {
    // Click Inventory
    cy.contains("Inventory").click();
    cy.url().should("include", "/inventory");

    // Find the item card for "Morphine 10mg" and interact with it
    cy.contains("Morphine 10mg").scrollIntoView().closest('div:has(input[placeholder="1"])').parent().within(() => {
      cy.get('input[placeholder="1"]').clear().type("2");
      // Click the "Transfer" button
      cy.contains("Transfer").click({ force: true });
    });

    cy.contains("History").click();
    // Verify that the history page shows the transferred item
    cy.url().should("include", "/history");
    cy.contains("Morphine 10mg").should("exist");
    cy.contains("Transfer").should("exist");
    cy.contains("2").should("exist");
  });

  it("Testcase3", () => {
    // Click Inventory
    cy.contains("Inventory").click();
    cy.url().should("include", "/inventory");

    // Find "Blood Pressure Monitor" using the working pattern
    cy.contains("Blood Pressure Monitor")
      .scrollIntoView()
      .closest('div:has(input[placeholder="1"])')
      .parent()
      .within(() => {
        cy.contains("Remove All").click({ force: true });
      });
    cy.contains("History").click();
    // Verify that the history page shows the removed item
    cy.url().should("include", "/history");
    cy.contains("Blood Pressure Monitor").should("exist");
  });

});
describe("Unhappy Path Testcases", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Testcase1", () => {
    cy.contains("Inventory").click();
    
    cy.contains("Gauze Pads 4x4").scrollIntoView().closest('div:has(input[placeholder="1"])').parent().within(() => {
        // Input 55 (Available is 45)
        cy.get('input[placeholder="1"]').clear().type("55");
        // Verify the specific error message appears
        cy.contains("Not enough items. Available: 45").should("be.visible");
        cy.contains("Use").parent() .should("have.attr", "aria-disabled", "true");
      });
    cy.contains("History").click();
    // Verify that the history page shows the used item
    cy.url().should("include", "/history");
  });

  it("Testcase2", () => {
    cy.contains("Inventory").click();

    cy.contains("Morphine 10mg")
      .scrollIntoView()
      .closest('div:has(input[placeholder="1"])')
      .parent()
      .within(() => {
        // Try to type "abc"
        cy.get('input[placeholder="1"]').clear().type("abc");
        // Verify the input auto-corrected to ""
        cy.get('input[placeholder="1"]').should("have.value", "");
      });
    cy.contains("History").click();
    // Verify that the history page shows the used item
    cy.url().should("include", "/history");
  });

  it("Testcase3", () => {
    cy.contains("Inventory").click();

    cy.contains("Blood Pressure Monitor")
      .scrollIntoView()
      .closest('div:has(input[placeholder="1"])')
      .parent()
      .within(() => {
        // Clear the input
        cy.get('input[placeholder="1"]').clear();
        // Trigger validation by clicking away (blur)
        cy.get('input[placeholder="1"]').blur();
        // After clearing, the value should be an empty string.
        cy.get('input[placeholder="1"]').should("have.value", "");
      });
    cy.contains("History").click();
    // Verify that the history page shows the used item
    cy.url().should("include", "/history");
  });
});
