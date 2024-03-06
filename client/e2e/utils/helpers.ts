import { Page, expect } from "@playwright/test";

// 🛠️ Function: get all label elements with required field character * within form fieldset
export async function getFieldRequired(page: Page) {
  const fieldset = await page.$("fieldset#root");
  const requiredFields = await fieldset?.$$('label:has-text("*")');
  return requiredFields;
}
// 🛠️ Function: get all alert elements within form fieldset
export async function getFieldAlerts(page: Page) {
  const fieldset = await page.$("fieldset#root");
  const alertElements = await fieldset!.$$(`div[role="alert"]`);
  return alertElements;
}
// 🛠️ Function: clears required form fields
export async function fieldsClear(page: Page) {
  // Locate all required fields within the fieldset
  const requiredFields = await getFieldRequired(page);
  if (requiredFields) {
    // 📛 Clear the required input fields
    for (const input of requiredFields) {
      const labelText = await input.textContent();
      const inputField = await page.getByLabel(labelText as string);
      // Click the field to focus it
      await inputField.click();
      // Clear the field
      await inputField.clear();
    }
  }
  return requiredFields?.length;
}
// 🛠️ Function: completes required form fields correctly
export async function fieldsUpdate(page: Page) {
  // Locate all required fields within the fieldset
  const requiredFields = await getFieldRequired(page);
  if (requiredFields) {
    // ✔️ Set required input fields
    for (const input of requiredFields) {
      const labelText = await input.textContent();
      const inputField = await page.getByLabel(labelText as string);
      // Click the field to focus it
      await inputField.click();
      switch (labelText) {
        case "Phone Number*":
          await page.getByLabel(labelText).fill("604 401 5432"); //Format should be ### ### ####
          break;
        default:
          await inputField.fill(`E2E ${labelText}`);
          break;
      }
    }
  }
}

export async function getAllFormInputs(page: Page) {
  const fields = await page.locator("input").all();
  return fields;
}

export async function downloadPDF(
  page: Page,
  linkName: string,
  fileName: string,
) {
  const downloadPromise = page.waitForEvent("download"); // Start waiting for download before clicking.
  await page.getByRole("link", { name: linkName }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain(fileName);
  await download.delete(); // Delete the downloaded file (cleanup)
}
