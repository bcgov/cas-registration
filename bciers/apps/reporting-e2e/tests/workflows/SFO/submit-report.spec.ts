import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { expect } from "@playwright/test";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  FacilityIDs,
  OPERATION_NAMES,
  REPORT_STATUS,
  ReportIDs,
  ReportRoutes,
} from "@/reporting-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { CurrentReportPOM } from "@/reporting-e2e/poms/current-report";
import { SFOFacilityReportPOM } from "@/reporting-e2e/poms/facility-report";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import {
  assertFieldVisibility,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import {
  verifyFormTitle,
  verifyReportHeader,
} from "@/reporting-e2e/utils/helpers";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

test.describe("SFO: create and submit a new report for the current reporting year", () => {
  test("Industry user starts, fills, and submits a new SFO report", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // ── 0. Open the current reporting year so the "Start" button is available ──
    const setup = new ReportSetUpPOM(page);
    await setup.primeReportingYear("open");

    // ── 1. Navigate to the current reports grid ──
    const grid = new CurrentReportsPOM(page);
    await grid.route();

    // ── 2. Click "Start" for Bugle SFO — creates the report and navigates to
    //       review-operation-information ──
    const versionId = await grid.startNewReportForOperation(
      OPERATION_NAMES.BUGLE_SFO,
    );
    const report = new CurrentReportPOM(page);
    const facilityReport = new SFOFacilityReportPOM(
      page,
      FacilityIDs.BUGLE_SFO,
    );

    // ── 3. Review Operation Information ──
    await verifyFormTitle(page, "Review Operation Information");
    await report.verifyBugleSfoOperationInfo();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Review Operation Information",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(report.personResponsibleUrl(versionId), "i"),
    );

    // ── 4. Person Responsible — select "Bill Blue" (contact linked to the op) ──
    await verifyFormTitle(page, "Person Responsible for Submitting Report");
    await report.fillPersonResponsible("Bill Blue");
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Person Responsible",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(report.activitiesUrl(versionId, FacilityIDs.BUGLE_SFO), "i"),
    );

    // ── 5. Activities — GSC with 1 unit, 1 fuel (Diesel), 1 emission (CO2) ──
    await verifyFormTitle(
      page,
      "General stationary combustion excluding line tracing (at SFO)",
    );
    await facilityReport.fillGscActivity();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Activities",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(facilityReport.nonAttributableUrl(), "i"),
    );

    // ── 6. Non-Attributable Emissions (no entries needed) ──
    await verifyFormTitle(page, "Non-Attributable Emissions");
    await facilityReport.fillNonAttributable();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Non-Attributable Emissions",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.EMISSION_SUMMARY}`,
      ),
    );

    // ── 7. Emission Summary (read-only) ──
    await facilityReport.verifyEmissionSummary();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Emission Summary",
      variant: "default",
    });
    await facilityReport.clickContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.PRODUCTION_DATA}`,
      ),
    );

    // ── 8. Production Data — select Cement equivalent, fill annual production ──
    await verifyFormTitle(page, "Production Data");
    await facilityReport.fillProductionData();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Production Data",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.ALLOCATION_OF_EMISSIONS}`,
      ),
    );

    // ── 9. Allocation of Emissions ──
    await verifyFormTitle(page, "Allocation of Emissions");
    await facilityReport.verifyAllocationAlerts();
    await facilityReport.fillAllocationOfEmissions();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Allocation of Emissions",
      variant: "filled",
    });
    await facilityReport.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.ADDITIONAL_REPORTING_DATA}`),
    );

    // ── 10. Additional Reporting Data ──
    await verifyFormTitle(page, "Additional Reporting Data");
    await report.fillAdditionalData();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Additional Reporting Data",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.COMPLIANCE_SUMMARY}`),
    );

    // ── 11. Compliance Summary (read-only) ──
    await report.verifyComplianceSummary();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Compliance Summary",
      variant: "default",
    });
    await report.continue(
      new RegExp(`${versionId}/${ReportRoutes.VALIDATION}`),
    );

    // ── 12. Report Validation (read-only) ──
    await verifyFormTitle(page, "Report validation");
    await report.verifyReportValidation();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Report Validation",
      variant: "default",
    });
    await report.continue(
      new RegExp(`${versionId}/${ReportRoutes.FINAL_REVIEW}`),
    );

    // ── 13. Final Review (read-only) ──
    await report.verifyFinalReview();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Final Review",
      variant: "default",
    });
    await report.continue(
      new RegExp(`${versionId}/${ReportRoutes.VERIFICATION}`),
    );

    // ── 14. Verification ──
    await verifyFormTitle(page, "Verification");
    await report.fillVerification();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Verification",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.ATTACHMENTS}`),
    );

    // ── 15. Attachments — upload verification statement PDF ──
    await report.uploadVerificationStatement();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Attachments",
      variant: "filled",
    });
    await report.saveAndContinue(
      new RegExp(`${versionId}/${ReportRoutes.SIGN_OFF}`),
      false,
    );

    // ── 16. Sign-off and submit (submission stubbed to avoid external calls) ──
    await grid.submitReportById(request, versionId, false, false, true);

    // ── 17. Submission page — verify success content ──
    await grid.verifySubmissionPage();
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Submission",
      variant: "default",
    });

    // ── 18. Return to the grid and verify the report status ──
    await page.getByRole("link", { name: "Return to report table" }).click();
    await grid.verifyReportStatus(
      OPERATION_NAMES.BUGLE_SFO,
      REPORT_STATUS.SUBMITTED,
    );
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Report - Current Reports Grid",
      variant: "submitted",
    });
  });
});

test.describe("SFO: create and submit a new supplementary report for the current reporting year", () => {
  test("Industry user starts, fills, and submits a new supplementary report for Bangles SFO", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // ── 0. Open the current reporting year so the "Start" button is available ──
    const setup = new ReportSetUpPOM(page);
    await setup.primeReportingYear("open");

    // ── 1. Navigate to the current reports grid ──
    const grid = new CurrentReportsPOM(page);
    await grid.route();

    // ── 2. Click "Create supplementary report" for Bangles SFO
    const supplementaryVersionId = await grid.createSupplementaryReportById(
      ReportIDs.BANGLES_SFO,
    );
    const report = new CurrentReportPOM(page);
    const facilityReport = new SFOFacilityReportPOM(
      page,
      FacilityIDs.BANGLES_SFO,
    );

    // ── 3. Review Operation Information ──
    await verifyReportHeader(page, OPERATION_NAMES.BANGLES_SFO, "Version 2");
    await verifyFormTitle(page, "Review Operation Information");
    await report.verifyBanglesSfoOperationInfo();
    await report.saveAndContinue(
      new RegExp(report.personResponsibleUrl(supplementaryVersionId), "i"),
    );

    // -- 4. Person Responsible — change from "Bill Blue" to "Bob Brown" ──
    await verifyFormTitle(page, "Person Responsible for Submitting Report");
    await report.fillPersonResponsible("Bob Brown");
    await report.saveAndContinue(
      new RegExp(
        report.activitiesUrl(supplementaryVersionId, FacilityIDs.BANGLES_SFO),
        "i",
      ),
    );

    // -- 5. Activities — verify GSC activity is pre-populated. Update annual fuel amount and emissions quantity ──
    await verifyFormTitle(
      page,
      "General stationary combustion excluding line tracing (at SFO)",
    );
    const gscWithEnergyCheckbox = page.locator(
      "#root_gscWithProductionOfUsefulEnergy",
    );
    await expect(gscWithEnergyCheckbox).toBeChecked();
    const gscWithoutEnergyCheckbox = page.locator(
      "#root_gscWithoutProductionOfUsefulEnergy",
    );
    await expect(gscWithoutEnergyCheckbox).not.toBeChecked();

    const annualFuelLocator = report.page.locator(
      "#root_sourceTypes_gscWithProductionOfUsefulEnergy_units_0_fuels_0_annualFuelAmount",
    );
    await expect(annualFuelLocator).toHaveValue("12,000");
    annualFuelLocator.clear();
    await annualFuelLocator.fill("12600");

    const emissionsQuantityLocator = report.page.locator(
      "#root_sourceTypes_gscWithProductionOfUsefulEnergy_units_0_fuels_0_emissions_0_emission",
    );
    await expect(emissionsQuantityLocator).toHaveValue("11,000");
    emissionsQuantityLocator.clear();
    await emissionsQuantityLocator.fill("11800");

    await report.saveAndContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BANGLES_SFO}/${ReportRoutes.NON_ATTRIBUTABLE}`,
      ),
    );

    // -- 6. Non-Attributable Emissions ──
    await verifyFormTitle(page, "Non-Attributable Emissions");
    await expect(report.page.getByRole("radio", { name: "No" })).toBeChecked();
    await report.saveAndContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BANGLES_SFO}/${ReportRoutes.EMISSION_SUMMARY}`,
      ),
    );

    // -- 7. Emission Summary (read-only) ──
    await verifyFormTitle(page, "Emissions Summary (in tCO2e)");
    const emissionsAttributableForReportingLocator = report.page.locator(
      "#root_attributable_for_reporting",
    );
    await expect(emissionsAttributableForReportingLocator).toHaveValue(
      "11,800",
    );
    await expect(emissionsAttributableForReportingLocator).toBeDisabled();

    await report.continue(
      new RegExp(report.additionalReportingDataUrl(supplementaryVersionId)),
    );

    // -- 8. Additional Reporting Data ──
    await verifyFormTitle(page, "Additional Reporting Data");
    await expect(report.page.getByRole("radio", { name: "Yes" })).toBeChecked();

    // Verify Capture type multi-select has the expected values selected
    const expectedCaptureTypes = [
      "On-site use",
      "On-site sequestration",
      "Off-site transfer",
    ];
    await assertFieldVisibility(
      report.page,
      expectedCaptureTypes as unknown as string[],
      true,
    );

    // change value from 100 to 120 for "On-site use"
    await report.page
      .locator("#root_captured_emissions_section_emissions_on_site_use")
      .fill("120");

    await report.saveAndContinue(
      new RegExp(report.reviewChangesUrl(supplementaryVersionId)),
    );

    // -- 9. Review Changes ──
    await verifyFormTitle(page, "Reason for change");

    // TODO: ticket 4462 for e2e of Review Changes feature
    await report.page
      .getByRole("textbox", { name: /Reason for change/i })
      .fill("Lorem ipsum.");

    // the Review Changes page is built differently to all other pages, so the standard
    // saveAndContinue() method doesn't work here. Instead, click the button and wait for navigation.
    await report.page.getByRole("button", { name: /Save & Continue/i }).click();
    await report.page.waitForURL(
      new RegExp(`${supplementaryVersionId}/${ReportRoutes.VALIDATION}`),
      { waitUntil: "domcontentloaded" },
    );

    // -- 10. Report Validation (read-only) ──
    await verifyFormTitle(page, "Report validation");
    await report.verifyReportValidation();
    await report.continue(
      new RegExp(report.finalReviewUrl(supplementaryVersionId)),
    );

    // -- 11. Final Review (read-only) ──
    // there is no Form Title for this page
    await report.verifyFinalReview();
    await report.continue(
      new RegExp(report.attachmentsUrl(supplementaryVersionId)),
    );

    // -- 12. Attachments — upload verification statement PDF ──
    await verifyFormTitle(page, "Attachments");

    // assert warning message appears (unique to supplementary report submissions)
    await expect(
      report.page.getByText(/Review your attachments and replace any/i),
    ).toBeVisible();

    // assert previously uploaded verification statement is still present
    await report.verifyVerificationStatementUploaded("file1");

    // click required checkboxes
    await report.page
      .getByRole("checkbox", {
        name: /I confirm that I have uploaded any attachments/i,
      })
      .check();
    await report.page
      .getByRole("checkbox", {
        name: /I confirm that any previously uploaded attachments/i,
      })
      .check();

    // locator in saveAndContinue() failing on Attachments page too
    await report.saveAndContinue(
      new RegExp(`${supplementaryVersionId}/${ReportRoutes.SIGN_OFF}`),
      false,
    );

    // -- 13. Sign-off and submit (submission stubbed to avoid external calls) ──
    await verifyFormTitle(page, "Sign-off");
    await grid.submitReportById(
      request,
      supplementaryVersionId,
      false,
      true,
      false,
    );
  });
});
