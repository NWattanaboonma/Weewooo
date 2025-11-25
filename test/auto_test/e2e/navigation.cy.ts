describe("App Navigation and Core Actions", () => {
  beforeEach(() => {
    // Visit the base URL before each test
    cy.visit("/");
  });

  it("should load the home screen and display key stats", () => {
    // Check for the current user text
    cy.contains("Current User:").should("be.visible");

    // Check for the stats cards
    cy.contains("Items Checked In").should("be.visible");
    cy.contains("Items Checked Out").should("be.visible");
  });

  it('should have a "Start Scanning" button that navigates to the scan page', () => {
    // Find the button and click it
    cy.contains("Start Scanning").click();

    // Assert that the URL changed to the scan tab and check for an element on that page
    cy.url().should("include", "/scan");
    cy.contains("Manual Entry").should("be.visible");
  });
});