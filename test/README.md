# Unit Testing Documentation

This project uses [Jest](https://jestjs.io/) for unit and integration testing. The tests are located in the `test/` directory and cover both the frontend components (React Native) and the backend API (Node.js/Express).

<!-- ## 1. Testing Stack

Our testing strategy relies on a few key libraries to ensure both backend and frontend code is reliable.

*   **Jest:** A JavaScript testing framework that provides the test runner, assertion library, and powerful mocking capabilities. It's essential for isolating components and mocking dependencies like database connections.
*   **Supertest:** An HTTP assertion library used to test the backend Express.js API endpoints without needing to start a live server. It allows us to make requests to our API and inspect the responses.
*   **React Native Testing Library:** A library for testing React Native components in a way that resembles how users interact with them. It's used for testing our frontend screens and components. -->

## 2. Prerequisites

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

<!-- ## 4. Test Suites Overview

*   `test/history.test.js`: Covers the backend API endpoints for logging inventory actions (`/api/action/log`) and retrieving history (`/api/history`).
*   `test/server.test.js`: Covers the main backend API endpoints, such as fetching inventory data (`/api/inventory`) and handling exports (`/api/export/*`).
*   `test/Scan.test.tsx`: Tests the frontend logic for the "Scan" screen, including mode toggling and barcode handling.
*   `test/Header.test.tsx`: Tests the main `Header` component, ensuring navigation works correctly. -->
mook is here