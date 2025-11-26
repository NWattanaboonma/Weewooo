# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   npx install -g expo-cli
   ```

2. Start the app

   ```bash
   npx expo start --tunnel
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Update New Setup

This is a two-part application for managing medical inventory: a Node.js Express API backend with a MySQL database, and a React Native (Expo) frontend for mobile/web scanning and tracking.

## ⚙️ Prerequisites

You must have the following installed on your machine:

1. **Node.js (LTS)**: For running both the API and the frontend.

2. **MySQL Server**: To host the application database (`QMedicDB`).

3. **Expo CLI**: Required to run the React Native application.

   ```bash
   npm install -g expo-cli
   ```


## 1. 🗄️ Database Setup (MySQL)

You must ensure your MySQL database is set up with the correct credentials and schema.

### A. Database Connection Details

The API server (server.js) connects using these credentials:

| Setting | Value |
|---------|-------------|
| **Host** | 192.168.1.47 (Change this if MySQL is on a different machine) |
| **User** | usrParamedic |
| **Password** | paramedic1234 |
| **Database** | QMedicDB |

Action Required: Ensure your MySQL server is running and accessible using these details.

### B. Essential Schema 


## 2. 🚀 Backend API Server Setup

### A. Install Dependencies

In your project root (where server.js is located):

```bash
npm install express mysql2 cors
```

### B. Run the Server

Keep this terminal window open while running the frontend:

```bash
node server.js
```

The console should show: 🚀 Server running on port 3000

## 3. 📱 Frontend Application Setup (React Native/Expo)

### A. Install Dependencies

In your project root:

```bash
npm install
# OR: yarn install
```

### B. Critical Configuration in InventoryContext.tsx and NotificationContext.tsx

The app must know the address of the API server.

Action Required: In the file contexts/InventoryContext.tsx, update the API_BASE_URL with the correct local network IP address of the computer running your server.

```bash
// contexts/InventoryContext.tsx
// 1. API Configuration: *** UPDATE THIS WITH YOUR ACTUAL SERVER IP ***
const API_BASE_URL = 'http://<YOUR_COMPUTER_IP_ADDRESS>:3000/api'; 
```

### C. Run the Frontend (using LAN)

To avoid Mixed Content errors, do not use the tunnel unless necessary.

Ensure your API server is running (node server.js).

Start the Expo client for local network access:

```bash
expo start
# OR: npx expo start
```


Ensure the Expo CLI terminal displays Connection: LAN.

Scan the QR code with the Expo Go app on your physical device, or use an emulator/web option.

Your application should now load data from the API and allow you to perform inventory actions.

## 🧪 Running Unit Tests

This project uses [Jest](https://jestjs.io/) for unit and integration testing. The tests are located in the `test/` directory and cover both the frontend components (React Native) and the backend API (Node.js/Express).

### Prerequisites

Before running tests, ensure you have installed all the project dependencies, including the development dependencies needed for testing:

```bash
npm install
```

### Running All Test Suites

To run the complete test suite (including tests for the API server and React Native components), use the `test` script defined in your `package.json`:

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

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

---
# Weewooo - Q Medic

Q-Medic is a mobile application designed to help paramedics efficiently manage medical inventory in real time. The system allows emergency staff to track item availability, monitor stock usage, check expiration dates, and update supplies across multiple ambulances or medical kits.

## Key Features

* Scanning items to update inventory
* Logging all inventory actions for complete history tracking
* Data Export & Integration
* Notification for tracking expiry stock
* Real time inventory for different device

## Team member
1. 6588022 Sakhunich Iamcharas - Bam 
2. 6588175 - Pakjira Kharpholdee - Bew
3. 6588116-Nuttipong Wattanaboonma - Eak
4. 6588169 Chananphimon Chunchaowarit - Pin
5. 6588170-Peteingthanin Hajumpee- Aoey
6. 6588174-Thitiwan Keattitat - Mook

---

## Running the Project

### 1. Start the Backend Server

```
cd server
node server.js
```

### 2. Start the Frontend (Expo)

```
npx expo start --clear
```

Example output:

```
› Metro waiting on exp://10.62.87.212:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
› Web is waiting on http://localhost:8081
```

---

# Testing Overview

This project includes the following testing components:

1. Unit Testing
2. System Testing (Manual Test Suites)
3. Automated UI Testing (Cypress)

This document currently covers Unit Testing. System and UI automation continue in later sections.

### Test Directory Structure

All test-related files are organized within the `test/` directory at the project root.

```
test/
├── automated test cases/  # Cypress E2E test files 
│   ├── e2e/
│   │   ├── inventory.cy.ts   # Test Suite 1: Inventory Search and Filtering
│   │   ├── Scan.cy.ts        # Test Suite 2: Scan and Barcode Processing
│   │   └── History.cy.ts     # Test Suite 3: History Log Interaction
├── manual test cases/    # Checklists for manual testing 
│   └── System test Search and Filtering.pdf
│   └── System test Scan.pdf
│   └── System test History page.pdf
│   └── Requirement Traceability Matrix.pdf
├── inventory.test.js       # Jest unit tests 
├── Scan.test.tsx         # Jest unit tests 
├── history.test.js       # Jest unit tests

```
---

# 1. Unit Testing

Unit testing ensures correctness of the application's core logic.
Three unit test suites were created according to project requirements.


## Running Unit Tests

```
npm test
```

## Running Specific Test Files

```
npx jest test/history.test.js
npx jest test/Scan.test.tsx
npx jest test/inventory.test.tsx
```

---

### Unit Test Techniques Design

---
### Test Suite 1 — filteredItems()

### 1.1 Identify testable functions

* filteredItems()

### 1.2 Identify parameters, return types, return values, and exceptional behavior

* Parameters: items, selectedCategory, searchQuery, selectedLocation, selectedExpiringSoon
* Return Type: Array List (InventoryItem[])
* Return Value: Filtered list of inventory items matching all applied criteria
* Exceptional Behavior: Empty search returns all items

### 1.3 Model the input domain

| Characteristic            | b1             | b2              | b3            | b4             | b5        |
| ------------------------- | -------------- | --------------- | ------------- | -------------- | --------- |
| C1 searchQuery            | Empty ("")     | Valid Item Name | Valid Item ID | Valid Location | -         |
| C2 selectedCategory       | All Categories | Medication      | Equipment     | Supplies       | -         |
| C3 selectedLocation       | Not select     | Ambulance 1     | Ambulance 2   | Storage Room A | Cabinet 3 |
| C4 selectedExpiringStatus | Not select     | Expiring Soon   | Expired       | -              | -         |

### 1.4 Combine partitions to define test requirements

* Assumption: PWC rule combines one value from each block so every pair of values across characteristics appears at least once
* Test Requirements: PWC = 5 × 4 = 20

### 1.5 Base Pair-Wise Test Requirements

| TestID | C1 (SearchQuery) | C2 (Category)  | C3 (Location)  | C4 (Expiry)   |
| ------ | ---------------- | -------------- | -------------- | ------------- |
| T1     | Empty            | All Categories | Not select     | Not select    |
| T2     | Valid Name       | Medication     | Ambulance 1    | Expiring Soon |
| T3     | Valid ID         | Equipment      | Ambulance 2    | Expired       |
| T4     | Valid Location   | Supplies       | Storage Room A | Not select    |
| T5     | Empty            | All Categories | Cabinet 3      | Expiring Soon |
| T6     | Valid Name       | Medication     | Not select     | Expired       |
| T7     | Valid ID         | Equipment      | Ambulance 1    | Not select    |
| T8     | Valid Location   | Supplies       | Ambulance 2    | Expiring Soon |
| T9     | Empty            | All Categories | Storage Room A | Expired       |
| T10    | Valid Name       | Medication     | Cabinet 3      | Not select    |
| T11    | Valid ID         | Equipment      | Not select     | Expiring Soon |
| T12    | Valid Location   | Supplies       | Ambulance 1    | Expired       |
| T13    | Empty            | All Categories | Ambulance 2    | Not select    |
| T14    | Valid Name       | Medication     | Storage Room A | Expiring Soon |
| T15    | Valid ID         | Equipment      | Cabinet 3      | Expired       |
| T16    | Valid Location   | Supplies       | Not select     | Not select    |
| T17    | Empty            | All Categories | Ambulance 1    | Expiring Soon |
| T18    | Valid Name       | Medication     | Ambulance 2    | Expired       |
| T19    | Valid ID         | Equipment      | Storage Room A | Not select    |
| T20    | Valid Location   | Supplies       | Cabinet 3      | Expiring Soon |

### 1.6 Derive Test Values

| TestID | SearchQuery     | Category       | Location       | Expiry        | Expected Results                          |
| ------ | --------------- | -------------- | -------------- | ------------- | ----------------------------------------- |
| T1     | ""              | All Categories | Not select     | Not select    | All 7 items                               |
| T2     | "Morphine"      | Medication     | Ambulance 1    | Expiring Soon | Empty array                               |
| T3     | "EQP002"        | Equipment      | Ambulance 2    | Expired       | Blood Pressure Monitor                    |
| T4     | "Cabinet"       | Supplies       | Storage Room A | Not select    | Gauze Pads, Medical Gloves                |
| T5     | ""              | Medication     | Cabinet 3      | Expired       | Empty array                               |
| T6     | "Defibrillator" | Equipment      | Not select     | Not select    | Defibrillator AED                         |
| T7     | "SUP001"        | Supplies       | Ambulance 1    | Expiring Soon | Empty array                               |
| T8     | "Ambulance"     | All Categories | Ambulance 2    | Expired       | Empty array                               |
| T9     | ""              | Equipment      | Storage Room A | Expiring Soon | Empty array                               |
| T10    | "Gloves"        | Supplies       | Cabinet 3      | Expired       | Empty array                               |
| T11    | "MED001"        | All Categories | Not select     | Not select    | Epinephrine Auto-Injector                 |
| T12    | "Ambulance 1"   | Medication     | Ambulance 1    | Expiring Soon | Empty array                               |
| T13    | ""              | Supplies       | Ambulance 2    | Expired       | Empty array                               |
| T14    | "Blood"         | All Categories | Storage Room A | Expiring Soon | Empty array                               |
| T15    | "MED002"        | Medication     | Cabinet 3      | Expired       | Empty array                               |
| T16    | "Storage"       | Equipment      | Not select     | Not select    | Defibrillator AED, Blood Pressure Monitor |
| T17    | ""              | All Categories | Ambulance 1    | Expiring Soon | Epinephrine Auto-Injector                 |
| T18    | "Morphine"      | Medication     | Ambulance 2    | Expired       | Empty array                               |
| T19    | "EQP001"        | Equipment      | Storage Room A | Not select    | Defibrillator AED                         |
| T20    | "Cabinet"       | Supplies       | Cabinet 3      | Expiring Soon | Gauze Pads, Medical Gloves                |

---

## Test Suite 2 — processScannedCode()

### 2.1 Identify testable functions

* const processScannedCode = (code: string) => {}

### 2.2 Identify parameters, return types, return values, and exceptional behavior

* Parameters: code: string
* Return values: undefined (returns early under error condition)
* Exceptional behavior: returns early if invalid code or out-of-stock items

### 2.3 Model the input domain

| Characteristic       | b1                 | b2                     |
| -------------------- | ------------------ | ---------------------- |
| C1 Action Type       | Check in           | Check out              |
| C2 Code Validity     | Valid Code         | Invalid Code           |
| C3 Item Stock Status | In stock (qty > 0) | Out of Stock (qty ≤ 0) |

### 2.4 Combine partitions to define test requirements

* Assumption: AAC
* Test Requirements: 2 × 2 × 2 = 8

### 2.5 ACC Test Requirements

| TestID | C1        | C2           | C3           |
| ------ | --------- | ------------ | ------------ |
| T1     | Check in  | Valid Code   | In stock     |
| T2     | Check in  | Valid Code   | Out of Stock |
| T3     | Check in  | Invalid Code | In stock     |
| T4     | Check in  | Invalid Code | Out of Stock |
| T5     | Check out | Valid Code   | In stock     |
| T6     | Check out | Valid Code   | Out of Stock |
| T7     | Check out | Invalid Code | In stock     |
| T8     | Check out | Invalid Code | Out of Stock |

### 2.6 Derive Test Values

| TestID | C1        | C2                 | C3           | Expected Result |
| ------ | --------- | ------------------ | ------------ | --------------- |
| T1     | Check in  | “MED001”           | In stock     | Success         |
| T2     | Check in  | “MED001”           | Out of Stock | Success         |
| T3     | Check in  | "WeLoveAjChaiyong" | In stock     | Fail            |
| T4     | Check in  | "WeLoveAjChaiyong" | Out of Stock | Fail            |
| T5     | Check out | “MED001”           | In stock     | Success         |
| T6     | Check out | “MED001”           | Out of Stock | Fail            |
| T7     | Check out | "WeLoveAjChaiyong" | In stock     | Fail            |
| T8     | Check out | "WeLoveAjChaiyong" | Out of Stock | Fail            |

---

## Test Suite 3 — History.tsx API Logging

### 3.1 Identify testable functions

* router.post('/action/log', async (req, res) => {})

### 3.2 Test technique

* ISP technique with BCC (Base Choice Coverage)

### 3.3 Base choice

* Action: "Use"
* Item: exists
* Quantity: valid (≤ stock)
* Low stock: false
* DB: normal
* User/caseId: provided

### 3.4 Test case descriptions

* Test case 1: normal “Use” action reduces stock, updates DB, logs history, commits successfully
* Test case 2: increase-quantity branch updates stock correctly
* Test case 3: quantity unchanged but history logged normally
* Test case 4: API returns 404 and rolls back
* Test case 5: insufficient stock returns 400
* Test case 6: parsed quantity becomes 0, inventory unchanged
* Test case 7: low-stock notification inserted
* Test case 8: DB error triggers rollback and returns 500
* Test case 9: default values applied

---

## Coverage Report 
![Coverage](https://github.com/user-attachments/assets/98b4aa8f-a439-45d0-ac90-5b3001223668)

Coverage includes:
* Scan feature (Scan.test.tsx)
* Inventory search an filtering feature (inventoryFilters.js)
* History feature (history.test.js)
All tested components reached ≥ 70% statement coverage and ≥ 70% branch coverage.

---


## 2. System Testing

System Testing was performed to validate the application as a whole, ensuring that integrated components function correctly according to functional requirements. The testing approach follows manual execution based on structured test cases.

### System Test Suites Provided

All manual system test suites are included in the repository under:

```
/test/manual test cases/
```

The folder contains the following documents:

#### System Test Suite 1

**File:**
```
System test Search and Filtering.pdf
```

#### System Test Suite 2

**File:**
```
System test Scan test.pdf
```

#### System Test Suite 3

**File:**
```
System test History page.pdf
```

### Requirement Traceability Matrix
File included in the same directory:
```
Requirement Traceability Matrix.pdf
```
---

## 3. Automated UI Testing

Automated UI testing was implemented using Cypress to validate full end-to-end user flows in a browser environment. These tests confirm that critical workflows behave correctly when the frontend communicates with the backend.

### Test Execution

#### Running E2E Tests Interactively

This mode opens the Cypress Test Runner interface for development and debugging.

```
npm run test:e2e
```

#### Running E2E Tests Headlessly

This mode executes all Cypress tests directly in the terminal, suitable for automated pipelines.

```
npm run test:e2e:run
```


### Browser Selection

When the Cypress Test Runner opens:

1. Choose a preferred browser for executing E2E tests
2. Select individual test specs to run or run all at once


### Automated UI Test Suite Location

All Cypress end-to-end test suites are located inside:

```
test/automated test cases/e2e/
```

Directory listing:

```
test/
├── automated test cases/  # Cypress E2E test files 
│   ├── e2e/
│   │   ├── inventory.cy.ts   # Test Suite 1: Inventory Search and Filtering
│   │   ├── Scan.cy.ts        # Test Suite 2: Scan and Barcode Processing
│   │   └── History.cy.ts     # Test Suite 3: History Log Interaction
```

### Automated UI Testing result

#### Test Suite 1 : Inventory search and filtering
![InventoryUI_test](https://github.com/user-attachments/assets/b5e17ae2-cea5-407f-919f-5bbd340c1984)

#### Test Suite 2 : Fast Scanning
![ScanUI_test](https://github.com/user-attachments/assets/cf7005a6-ba1c-4dac-a6aa-074aee2047cf)

#### Test Suite 2 : History and report
![historyUI_test](https://github.com/user-attachments/assets/9a586a1a-02f7-46fa-bdca-04657a50d6dd)

---
