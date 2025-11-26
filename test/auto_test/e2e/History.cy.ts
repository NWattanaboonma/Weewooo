describe("App Navigation and Core Actions", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  // -------------------------
  // Test 1: Navigate to History
  // -------------------------
  // it("should navigate to the history page and display its content", () => {
  //   cy.contains("History").click();
  //   cy.url().should("include", "/history");
  //   cy.contains("History").should("be.visible");
  // });

  // // -------------------------
  // // Test case ID: 03
  // // View, filter, and sort history records
  // // -------------------------
  // it("should sort history records by date correctly", () => {
  //   cy.contains("History").click();

  //   cy.contains("Sort by:").click();

  //   cy.get('[data-testid="history-date"]').then($dates => {
  //     const dates = [...$dates].map(d => new Date(d.innerText.trim()).getTime());
  //     const expectedSort = [...dates].sort((a, b) => b - a);
  //     expect(dates).to.deep.equal(expectedSort);
  //   });
  // });
  
  // it("should sort history records by action correctly", () => {
  //   cy.contains("History").click();

  //   cy.contains("Action: ").click();
  //   cy.contains("Action:").click(); 
  //   cy.contains("Action:").click(); 
  //   cy.contains("Action:").click(); 
  //   cy.contains("Action:").click(); 

  //   cy.get('[data-testid="history-action"]').each($el => {
  //     expect($el.text().trim()).to.equal("Transfer");
  //   })
  
  // });

  // it("should sort history records by category correctly", () => {
  //   cy.contains("History").click();

  //   cy.contains("Category: ").click();
  //   cy.contains("Category:").click(); 
  //   cy.contains("Category:").click(); 
  //   cy.contains("Category:").click(); 

  //   cy.get('[data-testid="category"]').each($el => {
  //     expect($el.text().trim()).to.equal("Category: Supplies");
  //   })
  
  // });

  // -------------------------
  // Test case ID: 04
  // Check In and Check out action is recorded and displayed correctly
  // -------------------------
  it("should check in successfully", () => {

    cy.contains("History").click();

    cy.contains("Scan").click();

    cy.contains("MED001").click();
    // cy.contains("OK").click();

    cy.contains("History").click();

    cy.contains("MED001").closest('[data-testid="card"]').as("targetCard");

  // STEP 4 — ดึงเวลา record นี้
    cy.get("@targetCard")
      .find('[data-testid="date"]')
      .invoke("text")
      .then((text) => {
        const latestTime = new Date(text.trim()).getTime();
        // STEP 5 — เทียบกับทุกเวลาในหน้า
        cy.get('[data-testid="date"]').each(($el) => {
          const t = new Date($el.innerText.trim()).getTime();
          expect(latestTime).to.be.at.least(t); // ต้อง >= ทุก record
        });
      });
  
  });

});


