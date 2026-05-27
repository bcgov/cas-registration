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
import { TransferE2EValues, TransferStatus } from "../../../utils/enums";

const test = setupBeforeEachTest(UserRole.CAS_ANALYST);

test.describe.configure({ mode: "serial" });
test.describe("CAS Analyst - Transfer Operation", () => {
  test("'Make a Transfer' button is visible in the transfers grid", async ({
    page,
  }) => {
    const transferPage = new TransferPOM(page);
    await transferPage.route();
    await transferPage.assertMakeTransferButtonVisible();
  });

  test("Transfer operation with future effective date shows 'To be transferred' status", async ({
    page,
    happoScreenshot,
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
      component: "CAS Analyst - Transfer operation form - filled",
      variant: "filled",
    });
    await analyzeAccessibility(page);

    await transferPage.assertTransferSuccess("future");

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfer operation success - future date",
      variant: "default",
    });

    await transferPage.assertTransferRowInGrid(
      TransferE2EValues.OPERATION_NAME,
      TransferStatus.TO_BE_TRANSFERRED,
    );
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfers grid - operation To be transferred",
      variant: "default",
    });
  });

  test("Transfer operation with past effective date shows 'Transferred' status", async ({
    page,
    happoScreenshot,
  }) => {
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
      component: "CAS Analyst - Transfer operation success - past date",
      variant: "default",
    });

    await transferPage.assertTransferRowInGrid(
      TransferE2EValues.OPERATION_NAME,
      TransferStatus.TRANSFERRED,
    );

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfers grid - operation transferred",
      variant: "default",
    });
  });

  test("Can edit a pending transfer", async ({ page, happoScreenshot }) => {
    const transferPage = new TransferPOM(page);

    await transferPage.routeToFixturePendingTransferDetail(
      TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME,
    );

    await transferPage.assertEditDetailsVisible();

    await analyzeAccessibility(page);
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfer detail - read only",
      variant: "default",
    });

    await transferPage.editEffectiveDate(TransferE2EValues.NEW_EFFECTIVE_DATE);

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Transfer detail - after edit saved",
      variant: "default",
    });
  });

  test("Can cancel a pending transfer", async ({ page, happoScreenshot }) => {
    const transferPage = new TransferPOM(page);

    await transferPage.routeToFixturePendingTransferDetail(
      TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME,
    );

    await transferPage.clickCancelTransfer();
    await transferPage.assertCancelConfirmationModal();
    // happo screenshot
    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "CAS Analyst - Cancel transfer - confirmation modal",
      variant: "default",
    });

    await transferPage.confirmCancelTransfer();
    await transferPage.assertTransferCancelled(
      TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME,
    );
  });
});
