/**
 * Shared test body helpers for transfer-operation spec files.
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
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { TransferPOM } from "../poms/transfer";
import { TransferE2EValues, TransferStatus } from "./enums";

export async function transfersGridTest(
  page: Page,
  happoScreenshot: any,
  roleLabel: string,
) {
  const transferPage = new TransferPOM(page);
  await transferPage.route();
  await transferPage.assertMakeTransferButtonVisible();
  await transferPage.stabilizeSubmissionDates();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfers grid`,
    variant: "default",
  });
  await analyzeAccessibility(page);
}

export async function futureOperationTransferTest(
  page: Page,
  happoScreenshot: any,
  roleLabel: string,
) {
  const transferPage = new TransferPOM(page);
  await transferPage.routeToTransferEntity();

  await transferPage.fillOperationTransferForm(
    TransferE2EValues.FROM_OPERATOR_NAME,
    TransferE2EValues.TO_OPERATOR_NAME,
    TransferE2EValues.OPERATION_NAME,
    TransferE2EValues.FUTURE_DATE,
  );
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfer operation form - filled`,
    variant: "filled",
  });
  await analyzeAccessibility(page);

  await transferPage.assertTransferSuccess("future");
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfer operation success - future date`,
    variant: "default",
  });

  await transferPage.assertTransferRowInGrid(
    TransferE2EValues.OPERATION_NAME,
    TransferStatus.TO_BE_TRANSFERRED,
  );
}

export async function pastOperationTransferTest(
  page: Page,
  happoScreenshot: any,
  roleLabel: string,
) {
  const transferPage = new TransferPOM(page);
  await transferPage.routeToTransferEntity();

  await transferPage.fillOperationTransferForm(
    TransferE2EValues.FROM_OPERATOR_NAME,
    TransferE2EValues.TO_OPERATOR_NAME,
    TransferE2EValues.OPERATION_NAME,
    TransferE2EValues.PAST_DATE,
  );

  await transferPage.assertTransferSuccess("past");
  await analyzeAccessibility(page);

  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfer operation success - past date`,
    variant: "default",
  });

  await transferPage.assertTransferRowInGrid(
    TransferE2EValues.OPERATION_NAME,
    TransferStatus.TRANSFERRED,
  );
}

export async function editPendingOperationTransferTest(
  page: Page,
  happoScreenshot: any,
  roleLabel: string,
) {
  const transferPage = new TransferPOM(page);

  await transferPage.routeToFixturePendingTransferDetail(
    TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME,
  );

  await transferPage.assertEditDetailsVisible();
  await analyzeAccessibility(page);
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfer detail - read only`,
    variant: "default",
  });

  await transferPage.editEffectiveDate(TransferE2EValues.NEW_EFFECTIVE_DATE);
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfer detail - after edit saved`,
    variant: "default",
  });
}

export async function cancelPendingOperationTransferTest(
  page: Page,
  happoScreenshot: any,
  roleLabel: string,
) {
  const transferPage = new TransferPOM(page);

  await transferPage.routeToFixturePendingTransferDetail(
    TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME,
  );

  await transferPage.clickCancelTransfer();
  await transferPage.assertCancelConfirmationModal();
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Cancel transfer - confirmation modal`,
    variant: "default",
  });

  await transferPage.confirmCancelTransfer();
  await transferPage.assertTransferCancelled(
    TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME,
  );
}
