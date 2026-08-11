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
  LFOFacilityReportPOM,
} from "@/reporting-e2e/poms/facility-report";
import { ReportHistoryPOM } from "@/reporting-e2e/poms/report-history";
import { ReportSetUpPOM } from "@/reporting-e2e/poms/report-setup";
import { SubmittedPOM } from "@/reporting-e2e/poms/submitted";
import { DEFAULT_ANNUAL_PRODUCTION } from "@/reporting-e2e/poms/production-data";
import { ReviewFacilitiesPOM } from "@/reporting-e2e/poms/LFO/review-facilities";
import { FacilityGridPOM } from "@/reporting-e2e/poms/LFO/facility-grid";
import { OperationEmissionSummaryPOM } from "@/reporting-e2e/poms/LFO/operation-emissions-summary";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { verifyFormTitle } from "@/reporting-e2e/utils/helpers";
import { runLfoSubmitReport } from "@/reporting-e2e/tests/workflows/submit/lfo";
import {
  LfoSupplementaryScenario,
  SupplementaryScenarioArgs,
} from "@/reporting-e2e/tests/workflows/supplementary/types";

export const lfoSupplementaryScenarios: LfoSupplementaryScenario[] = [
  {
    title:
      "Industry user creates, edits, explains and submits a supplementary LFO report",
    operationName: OPERATION_NAMES.BEES_LFO,
    facilityName: "Facility 38",
    facilityId: FacilityIDs.BEES_LFO,
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

export async function runLfoSupplementaryScenario({
  page,
  request,
  scenario,
  happoScreenshot,
}: SupplementaryScenarioArgs<LfoSupplementaryScenario>) {
  const { operationName, facilityName, isRegulated, edits } = scenario;

  // ── 0. Open the current reporting year ──
  const setup = new ReportSetUpPOM(page);
  await setup.primeReportingYear("open");

  // ── 1. Ensure there is a submitted report to supplement ──
  const grid = new CurrentReportsPOM(page);
  await grid.route();
  await grid.searchByOperationName(operationName);

  if (!(await grid.hasSubmittedReport(operationName))) {
    // No screenshots — the submit spec already captures these in this run.
    await runLfoSubmitReport({ page, request, happoScreenshot: undefined });
    await grid.route();
    await grid.searchByOperationName(operationName);
  }

  await grid.verifyReportStatus(operationName, REPORT_STATUS.SUBMITTED);

  // ── 2. Create the supplementary report from the row's ⋮ menu ──
  const versionId =
    await grid.createSupplementaryReportForOperation(operationName);
  const report = new CurrentReportPOM(page);

  // ── 3. The new draft is version 2 of the same operation's report ──
  await grid.verifyReportHeading(operationName, 2);

  // ── 4. Review Operation Information — pre-populated from version 1 ──
  await verifyFormTitle(page, "Review Operation Information");

  // ── 5. The grid now shows the supplementary draft; resume it from there ──
  await grid.route();
  await grid.searchByOperationName(operationName);
  await grid.verifyReportStatus(
    operationName,
    REPORT_STATUS.DRAFT_SUPPLEMENTARY,
  );

  expect(await grid.continueReportForOperation(operationName)).toBe(versionId);
  await report.saveAndContinue(
    new RegExp(report.personResponsibleUrl(versionId)),
  );

  // ── 6. Person Responsible — carried over ──
  await verifyFormTitle(page, "Person Responsible for Submitting Report");
  await report.verifyPersonResponsible("Bill Blue");
  await report.saveAndContinue(
    new RegExp(report.reviewFacilitiesUrl(versionId)),
  );

  // ── 7. Review Facilities — the facility selection carried over ──
  const reviewFacility = new ReviewFacilitiesPOM(page);
  await reviewFacility.selectFacilities([facilityName]);
  await report.saveAndContinue(new RegExp(report.facilitiesGridUrl(versionId)));

  // ── 8. Facility Grid — cloned facility reports come back incomplete, so the
  //       facility has to be walked through and re-marked complete ──
  const facilityGrid = new FacilityGridPOM(page, versionId);
  await facilityGrid.waitForReady();
  const facilityId = await facilityGrid.continueReportForFacility(facilityName);

  // ── 9. Review Facility Information — the activity selection carried over, which
  //       is what fillReviewFacilityInformation asserts before saving ──
  const facilityReport = new LFOFacilityReportPOM(page, facilityId);
  await verifyFormTitle(page, "Review Facility Information");
  await facilityReport.fillReviewFacilityInformation();
  await facilityReport.saveAndContinue(
    new RegExp(report.activitiesUrl(versionId, scenario.facilityId), "i"),
  );

  // ── 10. Activities — the GSC unit, fuel and emission all carried over ──
  await facilityReport.verifyGscActivityCarriedOver();
  await facilityReport.fillGSCEmissionAmount(edits.emission.updated);
  await facilityReport.saveAndContinue(
    new RegExp(facilityReport.nonAttributableUrl()),
  );

  // ── 11. Non-Attributable Emissions ──
  await verifyFormTitle(page, "Non-Attributable Emissions");
  await facilityReport.saveAndContinue(
    new RegExp(facilityReport.emissionsSummaryUrl()),
  );

  // ── 12. Emission Summary (read-only) ──
  await facilityReport.verifyEmissionSummary();
  await facilityReport.clickContinue(
    new RegExp(facilityReport.productionDataUrl()),
  );

  // ── 13. Production Data — the data change under test. Annual production is the
  //        safe field to edit: changing emissions instead would invalidate the
  //        carried-over Allocation of Emissions ──
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
  await facilityReport.clickContinue(
    new RegExp(facilityReport.allocationOfEmissionsUrl()),
  );

  // ── 14. Allocation of Emissions — re-allocated to match the changed emission
  //        total. Only the amount: the methodology carried over ──
  await verifyFormTitle(page, "Allocation of Emissions");
  await facilityReport.updateAllocationOfEmissions(edits.emission.updated);
  await facilityReport.clickContinue(
    new RegExp(facilityReport.facilityReportCompletedUrl()),
  );

  // ── 15. Facility report completed ──
  await facilityReport.verifyFacilityReportCompleted();
  await facilityReport.returnToAllFacilityReports();
  await facilityGrid.markFacilityComplete(facilityName);
  await facilityGrid.clickContinue(
    new RegExp(`${versionId}/${ReportRoutes.ADDITIONAL_REPORTING_DATA}`),
  );

  // ── 16. Additional Reporting Data ──
  await verifyFormTitle(page, "Additional Reporting Data");
  await report.saveAndContinue();

  // ── 17. Operation Emission Summary (read-only) ──
  const operationEmissionSummary = new OperationEmissionSummaryPOM(page);
  await operationEmissionSummary.validateEmissionSummary();
  await operationEmissionSummary.continue(
    new RegExp(`${versionId}/${ReportRoutes.COMPLIANCE_SUMMARY}`),
  );

  // ── 18. Compliance Summary (read-only) ──
  await report.verifyComplianceSummary();
  await report.continue(
    new RegExp(`${versionId}/${ReportRoutes.REVIEW_CHANGES}`),
  );

  // ── 19. Review Changes — auto-computed diff plus a mandatory reason for change ──
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

  // Operation-level summary repeats the facility totals
  await reviewChanges.verifySection(
    REVIEW_CHANGES_SECTIONS.OPERATION_EMISSION_SUMMARY,
  );
  await reviewChanges.verifyFieldChanges(
    REVIEW_CHANGES_SECTIONS.OPERATION_EMISSION_SUMMARY,
    [
      { label: REVIEW_CHANGES_LABELS.ATTRIBUTABLE_FOR_REPORTING, ...emission },
      {
        label: REVIEW_CHANGES_LABELS.ATTRIBUTABLE_FOR_REPORTING_THRESHOLD,
        ...emission,
      },
    ],
  );

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
    component: "Report - Review Changes",
    variant: "LFO",
  });
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.VALIDATION}`),
    false,
  );

  // ── 20. Report Validation (read-only) ──
  await verifyFormTitle(page, "Report validation");
  await report.verifyReportValidation();
  await report.continue(
    new RegExp(`${versionId}/${ReportRoutes.FINAL_REVIEW}`),
  );

  // ── 21. Final Review (read-only) ──
  await report.verifyFinalReview();
  await report.continue(
    new RegExp(`${versionId}/${ReportRoutes.VERIFICATION}`),
  );

  // ── 22. Verification ──
  await verifyFormTitle(page, "Verification");
  await report.verifySupplementaryVerification();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Verification",
    variant: "LFO - supplementary",
  });
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.ATTACHMENTS}`),
  );

  // ── 23. Attachments ──
  await report.verifySupplementaryAttachments();
  await grid.verifySaveAndContinueDisabled();
  await report.uploadVerificationStatement();
  await grid.fillAttachments();
  await grid.verifySaveAndContinueEnabled();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Attachments",
    variant: "LFO - supplementary",
  });
  await report.saveAndContinue(
    new RegExp(`${versionId}/${ReportRoutes.SIGN_OFF}`),
    false,
  );

  // ── 24. Sign-off ──
  await grid.verifySupplementarySignOffFields(isRegulated);
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Sign-off",
    variant: "LFO - supplementary",
  });
  await grid.submitReportById(request, versionId, false, true, isRegulated);

  // ── 25. Submission page ──
  await grid.verifySubmissionPage(true);
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Submission",
    variant: "LFO - supplementary",
  });

  // ── 26. Back on the grid, the report reads as a submitted supplementary ──
  await page.getByRole("link", { name: "Return to report table" }).click();
  await grid.verifyReportStatus(
    operationName,
    REPORT_STATUS.SUBMITTED_SUPPLEMENTARY,
  );

  // ── 27. Report history lists both versions, and version 1 is still viewable ──
  await grid.reportHistoryForOperation(operationName);
  const reportHistory = new ReportHistoryPOM(page);
  await reportHistory.validatePageElements(operationName);
  await reportHistory.verifyVersions(scenario.expectedVersions);
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: "Report - Report History",
    variant: "LFO",
  });
  await reportHistory.viewDetailsFromReportHistory(1);
  await new SubmittedPOM(page).verifySubmittedReportView(operationName, true);
}
