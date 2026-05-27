// 🧪 Suite to test the CAS Analyst transfer facility workflow
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
import {
  TransferE2EValues,
  TransferStatus,
} from "../../../utils/enums";

const test = setupBeforeEachTest(UserRole.CAS_ANALYST);

// 🏷 Annotate test suite as serial to use 1 worker - prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("CAS Analyst - Transfer Facility", () => {
  test("Transfer facility with future effective date shows 'To be transferred' status", async ({
    page,
    happoScreenshot
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
      component: "Transfer facility form - filled",
      variant: "filled",
    });
    await analyzeAccessibility(page, "Transfer facility form");

    await transferPage.submitTransfer();
    await transferPage.assertFutureTransferSuccess();
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfer facility success - future date",
      variant: "default",
    });

    await transferPage.returnToTransferGrid();
    await transferPage.assertTransferRowInGrid(TransferE2EValues.FACILITY_NAME, TransferStatus.TO_BE_TRANSFERRED);
  });

  test("Transfer facility with past effective date shows 'Transferred' status", async ({
    page,
    happoScreenshot
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

    await transferPage.submitTransfer();
    await transferPage.assertPastTransferSuccess();
    await analyzeAccessibility(page, "Transfer facility success");
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfer facility success - past date",
      variant: "default",
    });

    await transferPage.returnToTransferGrid();
    await transferPage.assertTransferRowInGrid(TransferE2EValues.FACILITY_NAME, TransferStatus.TRANSFERRED);
  });

  test("Can edit a pending facility transfer", async ({
    page,
    happoScreenshot
  }) => {
    const transferPage = new TransferPOM(page);

    await transferPage.routeToFixturePendingTransferDetail(TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME);

    await transferPage.assertEditDetailsVisible();
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfer facility detail - read only",
      variant: "default",
    });

    await transferPage.clickEditDetails();
    await transferPage.fillEffectiveDate(TransferE2EValues.NEW_EFFECTIVE_DATE);
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfer facility detail - edit mode",
      variant: "default",
    });

    await transferPage.submitTransfer();
    await transferPage.assertEditDetailsVisible();
  });

  test("Can cancel a pending facility transfer", async ({
    page,
    happoScreenshot,
  }) => {
    const transferPage = new TransferPOM(page);

    await transferPage.routeToFixturePendingTransferDetail(TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME);

    await transferPage.clickCancelTransfer();
    await transferPage.assertCancelConfirmationModal();
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Cancel facility transfer - confirmation modal",
      variant: "default",
    });

    await transferPage.confirmCancelTransfer();
    await transferPage.assertTransferCancelled(TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME);
  });
});
