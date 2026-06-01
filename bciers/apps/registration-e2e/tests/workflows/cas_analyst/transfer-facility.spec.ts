import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
// 🛠️ Helpers
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
// 🪄 Page Object Models
import { TransferPOM } from "../../../poms/transfer";
// ☰ Enums
import { TransferE2EValues, TransferStatus } from "../../../utils/enums";

const test = setupBeforeEachTest(UserRole.CAS_ANALYST);

// 🏷 Annotate test suite as serial to use 1 worker - prevents failure in setupTestEnvironment
// fillFacilityTransferForm toPass(75s) exceeds the 60s global timeout — set 120s here.
test.describe.configure({ mode: "serial", timeout: 120_000 });
test.describe("CAS Analyst - Transfer Facility", () => {
  test("Transfer facility with future effective date shows 'To be transferred' status", async ({
    page,
    happoScreenshot,
  }) => {
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
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfer facility form - filled",
      variant: "filled",
    });
    await analyzeAccessibility(page);
    await transferPage.assertTransferSuccess("future");

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfer facility success - future date",
      variant: "default",
    });

    await transferPage.assertTransferRowInGrid(
      TransferE2EValues.FACILITY_NAME,
      TransferStatus.TO_BE_TRANSFERRED,
    );
  });

  test("Transfer facility with past effective date shows 'Transferred' status", async ({
    page,
  }) => {
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
  });

  test("Can edit a pending facility transfer", async ({
    page,
    happoScreenshot,
  }) => {
    const transferPage = new TransferPOM(page);

    await transferPage.routeToFixturePendingTransferDetail(
      TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME,
    );

    await transferPage.assertEditDetailsVisible();
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfer facility detail - read only",
      variant: "default",
    });

    await transferPage.editEffectiveDate(TransferE2EValues.NEW_EFFECTIVE_DATE);
  });

  test("Can cancel a pending facility transfer", async ({
    page,
    happoScreenshot,
  }) => {
    const transferPage = new TransferPOM(page);

    await transferPage.routeToFixturePendingTransferDetail(
      TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME,
    );

    await transferPage.clickCancelTransfer();
    await transferPage.assertCancelConfirmationModal();
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Cancel facility transfer - confirmation modal",
      variant: "default",
    });

    await transferPage.confirmCancelTransfer();
    await transferPage.assertTransferCancelled(
      TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME,
    );
  });
});
