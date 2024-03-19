import { Locator, Page, expect } from "@playwright/test";

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
// 🛠️ Function: fills required form fields correctly
export async function fillRequiredFormFields(page: Page) {
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

// 🛠️ Function: fills all form fields with correct formatting. Selector argument is used to selectively fill parts of the form. Use "fieldset#root" as the argument if filling the entire form, otherwise use the a section's fieldset.
export async function fillAllFormFields(page: Page, selector: string) {
  // Locate all fields within the fieldset
  const fieldset = await page.$(selector);
  const fields = await fieldset?.$$("label");
  if (fields) {
    for (const input of fields) {
      const labelText = await input.textContent();
      // We use the same labels multiple times in some forms (e.g., the parent operator section in the operator form has a Legal Name field, as does the main operator form), so this ensures we only getByLabel in the desired section of the form
      const formSection = page.locator(selector);
      const inputField = await formSection.getByLabel(labelText as string);
      if (
        labelText ===
        "Is the business mailing address the same as the physical address?"
      ) {
        break;
      }
      // Click the field to focus it
      await inputField.click();
      switch (labelText) {
        case "Phone Number*":
          await formSection.getByLabel(labelText).fill("604 401 5432");
          break;
        case "CRA Business Number*":
          await formSection.getByLabel(labelText).fill("123454321");
          break;
        case "BC Corporate Registry Number*":
          await formSection.getByLabel(labelText).fill("AAA1111111");
          break;
        case "Business Structure*":
          await formSection.getByLabel(labelText).fill("General Partnership");
          await formSection.getByText(/General Partnership/i).click();
          break;
        case "Province*":
          await formSection.getByLabel(labelText).fill("Alberta");
          await formSection.getByText(/Alberta/i).click();
          break;
        case "Postal Code*":
          await formSection.getByLabel(labelText).fill("H0H 0H0");
          break;
        case "Website (optional)":
          await formSection
            .getByLabel(labelText)
            .fill("https://www.website.com");
          break;
        default:
          await inputField.fill(`E2E ${labelText}`);
          break;
      }
    }
  }
}

export async function checkRequiredFieldValidationErrors(
  page: Page,
  submitButton: Locator,
) {
  // Locate all required fields
  const requiredFields = await getFieldRequired(page);
  // Submit
  await submitButton.click();
  // Locate all alert elements within the fieldset
  const alertElements = await getFieldAlerts(page);
  // 🔍 Assert there to be exactly the same number of required fields and alert elements
  await expect(requiredFields?.length).toBe(alertElements.length);
}

export async function triggerFormatValidationErrors(
  page: Page,
  submitButton: Locator,
) {
  // Locate all fields within the fieldset
  const fieldset = await page.$("fieldset#root");
  const fields = await fieldset?.$$("label");
  if (fields) {
    for (const input of fields) {
      const labelText = await input.textContent();
      const inputField = await page.getByLabel(labelText as string);
      if (
        labelText ===
        "Is the business mailing address the same as the physical address?"
      ) {
        break;
      }
      // Click the field to focus it
      await inputField.click();
      switch (labelText) {
        case "Phone Number*":
          await page.getByLabel(labelText).fill("111");
          break;
        case "CRA Business Number*":
          await page.getByLabel(labelText).fill("123");
          break;
        case "BC Corporate Registry Number*":
          await page.getByLabel(labelText).fill("234rtf");
          break;
        case "Postal Code*":
          await page.getByLabel(labelText).fill("garbage");
          break;
        case "Website (optional)":
          await page.getByLabel(labelText).fill("bad website");
          break;
        default:
          break;
      }
    }
  }
  // Submit
  await submitButton.click();
}

export async function getAllFormInputs(page: Page) {
  const fields = await page.locator("input").all();
  return fields;
}

export async function tableColumnNamesAreCorrect(
  page: Page,
  expectedColumnNames: string[],
) {
  for (const columnName of expectedColumnNames) {
    expect(
      page.locator(".MuiDataGrid-columnHeaderTitle").getByText(columnName),
    ).toBeVisible();
  }
}

export async function addPdf(page: Page, index: number = 0) {
  // Pass an index if there are multiple file inputs on the page
  const inputs = await page.locator('input[type="file"]').all();
  const input = inputs[index];
  await input.setInputFiles("./e2e/assets/test.pdf");
  expect(page.getByText("test.pdf")).toBeVisible();
}
