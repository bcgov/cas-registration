// 🧪 Suite to test the transfer facility workflow for CAS Analyst and CAS Director
import { Page } from "@playwright/test";
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { TransferPOM } from "../../poms/transfer";
import { TransferE2EValues, TransferStatus } from "../../utils/enums";

const analystTest = setupBeforeEachTest(UserRole.CAS_ANALYST);
const directorTest = setupBeforeEachTest(UserRole.CAS_DIRECTOR);

async function futureFacilityTransferTest(
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
  await analyzeAccessibility(page);
  await transferPage.submitAndAssertTransfer("future");
  await takeStabilizedScreenshot(happoScreenshot, page, {
    component: `${roleLabel} - Transfer facility success - future date`,
    variant: "default",
  });
  await transferPage.assertTransferRowInGrid(
    TransferE2EValues.FACILITY_NAME,
    TransferStatus.TO_BE_TRANSFERRED,
  );
}

async function pastFacilityTransferTest(page: Page) {
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
  await transferPage.submitAndAssertTransfer("past");
  await analyzeAccessibility(page);
  await transferPage.assertTransferRowInGrid(
    TransferE2EValues.FACILITY_NAME,
    TransferStatus.TRANSFERRED,
  );
}

analystTest.describe("CAS Analyst - Transfer Facility", () => {
  analystTest.describe.configure({ mode: "serial", timeout: 120000 });
  analystTest(
    "Transfer facility with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) =>
      futureFacilityTransferTest(page, happoScreenshot, "CAS Analyst"),
  );

  analystTest(
    "Transfer facility with past effective date shows 'Transferred' status",
    async ({ page }) => pastFacilityTransferTest(page),
  );

  analystTest(
    "Can edit a pending facility transfer",
    async ({ page, happoScreenshot }) => {
      const transferPage = new TransferPOM(page);
      await transferPage.routeToFixturePendingTransferDetail(
        TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME,
      );
      await transferPage.assertEditDetailsVisible();
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "CAS Analyst - Transfer facility detail - read only",
        variant: "default",
      });
      await transferPage.editEffectiveDate(
        TransferE2EValues.NEW_EFFECTIVE_DATE,
      );
    },
  );

  analystTest(
    "Can cancel a pending facility transfer",
    async ({ page, happoScreenshot }) => {
      const transferPage = new TransferPOM(page);
      await transferPage.routeToFixturePendingTransferDetail(
        TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME,
      );
      await transferPage.clickCancelTransfer();
      await transferPage.assertCancelConfirmationModal();
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component:
          "CAS Analyst - Cancel facility transfer - confirmation modal",
        variant: "default",
      });
      await transferPage.confirmCancelTransfer();
      await transferPage.assertTransferCancelled(
        TransferE2EValues.FIXTURE_PENDING_FACILITY_NAME,
      );
    },
  );
});

// CAS Director can view and create transfers but cannot edit or cancel them
directorTest.describe("CAS Director - Transfer Facility", () => {
  directorTest.describe.configure({ mode: "serial", timeout: 120000 });
  directorTest(
    "Transfer facility with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) =>
      futureFacilityTransferTest(page, happoScreenshot, "CAS Director"),
  );

  directorTest(
    "Transfer facility with past effective date shows 'Transferred' status",
    async ({ page }) => pastFacilityTransferTest(page),
  );
});
