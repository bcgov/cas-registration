import { expect } from "@playwright/test";
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import { FrontendMessages } from "@bciers/utils/src/enums";
import { FacilityPOM } from "@/administration-e2e/poms/facility";
import {
  FacilityButtonText,
  FacilityE2EValue,
  FacilityFormField,
  FacilityType,
  LfoPageLocators,
  SfoPageLocators,
} from "@/administration-e2e/utils/enums";
import {
  analyzeAccessibility,
  assertSuccessfulSnackbar,
  checkAlertMessage,
  checkBreadcrumbText,
  clickButton,
  fillComboxboxWidget,
  fillInputValueByLabel,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";

const test = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });

test.describe("Add/edit facility", () => {
  test("Verify that SFO has no Add Facility button and required-field validation exists", async ({
    page,
  }) => {
    const facilityPage = new FacilityPOM(page);
    await facilityPage.route();

    // 🛸 Locate Bugle SFO via the Operations grid search
    let row = await facilityPage.searchOperationByName(
      FacilityE2EValue.SFO_OPERATION_WITH_FACILITY,
    );

    // Navigate to the facility page
    const viewFacilityLink = row
      .first()
      .getByRole("link", { name: "View Facility", exact: true });
    await expect(viewFacilityLink).toBeVisible();
    await viewFacilityLink.click();
    await page.waitForLoadState();

    // Verify that SFO operations do not have Add Facility button
    await expect(
      page.getByRole("button", { name: FacilityButtonText.ADD_FACILITY }),
    ).toBeHidden();
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();

    for (const id of Object.values(SfoPageLocators)) {
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(`#${id}`)).toHaveClass(/read-only/i);
    }

    // Edit: Facility name, type, and province stays as read-only widget
    await clickButton(page, /edit/i);

    const {
      name: nameId,
      type: typeId,
      province: provinceId,
      ...editableFieldIds
    } = SfoPageLocators;
    for (const id of Object.values(editableFieldIds)) {
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(`#${id}`)).not.toHaveClass(/read-only/i);
    }

    await expect(page.locator(`#${nameId}`)).toHaveClass(/read-only/i);
    await expect(page.locator(`#${typeId}`)).toHaveClass(/read-only/i);
    await expect(page.locator(`#${provinceId}`)).toHaveClass(/read-only/i);

    await fillInputValueByLabel(
      page,
      FacilityFormField.MUNICIPALITY,
      FacilityE2EValue.TEMP_MUNICIPALITY,
    );

    // Cancel discards the change and routes back to the Operations grid
    await clickButton(page, /cancel/i);
    await page.waitForLoadState();
    await expect(page).toHaveURL(/operations/i);

    // Go back to the facility page (re-search — Cancel's route change remounts
    // the Operations grid, so any prior search-box state is gone)
    row = await facilityPage.searchOperationByName(
      FacilityE2EValue.SFO_OPERATION_WITH_FACILITY,
    );
    await row
      .first()
      .getByRole("link", { name: "View Facility", exact: true })
      .click();
    await page.waitForLoadState();

    // Make changes to the form
    await clickButton(page, /edit/i);
    await fillInputValueByLabel(
      page,
      FacilityFormField.MUNICIPALITY,
      FacilityE2EValue.TEMP_MUNICIPALITY,
    );
    await clickButton(page, /save/i);
    await assertSuccessfulSnackbar(page, FrontendMessages.SUBMIT_CONFIRMATION);

    // Required-field validation: clear latitude (a required field) and save
    await clickButton(page, /edit/i);
    await fillInputValueByLabel(page, FacilityFormField.LATITUDE, "");
    await clickButton(page, /save/i);
    await checkAlertMessage(
      page,
      "This form can't be saved yet. Please fix the errors above.",
    );

    // Required-field validation: enter value for latitude, clear longitude and save
    await fillInputValueByLabel(page, FacilityFormField.LATITUDE, "1");
    await fillInputValueByLabel(page, FacilityFormField.LONGITUDE, "");
    await clickButton(page, /save/i);
    await checkAlertMessage(
      page,
      "This form can't be saved yet. Please fix the errors above.",
    );

    // Required-field validation: fill out required fields and save
    await fillInputValueByLabel(page, FacilityFormField.LONGITUDE, "1");
    await clickButton(page, /save/i);
    await assertSuccessfulSnackbar(page, FrontendMessages.SUBMIT_CONFIRMATION);
  });

  test("Verify that LFO has Add Facility button, editing works, and required-field validation exists", async ({
    page,
  }) => {
    const facilityPage = new FacilityPOM(page);
    await facilityPage.route();

    // 🛸 Locate Banana LFO via the Operations grid, then its Facilities grid
    await facilityPage.goToOperationFacilities(
      FacilityE2EValue.LFO_OPERATION_WITH_FACILITIES,
      /view facilities/i,
    );

    await expect(
      page.getByRole("button", { name: FacilityButtonText.ADD_FACILITY }),
    ).toBeVisible();

    // Locate a specific facility via the Facilities grid search
    await facilityPage.searchFacilitiesGrid(
      /bc ghg id/i,
      FacilityE2EValue.LFO_EDIT_FACILITY_BCGHG_ID,
    );
    await facilityPage.openFacilityFromGrid(
      FacilityE2EValue.LFO_EDIT_FACILITY_NAME,
    );
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();

    // Edit: change type, Cancel discards it and routes back to the Facilities grid
    await clickButton(page, /edit/i);
    await fillComboxboxWidget(
      page,
      FacilityFormField.TYPE,
      FacilityType.SMALL_AGGREGATE,
    );
    await clickButton(page, /cancel/i);
    await page.waitForLoadState();

    // Verify that clicking Cancel from facility form routes back to Facilities grid
    await facilityPage.searchFacilitiesGrid(
      /bc ghg id/i,
      FacilityE2EValue.LFO_EDIT_FACILITY_BCGHG_ID,
    );
    await facilityPage.openFacilityFromGrid(
      FacilityE2EValue.LFO_EDIT_FACILITY_NAME,
    );

    for (const id of Object.values(LfoPageLocators)) {
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(`#${id}`)).toHaveClass(/read-only/i);
    }

    await clickButton(page, /edit/i);
    const { province: provinceId, ...editableFieldIds } = LfoPageLocators;
    for (const id of Object.values(editableFieldIds)) {
      await expect(page.locator(`#${id}`)).toBeVisible();
      await expect(page.locator(`#${id}`)).not.toHaveClass(/read-only/i);
    }
    await expect(page.locator(`#${provinceId}`)).toHaveClass(/read-only/i);

    await fillComboxboxWidget(page, FacilityFormField.TYPE, FacilityType.LARGE);
    await clickButton(page, /save/i);
    await assertSuccessfulSnackbar(page, FrontendMessages.SUBMIT_CONFIRMATION);

    // Go back to the Facilities grid to click Add Facility button
    await clickButton(page, /back/i);
    await page.waitForLoadState();

    // Required-field validation on the create flow
    await facilityPage.clickAddFacility();
    await clickButton(page, /save/i);
    await checkAlertMessage(
      page,
      "This form can't be saved yet. Please fix the errors above.",
    );
  });

  test("LFO — Add Facility happy path creates Large and Small Aggregate facilities", async ({
    page,
    happoScreenshot,
  }) => {
    const facilityPage = new FacilityPOM(page);
    await facilityPage.route();

    // 🛸 Locate Banana LFO via the Operations grid, then its Facilities grid
    await facilityPage.goToOperationFacilities(
      FacilityE2EValue.LFO_OPERATION_WITH_FACILITIES,
      /view facilities/i,
    );

    await facilityPage.clickAddFacility();

    // Fill out for large facility
    await facilityPage.fillAddFacilityForm(
      FacilityE2EValue.NEW_FACILITY_NAME,
      FacilityType.LARGE,
      FacilityE2EValue.NEW_LATITUDE,
      FacilityE2EValue.NEW_LONGITUDE,
    );

    let componentName = "Add Facility form - large facility";
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: componentName,
      variant: "filled",
    });
    await analyzeAccessibility(page, componentName);
    await clickButton(page, /save/i);

    await assertSuccessfulSnackbar(page, FrontendMessages.SUBMIT_CONFIRMATION);
    await expect(page).not.toHaveURL(/add-facility/);

    // The breadcrumb updates to show the new facility's name once created
    await checkBreadcrumbText(page, FacilityE2EValue.NEW_FACILITY_NAME);

    // Fill out for small aggregate
    await clickButton(page, /back/i);
    await page.waitForLoadState();
    await facilityPage.clickAddFacility();

    await facilityPage.fillAddFacilityForm(
      FacilityE2EValue.NEW_SMALL_AGGREGATE_FACILITY_NAME,
      FacilityType.SMALL_AGGREGATE,
    );
    await expect(page.getByLabel(FacilityFormField.LATITUDE)).toHaveCount(0);
    await expect(page.getByLabel(FacilityFormField.LONGITUDE)).toHaveCount(0);

    componentName = "Add Facility form - small aggregate";
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: componentName,
      variant: "filled",
    });
    await clickButton(page, /save/i);
    await assertSuccessfulSnackbar(page, FrontendMessages.SUBMIT_CONFIRMATION);
    await checkBreadcrumbText(
      page,
      FacilityE2EValue.NEW_SMALL_AGGREGATE_FACILITY_NAME,
    );
  });
});
