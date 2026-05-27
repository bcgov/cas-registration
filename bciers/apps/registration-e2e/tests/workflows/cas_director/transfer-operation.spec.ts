// 🧪 Suite to test the CAS Director transfer operation workflow
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

const test = setupBeforeEachTest(UserRole.CAS_DIRECTOR);

test.describe.configure({ mode: "serial" });
test.describe("CAS Director - Transfer Operation", () => {
  test("'Make a Transfer' button is visible in the transfers grid", async ({
    page
  }) => {
    const transferPage = new TransferPOM(page);
    await transferPage.route();

    await transferPage.assertMakeTransferButtonVisible();
  });

  test("Transfer operation with future effective date shows 'To be transferred' status", async ({
    page,
    happoScreenshot
  }) => {
    const transferPage = new TransferPOM(page);
    await transferPage.routeToTransferEntity();

    await transferPage.fillOperationTransferForm(
      TransferE2EValues.FROM_OPERATOR_NAME,
      TransferE2EValues.TO_OPERATOR_NAME,
      TransferE2EValues.OPERATION_NAME,
      TransferE2EValues.FUTURE_DATE,
    );
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Transfer operation form - filled",
      variant: "filled",
    });
    await analyzeAccessibility(page, "Transfer operation form");

    await transferPage.submitTransfer();
    await transferPage.assertFutureTransferSuccess();
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Director - Transfer operation success - future date",
      variant: "default",
    });

    await transferPage.returnToTransferGrid();
    await transferPage.assertTransferRowInGrid(TransferE2EValues.OPERATION_NAME, TransferStatus.TO_BE_TRANSFERRED);
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Director - Transfers grid - operation To be transferred",
      variant: "default",
    });
  });

  test("Transfer operation with past effective date shows 'Transferred' status", async ({
    page,
    happoScreenshot
  }) => {
    const transferPage = new TransferPOM(page);
    await transferPage.routeToTransferEntity();

    await transferPage.fillOperationTransferForm(
      TransferE2EValues.FROM_OPERATOR_NAME,
      TransferE2EValues.TO_OPERATOR_NAME,
      TransferE2EValues.OPERATION_NAME,
      TransferE2EValues.PAST_DATE,
    );

    await transferPage.submitTransfer();
    await transferPage.assertPastTransferSuccess();
    await analyzeAccessibility(page);
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Director - Transfer operation success - past date",
      variant: "default",
    });

    await transferPage.returnToTransferGrid();
    await transferPage.assertTransferRowInGrid(TransferE2EValues.OPERATION_NAME, TransferStatus.TRANSFERRED);
  });

  test("Can edit a pending transfer", async ({ page, happoScreenshot }) => {
    // Edit for CAS Director is not yet implemented in the frontend
    test.fail()

    const transferPage = new TransferPOM(page);

    await transferPage.routeToFixturePendingTransferDetail(TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME);

    await transferPage.assertEditDetailsVisible();
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Director - Transfer detail - read only",
      variant: "default",
    });

    await transferPage.clickEditDetails();
    await transferPage.fillEffectiveDate(TransferE2EValues.NEW_EFFECTIVE_DATE);
    await analyzeAccessibility(page, "Transfer detail edit form");
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Transfer detail - edit mode",
      variant: "default",
    });

    await transferPage.submitTransfer();
    await transferPage.assertEditDetailsVisible();
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Transfer detail - after edit saved",
      variant: "default",
    });
  });

  test("Can cancel a pending transfer", async ({ page, happoScreenshot }) => {
    // Cancel for CAS Director is not yet implemented in the frontend
    test.fail();

    const transferPage = new TransferPOM(page);

    await transferPage.routeToFixturePendingTransferDetail(TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME);

    await transferPage.clickCancelTransfer();
    await transferPage.assertCancelConfirmationModal();
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Director - Cancel transfer - confirmation modal",
      variant: "default",
    });

    await transferPage.confirmCancelTransfer();
    await transferPage.assertTransferCancelled(TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME);
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Director - Transfers grid - after cancellation",
      variant: "default",
    });
  });
});
