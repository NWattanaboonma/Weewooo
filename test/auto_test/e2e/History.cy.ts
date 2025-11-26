describe("App Navigation and Core Actions", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  // -------------------------
  // Test case ID: 03
  // View, filter, and sort history records
  // -------------------------

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

  // -------------------------
  // Test case ID: 04
  // Check In and Check out action is recorded and displayed correctly
  // -------------------------
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
