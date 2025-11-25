describe("App Navigation and Core Actions", () => {
  beforeEach(() => {
    // Visit the base URL before each test
    cy.visit("/");
  });

  it("should navigate to the history page and display its content", () => {
    cy.contains("History").click();
    cy.url().should("include", "/history");
    cy.contains("History").should("be.visible");
  });
});