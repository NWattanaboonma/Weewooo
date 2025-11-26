/**
 * @file cypress/e2e/testScanPage.cy.ts
 * @description System Test Case 05: Check in and Check out (REAL DATABASE)
 */

describe('Test Case 05: Check in and Check out item with manual entry (Real DB)', () => {

  beforeEach(() => {
    // 1. Spy on Inventory API (Do NOT stub/mock)
    // This allows the request to go to the real server, but lets us wait for it.
    cy.intercept('GET', '**/api/inventory').as('getInventory');

    // 2. Spy on Log API
    cy.intercept('POST', '**/api/action/log').as('logAction');

    // 3. Visit the Page
    // Ensure your backend server is running before this step!
    cy.visit('http://localhost:8082/scan');
    
    // Wait for the real data to load from the server
    cy.wait('@getInventory');
  });

  // ==========================================
  // Test 1: Check-in & Valid Code
  // ==========================================
  it('Test 1: Check in & Valid Code (MED001) - should log success', () => {
    const alertStub = cy.stub().as('alertStub');
    cy.on('window:alert', alertStub);
    cy.wait(500);

    const validCode = 'MED001';

    cy.get('input[placeholder="Enter barcode or scan..."]')
      .scrollIntoView()
      .should('exist')
      .click({ force: true })
      .clear()
      .type(validCode, { force: true, delay: 100 });

    cy.contains('Submit Scan')
      .scrollIntoView()
      .should('exist')
      .click({ force: true });

    cy.get('@alertStub').should(
      'have.been.calledWith',
      `Logged action for item: ${validCode} (Check In, Quantity 1)`
    );
  });

  // ==========================================
  // Test 2: Check-in & Invalid Code
  // ==========================================
  it('Test 2: Check in & Invalid Code (XYZ) - should show invalid error', () => {
    const alertStub = cy.stub().as('alertStub');
    cy.on('window:alert', alertStub);
    cy.wait(500);

    const invalidCode = 'XYZ';

    cy.get('input[placeholder="Enter barcode or scan..."]')
      .scrollIntoView()
      .click({ force: true })
      .clear()
      .type(invalidCode, { force: true, delay: 100 });

    cy.contains('Submit Scan')
      .scrollIntoView()
      .click({ force: true });

    cy.get('@alertStub').should(
      'have.been.calledWith',
      `Invalid QR code: "${invalidCode}". Please scan or enter a valid code.`
    );
  });

  // ==========================================
  // Test 3: Check-out & Valid Code
  // ==========================================
  it('Test 3: Check out & Valid Code (MED001) - should log success', () => {
    // PRE-CONDITION: Ensure MED001 has quantity > 0 in your Real DB
    const alertStub = cy.stub().as('alertStub');
    cy.on('window:alert', alertStub);
    cy.wait(500);

    cy.contains('Check Out').scrollIntoView().click({ force: true });

    const validCode = 'MED001';

    cy.get('input[placeholder="Enter barcode or scan..."]')
      .scrollIntoView()
      .click({ force: true })
      .clear()
      .type(validCode, { force: true, delay: 100 });

    cy.contains('Submit Scan').scrollIntoView().click({ force: true });

    cy.get('@alertStub').should(
      'have.been.calledWith',
      `Logged action for item: ${validCode} (Check Out, Quantity 1)`
    );
  });

  // ==========================================
  // Test 4: Check-out & Invalid Code
  // ==========================================
  it('Test 4: Check out & Invalid Code (XYZ) - should show invalid error', () => {
    const alertStub = cy.stub().as('alertStub');
    cy.on('window:alert', alertStub);
    cy.wait(500);

    cy.contains('Check Out').scrollIntoView().click({ force: true });

    const invalidCode = 'XYZ';

    cy.get('input[placeholder="Enter barcode or scan..."]')
      .scrollIntoView()
      .click({ force: true })
      .clear()
      .type(invalidCode, { force: true, delay: 100 });

    cy.contains('Submit Scan').scrollIntoView().click({ force: true });

    cy.get('@alertStub').should(
      'have.been.calledWith',
      `Invalid QR code: "${invalidCode}". Please scan or enter a valid code.`
    );
  });

  // ==========================================
  // Test 5: Check-out & Out of Stock
  // ==========================================
  it('Test 5: Check out & Out of Stock (SUP002) - should show stock error', () => {
    // PRE-CONDITION: Ensure SUP002 has quantity 0 in your Real DB
    const alertStub = cy.stub().as('alertStub');
    cy.on('window:alert', alertStub);
    cy.wait(500);

    cy.contains('Check Out').scrollIntoView().click({ force: true });

    const outOfStockCode = 'SUP002';
    // Matches the error message format from your previous logs
    const expectedErrorMessage = `Action failed: Item 'Medical Gloves (Box)' is out of stock.`;

    cy.get('input[placeholder="Enter barcode or scan..."]')
      .scrollIntoView()
      .click({ force: true })
      .clear()
      .type(outOfStockCode, { force: true, delay: 100 });

    cy.contains('Submit Scan').scrollIntoView().click({ force: true });

    cy.get('@alertStub').should(
      'have.been.calledWith',
      expectedErrorMessage
    );
  });

});