# Weewooo

Weewooo is a full-stack application designed for simple inventory management. It features a mobile-friendly frontend built with React Native and a robust backend API powered by Node.js and Express.

Key features include:
*   Scanning items to update inventory.
*   Logging all inventory actions for a complete history.
*   Exporting inventory data.

This README provides details on how to run the unit and end-to-end tests for the project.

---

## Testing Documentation

This document outlines the testing strategy for the Weewooo application, which includes automated unit, integration, and end-to-end (E2E) tests, as well as guidelines for manual testing.

### Test Directory Structure

All test-related files are organized within the `test/` directory at the project root.

```
test/
├── automated test cases/ # Cypress E2E test files 
│   ├── e2e/
│   │   ├── History.cy.ts     # Tests for the History page 
│   │   ├── Scan.cy.ts        # Tests for the Scan/Barcode page 
│   │   ├── inventory.cy.ts   # Tests for Search and Filtering Inventory 
│   │   └── spec.cy.ts        # Example Cypress 
├── manual test cases/    # Checklists for manual testing 
│   └── manual_tests.md
├── Header.test.tsx       # Jest unit tests for React Native components 
├── Scan.test.tsx         # Jest unit tests for React Native components 
├── history.test.js       # Jest integration tests for the Node.js API 
└── server.test.js        # Jest integration tests for the Node.js API
```

## 1. Automated Testing

Automated tests are critical for ensuring code quality and preventing regressions. We use Jest for unit/integration tests and Cypress for end-to-end tests.

### 1.1. Testing Stack

Our testing strategy relies on a few key libraries to ensure both backend and frontend code is reliable.

*   **Jest:** A JavaScript testing framework that provides the test runner, assertion library, and powerful mocking capabilities. It's essential for isolating components and mocking dependencies like database connections.
*   **Supertest:** An HTTP assertion library used to test the backend Express.js API endpoints without needing to start a live server. It allows us to make requests to our API and inspect the responses.
*   **React Native Testing Library:** A library for testing React Native components in a way that resembles how users interact with them. It's used for testing our frontend screens and components.
*   **Cypress:** A next-generation front-end testing tool built for the modern web. We use it for E2E tests to simulate real user flows in a browser.

### 1.2. Prerequisites

Before running tests, ensure you have installed all the project dependencies, including the development dependencies needed for testing:

```bash
npm install
```

## 3. Running Tests

You can run the entire suite or target specific files.

### Running All Test Suites

To run the complete test suite, use the `test` script defined in `package.json`:

```bash
npm test
```

### Generating a Test Coverage Report

To run all tests and generate a report showing how much of your code is covered by those tests, use the `test:coverage` script:

```bash
npm run test:coverage
```

This command will print a coverage summary in your console and create a detailed HTML report in a new `coverage/` directory at the project root.

### Running a Specific Test File

When working on a specific feature, you can run only the tests for that file. Use `npx` to run the locally installed Jest package and provide the path to the test file.

```bash
# Example: Run only the backend history API tests
npx jest test/history.test.js

# Example: Run only the frontend Scan screen tests
npx jest test/Scan.test.tsx

```

## End-to-End (E2E) Testing

This project uses Cypress for E2E testing to simulate real user interactions in a browser environment. This ensures that the application's critical user flows work from start to finish.

The E2E test scripts automatically start the web server and then launch Cypress, so no manual server setup is needed.

### Running E2E Tests Interactively

To open the Cypress Test Runner and run tests in an interactive window, use the following command. This is useful for development and debugging.

```bash
npm run test:e2e
```

### Running E2E Tests Headlessly

To run all E2E tests headlessly in your terminal (as you would in a CI/CD environment), use this command:

```bash
npm run test:e2e:run
```

### Test File Location

Cypress test files (specs) are located in the `test/automated test cases/` directory and end with `.cy.ts`. Any videos or screenshots captured during test runs will also be saved in this directory.

```

<!-- ## 4. Test Suites Overview

*   `test/history.test.js`: Covers the backend API endpoints for logging inventory actions (`/api/action/log`) and retrieving history (`/api/history`).
*   `test/server.test.js`: Covers the main backend API endpoints, such as fetching inventory data (`/api/inventory`) and handling exports (`/api/export/*`).
*   `test/Scan.test.tsx`: Tests the frontend logic for the "Scan" screen, including mode toggling and barcode handling.
*   `test/Header.test.tsx`: Tests the main `Header` component, ensuring navigation works correctly. -->
mook is here
