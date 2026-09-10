import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { FacilityPOM } from "@/administration-e2e/poms/facility";
import { OperationPOM } from "@/administration-e2e/poms/operation";
import {
  FacilityE2EValue,
  FacilityFormErrorMessages,
  FacilityFormField,
  FacilityType,
} from "@/administration-e2e/utils/enums";
import {
  analyzeAccessibility,
  assertSuccessfulSnackbar,
  checkBreadcrumbText,
  clickButton,
  fillComboxboxWidget,
  fillInputValueByLabel,
  stabilizeGrid,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { FacilityTypes, FrontendMessages } from "@bciers/utils/src/enums";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });

test.describe("SFO", () => {
  let facilityPage: FacilityPOM;
  let operationPage: OperationPOM;

  test.beforeEach(async ({ page }) => {
    facilityPage = new FacilityPOM(page);
    operationPage = new OperationPOM(page);
    await operationPage.route();

    // 🛸 Locate Bugle SFO via the Operations grid search
    const row = await operationPage.searchOperationByName(
      FacilityE2EValue.SFO_OPERATION_WITH_FACILITY,
    );

    // Navigate to the facility page
    const viewFacilityLink = row
      .first()
      .getByRole("link", { name: "View Facility", exact: true });
    await expect(viewFacilityLink).toBeVisible();
    await viewFacilityLink.click();
    await checkBreadcrumbText(page, FacilityE2EValue.SFO_FACILITY_NAME);
  });

  test("should enforce permissions and validate field states across modes", async () => {
    // 1. Initial Load: Verify view-only permissions and all fields read-only
    await facilityPage.assertAddFacilityButtonVisible(false);
    await facilityPage.assertEditButtonVisible();
    await facilityPage.assertFieldsReadOnly(FacilityTypes.SFO);

    // 2. Edit Mode: Enter edit mode and verify granular field editability rules
    await facilityPage.clickEdit();
    await facilityPage.assertFieldStates(FacilityTypes.SFO);
  });

  test("should discard changes and route back to operations grid on cancel", async ({
    page,
  }) => {
    await facilityPage.assertEditButtonVisible();

    await facilityPage.clickEdit();
    await fillInputValueByLabel(
      page,
      FacilityFormField.MUNICIPALITY,
      FacilityE2EValue.TEMP_MUNICIPALITY,
    );

    // Cancel discards the change and routes back to the Operations grid
    await facilityPage.clickCancel();
    await expect(page).toHaveURL(/operations/i);

    // Go back to the facility page (re-search — Cancel's route change remounts
    // the Operations grid, so any prior search-box state is gone)
    const row = await operationPage.searchOperationByName(
      FacilityE2EValue.SFO_OPERATION_WITH_FACILITY,
    );
    await row
      .first()
      .getByRole("link", { name: "View Facility", exact: true })
      .click();
    await checkBreadcrumbText(page, FacilityE2EValue.SFO_FACILITY_NAME);

    // Verify temporary change was not saved
    await facilityPage.assertValueVisible(
      FacilityE2EValue.TEMP_MUNICIPALITY,
      false,
    );
  });

  test("should successfully save modifications", async ({ page }) => {
    await facilityPage.assertEditButtonVisible();

    await facilityPage.clickEdit();
    await fillInputValueByLabel(
      page,
      FacilityFormField.MUNICIPALITY,
      FacilityE2EValue.TEMP_MUNICIPALITY,
    );
    await clickButton(page, /save/i);
    await assertSuccessfulSnackbar(page, FrontendMessages.SUBMIT_CONFIRMATION);

    // Verify municipality change was saved
    await facilityPage.assertValueVisible(
      FacilityE2EValue.TEMP_MUNICIPALITY,
      true,
    );
  });

  test("should validate required fields and successfully save when resolved", async ({
    page,
    happoScreenshot,
  }) => {
    await checkBreadcrumbText(page, FacilityE2EValue.SFO_FACILITY_NAME);
    await facilityPage.assertEditButtonVisible();

    // Required-field validation: clear latitude (a required field) and save
    await facilityPage.clickEdit();
    await facilityPage.setCoordinates("", "-123.5");
    await facilityPage.saveExpectingValidationError(
      FacilityFormErrorMessages.LATITUDE_ERROR,
    );

    // Required-field validation: enter value for latitude, clear longitude and save
    await facilityPage.setCoordinates("1", "");
    await facilityPage.saveExpectingValidationError(
      FacilityFormErrorMessages.LONGITUDE_ERROR,
    );

    // Required-field validation: fill out required fields and save
    await facilityPage.setCoordinates("1", "1");

    const componentName = "SFO - Edit facility form";
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: componentName,
      variant: "filled",
    });
    await analyzeAccessibility(page, componentName);

    await facilityPage.saveSuccessfully();
  });
});

test.describe("LFO", () => {
  let facilityPage: FacilityPOM;
  let operationPage: OperationPOM;

  test.beforeEach(async ({ page }) => {
    facilityPage = new FacilityPOM(page);
    operationPage = new OperationPOM(page);
    await operationPage.route();

    // 🛸 Locate Bees LFO via the Operations grid, then its Facilities grid
    const operationRow = await operationPage.searchOperationByName(
      FacilityE2EValue.LFO_OPERATION_WITH_FACILITIES,
    );
    await facilityPage.goToOperationFacilities(
      operationRow,
      /view facilities/i,
    );
  });

  test("should enforce permissions and allow adding facilities on initial load", async () => {
    await facilityPage.assertAddFacilityButtonVisible(true);
  });

  test("should enforce permissions and validate field states across modes", async () => {
    await facilityPage.openFacilityByName(
      FacilityE2EValue.LFO_EDIT_FACILITY_NAME,
    );
    await facilityPage.assertEditButtonVisible();
    await facilityPage.assertFieldsReadOnly(FacilityTypes.LFO);

    await facilityPage.clickEdit();
    await facilityPage.assertFieldStates(FacilityTypes.LFO);
  });

  test("should discard changes and route back to facilities grid on cancel", async ({
    page,
  }) => {
    await facilityPage.openFacilityByName(
      FacilityE2EValue.LFO_EDIT_FACILITY_NAME,
    );
    await facilityPage.assertEditButtonVisible();

    // Edit: change name, Cancel discards it and routes back to the Facilities grid
    await facilityPage.clickEdit();
    await fillInputValueByLabel(
      page,
      FacilityFormField.NAME,
      FacilityE2EValue.LFO_NEW_FACILITY_NAME,
    );
    await facilityPage.clickCancel();

    // Verify that clicking Cancel from facility form routes back to Facilities grid
    await stabilizeGrid(page, 1);

    // Verify facility name change was discarded
    await facilityPage.openFacilityByName(
      FacilityE2EValue.LFO_EDIT_FACILITY_NAME,
    );
    await facilityPage.assertValueVisible(
      FacilityE2EValue.LFO_EDIT_FACILITY_NAME,
      true,
    );
  });

  test("should successfully save modifications", async ({ page }) => {
    await facilityPage.openFacilityByName(
      FacilityE2EValue.LFO_EDIT_FACILITY_NAME,
    );
    await facilityPage.assertEditButtonVisible();

    await facilityPage.clickEdit();
    await fillInputValueByLabel(
      page,
      FacilityFormField.MUNICIPALITY,
      FacilityE2EValue.TEMP_MUNICIPALITY,
    );
    await clickButton(page, /save/i);
    await assertSuccessfulSnackbar(page, FrontendMessages.SUBMIT_CONFIRMATION);

    // Verify municipality change was saved
    await facilityPage.assertValueVisible(
      FacilityE2EValue.TEMP_MUNICIPALITY,
      true,
    );
  });

  test("should validate required fields and successfully save when resolved", async ({
    page,
  }) => {
    await facilityPage.openFacilityByName(
      FacilityE2EValue.LFO_EDIT_FACILITY_NAME,
    );
    await facilityPage.assertEditButtonVisible();
    await facilityPage.clickEdit();
    await facilityPage.assertFieldStates(FacilityTypes.LFO);

    await fillComboxboxWidget(page, FacilityFormField.TYPE, FacilityType.LARGE);

    const facilityNameField = page.getByLabel(FacilityFormField.NAME);
    await facilityNameField.fill("");
    await clickButton(page, /save/i);
    await facilityPage.saveExpectingValidationError(
      FacilityFormErrorMessages.FACILITY_NAME_ERROR,
    );

    await facilityNameField.fill(FacilityE2EValue.LFO_EDIT_FACILITY_NAME);
    await facilityPage.saveSuccessfully();
  });

  test("should create a Large facility and update breadcrumbs", async ({
    page,
    happoScreenshot,
  }) => {
    await facilityPage.clickAddFacility();
    await facilityPage.stabilizeFacilityForm();

    // Fill out for large facility
    await facilityPage.fillAddFacilityForm(
      FacilityE2EValue.NEW_FACILITY_NAME,
      FacilityType.LARGE,
      FacilityE2EValue.NEW_LATITUDE,
      FacilityE2EValue.NEW_LONGITUDE,
    );

    const componentName = "Add Facility form - large facility";
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: componentName,
      variant: "filled",
    });
    await analyzeAccessibility(page, componentName);
    await facilityPage.saveSuccessfully();
    await page.waitForURL(
      new RegExp(encodeURIComponent(FacilityE2EValue.NEW_FACILITY_NAME), "i"),
    );

    // The breadcrumb updates to show the new facility's name once created
    await checkBreadcrumbText(page, FacilityE2EValue.NEW_FACILITY_NAME);
  });

  test("should conditionally hide coordinates when creating a Small Aggregate facility", async ({
    page,
    happoScreenshot,
  }) => {
    await facilityPage.clickAddFacility();
    await facilityPage.stabilizeFacilityForm();

    await facilityPage.fillAddFacilityForm(
      FacilityE2EValue.NEW_SMALL_AGGREGATE_FACILITY_NAME,
      FacilityType.SMALL_AGGREGATE,
    );
    await expect(page.getByLabel(FacilityFormField.LATITUDE)).toBeHidden();
    await expect(page.getByLabel(FacilityFormField.LONGITUDE)).toBeHidden();

    const componentName = "Add Facility form - small aggregate";
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: componentName,
      variant: "filled",
    });

    await facilityPage.saveSuccessfully();
    await page.waitForURL(
      new RegExp(
        encodeURIComponent(FacilityE2EValue.NEW_SMALL_AGGREGATE_FACILITY_NAME),
        "i",
      ),
    );
    await checkBreadcrumbText(
      page,
      FacilityE2EValue.NEW_SMALL_AGGREGATE_FACILITY_NAME,
    );
  });
});
