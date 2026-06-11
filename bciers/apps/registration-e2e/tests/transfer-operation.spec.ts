// 🧪 Suite to test the transfer operation workflow for CAS Analyst and CAS Director
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  analyzeAccessibility,
  stabilizeGrid,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { TransferPOM } from "../poms/transfer";
import { TransferE2EValues, TransferStatus } from "../utils/enums";

const analystTest = setupBeforeEachTest(UserRole.CAS_ANALYST);
const directorTest = setupBeforeEachTest(UserRole.CAS_DIRECTOR);

analystTest.describe.configure({ mode: "serial" });

analystTest.describe("CAS Analyst - Transfer Operation", () => {
  analystTest(
    "'Make a Transfer' button is visible in the transfers grid",
    async ({ page, happoScreenshot }) => {
      const transferPage = new TransferPOM(page);
      await transferPage.route();
      await transferPage.assertMakeTransferButtonVisible();
      await stabilizeGrid(page, 6);
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "CAS Analyst - Transfers grid",
        variant: "default",
      });
      await analyzeAccessibility(page);
    },
  );

  analystTest(
    "Transfer operation with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) => {
      const transferPage = new TransferPOM(page);
      await transferPage.routeToTransferEntity();

      await transferPage.fillOperationTransferForm(
        TransferE2EValues.FROM_OPERATOR_NAME,
        TransferE2EValues.TO_OPERATOR_NAME,
        TransferE2EValues.OPERATION_NAME,
        TransferE2EValues.FUTURE_DATE,
      );
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
    },
  );

  analystTest(
    "Transfer operation with past effective date shows 'Transferred' status",
    async ({ page, happoScreenshot }) => {
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
    },
  );

  analystTest(
    "Can edit a pending transfer",
    async ({ page, happoScreenshot }) => {
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

      await transferPage.editEffectiveDate(
        TransferE2EValues.NEW_EFFECTIVE_DATE,
      );
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "CAS Analyst - Transfer detail - after edit saved",
        variant: "default",
      });
    },
  );

  analystTest(
    "Can cancel a pending transfer",
    async ({ page, happoScreenshot }) => {
      const transferPage = new TransferPOM(page);

      await transferPage.routeToFixturePendingTransferDetail(
        TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME,
      );

      await transferPage.clickCancelTransfer();
      await transferPage.assertCancelConfirmationModal();
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "CAS Analyst - Cancel transfer - confirmation modal",
        variant: "default",
      });

      await transferPage.confirmCancelTransfer();
      await transferPage.assertTransferCancelled(
        TransferE2EValues.FIXTURE_PENDING_OPERATION_NAME,
      );
    },
  );
});

directorTest.describe("CAS Director - Transfer Operation", () => {
  directorTest(
    "'Make a Transfer' button is visible in the transfers grid",
    async ({ page, happoScreenshot }) => {
      const transferPage = new TransferPOM(page);
      await transferPage.route();
      await transferPage.assertMakeTransferButtonVisible();
      await stabilizeGrid(page, 6);
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "CAS Director - Transfers grid",
        variant: "default",
      });
      await analyzeAccessibility(page);
    },
  );

  directorTest(
    "Transfer operation with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) => {
      const transferPage = new TransferPOM(page);
      await transferPage.routeToTransferEntity();

      await transferPage.fillOperationTransferForm(
        TransferE2EValues.FROM_OPERATOR_NAME,
        TransferE2EValues.TO_OPERATOR_NAME,
        TransferE2EValues.OPERATION_NAME,
        TransferE2EValues.FUTURE_DATE,
      );
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "CAS Director - Transfer operation form - filled",
        variant: "filled",
      });
      await analyzeAccessibility(page);

      await transferPage.assertTransferSuccess("future");
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "CAS Director - Transfer operation success - future date",
        variant: "default",
      });

      await transferPage.assertTransferRowInGrid(
        TransferE2EValues.OPERATION_NAME,
        TransferStatus.TO_BE_TRANSFERRED,
      );
    },
  );

  directorTest(
    "Transfer operation with past effective date shows 'Transferred' status",
    async ({ page, happoScreenshot }) => {
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
        component: "CAS Director - Transfer operation success - past date",
        variant: "default",
      });

      await transferPage.assertTransferRowInGrid(
        TransferE2EValues.OPERATION_NAME,
        TransferStatus.TRANSFERRED,
      );
    },
  );
});
