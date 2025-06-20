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
import { baseUrlSetup } from "@bciers/e2e/utils/constants";
import {
  DataTestID,
  E2EValue,
  FormField,
  MessageTextResponse,
} from "@bciers/e2e/utils/enums";
import AxeBuilder from "@axe-core/playwright";

// 🛠️ Function: analyze the accessibility of the page. Use the description argument to indicate what screen/form/etc. is being tested.
export async function analyzeAccessibility(
  page: Page,
  description: string = "",
) {
  const accessibilityScanResults = await new AxeBuilder({
    page,
  }).analyze();

  if (accessibilityScanResults.violations.length > 0) {
    console.log(
      `[Accessibility Violation: ${description}]`,
      accessibilityScanResults.violations,
    );
  }

  expect(accessibilityScanResults.violations).toEqual([]);
}

// Helpers for filling forms
export async function addPdf(page: Page, index: number = 0) {
  // Pass an index if there are multiple file inputs on the page
  const inputs = await page.locator('input[type="file"]').all();
  const input = inputs[index];
  await input.setInputFiles("./e2e/assets/test.pdf");
  expect(page.getByText("test.pdf")).toBeVisible();
}

export async function clickButton(page: Page, buttonName: string | RegExp) {
  page
    .getByRole("button", {
      name: buttonName,
    })
    .click();
}

export async function fillComboxboxWidget(
  page: Page,
  labelText: string | RegExp,
  value: string,
) {
  const input = await page.getByRole("combobox", {
    name: labelText,
  });
  await expect(input).toBeVisible();
  await expect(input).toBeEnabled();
  await input.fill(value);
  const option = page.getByRole("option", { name: value });
  await expect(option).toBeVisible();
  await option.click();
}

export async function fillDropdownByLabel(
  page: Page,
  labelText: string | RegExp,
  value: string,
) {
  const input = await page.getByLabel(labelText);
  await expect(input).toBeVisible();
  await expect(input).toBeEnabled();
  await input.fill(value);
}

export async function checkAllRadioButtons(page: Page) {
  const radioButtons = page.getByRole("radio", { name: "Yes" });
  const count = await radioButtons.count();

  for (let i = 0; i < count; i++) {
    const radio = radioButtons.nth(i);
    if (await radio.isEnabled()) {
      await radio.check();
    }
  }
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
      .locator(`[role="gridcell"]${columnSelector}:has-text("${text}")`)
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
      if (readonly === true) {
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

// 🛠️ Function: get all label elements with required field character * within form fieldset
export async function getFieldRequired(page: Page) {
  const fieldset = page.locator("fieldset#root");
  const requiredFields = await fieldset.locator('label:has-text("*")').all();
  return requiredFields;
}

// 🛠️ Function: checking required field values
export async function checkRequiredFieldValue(page: Page) {
  const requiredFields = await getFieldRequired(page);
  const allFieldsHaveValue = await Promise.all(
    requiredFields.map(async (field) => !!field),
  );
  return allFieldsHaveValue.every((value) => value);
}

// 🛠️ Function: get all alert elements within form fieldset
export async function getFieldAlerts(page: Page) {
  const fieldset = page.locator("fieldset#root");
  const alertElements = await fieldset.locator('div[role="alert"]').all();
  return alertElements;
}

/**
 *  📖 https://playwright.dev/docs/api/class-download
 * Download objects are dispatched by page via the page.on('download') event.
All the downloaded files belonging to the browser context are deleted when the browser context is closed.
Download event is emitted once the download starts. Download path becomes available once download completes.
 */
export async function downloadPDF(
  page: Page,
  linkName: string,
  fileName: string,
) {
  // Start waiting for download before clicking. Note no await.
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: linkName }).click();
  // Wait for the download process to complete
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain(fileName);
}

// 🛠️ Function: get all form inputs
export async function getAllFormInputs(page: Page) {
  const fields = await page.locator("input").all();
  return fields;
}

// 🛠️ Function: gets table row's cell value
export async function getRowCellBySelector(row: Locator, selector: string) {
  const cell = await row.locator(`[role="gridcell"]${selector}`).first();
  return cell;
}
// 🛠️ Function: gets table row by cell value selector
export async function getTableRowByCellSelector(
  table: Locator,
  selector: string,
) {
  const row = await table
    .locator(`[role="gridcell"]${selector}`)
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

// 🛠️ Function: get a table column's values
export async function getTableColumnTextValues(
  table: Locator,
  dataField: string,
): Promise<string[]> {
  const uniqueColumnValues = new Set<string>();
  const rows = await table.locator('[role="row"]').all();
  const rowsLength = rows.length;
  const indexStart = 2; //skip header row; skip search row

  for (let i = indexStart; i < rowsLength; i++) {
    const row = rows[i];
    const cell = await getRowCellBySelector(row, `[data-field="${dataField}"]`);
    const text = (await cell.textContent()) || "";
    uniqueColumnValues.add(text.trim());
  }

  return Array.from(uniqueColumnValues);
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
export async function fillRequiredFormFields(
  page: Page,
  fieldLabels: string[],
  values: { [key: string]: string },
  mode: "fill" | "read" = "fill",
) {
  for (const labelText of fieldLabels) {
    const inputFields = await page.getByLabel(labelText);
    const inputField = inputFields.nth((await inputFields.count()) - 1);
    if (mode === "fill") {
      const currentValue = await inputField.inputValue();
      // clear field for editing form
      if (currentValue) {
        await inputField.clear();
      }
      // Special condition for province
      if (/province/i.test(labelText)) {
        await fillComboxboxWidget(page, labelText, values[labelText]);
      } else {
        await inputField.fill(values[labelText]);
      }
    } else if (mode === "read") {
      const isPhoneField = /telephone number/i.test(labelText);
      const expectedValue = isPhoneField
        ? `+1 ${values[labelText]}`
        : values[labelText];
      const text = await page.getByText(expectedValue, { exact: true });
      await expect(text).toBeVisible();
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

export async function tableHasExpectedRowCount(
  page: Page,
  expectedRowCount: number,
) {
  const rows = page.locator(".MuiDataGrid-row");
  await expect(rows).toHaveCount(expectedRowCount);
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
  expect(await response.text()).toBe(MessageTextResponse.SETUP_SUCCESS);
  expect(response.status()).toBe(200);
}

export async function sortTableByColumnLabel(
  page: Page,
  columnLabel: string,
  expectedFirstSortedCell: string,
  expectedSortDirection: "ascending" | "descending" | "none" = "ascending",
) {
  const header = page.getByRole("columnheader").getByText(columnLabel);

  const colIndex = await page
    .locator(`[aria-label="${columnLabel}"]`)
    .getAttribute("aria-colindex");
  await header.click();

  // wait for aria-sort to be set to ascending
  const ariaSort = await page
    .locator(`[aria-label="${columnLabel}"]`)
    .getAttribute("aria-sort");

  expect(ariaSort).toBe(expectedSortDirection);

  // wait for response to complete
  await page.waitForResponse((response) => response.status() === 200);

  const table = page.locator(DataTestID.GRID);

  // Get the first row cell that was sorted
  const firstSortedCell = await getRowCellBySelector(
    table,
    `[aria-colindex="${colIndex}"]`,
  );

  // Longer timeout to wait for sorting to complete
  await expect(firstSortedCell).toHaveText(expectedFirstSortedCell, {
    timeout: 20000,
  });
}
export async function filterTableByFieldId(
  page: Page,
  fieldId: string,
  columnLabel: string,
  filterValue: string,
  expectEmptyTable: boolean = false,
) {
  const filter = page.locator(`[id="${fieldId}"]`);
  await filter.fill(filterValue);
  expect(await filter.inputValue()).toBe(filterValue);

  // wait for response to complete
  await page.waitForResponse((response) => response.status() === 200);

  if (expectEmptyTable) {
    const emptyTable = page.getByText("No records found");
    await expect(emptyTable).toBeVisible({ timeout: 20000 });
    return;
  }

  const colIndex = await page
    .locator(`[aria-label="${columnLabel}"]`)
    .getAttribute("aria-colindex");

  const table = page.locator(DataTestID.GRID);

  // get the first row cell that was filtered
  const firstFilteredCell = await getRowCellBySelector(
    table,
    `[aria-colindex="${colIndex}"]`,
  );

  // Longer timeout to wait for filtering to complete
  await expect(firstFilteredCell).toContainText(filterValue, {
    timeout: 20000,
  });
}

export async function tableRowCount(page: Page, expectedRowCount: number) {
  const tableContent = page.locator(`.MuiDataGrid-virtualScroller`);
  const rows = tableContent.locator('[role="row"]');
  await expect(rows).toHaveCount(expectedRowCount, { timeout: 20000 });
}

export async function clearTableFilter(page: Page, fieldId: string) {
  const filter = page.locator(`[id="${fieldId}"]`);
  await filter.clear();
  expect(await filter.inputValue()).toBe("");
}

export async function waitForElementToStabilize(page: Page, element: string) {
  await page.waitForLoadState();
  const el = await page.$(element);
  await el?.waitForElementState("stable");
}

// This function can be used instead of `happoPlaywright.screenshot` when experiencing flaky screenshots. It waits for the page to be stable before taking a screenshot.
export async function takeStabilizedScreenshot(
  happoPlaywright: any,
  page: Page,
  happoArgs: { component: string; variant: string; targets?: string[] },
) {
  const { component, variant, targets } = happoArgs;
  const pageContent = page.locator("html");
  await waitForElementToStabilize(page, "main");
  await happoPlaywright.screenshot(page, pageContent, {
    component,
    variant,
    targets,
  });
}
export async function assertCount(elementsToCount: Locator) {
  expect(elementsToCount).toHaveCount(0);
}

export async function stabilizeGrid(page: Page, expectedRowCount: number) {
  await tableHasExpectedRowCount(page, expectedRowCount);
  await assertCount(page.locator(".MuiDataGrid-row:hover")); // on hover, the table row colour changes, creating happo diffs
}
export async function stabilizeAccordion(
  page: Page,
  expectedArrowDropdownCount: number,
) {
  await waitForElementToStabilize(page, "section");
  const arrowDropDownElements = await page.locator(
    `[data-testid=${DataTestID.ARROW_DROPDOWN_ICON}]`,
  );
  expect(await arrowDropDownElements.count()).toBe(expectedArrowDropdownCount);
  await waitForElementToStabilize(page, "section");
}

export function getStorageStateForRole(role: string) {
  const envKey = `E2E_${role.toUpperCase()}_STORAGE_STATE`;
  const processEnv = process.env[envKey];

  return JSON.parse(processEnv as string);
}

export async function assertSuccessfulSnackbar(page: Page, message: string) {
  const snackbarLocator = page.locator(".MuiSnackbar-root").getByText(message);
  await snackbarLocator.waitFor();
  await expect(snackbarLocator).toBeVisible();
}

export async function clickWithRetry(
  page: Page,
  buttonName: string | RegExp,
  retries: number,
) {
  for (let i = 1; i <= retries; i++) {
    try {
      await clickButton(page, buttonName);
      return;
    } catch (error) {
      console.warn(`Click failed. Retrying... Attempt ${i}/${retries}`);
    }
  }
}

export async function urlIsCorrect(
  page: Page,
  expectedPath: string,
  fromBaseUrl?: boolean,
) {
  if (fromBaseUrl) {
    expectedPath = process.env.E2E_BASEURL + expectedPath;
  }
  const currentUrl = page.url();
  await expect(currentUrl.toLowerCase()).toMatch(expectedPath.toLowerCase());
}
