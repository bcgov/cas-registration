import {
  Page,
  expect,
  Locator,
  APIResponse,
  chromium,
  firefox,
  webkit,
  Browser,
} from "@playwright/test";
import { baseUrlSetup } from "./constants";
import { MessageTexResponse } from "./enums";

// 🛠️ Function: checks expected alert mesage
export async function checkAlertMessage(
  page: Page,
  alertMessage: string | RegExp,
  index: number = 0,
) {
  await expect(page.getByRole("alert").nth(index)).toHaveText(alertMessage);
}

// 🛠️ Function: checks the visibility of each text within the specified column of the provided table
export async function checkColumnTextVisibility(
  table: Locator,
  columnIdentifier: number | string,
  columnText: string[],
): Promise<void> {
  let columnSelector: string;
  if (typeof columnIdentifier === "number") {
    columnSelector = `[data-colindex="${columnIdentifier}"]`; // Use data-colindex
  } else {
    columnSelector = `[data-field="${columnIdentifier}"]`; // Use data-field
  }
  // Check for visibility of each text within the column
  for (const text of columnText) {
    const cell = await table
      .locator(`[role="cell"]${columnSelector}:has-text("${text}")`)
      .first();
    await expect(cell).toBeVisible();
  }
}

// 🛠️ Function: checks read only of form inputs
export async function checkFormFieldsReadOnly(fields: Locator[]) {
  // perform checks simultaneously
  await Promise.all(
    fields.map(async (field) => {
      // Combine multiple assertions for efficiency
      const [visible, disabled, editable] = await Promise.all([
        field.isVisible(),
        field.isDisabled(),
        field.isEditable(),
      ]);
      // Assert visibility to be true
      await expect(visible).toBeTruthy();
      await expect(disabled).toBeTruthy();
      await expect(editable).toBeFalsy();
    }),
  );
}

// 🛠️ Function: checks all visibility of form headers
export async function checkFormHeaders(page: Page, formHeaders: string[]) {
  await Promise.all(
    formHeaders.map(async (header) => {
      await expect(page.getByRole("button", { name: header })).toBeVisible();
    }),
  );
}

// 🛠️ Function: check locator visiblity true or false
export async function checkLocatorsVisibility(
  page: Page,
  locators: Locator[],
  visible: boolean = true,
) {
  for (const locator of locators) {
    if (visible) {
      await expect(locator).toBeVisible();
    } else {
      await expect(locator).not.toBeVisible();
    }
  }
}

// 🛠️ Function: get all alert elements within form fieldset
export async function getFieldAlerts(page: Page) {
  const fieldset = page.locator("fieldset#root");
  const alertElements = await fieldset.locator('div[role="alert"]').all();
  return alertElements;
}

// 🛠️ Function: get all label elements with required field character * within form fieldset
export async function getFieldRequired(page: Page) {
  const fieldset = page.locator("fieldset#root");
  const requiredFields = await fieldset.locator('label:has-text("*")').all();
  return requiredFields;
}

// 🛠️ Function: check if there are any validation errors related to required fields after form submission
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
  await expect(requiredFields?.length).toBe(alertElements);
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

// 🛠️ Function: get all form inputs
export async function getAllFormInputs(page: Page) {
  const fields = await page.locator("input").all();
  return fields;
}

// 🛠️ Function: gets table row by selector
export async function getTableRow(table: Locator, selector: string) {
  const row = await table
    .locator(selector)
    .first()
    .locator('xpath=ancestor::div[@role="row"]')
    .first();
  return row;
}

// 🛠️ Function: clears form fields
export async function fieldsClear(page: Page, formFields: string | any[]) {
  // 📛 Clear the required input fields
  for (const input of formFields) {
    const labelText = await input.textContent();
    const inputField = await page.getByLabel(labelText as string);
    // Click the field to focus it
    await inputField.click();
    // Clear the field
    await inputField.clear();
  }
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
// 🛠️ Function: verifies whether the column names displayed on the page match the expected column names provided as input
export async function tableColumnNamesAreCorrect(
  page: Page,
  expectedColumnNames: string[],
) {
  const columnHeaders = page.locator(".MuiDataGrid-columnHeaderTitle");
  const actualColumnNames = await columnHeaders.allTextContents();
  expect(actualColumnNames).toEqual(expectedColumnNames);
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

// 🛠️ Function: calls api to seed database with data for workflow tests
export async function setupTestEnvironment(
  workFlow?: string,
  truncateOnly?: boolean,
) {
  let browser: Browser | null = null;

  // Attempt launching browsers in order of preference
  for (const browserType of ["chromium", "firefox", "webkit"]) {
    //    console.log(browserType);  // ? always Chromium in e2e:ui
    try {
      browser = await (async () => {
        switch (browserType) {
          case "chromium":
            return chromium.launch();
          case "firefox":
            return firefox.launch();
          case "webkit":
            return webkit.launch();
          default:
            throw new Error(`Unsupported browser: ${browserType}`);
        }
      })();
      // Browser launched successfully, break the loop
      break;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.warn(`Failed to launch ${browserType}: ${error.message}`);
    }
  }

  if (!browser) {
    throw new Error("No compatible browser found");
  }

  const context = await browser.newContext();
  const url = workFlow
    ? `${baseUrlSetup}?workflow=${workFlow}`
    : truncateOnly
    ? `${baseUrlSetup}?truncate_only=true`
    : baseUrlSetup;
  let response: APIResponse = await context.request.get(url);

  // Wait for the response and check for success status text and code (e.g., 200)
  expect(await response.text()).toBe(MessageTexResponse.SETUP_SUCCESS);
  expect(response.status()).toBe(200);
}
