/**
 * Shared test body helpers for transfer-facility spec files.
 *
 * Each function contains the steps for one test scenario. The spec files
 * (cas_analyst and cas_director) call these helpers so the logic lives in
 * one place instead of being copy-pasted across both files.
 *
 * @param page           - Playwright Page object
 * @param happoScreenshot - Happo screenshot fixture (for visual regression)
 * @param roleLabel      - Human-readable role name used in happo component names
 *                         e.g. "CAS Analyst" or "CAS Director"
 */
import { Page } from "@playwright/test";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { analyzeAccessibility } from "@bciers/e2e/utils/a11y";
import { TransferPOM } from "../poms/transfer";
import { TransferE2EValues, TransferStatus } from "./enums";

export async function futureFacilityTransferTest(
  page: Page,
  happoScreenshot: any,
  roleLabel: string,
) {
  const transferPage = new TransferPOM(page);
  await transferPage.routeToTransferEntity();

  await transferPage.fillFacilityTransferForm(
    TransferE2EValues.FROM_OPERATOR_NAME,
    TransferE2EValues.TO_OPERATOR_NAME,
    TransferE2EValues.FROM_OPERATION_NAME,
    TransferE2EValues.FACILITY_NAME,
    TransferE2EValues.TO_OPERATION_NAME,
    TransferE2EValues.FUTURE_DATE,
  );
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfer facility form - filled`,
    variant: "filled",
  });
  await analyzeAccessibility(
    page,
    `${roleLabel} - Transfer facility form - filled`,
  );

  await transferPage.assertTransferSuccess("future");
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfer facility success - future date`,
    variant: "default",
  });

  await transferPage.assertTransferRowInGrid(
    TransferE2EValues.FACILITY_NAME,
    TransferStatus.TO_BE_TRANSFERRED,
  );
}

export async function pastFacilityTransferTest(page: Page) {
  const transferPage = new TransferPOM(page);
  await transferPage.routeToTransferEntity();

  await transferPage.fillFacilityTransferForm(
    TransferE2EValues.FROM_OPERATOR_NAME,
    TransferE2EValues.TO_OPERATOR_NAME,
    TransferE2EValues.FROM_OPERATION_NAME,
    TransferE2EValues.FACILITY_NAME,
    TransferE2EValues.TO_OPERATION_NAME,
    TransferE2EValues.PAST_DATE,
  );

  await transferPage.assertTransferSuccess("past");
  await transferPage.assertTransferRowInGrid(
    TransferE2EValues.FACILITY_NAME,
    TransferStatus.TRANSFERRED,
  );
}

export async function editPendingFacilityTransferTest(
  page: Page,
  happoScreenshot: any,
  roleLabel: string,
) {
  const transferPage = new TransferPOM(page);

  await transferPage.routeToFixturePendingTransferDetail(
    TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME,
  );

  await transferPage.assertEditDetailsVisible();
  await analyzeAccessibility(
    page,
    `${roleLabel} - Transfer facility detail - read only`,
  );
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfer facility detail - read only`,
    variant: "default",
  });

  await transferPage.editEffectiveDate(TransferE2EValues.NEW_EFFECTIVE_DATE);
}

export async function cancelPendingFacilityTransferTest(
  page: Page,
  happoScreenshot: any,
  roleLabel: string,
) {
  const transferPage = new TransferPOM(page);

  await transferPage.routeToFixturePendingTransferDetail(
    TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME,
  );

  await transferPage.clickCancelTransfer();
  await transferPage.assertCancelConfirmationModal();
  await analyzeAccessibility(
    page,
    `${roleLabel} - Cancel facility transfer - confirmation modal`,
  );
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Cancel facility transfer - confirmation modal`,
    variant: "default",
  });

  await transferPage.confirmCancelTransfer();
  await transferPage.assertTransferCancelled(
    TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME,
  );
}
