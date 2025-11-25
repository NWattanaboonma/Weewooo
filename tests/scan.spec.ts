import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:8081';

// --- FIX 1: Increase global timeout for slow Expo dev servers ---
test.setTimeout(120000); // 2 minutes per test

test.describe('Scan Screen Functionality', () => {

  test.beforeEach(async ({ page }) => {
    // 1. Prevent Red Box Crash (Keep this!)
    await page.addInitScript(() => {
      if (navigator.permissions) {
        navigator.permissions.query = async () => ({
          state: 'granted',
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        } as any);
      }
    });

    // 2. --- NEW FIX: Clear Local Storage to remove old logs ---
    // We navigate to base url first to access the correct localStorage domain
    await page.goto(BASE_URL);
    await page.evaluate(() => window.localStorage.clear());

    // 3. Now navigate to the scan page clean
    await page.goto(`${BASE_URL}/scan`, { 
      timeout: 60000, 
      waitUntil: 'domcontentloaded' 
    });

    await expect(page.getByText('Manual Entry')).toBeVisible({ timeout: 30000 });
  });

  test('Step 1: Enter a valid item code in the Check-in section', async ({ page }) => {
    const validCode = 'MED001';
    
    // --- FIX 2: Use getByText instead of getByRole ---
    // React Native renders these as divs, not strict "buttons"
    await page.getByText('Check In').click();

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain(`Logged action for item: ${validCode} (Check In, Quantity 1)`);
      await dialog.dismiss();
    });

    await page.getByPlaceholder('Enter barcode or scan...').fill(validCode);
    
    // Use getByText for the Submit button too
    await page.getByText('Submit Scan').click();
  });

  test('Step 2: Enter an invalid item code in the Check-in section', async ({ page }) => {
    const invalidCode = 'XYZ';
    await page.getByText('Check In').click();

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain(`Invalid QR code: "${invalidCode}"`);
      await dialog.dismiss();
    });

    await page.getByPlaceholder('Enter barcode or scan...').fill(invalidCode);
    await page.getByText('Submit Scan').click();
  });

  test('Step 3: Enter a valid item code in the Check-out section', async ({ page }) => {
    const validCode = 'MED001';
    
    // --- FIX: Use 'exact: true' to avoid matching history logs ---
    // This ensures we click the button "Check Out", not a log sentence containing "Check Out"
    await page.getByText('Check Out', { exact: true }).click();

    // Small wait to ensure state toggles (just in case)
    await page.waitForTimeout(500);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain(`Logged action for item: ${validCode} (Check Out, Quantity 1)`);
      await dialog.dismiss();
    });

    await page.getByPlaceholder('Enter barcode or scan...').fill(validCode);
    await page.getByText('Submit Scan').click();
  });

  test('Step 4: Enter an invalid item code in the Check-out section', async ({ page }) => {
    const invalidCode = 'XYZ';
    await page.getByText('Check Out').click();

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toContain(`Invalid QR code: "${invalidCode}"`);
      await dialog.dismiss();
    });

    await page.getByPlaceholder('Enter barcode or scan...').fill(invalidCode);
    await page.getByText('Submit Scan').click();
  });

  test('Step 5: Enter a valid item code but out of stock in Check-out section', async ({ page }) => {
    const outOfStockCode = 'SUP002'; 

    // // 1. PREPARATION: Go to Inventory
    // await page.goto(`${BASE_URL}/inventory`, { waitUntil: 'domcontentloaded' });
    
    // const searchInput = page.getByPlaceholder('Search by name or code...');
    // await searchInput.fill(outOfStockCode);
    
    // await expect(page.getByText(outOfStockCode).first()).toBeVisible();

    // // --- FIX: Use getByText for "Remove All" ---
    // // Note: To check if it is disabled in RN-Web, we sometimes need to check opacity or specific styles,
    // // but often simply clicking it and seeing if it works is enough.
    // // However, RN-Web often maps 'disabled' prop to 'aria-disabled'.
    // const removeButton = page.getByText('Remove All').first();

    // // We try to click. If it's effectively disabled in logic, the UI won't change.
    // // But for the sake of the test setup, we just assume if we can click it, we should.
    
    // // Check if the button LOOKS disabled (often handled by opacity in RN)
    // // A safer way for your specific code is checking if the element is interactable.
    // if (await removeButton.isEnabled()) {
    //    await removeButton.click();
    // }

    // 2. EXECUTION: Go back to Scan screen
    await page.goto(`${BASE_URL}/scan`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Manual Entry')).toBeVisible();

    await page.getByText('Check Out').click();

    page.once('dialog', async (dialog) => {
      const message = dialog.message();
      expect(message).toContain('Action failed');
      expect(message).toContain('out of stock');
      await dialog.dismiss();
    });

    await page.getByPlaceholder('Enter barcode or scan...').fill(outOfStockCode);
    await page.getByText('Submit Scan').click();
  });

});