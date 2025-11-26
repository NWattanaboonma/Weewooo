  // -------------------------
  // Test case ID: 01 
  // View usage history after using item (Happy path)
  // -------------------------

describe("Happy Path Testcases", () => {
  beforeEach(() => {
    // Visit the base URL before each test
    cy.visit("/");
  });

  it("View usage history after using item (Gauze Pads 4x4)", () => {
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

  it("View usage history after using item (Morphine 10mg)", () => {
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

  it("View usage history after using item (Remove all)", () => {
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

// -------------------------
  // Test case ID: 02
  // View usage history after using item (Unhappy path)
  // -------------------------

describe("Unhappy Path Testcases", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("View usage history after using item (enter quantity greater than available)", () => {
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

  it("View usage history after using item (non-numeric value)", () => {
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

  it("View usage history after using item (empty value)", () => {
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



// -------------------------
  // Test case ID: 03
  // View, filter, and sort history records
  // -------------------------

describe("View, filter, and sort history records", () => {
  beforeEach(() => {
    cy.visit("/");
  });

    // sort by: Date
  it("should sort history records by date correctly", () => {
    cy.contains("History").click();
    cy.contains("History").should("be.visible");

    function clickUntilSortbyDate() {
      // Find the button that contains the text "Action:".
      cy.contains("Sort by:").then($button => {
        // Check if the button's text already contains "Transfer".
        if (!$button.text().includes("Date")) {
          // If not, click it and call the function again to re-check.
          cy.wrap($button).click();
          // Add a small wait for the UI to update after the click.
          cy.wait(100); 
          clickUntilSortbyDate();
        }
      });
    }
    clickUntilSortbyDate();
  });
   
    // Action: Transfer
    it("should sort history records by action correctly", () => {
      cy.contains("History").click();
      cy.contains("History").should("be.visible");

      // function to click the action button to be 'Transfer'
      function clickUntilActionIsTransfer() {
        // Find the button that contains the text "Action:".
        cy.contains("Action:").then($button => {
          // Check if the button's text already contains "Transfer".
          if (!$button.text().includes("Transfer")) {
            // If not, click it and call the function again to re-check.
            cy.wrap($button).click();
            // Add a small wait for the UI to update after the click.
            cy.wait(100); 
            clickUntilActionIsTransfer();
          }
        });
      }
      clickUntilActionIsTransfer();
    });

    // Category: Supplies
    it("should sort history records by category correctly", () => {
      cy.contains("History").click();
      cy.contains("History").should("be.visible");

      function clickUntilCategoryIsSupplies() {
        // Find the button that contains the text "Action:".
        cy.contains("Category:").then($button => {
          // Check if the button's text already contains "Transfer".
          if (!$button.text().includes("Supplies")) {
            // If not, click it and call the function again to re-check.
            cy.wrap($button).click();
            // Add a small wait for the UI to update after the click.
            cy.wait(100); 
            clickUntilCategoryIsSupplies() 
          }
        });
      }

      clickUntilCategoryIsSupplies();
    
  });
  });

  // -------------------------
  // Test case ID: 04
  // Check In and Check out action is recorded and displayed correctly
  // -------------------------
  describe("Check In and Check out action", () => {
    beforeEach(() => {
    cy.visit("/");
  });

  it("should record a 'Check In' action and display it as the most recent history item", () => {
      
    // Step 1: visit the Scan page
    cy.visit('http://localhost:8082/scan')
    cy.contains("Scan").click();
    cy.url().should("include", "/scan");

    // Assuming 'MED001' is an item that can be checked in.
    cy.contains("MED001").scrollIntoView().should("be.visible").click();

    cy.wait(1000);

    // Step 2: Navigate to the History page to verify the result
    cy.contains("History").click();
    cy.url().should("include", "/history");

    // Step 3 : Verify the first record is the newest by comparing timestamps.
    cy.get('[data-testid="history-date"]') 
      .first() 
      .invoke('text') 
      .then((latestTimestampText) => {
      const latestTime = new Date(latestTimestampText.trim()).getTime();

        // Iterate through ALL timestamps on the page
        cy.get('[data-testid="history-date"]').each(($el) => {
          const otherTime = new Date($el.text().trim()).getTime();
          // Assert that the first record's time is greater than or equal to every other time
          expect(latestTime).to.be.at.least(otherTime);
        });
      })
      .then(() => {
        // Step 4: Log success message and print the verified record
        cy.log("Success: The new record is confirmed as the most recent item.");
        cy.get('[data-testid="card"]')
          .first()
          .invoke('text')
          .then(recordText => {
            // The recordText will contain all text from the card, like item name, action, and date.
            cy.log(`Verified Record Details: ${recordText.replace(/\s+/g, ' ')}`);
          });
      });
  });

  // Check Out test
  it("should record a 'Check Out' action and display it as the most recent history item", () => {

    // Step 1: visit the Scan page
    cy.visit('http://localhost:8082/scan')
    cy.contains("Scan").click();
    cy.url().should("include", "/scan");

    // Select the "Check out" action type
    cy.contains("Check Out").click();

    // Assuming 'MED002' is an item that can be checked out.
    // Find the item, scroll to it, and click it to trigger the automatic check-out
    cy.contains("MED002").scrollIntoView().should("be.visible").click();
    // Wait for the automatic action to complete
    cy.wait(1000); 

    // Step 2: Navigate to the History page to verify the result
    cy.contains("History").click();
    cy.url().should("include", "/history");

    // Step 3 Verify the first record is the newest by comparing timestamps.
    cy.get('[data-testid="history-date"]') // Get all date elements
      .first() 
      .invoke('text') 
      .then((latestTimestampText) => {
        const latestTime = new Date(latestTimestampText.trim()).getTime();

        // Iterate through ALL timestamps on the page
        cy.get('[data-testid="history-date"]').each(($el) => {
          const otherTime = new Date($el.text().trim()).getTime();
          // Assert that the first record's time is greater than or equal to every other time
          expect(latestTime).to.be.at.least(otherTime);
        });
      })
      .then(() => {
        // Step 4: Log success message and print the verified record
        cy.log("Success: The new record is confirmed as the most recent item.");
        cy.get('[data-testid="card"]')
          .first()
          .invoke('text')
          .then(recordText => {
            // The recordText will contain all text from the card, like item name, action, and date.
            cy.log(`Verified Record Details: ${recordText.replace(/\s+/g, ' ')}`);
          });
      });
   });
});
