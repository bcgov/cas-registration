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
import { baseUrlSetup } from "@/e2e/utils/constants";
import { E2EValue, FormField, MessageTexResponse } from "@/e2e/utils/enums";

export async function addPdf(page: Page, index: number = 0) {
  // Pass an index if there are multiple file inputs on the page
  const inputs = await page.locator('input[type="file"]').all();
  const input = inputs[index];
  await input.setInputFiles("./e2e/assets/test.pdf");
  expect(page.getByText("test.pdf")).toBeVisible();
}

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
export async function checkFormFieldsReadOnly(
  fields: Locator[],
  readonly: boolean = true,
) {
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
      if (readonly == true) {
        await expect(disabled).toBeTruthy();
        await expect(editable).toBeFalsy();
      } else {
        await expect(disabled).toBeFalsy();
        await expect(editable).toBeTruthy();
      }
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

// 🛠️ Function: gets table row's cell value
export async function getRowCellBySelector(row: Locator, selector: string) {
  const cell = await row.locator(`[role="cell"]${selector}`).first();
  return cell;
}
// 🛠️ Function: gets table row by cell value selector
export async function getTableRowByCellSelector(
  table: Locator,
  selector: string,
) {
  const row = await table
    .locator(`[role="cell"]${selector}`)
    .first()
    .locator('xpath=ancestor::div[@role="row"]')
    .first();
  return row;
}
// 🛠️ Function: gets table row by row id
export async function getTableRowById(table: Locator, rowId: string) {
  const row = await table.locator(`[role="row"][data-id="${rowId}"]`).first();
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
        case FormField.PHONE:
          await inputField.fill(E2EValue.INPUT_PHONE); //Format should be ### ### ####
          break;
        default:
          await inputField.fill(`${E2EValue.PREFIX} ${labelText}`);
          break;
      }
    }
  }
}

// 🛠️ Function: fills all form fields with correct formatting. Selector argument is used to selectively fill parts of the form. Use "fieldset#root" as the argument if filling the entire form, otherwise use the a section's fieldset.
export async function fillAllFormFields(page: Page, selector: string) {
  // Locate all fields within the fieldset
  const fieldset = await page.locator(selector).first();
  if (!fieldset) {
    throw new Error("Fieldset not found");
  }
  const fields = await fieldset.locator("label").all();
  if (fields) {
    for (const input of fields) {
      const labelText = await input.textContent();
      // We use the same labels multiple times in some forms (e.g., the parent operator section in the operator form has a Legal Name field, as does the main operator form), so this ensures we only getByLabel in the desired section of the form
      const formSection = page.locator(selector);
      const inputField = await formSection
        .getByLabel(labelText as string)
        .first();
      if (labelText === FormField.IS_BUSINESS_ADDRESS_SAME) {
        break;
      }
      // Click the field to focus it
      await inputField.click();
      switch (labelText) {
        case FormField.PHONE:
          await inputField.fill(E2EValue.INPUT_PHONE);
          break;
        case FormField.CRA:
          await inputField.fill(E2EValue.INPUT_CRA);
          break;
        case FormField.BC_CRN:
          await inputField.fill(E2EValue.INPUT_BC_CRN);
          break;
        case FormField.BUSINESS_STRUCTURE:
          await inputField.fill(E2EValue.INPUT_BUSINESS_STRUCTRE);
          await formSection
            .getByRole("option", { name: E2EValue.INPUT_BUSINESS_STRUCTRE })
            .click();
          break;
        case FormField.PROVINCE:
          await inputField.fill(E2EValue.INPUT_PROVINCE);
          await formSection
            .getByRole("option", { name: E2EValue.INPUT_PROVINCE })
            .click();
          break;
        case FormField.POSTAL_CODE:
          await inputField.fill(E2EValue.INPUT_POSTAL_CODE);
          break;
        case FormField.WEB_SITE:
          await inputField.fill(E2EValue.INPUT_WEB_SITE);
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
