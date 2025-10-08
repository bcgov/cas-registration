// 🧪 Suite to test the administration industry_user workflow
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { expect } from "@playwright/test";
// 🪄 Page Object Models
import { OperationPOM } from "@/administration-e2e/poms/operation";
// ☰ Enums
import {
  ChangeRegistrationPurposeE2EValues,
  RegistrationPurposes,
} from "@/administration-e2e/utils/enums";
import { UserRole } from "@bciers/e2e/utils/enums";
// 🛠️ Helpers
import {
  assertSuccessfulSnackbar,
  checkBreadcrumbText,
  clickButton,
  selectItemFromMuiSelect,
  stabilizeGrid,
  urlIsCorrect,
  takeStabilizedScreenshot,
  uploadFile,
  checkAlertMessage,
  fillDropdownByLabel,
  fillComboxboxWidget,
  assertConfirmationModal,
} from "@bciers/e2e/utils/helpers";

const happoPlaywright = require("happo-playwright");
const test = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });
test.describe("Test changing registration purpose", () => {
  test("OBPS Regulated Operation to Reporting Operation", async ({ page }) => {
    // 🛸 Navigate to operation page
    const operationPage = new OperationPOM(page);
    await operationPage.route();
    await urlIsCorrect(page, operationPage.operationsUrl);
    const bcghgIdValue =
      ChangeRegistrationPurposeE2EValues.REGULATED_BCGHG_ID_FIELD_VALUE;

    // Look for operation by BCGHG ID
    const row = await operationPage.findRowByBcghgId(
      ChangeRegistrationPurposeE2EValues.REGULATED_BCGHG_ID_FIELD_VALUE,
    );

    // Go to operation details page
    await operationPage.goToOperation(row);
    await checkBreadcrumbText(
      page,
      ChangeRegistrationPurposeE2EValues.REGULATED_OPERATION_NAME,
    );
    await expect(page.getByText(bcghgIdValue)).toBeVisible();

    // Click Edit
    await clickButton(page, "Edit");

    let component = "";
    // Set and use registrationPurpose via OperationPOM getter/setter
    const registrationPurpose = RegistrationPurposes.REPORTING_OPERATION;
    const registrationPurposeXPath = operationPage.registrationPurposeXPath;
    await selectItemFromMuiSelect(
      page,
      registrationPurpose,
      registrationPurposeXPath,
      true,
    );

    // Assert confirmation modal appears
    const changeRegistrationPurposeButton =
      ChangeRegistrationPurposeE2EValues.CHANGE_REG_PURPOSE_BTN;
    await assertConfirmationModal(
      page,
      "Confirmation",
      ChangeRegistrationPurposeE2EValues.CONFIRMATION_MODAL_MESSAGE,
      changeRegistrationPurposeButton,
    );

    await expect(
      page.getByRole("button", { name: changeRegistrationPurposeButton }),
    ).toBeVisible();

    // Say cheese!
    component = "Confirmation to change registration purpose";
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: component,
      variant: "default",
    });

    // Confirm registration purpose change
    await clickButton(page, changeRegistrationPurposeButton);

    // Assert Regulated Products not visible
    await expect(page.getByText("Regulated Product Name(s)")).toBeHidden();

    // Assert visible fields are expected based on registration purpose
    await operationPage.assertCorrectFieldsAreVisible(registrationPurpose);
    await expect(
      page.locator(registrationPurposeXPath).getByText(registrationPurpose),
    ).toBeVisible();

    // Say cheese!
    component = "Changed registration purpose to Reporting Operation";
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: component,
      variant: "default",
    });

    // Upload missing files to prevent error when saving
    await uploadFile(page, 0);
    await uploadFile(page, 1);

    // Click Save
    await clickButton(page, "Save");
    await assertSuccessfulSnackbar(
      page,
      "All changes have been successfully saved",
    );
  });

  test("OBPS Regulated Operation to EIO", async ({ page }) => {
    // 🛸 Navigate to operation page
    const operationPage = new OperationPOM(page);
    await operationPage.route();
    await urlIsCorrect(page, operationPage.operationsUrl);
    const bcghgIdValue =
      ChangeRegistrationPurposeE2EValues.REGULATED_BCGHG_ID_FIELD_VALUE;

    // Look for operation by BCGHG ID
    const row = await operationPage.findRowByBcghgId(
      ChangeRegistrationPurposeE2EValues.REGULATED_BCGHG_ID_FIELD_VALUE,
    );
    await stabilizeGrid(page, 1);

    // Go to operation details page
    const viewOperation = await row.getByRole("link", {
      name: "View Operation",
    });
    await viewOperation.click();
    await checkBreadcrumbText(
      page,
      ChangeRegistrationPurposeE2EValues.REGULATED_OPERATION_NAME,
    );
    await expect(page.getByText(bcghgIdValue)).toBeVisible();

    // Click Edit
    await clickButton(page, "Edit");

    let component = "";
    // Set and use registrationPurpose via OperationPOM getter/setter
    const registrationPurpose =
      RegistrationPurposes.ELECTRICITY_IMPORT_OPERATION;
    const registrationPurposeXPath = operationPage.registrationPurposeXPath;
    await selectItemFromMuiSelect(
      page,
      registrationPurpose,
      registrationPurposeXPath,
      true,
    );

    // Assert confirmation modal appears
    const changeRegistrationPurposeButton =
      ChangeRegistrationPurposeE2EValues.CHANGE_REG_PURPOSE_BTN;
    await assertConfirmationModal(
      page,
      "Confirmation",
      ChangeRegistrationPurposeE2EValues.CONFIRMATION_MODAL_MESSAGE,
      changeRegistrationPurposeButton,
    );
    await expect(
      page.getByRole("button", { name: changeRegistrationPurposeButton }),
    ).toBeVisible();

    // Say cheese!
    component = "Confirmation to change registration purpose";
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: component,
      variant: "default",
    });

    // Confirm registration purpose change
    await clickButton(page, changeRegistrationPurposeButton);

    // Update operation type
    await fillDropdownByLabel(page, /operation type+/i, registrationPurpose);

    // Assert visible fields are expected based on registration purpose
    await operationPage.assertCorrectFieldsAreVisible(registrationPurpose);

    // Assert registration purpose has changed
    await expect(
      page.locator(registrationPurposeXPath).getByText(registrationPurpose),
    ).toBeVisible();

    // Click Save
    await clickButton(page, "Save");
    await checkAlertMessage(
      page,
      "Cannot change the type of an operation that has already been registered.",
    );

    // Say cheese!
    component = "Change registration purpose of existing operation to EIO";
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: component,
      variant: "default",
    });
  });

  test("Reporting Operation to OBPS Regulated Operation", async ({ page }) => {
    // 🛸 Navigate to operation page
    const operationPage = new OperationPOM(page);
    await operationPage.route();
    await urlIsCorrect(page, operationPage.operationsUrl);
    const bcghgIdValue =
      ChangeRegistrationPurposeE2EValues.REPORTING_BCGHG_ID_FIELD_VALUE;

    // Look for operation by BCGHG ID
    const row = await operationPage.findRowByBcghgId(
      ChangeRegistrationPurposeE2EValues.REPORTING_BCGHG_ID_FIELD_VALUE,
    );
    await stabilizeGrid(page, 1);

    // Go to operation details page
    const viewOperation = await row.getByRole("link", {
      name: "View Operation",
    });
    await viewOperation.click();
    await checkBreadcrumbText(
      page,
      ChangeRegistrationPurposeE2EValues.REPORTING_OPERATION_NAME,
    );
    await expect(page.getByText(bcghgIdValue)).toBeVisible();

    // Click Edit
    await clickButton(page, "Edit");

    let component = "";
    // Set and use registrationPurpose via OperationPOM getter/setter
    const registrationPurpose = RegistrationPurposes.OBPS_REGULATED_OPERATION;
    const registrationPurposeXPath = operationPage.registrationPurposeXPath;
    await selectItemFromMuiSelect(
      page,
      registrationPurpose,
      registrationPurposeXPath,
      true,
    );

    // Assert confirmation modal appears
    const changeRegistrationPurposeButton =
      ChangeRegistrationPurposeE2EValues.CHANGE_REG_PURPOSE_BTN;
    await assertConfirmationModal(
      page,
      "Confirmation",
      ChangeRegistrationPurposeE2EValues.CONFIRMATION_MODAL_MESSAGE,
      changeRegistrationPurposeButton,
    );
    await expect(
      page.getByRole("button", { name: changeRegistrationPurposeButton }),
    ).toBeVisible();

    // Say cheese!
    component = "Confirmation to change registration purpose";
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: component,
      variant: "default",
    });

    // Confirm registration purpose change
    await clickButton(page, changeRegistrationPurposeButton);

    // Assert visible fields are expected based on registration purpose
    await operationPage.assertCorrectFieldsAreVisible(registrationPurpose);

    // Assert registration purpose has changed
    await expect(
      page.locator(registrationPurposeXPath).getByText(registrationPurpose),
    ).toBeVisible();

    // To prevent error when saving
    await uploadFile(page, 0);
    await uploadFile(page, 1);
    await fillComboxboxWidget(page, /regulated product+/i, "Gypsum wallboard");

    // Click Save
    await clickButton(page, "Save");
    await assertSuccessfulSnackbar(
      page,
      "All changes have been successfully saved",
    );
  });
});
