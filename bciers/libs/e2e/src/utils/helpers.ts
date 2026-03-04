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
import { baseUrlSetup, GRID_ROOT } from "@bciers/e2e/utils/constants";
import { DataTestID, MessageTextResponse } from "@bciers/e2e/utils/enums";
import AxeBuilder from "@axe-core/playwright";
import path from "node:path";

// 🛠️ Function: analyze the accessibility of the page. Use the description argument to indicate what screen/form/etc. is being tested.
export async function analyzeAccessibility(
  page: Page,
  description: string = "",
) {
  const accessibilityScanResults = await new AxeBuilder({
    page,
  }).analyze();

  if (accessibilityScanResults.violations.length > 0) {
    // eslint-disable-next-line no-console
    console.log(
      `[Accessibility Violation: ${description}]`,
      accessibilityScanResults.violations,
    );
  }

  expect(accessibilityScanResults.violations).toEqual([]);
}

/**
 * Clicks a button by accessible name and optionally waits for navigation.
 * @param page - Playwright Page instance
 * @param buttonText - Button accessible name or RegExp
 * @param opts.inForm - Scope the button search to a <form> (default: false)
 * @param opts.waitForUrl - RegExp to wait for after clicking (optional)
 */
export async function clickButton(
  page: Page,
  buttonText: string | RegExp,
  opts?: {
    inForm?: boolean; // default false
    waitForUrl?: RegExp;
  },
): Promise<void> {
  const { inForm = false, waitForUrl } = opts ?? {};

  const name =
    buttonText instanceof RegExp ? buttonText : new RegExp(buttonText, "i");

  const root = inForm ? page.locator("form") : page;
  const button = root.getByRole("button", { name });

  await expect(button).toBeVisible({ timeout: 30_000 });
  await expect(button).toBeEnabled({ timeout: 30_000 });

  if (waitForUrl) {
    // Use a lighter wait for SPA navigation
    await Promise.all([
      page.waitForURL((u) => waitForUrl.test(u.toString()), {
        timeout: 30_000,
        waitUntil: "domcontentloaded",
      }),
      button.click(),
    ]);
  } else {
    await button.click();
  }
}

export async function fillComboxboxWidget(
  page: Page,
  labelText: string | RegExp,
  value: string,
) {
  const input = page.getByRole("combobox", {
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
  const input = page.getByLabel(labelText);
  await expect(input).toBeVisible();
  await expect(input).toBeEnabled();
  await input.fill(value);
}

export async function fillInputValueByLabel(
  page: Page,
  label: string | RegExp,
  value: string | number,
  opts?: {
    blur?: "tab" | "enter" | "none"; // default "tab"
  },
): Promise<void> {
  const { blur = "tab" } = opts ?? {};

  const name = label instanceof RegExp ? label : new RegExp(label, "i");
  const field = page.getByLabel(name);

  await expect(field).toBeVisible({ timeout: 30_000 });
  await expect(field).toBeEnabled({ timeout: 30_000 });

  await field.click();
  await field.press("Control+A");
  await field.press("Backspace");

  await field.fill(String(value));

  if (blur === "tab") await field.press("Tab");
  if (blur === "enter") await field.press("Enter");
}

export async function fillInputValueByLocator(
  field: Locator,
  value: string | number,
  opts?: {
    blur?: "tab" | "enter" | "none"; // default "tab"
  },
): Promise<void> {
  const { blur = "tab" } = opts ?? {};

  await expect(field).toBeVisible({ timeout: 30_000 });
  await expect(field).toBeEnabled({ timeout: 30_000 });

  // focus and clear field
  await field.click();
  await field.press("Control+A");
  await field.press("Backspace");

  await field.fill(String(value));

  if (blur === "tab") await field.press("Tab");
  if (blur === "enter") await field.press("Enter");
}

export async function checkAllRadioButtons(page: Page) {
  const radioButtons = page.getByRole("radio", { name: "Yes" });
  // Wait for at least one radio button to be visible before counting.
  // count() returns immediately without waiting for elements to appear,
  // so in production builds it can return 0 if the
  // form hasn't fully rendered yet.
  await expect(radioButtons.first()).toBeVisible();
  const count = await radioButtons.count();

  for (let i = 0; i < count; i++) {
    const radio = radioButtons.nth(i);
    if (await radio.isEnabled()) {
      await radio.check();
    }
  }
}

export async function checkCheckboxByLabel(
  page: Page,
  label: string | RegExp,
): Promise<void> {
  const name = label instanceof RegExp ? label : new RegExp(label, "i");

  const checkbox = page.getByRole("checkbox", { name });

  await expect(checkbox).toBeVisible({ timeout: 30_000 });
  await expect(checkbox).toBeEnabled({ timeout: 30_000 });

  if (!(await checkbox.isChecked())) {
    await checkbox.check();
  }

  await expect(checkbox).toBeChecked();
}

// 🛠️ Function: checks expected alert message
export async function checkAlertMessage(
  page: Page,
  alertMessage: string | RegExp,
) {
  await expect(
    page.getByRole("alert").filter({ hasText: alertMessage }),
  ).toBeVisible();
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
      expect(visible).toBeTruthy();
      if (readonly) {
        expect(disabled).toBeTruthy();
        expect(editable).toBeFalsy();
      } else {
        expect(disabled).toBeFalsy();
        expect(editable).toBeTruthy();
      }
    }),
  );
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
  const cell = row.locator(`[role="gridcell"]${selector}`).first();
  return cell;
}

// 🛠️ Function: find the nth row where a unique value resides in a given column and return that row Locator
export async function getRowByUniqueCellValue(
  page: Page,
  uniqueCellDataField: string,
  uniqueCellValue: string,
): Promise<Locator | null> {
  const table = page.locator(".MuiDataGrid-root");
  const rows = await table.locator('[role="row"]').all();
  const indexStart = 1; // skip header row

  for (let i = indexStart; i < rows.length; i++) {
    const row = rows[i];
    const uniqueCell = await getRowCellBySelector(
      row,
      `[data-field="${uniqueCellDataField}"]`,
    );
    const text = (await uniqueCell.textContent())?.trim() || "";
    if (text === uniqueCellValue) {
      return row;
    }
  }
  return null; // uniqueCellValue not found
}

// 🛠️ Function: fills required form fields correctly
export async function fillRequiredFormFields(
  page: Page,
  fieldLabels: string[],
  values: { [key: string]: string },
  mode: "fill" | "read" = "fill",
) {
  for (const labelText of fieldLabels) {
    const inputFields = page.getByLabel(labelText);
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
      const text = page.getByText(expectedValue, { exact: true });
      await expect(text).toBeVisible();
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

export async function getBrowser() {
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
  return browser;
}

export function getStorageStateForRole(role: string) {
  const envKey = `E2E_${role.toUpperCase()}_STORAGE_STATE`;
  const processEnv = process.env[envKey];

  return JSON.parse(processEnv as string);
}

// 🛠️ Function: calls api to seed database with data for workflow tests
export async function setupTestEnvironment(
  workFlow?: string,
  truncateOnly?: boolean,
) {
  const browser = await getBrowser();
  const context = await browser.newContext();
  const url = workFlow
    ? `${baseUrlSetup}?workflow=${workFlow}`
    : truncateOnly
      ? `${baseUrlSetup}?truncate_only=true`
      : baseUrlSetup;

  const response: APIResponse = await context.request.get(url);

  // Wait for the response and check for success status text and code (e.g., 200)
  expect(await response.text()).toBe(MessageTextResponse.SETUP_SUCCESS);
  expect(response.status()).toBe(200);
}

// helper: wait until page is "screenshot-safe"
async function waitForPageToBeScreenshotSafe(
  page: Page,
  quietMs = 700,
  maxRounds = 12,
) {
  if (page.isClosed()) return;

  // Never proceed on about:blank
  if (page.url() === "about:blank") {
    await page.waitForURL((url) => url.toString() !== "about:blank");
  }

  // Ensure at least a document exists
  await page.waitForLoadState("domcontentloaded").catch(() => {});

  // Best-effort "load" – important for full navigations/redirects.
  await page.waitForLoadState("load", { timeout: 10_000 }).catch(() => {});

  //  Require a quiet window with:
  // - no framenavigated events AND
  // - page.url() not changing
  for (let i = 0; i < maxRounds; i++) {
    if (page.isClosed()) return;

    const urlBefore = page.url();

    const navigatedDuringWindow = await Promise.race([
      page.waitForEvent("framenavigated").then(() => true),
      page.waitForTimeout(quietMs).then(() => false),
    ]);

    const urlAfter = page.url();

    if (!navigatedDuringWindow && urlBefore === urlAfter) break;
  }

  // Ensure root exists in the current document/frame
  await page
    .locator("html")
    .waitFor({ state: "attached" })
    .catch(() => {});
}

export async function openNewBrowserContextAs(role: string) {
  const browser = await getBrowser();
  const storageState = await getStorageStateForRole(role);
  const context = await browser.newContext({ storageState });
  const newPage = await context.newPage();
  return newPage;
}

export async function waitForElementToStabilize(page: Page, selector: string) {
  if (page.isClosed()) return;

  await waitForPageToBeScreenshotSafe(page);

  const loc = page.locator(selector);
  await loc.waitFor({ state: "attached" });

  // settle buffer
  await page.waitForTimeout(150);
}

export async function takeStabilizedScreenshot(
  happoScreenshot: any,
  page: Page,
  happoArgs: { component: string; variant: string; targets?: string[] },
) {
  if (!happoScreenshot) return;
  if (page.isClosed()) return;

  const { component, variant, targets } = happoArgs;

  for (let attempt = 0; attempt < 3; attempt++) {
    // Define handler inside the loop so we can unroute it reliably.
    const blockDocumentNavigations = (route: any) => {
      const req = route.request();
      // Only block real document navigations that would replace the frame.
      if (req.resourceType() === "document" && req.isNavigationRequest()) {
        return route.abort();
      }
      return route.continue();
    };

    try {
      // Your existing “settle” gates (keep them)
      await waitForPageToBeScreenshotSafe(page);
      await waitForElementToStabilize(page, "html");

      const html = page.locator("html");
      await html.waitFor({ state: "attached" });

      // ✅ Critical: prevent late redirects from detaching the frame DURING Happo
      await page.route("**/*", blockDocumentNavigations);

      await happoScreenshot(html, { component, variant, targets });
      return;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);

      if (
        !/Frame has been detached|Target closed|Page closed/i.test(msg) ||
        attempt === 2
      ) {
        throw e;
      }

      // small backoff before retry
      await page.waitForTimeout(300);
    } finally {
      // Always remove the route so it doesn’t affect the rest of the test.
      try {
        await page.unroute("**/*", blockDocumentNavigations);
      } catch {
        // ignore if page already closed
      }
    }
  }
}

export async function stabilizeGrid(page: Page, expectedRowCount: number) {
  await tableHasExpectedRowCount(page, expectedRowCount);
}

export async function stabilizeAccordion(
  page: Page,
  expectedArrowDropdownCount: number,
) {
  await waitForElementToStabilize(page, "section");
  const arrowDropDownElements = page.locator(
    `[data-testid=${DataTestID.ARROW_DROPDOWN_ICON}]`,
  );
  expect(await arrowDropDownElements.count()).toBe(expectedArrowDropdownCount);
  await waitForElementToStabilize(page, "section");
}

export async function assertSuccessfulSnackbar(
  page: Page,
  message: string | RegExp,
) {
  const snackbarLocator = page
    .locator(".MuiSnackbarContent-root")
    .getByText(message);
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
    } catch (_error) {
      // eslint-disable-next-line no-console
      console.warn(`Click failed. Retrying... Attempt ${i}/${retries}`);
    }
  }
}

export async function linkIsVisible(
  page: Page,
  text: string,
  visible: boolean,
  exact?: boolean,
) {
  if (exact === undefined) exact = false;
  const link = page.getByRole("link", { name: text, exact: exact });
  await expect(link).toBeVisible({ visible: visible });
  return link;
}

export async function waitForSpinner(row: Locator) {
  const spinner = row.locator('svg[aria-label="loading"]').first();
  await expect(spinner).toBeVisible();
  await expect(spinner).toBeHidden();
}

// This is specifically for a combobox that does not allow manual entries (MUI Select)
export async function selectItemFromMuiSelect(
  page: Page,
  choice: string | RegExp,
  xPath?: string,
  exactChoice: boolean = false,
) {
  let roleCell;
  if (xPath) roleCell = page.locator(xPath);
  else roleCell = page.locator(".MuiSelect-select");
  await expect(roleCell).toBeVisible();
  await roleCell.click();
  const optionsContainer = page.locator(".MuiList-root");
  await expect(optionsContainer).toBeVisible();
  const option = optionsContainer.getByRole("option", {
    name: choice,
    exact: exactChoice,
  });
  await expect(option).toBeVisible();
  await option.click();
}

export async function selectItemFromAutocomplete(
  page: Page,
  choice: string,
  selector?: string,
  exactChoice: boolean = false,
) {
  let container;

  if (selector) container = page.locator(selector);
  else container = page.locator(".MuiAutocomplete-input");
  await expect(container).toBeVisible();
  await container.click();
  const optionsPopper = page.locator(".MuiAutocomplete-listbox");
  await expect(optionsPopper).toBeVisible();
  const option = optionsPopper.getByRole("option", {
    name: choice,
    exact: exactChoice,
  });
  await expect(option).toBeVisible();
  await option.click();
}

export function urlIsCorrect(page: Page, expectedPath: string) {
  const currentUrl = page.url();
  expect(currentUrl.toLowerCase()).toMatch(expectedPath.toLowerCase());
}

// 🛠️ Function: checks if the breadcrumb contains the specified text using getByText
export async function checkBreadcrumbText(
  page: Page,
  expectedText: string | RegExp,
) {
  const breadcrumbLocator = page.locator('nav[aria-label="breadcrumbs"]');
  const textLocator = breadcrumbLocator.getByText(expectedText);
  await expect(textLocator).toBeVisible();
}

export async function searchGridByUniqueValue(
  page: Page,
  field: string | RegExp,
  value: string,
) {
  await page.getByLabel(field).getByPlaceholder("Search").fill(value);
  const row = page.getByRole("row").filter({ hasText: value });
  await expect(row.first()).toBeVisible();
  return row;
}

export async function uploadFile(page: Page, index: number) {
  // Our file widget has been customized, so the upload button isn't attached to the input. We select by index to get around this.
  const fileChooserPromise = page.waitForEvent("filechooser");

  const uploadButton = page
    .getByRole("button", { name: /upload+/i })
    .nth(index);

  await uploadButton.click();

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, "../docs/test.pdf"));
}

export async function assertConfirmationModal(
  page: Page,
  header: string | RegExp,
  message: string | RegExp,
  button: string | RegExp,
) {
  // assert visibility of header
  await expect(page.getByText(header)).toBeVisible();

  // assert visibility of message
  await expect(page.getByText(message)).toBeVisible();

  // assert visibility of button
  await expect(page.getByRole("button", { name: button })).toBeVisible();
}

export async function assertFieldVisibility(
  page: Page,
  fields: string[],
  visible: boolean,
) {
  for (const field of fields) {
    await expect(page.getByText(field)).toBeVisible({
      visible: visible,
    });
  }
}

/**
 * Extracts the compliance report version ID (CRV ID) from a URL.
 * Supports routes containing `/compliance-summaries/:id`,
 * `/compliance-report-versions/:id`, or `?complianceReportVersionId=:id`.
 */
export function getCrvIdFromUrl({ url }: { url: string }): number {
  const match =
    url.match(/compliance-summaries\/(\d+)\b/) ??
    url.match(/compliance-report-versions\/(\d+)\b/) ??
    url.match(/[?&]complianceReportVersionId=(\d+)\b/);

  if (!match) throw new Error(`Could not extract crvId from URL: ${url}`);
  return Number(match[1]);
}

/**
 * Wait until the grid is actually "ready":
 * - GRID_ROOT exists
 * - root + role=grid visible
 * - (optional) progressbar/spinner is gone
 * - at least one gridcell exists
 *
 * Tolerates re-mounts (e.g. HMR) with re-check of counts on every attempt
 */
export async function waitForGridReady(
  page: Page,
  options?: { timeout?: number },
): Promise<void> {
  const timeout = options?.timeout ?? 30_000;

  await expect(async () => {
    const rootCount = await page.locator(GRID_ROOT).count();
    expect(rootCount).toBeGreaterThan(0);

    const grid = page.locator(GRID_ROOT);
    await expect(grid).toBeVisible();

    const progressbar = grid.locator('[role="progressbar"]');
    const anyCell = grid.locator('[role="gridcell"]').first();

    if ((await progressbar.count()) > 0) {
      await expect(progressbar).toBeHidden();
    }

    await expect(anyCell).toBeVisible();
  }).toPass({ timeout });
}

export async function getGridRowByText(
  page: Page,
  rowText: string | RegExp,
): Promise<Locator> {
  await waitForGridReady(page, { timeout: 30_000 });

  const grid = page.locator(GRID_ROOT).first().locator('[role="grid"]').first();
  const row = grid.getByRole("row").filter({ hasText: rowText }).first();

  await expect(async () => {
    const matchingRowCount = await row.count();
    const totalRowCount = await grid.getByRole("row").count();

    expect(totalRowCount).toBeGreaterThan(0);
    expect(matchingRowCount).toBeGreaterThan(0);
    await expect(row).toBeVisible();

    const cellCount = await row.locator('[role="gridcell"]').count();
    expect(cellCount).toBeGreaterThan(0);
  }).toPass({ timeout: 30_000 });

  return row;
}
