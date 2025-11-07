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
  searchGridByUniqueValue,
} from "@bciers/e2e/utils/helpers";

const test = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });
test.describe("Test changing registration purpose", () => {
  test("Changes registration purpose from OBPS Regulated Operation to Reporting Operation", async ({
    page,
    happoScreenshot,
  }) => {
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

    let component = "";
    // Say cheese!
    component = "Confirmation to change registration purpose";
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: component,
      variant: "default",
    });

    // Confirm registration purpose change
    await clickButton(page, changeRegistrationPurposeButton);

    // Assert visible fields are expected based on registration purpose
    await operationPage.assertCorrectFieldsAreVisible(registrationPurpose);
    await expect(
      page.locator(registrationPurposeXPath).getByText(registrationPurpose),
    ).toBeVisible();

    // Upload missing files to prevent error when saving
    await uploadFile(page, 0);
    await uploadFile(page, 1);

    // Click Save
    await clickButton(page, "Save");
    await assertSuccessfulSnackbar(
      page,
      "All changes have been successfully saved",
    );

    // Say cheese!
    component = "Changed registration purpose to Reporting Operation";
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: component,
      variant: "default",
    });
  });

  test("Attempts to change registration purpose from OBPS Regulated Operation to EIO", async ({
    page,
    happoScreenshot,
  }) => {
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
    await operationPage.goToOperation(row);

    await checkBreadcrumbText(
      page,
      ChangeRegistrationPurposeE2EValues.REGULATED_OPERATION_NAME,
    );
    await expect(page.getByText(bcghgIdValue)).toBeVisible();

    // Click Edit
    await clickButton(page, "Edit");

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
    const component =
      "Change registration purpose of existing operation to EIO";
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: component,
      variant: "default",
    });
  });

  test("Changes registration purpose from Reporting Operation to OBPS Regulated Operation", async ({
    page,
    happoScreenshot,
  }) => {
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
    await operationPage.goToOperation(row);

    await checkBreadcrumbText(
      page,
      ChangeRegistrationPurposeE2EValues.REPORTING_OPERATION_NAME,
    );
    await expect(page.getByText(bcghgIdValue)).toBeVisible();

    // Click Edit
    await clickButton(page, "Edit");

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

    // Say cheese!
    const component =
      "Changed registration purpose to OBPS Regulated Operation";

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: component,
      variant: "default",
    });
  });

  test("Attempts to change registration purpose from EIO to Regulated Operation", async ({
    page,
    happoScreenshot,
  }) => {
    // 🛸 Navigate to operation page
    const operationPage = new OperationPOM(page);
    await operationPage.route();
    await urlIsCorrect(page, operationPage.operationsUrl);

    // Look for operation by operation name
    const row = await searchGridByUniqueValue(
      page,
      /operation name/i,
      ChangeRegistrationPurposeE2EValues.EIO_OPERATION_NAME,
    );
    await stabilizeGrid(page, 1);

    // Go to operation details page
    await operationPage.goToOperation(row);
    await checkBreadcrumbText(
      page,
      ChangeRegistrationPurposeE2EValues.EIO_OPERATION_NAME,
    );

    // Click Edit
    await clickButton(page, "Edit");

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

    // Confirm registration purpose change
    await clickButton(page, changeRegistrationPurposeButton);

    // To prevent other errors when saving
    await uploadFile(page, 0);
    await uploadFile(page, 1);
    await fillComboxboxWidget(page, /regulated product+/i, "Gypsum wallboard");
    await fillComboxboxWidget(
      page,
      /reporting activities+/i,
      "Cement production",
    );

    // Assert visible fields are expected based on registration purpose
    await operationPage.assertCorrectFieldsAreVisible(registrationPurpose);

    // Assert registration purpose has changed
    await expect(
      page.locator(registrationPurposeXPath).getByText(registrationPurpose),
    ).toBeVisible();

    // Assert operation type dropdown is disabled
    await expect(page.locator(operationPage.operationTypeXPath)).toBeDisabled();

    // Click Save
    await clickButton(page, "Save");
    await checkAlertMessage(page, /select a operation type/i);

    // Say cheese!
    const component = "Change registration purpose of existing EIO";
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: component,
      variant: "default",
    });
  });
});
