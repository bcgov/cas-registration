import { Page, expect, Locator } from "@playwright/test";
// ☰ Enums
import { DataTestID } from "@/e2e/utils/enums";

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

export async function clickViewDetailsButton(
  page: Page,
  childIndex: number = 0,
) {
  const viewDetailsButtons = page.getByRole("link", {
    name: /view details/i,
  });
  await viewDetailsButtons.nth(childIndex).click();
}

export async function checkFormHeaders(page: Page, formHeaders: string[]) {
  for (const header of formHeaders) {
    await expect(page.getByRole("button", { name: header })).toBeVisible();
  }
}

export async function checkFormHeaderIsCollapsed(
  page: Page,
  formHeader: string,
) {
  await expect(page.getByRole("button", { name: formHeader })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
}

export async function disabledAndNotEditable(fields: Locator[]) {
  for (const field of fields) {
    await expect(field).toBeDisabled();
    await expect(field).not.toBeEditable();
  }
}

export async function getModal(page: Page) {
  return page.locator(DataTestID.MODAL);
}

export async function getModalConfirmButton(modal: Locator) {
  return modal.locator("button[aria-label='Confirm']");
}

export async function getModalCancelButton(modal: Locator) {
  return modal.locator("button[aria-label='Cancel']");
}

export async function getApproveButton(page: Page) {
  const approveButton = page.locator(
    "button[aria-label='Approve application']",
  );
  return approveButton;
}

export async function getRejectButton(page: Page) {
  const rejectButton = page.locator("button[aria-label='Reject application']");
  return rejectButton;
}

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

export async function checkAlertMessage(
  page: Page,
  alertMessage: string | RegExp,
  index: number = 0,
) {
  await expect(page.getByRole("alert").nth(index)).toHaveText(alertMessage);
}
