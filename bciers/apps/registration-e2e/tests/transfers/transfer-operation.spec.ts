// 🧪 Suite to test the transfer operation workflow for CAS Analyst and CAS Director
import { Page } from "@playwright/test";
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  analyzeAccessibility,
  stabilizeGrid,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { TransferPOM } from "../../poms/transfer";
import { TransferE2EValues, TransferStatus } from "../../utils/enums";

const analystTest = setupBeforeEachTest(UserRole.CAS_ANALYST);
const directorTest = setupBeforeEachTest(UserRole.CAS_DIRECTOR);

async function transfersGridTest(
  page: Page,
  happoScreenshot: any,
  roleLabel: string,
) {
  const transferPage = new TransferPOM(page);
  await transferPage.route();
  await transferPage.assertMakeTransferButtonVisible();
  await stabilizeGrid(page, 6);
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfers grid`,
    variant: "default",
  });
  await analyzeAccessibility(page);
}

async function futureOperationTransferTest(
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
  await transferPage.submitAndAssertTransfer("future");
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfer operation success - future date`,
    variant: "default",
  });
  await transferPage.assertTransferRowInGrid(
    TransferE2EValues.OPERATION_NAME,
    TransferStatus.TO_BE_TRANSFERRED,
  );
}

async function pastOperationTransferTest(
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
  await transferPage.submitAndAssertTransfer("past");
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

analystTest.describe("CAS Analyst - Transfer Operation", () => {
  analystTest.describe.configure({ mode: "serial", timeout: 120000 });
  analystTest(
    "'Make a Transfer' button is visible in the transfers grid",
    async ({ page, happoScreenshot }) =>
      transfersGridTest(page, happoScreenshot, "CAS Analyst"),
  );

  analystTest(
    "Transfer operation with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) =>
      futureOperationTransferTest(page, happoScreenshot, "CAS Analyst"),
  );

  analystTest(
    "Transfer operation with past effective date shows 'Transferred' status",
    async ({ page, happoScreenshot }) =>
      pastOperationTransferTest(page, happoScreenshot, "CAS Analyst"),
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

// CAS Director can view and create transfers but cannot edit or cancel them
directorTest.describe("CAS Director - Transfer Operation", () => {
  directorTest.describe.configure({ mode: "serial", timeout: 120000 });
  directorTest(
    "'Make a Transfer' button is visible in the transfers grid",
    async ({ page, happoScreenshot }) =>
      transfersGridTest(page, happoScreenshot, "CAS Director"),
  );

  directorTest(
    "Transfer operation with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) =>
      futureOperationTransferTest(page, happoScreenshot, "CAS Director"),
  );

  directorTest(
    "Transfer operation with past effective date shows 'Transferred' status",
    async ({ page, happoScreenshot }) =>
      pastOperationTransferTest(page, happoScreenshot, "CAS Director"),
  );
});
