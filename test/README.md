
# Weewooo

Weewooo is a full-stack application designed for simple inventory management. It features a mobile-friendly frontend built with React Native and a backend powered by Node.js and Express.

## Key Features

* Scanning items to update inventory
* Logging all inventory actions for complete history tracking
* Exporting inventory data
* Mobile-friendly interface
* RESTful backend API

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
├── automated test cases/ # Cypress E2E test files 
│   ├── e2e/
│   │   ├── History.cy.ts     # Tests for the History page 
│   │   ├── Scan.cy.ts        # Tests for the Scan/Barcode page 
│   │   ├── inventory.cy.ts   # Tests for Search and Filtering Inventory 
│   │   └── spec.cy.ts        # Example Cypress 
├── manual test cases/    # Checklists for manual testing 
│   └── manual_tests.md
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


```

---

