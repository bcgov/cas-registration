import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  FacilityIDs,
  OPERATION_NAMES,
  REPORT_STATUS,
  ReportRoutes,
} from "@/reporting-e2e/utils/enums";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { CurrentReportPOM } from "@/reporting-e2e/poms/current-report";
import { SFOFacilityReportPOM } from "@/reporting-e2e/poms/facility-report";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import { assertFieldVisibility, takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import {
  verifyFormTitle,
  verifyReportHeader,
} from "@/reporting-e2e/utils/helpers";
import { APIRequestContext, Page } from "@playwright/test";
import { expect } from "@playwright/test";

const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });

// helper function to create and submit a new report for the initial Bugle SFO test
// used to set up the supplementary report test
// returns the versionId of the created report
async function submitInitialBugleSfoReport(
  page: Page,
  request: APIRequestContext,
): Promise<number> {
  const setup = new ReportSetUpPOM(page);
  await setup.primeReportingYear("open");

  const grid = new CurrentReportsPOM(page);
  await grid.route();

  const versionId = await grid.startNewReportForOperation(
    OPERATION_NAMES.BUGLE_SFO,
  );
  const report = new CurrentReportPOM(page);
  const facilityReport = new SFOFacilityReportPOM(page, FacilityIDs.BUGLE_SFO);

  // Review Operation Information
  await report.verifyBugleSfoOperationInfo();
  await report.saveAndContinue(
    new RegExp(report.personResponsibleUrl(versionId), "i"),
  );

  // Person Responsible — select "Bill Blue" (contact linked to the op)
  await report.fillPersonResponsible("Bill Blue");
  await report.saveAndContinue(
    new RegExp(report.activitiesUrl(versionId, FacilityIDs.BUGLE_SFO), "i"),
  );

  // Activity - GSC
  await facilityReport.fillGscActivity();
  await facilityReport.saveAndContinue(
    new RegExp(facilityReport.nonAttributableUrl(), "i"),
  );

  // Non-Attributable Emissions
  await facilityReport.fillNonAttributable();
  await facilityReport.saveAndContinue(
    new RegExp(
      `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.EMISSION_SUMMARY}`,
    ),
  );

  // Emission Summary
  await facilityReport.clickContinue(
    new RegExp(
      `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.PRODUCTION_DATA}`,
    ),
  );

  // Production Data
  await facilityReport.fillProductionData();
  await facilityReport.saveAndContinue(
    new RegExp(
      `/facilities/${FacilityIDs.BUGLE_SFO}/${ReportRoutes.ALLOCATION_OF_EMISSIONS}`,
    ),
  );

  // Allocation of Emissions
  await facilityReport.verifyAllocationAlerts();
  await facilityReport.fillAllocationOfEmissions();
  await facilityReport.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.ADDITIONAL_REPORTING_DATA}`),
  );

  // Additional Reporting Data
  await report.fillAdditionalData();
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.COMPLIANCE_SUMMARY}`),
  );

  // Compliance Summary
  await report.verifyComplianceSummary();
  await report.continue(new RegExp(`${versionId}/${ReportRoutes.VALIDATION}`));

  // Report Validation
  await report.verifyReportValidation();
  await report.continue(
    new RegExp(`${versionId}/${ReportRoutes.FINAL_REVIEW}`),
  );

  // Final Review
  await report.verifyFinalReview();
  await report.continue(
    new RegExp(`${versionId}/${ReportRoutes.VERIFICATION}`),
  );

  // Verification
  await report.fillVerification();
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.ATTACHMENTS}`),
  );

  // Attachments
  await report.uploadVerificationStatement();
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.SIGN_OFF}`),
    false,
  );

  // Sign-off and submit
  await grid.submitReportById(request, versionId, false, false, true);
  await grid.verifySubmissionPage();

  return versionId;
}

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

test.describe("SFO: create and submit a supplementary report for the current reporting year", () => {
  test("Industry user creates and submits a supplementary report for Bangles SFO", async ({
    page,
    request,
    happoScreenshot,
  }) => {
    // ── 0. Go to Reporting dashboard for the current reporting year ──
    const setup = new ReportSetUpPOM(page);
    await setup.primeReportingYear("open");

    // ── 1. Navigate to the current reports grid ──
    const grid = new CurrentReportsPOM(page);
    await grid.route();

    // ── 2. Create a supplementary report for Bangles SFO from the options menu in the grid ──
    const supplementaryVersionId = await grid.createSupplementaryReportById(13);
    const report = new CurrentReportPOM(page);

    // ── 3. Review Operation Information — verify fields are pre-populated with the same values as the original report ──
    await verifyReportHeader(page, OPERATION_NAMES.BANGLES_SFO, "Version 2");

    await verifyFormTitle(page, "Review Operation Information");
    await report.verifyBanglesSfoOperationInfo();

    await report.saveAndContinue(
      new RegExp(report.personResponsibleUrl(supplementaryVersionId), "i"),
    );

    // ── 4. Person Responsible — change from "Bob Brown" to "Bill Blue" ──
    await verifyFormTitle(page, "Person Responsible for Submitting Report");
    // await expect(report.page.getByTestId("root_person_responsible")).toHaveText("Bob Brown");
    await report.fillPersonResponsible("Bill Blue");
    await report.saveAndContinue(
      new RegExp(
        report.activitiesUrl(supplementaryVersionId, FacilityIDs.BANGLES_SFO),
        "i",
      ),
    );

    // ── 5. Activities — verify GSC activity with same details is pre-populated. Update annual fuel amount and emissions quantity ──
    await verifyFormTitle(
      page,
      "General stationary combustion excluding line tracing (at SFO)",
    );
    await expect(
      report.page.locator("#root_gscWithProductionOfUsefulEnergy"),
    ).toBeChecked();
    await expect(
      report.page.locator("#root_gscWithoutProductionOfUsefulEnergy"),
    ).not.toBeChecked();

    const annualFuelLocator = report.page.locator(
      "#root_sourceTypes_gscWithProductionOfUsefulEnergy_units_0_fuels_0_annualFuelAmount",
    );
    await expect(annualFuelLocator).toHaveValue("12,000");
    annualFuelLocator.clear();
    annualFuelLocator.fill("12600");

    const emissionsQuantityLocator = report.page.locator(
      "#root_sourceTypes_gscWithProductionOfUsefulEnergy_units_0_fuels_0_emissions_0_emission",
    );
    await expect(emissionsQuantityLocator).toHaveValue("11,000");
    emissionsQuantityLocator.clear();
    emissionsQuantityLocator.fill("11800");

    await report.saveAndContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BANGLES_SFO}/${ReportRoutes.NON_ATTRIBUTABLE}`,
      ),
    );

    // ── 6. Non-Attributable Emissions (no entries needed) ──
    await verifyFormTitle(page, "Non-Attributable Emissions");
    await expect(report.page.getByRole("radio", { name: "No" })).toBeChecked();
    await report.saveAndContinue(
      new RegExp(
        `/facilities/${FacilityIDs.BANGLES_SFO}/${ReportRoutes.EMISSION_SUMMARY}`,
      ),
    );

    // ── 7. Emission Summary (read-only) — verify values are updated based on changed activity data ──
    await verifyFormTitle(page, "Emissions Summary (in tCO2e)");
    const emissionsAttributableForReportingLocator = report.page.locator(
      "#root_attributable_for_reporting",
    );
    await expect(emissionsAttributableForReportingLocator).toHaveValue(
      "11,800",
    );
    await expect(emissionsAttributableForReportingLocator).toBeDisabled();

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "SFO Supplementary Report - Emissions Summary",
      variant: "default",
    });
    await report.continue(
      new RegExp(
        `/${supplementaryVersionId}/${ReportRoutes.ADDITIONAL_REPORTING_DATA}`,
      ),
    );

    // ── 8. Additional Reporting Data — verify fields are pre-populated with the same values as the original report ──
    await verifyFormTitle(page, "Additional Reporting Data");
    await expect(report.page.getByRole("radio", { name: "Yes" })).toBeChecked();

    // Verify Capture type multi-select has the expected values visible (selected)
    const expectedCaptureTypes = ["On-site use", "On-site sequestration", "Off-site transfer"];
    await assertFieldVisibility(
      report.page,
      expectedCaptureTypes as unknown as string[],
      true,
    );

    await report.page.locator("#root_captured_emissions_section_emissions_on_site_use").fill("120"); // change from 100

    await report.saveAndContinue(
      new RegExp(
        `/${supplementaryVersionId}/${ReportRoutes.REVIEW_CHANGES}`,
      ),
    );

    // ── 9. Review Changes - submit reason for change ──
    await verifyFormTitle(page, "Review Changes");

    // TODO: ticket 4462 for e2e of Review Changes feature
    await report.page.getByRole("textbox", { name: /Please explain the reason/i }).fill("Lorem ipsum.");

    await report.saveAndContinue(
        new RegExp(`${supplementaryVersionId}/${ReportRoutes.VALIDATION}`),
      );

    // ── 13. Report Validation (read-only) — confirm no validation warnings/errors detected ──
    await verifyFormTitle(page, "Report validation");

    // ── 14. Final Review (read-only) — verify updated report details are reflected in the summary ──

    // ── 15. Verification — confirm verification details are the same as before ──

    // ── 16. Attachments — confirm previously uploaded verification statement is still attached, upload new version. Enable required checkboxes regarding attachments  ──

    // ── 17. Sign-off and submit - select all checkboxes, sign (submission stubbed to avoid external calls) ──
  });
});
