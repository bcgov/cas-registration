import { expect } from "@playwright/test";
import {
  FacilityIDs,
  OPERATION_NAMES,
  REPORT_STATUS,
  ReportRoutes,
} from "@/reporting-e2e/utils/enums";
import {
  REPORT_HISTORY_CURRENT_VERSION,
  REVIEW_CHANGES_LABELS,
  REVIEW_CHANGES_SECTIONS,
  REVIEW_CHANGES_TEXT,
  reportHistoryVersionLabel,
} from "@/reporting-e2e/utils/constants";
import { CurrentReportsPOM } from "@/reporting-e2e/poms/current-reports";
import { CurrentReportPOM } from "@/reporting-e2e/poms/current-report";
import { ReviewChangesPOM } from "@/reporting-e2e/poms/review-changes";
import {
  DEFAULT_GSC_EMISSION,
  SFOFacilityReportPOM,
} from "@/reporting-e2e/poms/facility-report";
import { ReportHistoryPOM } from "@/reporting-e2e/poms/report-history";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import { SubmittedPOM } from "@/reporting-e2e/poms/submitted";
import { DEFAULT_ANNUAL_PRODUCTION } from "@/reporting-e2e/poms/production-data";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { verifyFormTitle } from "@/reporting-e2e/utils/helpers";
import { runSfoSubmitReport } from "@/reporting-e2e/tests/workflows/submit/sfo";
import {
  SupplementaryScenario,
  SupplementaryScenarioArgs,
} from "@/reporting-e2e/tests/workflows/supplementary/types";

export const sfoSupplementaryScenarios: SupplementaryScenario[] = [
  {
    title:
      "Industry user creates, edits, explains and submits a supplementary SFO report",
    operationName: OPERATION_NAMES.BUGLE_SFO,
    facilityId: FacilityIDs.BUGLE_SFO,
    isRegulated: true,
    edits: {
      emission: { carriedOver: DEFAULT_GSC_EMISSION, updated: 9000 },
      production: {
        productIndex: 0,
        carriedOver: DEFAULT_ANNUAL_PRODUCTION,
        updated: 7500,
      },
      methodology: {
        carriedOver: "OBPS Calculator",
        updated: "other",
        description: "Measured with a calibrated in-line meter",
      },
    },
    expectedVersions: [
      REPORT_HISTORY_CURRENT_VERSION,
      reportHistoryVersionLabel(1),
    ],
  },
];

export async function runSfoSupplementaryScenario({
  page,
  request,
  scenario,
  happoScreenshot,
}: SupplementaryScenarioArgs) {
  const { operationName, facilityId, isRegulated, edits } = scenario;

  // ── 0. Open the current reporting year ──
  const setup = new ReportSetUpPOM(page);
  await setup.primeReportingYear("open");

  // ── 1. Ensure there is a submitted report to supplement ──
  const grid = new CurrentReportsPOM(page);
  await grid.route();

  if (!(await grid.hasSubmittedReport(operationName))) {
    // No screenshots — the submit spec already captures these in this run.
    await runSfoSubmitReport({ page, request, happoScreenshot: undefined });
    await grid.route();
  }

  await grid.verifyReportStatus(operationName, REPORT_STATUS.SUBMITTED);

  // ── 2. Create the supplementary report from the row's ⋮ menu ──
  const versionId =
    await grid.createSupplementaryReportForOperation(operationName);
  const report = new CurrentReportPOM(page);
  const facilityReport = new SFOFacilityReportPOM(page, facilityId);

  // ── 3. The new draft is version 2 of the same operation's report ──
  await grid.verifyReportHeading(operationName, 2);

  // ── 4. Review Operation Information — every value carried over from version 1 ──
  await verifyFormTitle(page, "Review Operation Information");
  await report.verifyBugleSfoOperationInfo();

  // ── 5. The grid now shows the supplementary draft; resume it from there ──
  await grid.route();
  await grid.verifyReportStatus(
    operationName,
    REPORT_STATUS.DRAFT_SUPPLEMENTARY,
  );
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "SFO Supplementary Report - Current Reports Grid",
    variant: "draft supplementary",
  });

  expect(await grid.continueReportForOperation(operationName)).toBe(versionId);
  await report.saveAndContinue(
    new RegExp(report.personResponsibleUrl(versionId), "i"),
  );

  // ── 6. Person Responsible — carried over ──
  await verifyFormTitle(page, "Person Responsible for Submitting Report");
  await report.verifyPersonResponsible("Bill Blue");
  await report.saveAndContinue(
    new RegExp(report.activitiesUrl(versionId, facilityId), "i"),
  );

  // ── 7. Activities — the GSC unit, fuel and emission all carried over ──
  await facilityReport.verifyGscActivityCarriedOver();
  await facilityReport.fillEmissionAmount(edits.emission.updated);
  await facilityReport.saveAndContinue(
    new RegExp(facilityReport.nonAttributableUrl(), "i"),
  );

  // ── 8. Non-Attributable Emissions ──
  await verifyFormTitle(page, "Non-Attributable Emissions");
  await facilityReport.saveAndContinue(
    new RegExp(`/facilities/${facilityId}/${ReportRoutes.EMISSION_SUMMARY}`),
  );

  // ── 9. Emission Summary (read-only) ──
  await facilityReport.verifyEmissionSummary();
  await facilityReport.clickContinue(
    new RegExp(`/facilities/${facilityId}/${ReportRoutes.PRODUCTION_DATA}`),
  );

  // ── 10. Production Data ──
  await verifyFormTitle(page, "Production Data");
  await facilityReport.verifyAnnualProduction(
    edits.production.productIndex,
    edits.production.carriedOver,
  );
  await facilityReport.fillAnnualProduction(
    edits.production.productIndex,
    edits.production.updated,
  );
  await facilityReport.fillProductionMethodology(
    edits.production.productIndex,
    edits.methodology.updated,
    edits.methodology.description,
  );
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "SFO Supplementary Report - Production Data",
    variant: "changed",
  });
  await facilityReport.saveAndContinue(
    new RegExp(
      `/facilities/${facilityId}/${ReportRoutes.ALLOCATION_OF_EMISSIONS}`,
    ),
  );

  // ── 11. Allocation of Emissions ──
  await verifyFormTitle(page, "Allocation of Emissions");
  await facilityReport.updateAllocationOfEmissions(edits.emission.updated);
  await facilityReport.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.ADDITIONAL_REPORTING_DATA}`),
  );

  // ── 12. Additional Reporting Data ──
  await verifyFormTitle(page, "Additional Reporting Data");
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.COMPLIANCE_SUMMARY}`),
  );

  // ── 13. Compliance Summary (read-only) ──
  await report.verifyComplianceSummary();
  await report.continue(
    new RegExp(`${versionId}/${ReportRoutes.REVIEW_CHANGES}`),
  );

  // ── 14. Review Changes ──
  const reviewChanges = new ReviewChangesPOM(page);
  await reviewChanges.verifyPageElements(isRegulated);
  const emission = {
    from: String(edits.emission.carriedOver),
    to: String(edits.emission.updated),
  };
  const production = {
    from: String(edits.production.carriedOver),
    to: String(edits.production.updated),
  };

  await reviewChanges.verifySection(REVIEW_CHANGES_SECTIONS.FACILITY);

  // Activity data
  await reviewChanges.verifyActivityChanged(REVIEW_CHANGES_TEXT.GSC_ACTIVITY);
  await reviewChanges.verifyFieldChange({
    label: REVIEW_CHANGES_LABELS.EMISSION,
    ...emission,
  });
  await reviewChanges.verifyFieldChange({
    label: REVIEW_CHANGES_LABELS.EQUIVALENT_EMISSION,
    ...emission,
  });

  // ...which flows into the facility's summary totals
  await reviewChanges.verifySection(REVIEW_CHANGES_SECTIONS.EMISSION_SUMMARY);
  await reviewChanges.verifyFieldChanges(
    REVIEW_CHANGES_SECTIONS.EMISSION_SUMMARY,
    [
      { label: REVIEW_CHANGES_LABELS.ATTRIBUTABLE_FOR_REPORTING, ...emission },
      {
        label: REVIEW_CHANGES_LABELS.ATTRIBUTABLE_FOR_REPORTING_THRESHOLD,
        ...emission,
      },
      { label: REVIEW_CHANGES_LABELS.STATIONARY_FUEL_COMBUSTION, ...emission },
    ],
  );

  // Production Data renders the added description first, then the changed values
  await reviewChanges.verifySection(REVIEW_CHANGES_SECTIONS.PRODUCTION_DATA);
  await reviewChanges.verifyFieldAdded({
    section: REVIEW_CHANGES_SECTIONS.PRODUCTION_DATA,
    label: REVIEW_CHANGES_LABELS.METHODOLOGY_DESCRIPTION,
    value: edits.methodology.description,
  });
  await reviewChanges.verifyFieldChanges(
    REVIEW_CHANGES_SECTIONS.PRODUCTION_DATA,
    [
      { label: REVIEW_CHANGES_LABELS.ANNUAL_PRODUCTION, ...production },
      {
        label: REVIEW_CHANGES_LABELS.METHODOLOGY,
        from: edits.methodology.carriedOver,
        to: edits.methodology.updated,
      },
    ],
  );

  // The allocation redone to match the new emission total
  await reviewChanges.verifySection(
    REVIEW_CHANGES_SECTIONS.ALLOCATION_OF_EMISSIONS,
  );
  await reviewChanges.verifyFieldChange({
    section: REVIEW_CHANGES_SECTIONS.ALLOCATION_OF_EMISSIONS,
    label: REVIEW_CHANGES_LABELS.TOTAL_EMISSIONS,
    ...emission,
  });
  await reviewChanges.verifyFieldChange({
    label: REVIEW_CHANGES_LABELS.TOTAL_ATTRIBUTABLE_FOR_REPORTING,
    ...emission,
  });

  // Compliance Summary — same figures, different capitalization
  await reviewChanges.verifySection(REVIEW_CHANGES_SECTIONS.COMPLIANCE_SUMMARY);
  await reviewChanges.verifyFieldChanges(
    REVIEW_CHANGES_SECTIONS.COMPLIANCE_SUMMARY,
    [
      {
        label: REVIEW_CHANGES_LABELS.EMISSIONS_ATTRIBUTABLE_FOR_REPORTING,
        ...emission,
      },
      {
        label: REVIEW_CHANGES_LABELS.EMISSIONS_ATTRIBUTABLE_FOR_COMPLIANCE,
        ...emission,
      },
      { label: REVIEW_CHANGES_LABELS.ANNUAL_PRODUCTION, ...production },
      {
        label: REVIEW_CHANGES_LABELS.ALLOCATED_COMPLIANCE_EMISSIONS,
        ...emission,
      },
    ],
  );

  await reviewChanges.verifySaveAndContinueDisabled();
  await reviewChanges.fillReason();
  await reviewChanges.verifySaveAndContinueEnabled();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "SFO Supplementary Report - Review Changes",
    variant: "reason entered",
  });
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.VALIDATION}`),
    false,
  );

  // ── 15. Report Validation (read-only) ──
  await verifyFormTitle(page, "Report validation");
  await report.verifyReportValidation();
  await report.continue(
    new RegExp(`${versionId}/${ReportRoutes.FINAL_REVIEW}`),
  );

  // ── 16. Final Review (read-only) ──
  await report.verifyFinalReview();
  await report.continue(
    new RegExp(`${versionId}/${ReportRoutes.VERIFICATION}`),
  );

  // ── 17. Verification ──
  await verifyFormTitle(page, "Verification");
  await report.verifySupplementaryVerification();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "SFO Supplementary Report - Verification",
    variant: "supplementary info note",
  });
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.ATTACHMENTS}`),
  );

  // ── 18. Attachments ──
  await report.verifySupplementaryAttachments();
  await grid.verifySaveAndContinueDisabled();
  await report.uploadVerificationStatement();
  await grid.fillAttachments();
  await grid.verifySaveAndContinueEnabled();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "SFO Supplementary Report - Attachments",
    variant: "reuploaded and confirmed",
  });
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.SIGN_OFF}`),
    false,
  );

  // ── 19. Sign-off ──
  await grid.verifySupplementarySignOffFields(isRegulated);
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "SFO Supplementary Report - Sign-off",
    variant: "supplementary regulated",
  });
  await grid.submitReportById(request, versionId, false, true, isRegulated);

  // ── 20. Submission page ──
  await grid.verifySubmissionPage(true);
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "SFO Supplementary Report - Submission",
    variant: "supplementary",
  });

  // ── 21. Back on the grid, the report reads as a submitted supplementary ──
  await page.getByRole("link", { name: "Return to report table" }).click();
  await grid.verifyReportStatus(
    operationName,
    REPORT_STATUS.SUBMITTED_SUPPLEMENTARY,
  );

  // ── 22. Report history lists both versions, and version 1 is still viewable ──
  await grid.reportHistoryForOperation(operationName);
  const reportHistory = new ReportHistoryPOM(page);
  await reportHistory.validatePageElements(operationName);
  await reportHistory.verifyVersions(scenario.expectedVersions);
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "SFO Supplementary Report - Report History",
    variant: "two versions",
  });
  await reportHistory.viewDetailsFromReportHistory(1);
  await new SubmittedPOM(page).verifySubmittedReportView(operationName);
}
