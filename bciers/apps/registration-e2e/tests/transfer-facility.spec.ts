// 🧪 Suite to test the transfer facility workflow for CAS Analyst and CAS Director
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { TransferPOM } from "../poms/transfer";
import { TransferE2EValues, TransferStatus } from "../utils/enums";

const analystTest = setupBeforeEachTest(UserRole.CAS_ANALYST);
const directorTest = setupBeforeEachTest(UserRole.CAS_DIRECTOR);

// 🏷 Annotate test suite as serial to use 1 worker - prevents failure in setupTestEnvironment
analystTest.describe.configure({ mode: "serial", timeout: 120000 });

analystTest.describe("CAS Analyst - Transfer Facility", () => {
  analystTest(
    "Transfer facility with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) => {
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
    },
  );

  analystTest(
    "Transfer facility with past effective date shows 'Transferred' status",
    async ({ page }) => {
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
    },
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

directorTest.describe("CAS Director - Transfer Facility", () => {
  directorTest(
    "Transfer facility with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) => {
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
        component: "CAS Director - Transfer facility form - filled",
        variant: "filled",
      });

      await transferPage.assertTransferSuccess("future");
      await takeStabilizedScreenshot(happoScreenshot, page, {
        component: "CAS Director - Transfer facility success - future date",
        variant: "default",
      });

      await transferPage.assertTransferRowInGrid(
        TransferE2EValues.FACILITY_NAME,
        TransferStatus.TO_BE_TRANSFERRED,
      );
    },
  );

  directorTest(
    "Transfer facility with past effective date shows 'Transferred' status",
    async ({ page }) => {
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
    },
  );
});
