// 🧪 Suite to test the transfer facility workflow for CAS Analyst and CAS Director
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import * as transferFacilityHelpers from "../../utils/transfer-facility-helpers";

const analystTest = setupBeforeEachTest(UserRole.CAS_ANALYST);
const directorTest = setupBeforeEachTest(UserRole.CAS_DIRECTOR);

// 🏷 Annotate test suite as serial to use 1 worker - prevents failure in setupTestEnvironment
analystTest.describe.configure({ mode: "serial", timeout: 120000 });

analystTest.describe("CAS Analyst - Transfer Facility", () => {
  analystTest(
    "Transfer facility with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) => {
      await transferFacilityHelpers.futureFacilityTransferTest(
        page,
        happoScreenshot,
        "CAS Analyst",
        { includeAccessibility: true },
      );
    },
  );

  analystTest(
    "Transfer facility with past effective date shows 'Transferred' status",
    async ({ page }) => {
      await transferFacilityHelpers.pastFacilityTransferTest(page);
    },
  );

  analystTest(
    "Can edit a pending facility transfer",
    async ({ page, happoScreenshot }) => {
      await transferFacilityHelpers.editPendingFacilityTransferTest(
        page,
        happoScreenshot,
        "CAS Analyst",
      );
    },
  );

  analystTest(
    "Can cancel a pending facility transfer",
    async ({ page, happoScreenshot }) => {
      await transferFacilityHelpers.cancelPendingFacilityTransferTest(
        page,
        happoScreenshot,
        "CAS Analyst",
      );
    },
  );

  directorTest.describe("CAS Director - Transfer Facility", () => {
    directorTest(
      "Transfer facility with future effective date shows 'To be transferred' status",
      async ({ page, happoScreenshot }) => {
        await transferFacilityHelpers.futureFacilityTransferTest(
          page,
          happoScreenshot,
          "CAS Director",
        );
      },
    );

    directorTest(
      "Transfer facility with past effective date shows 'Transferred' status",
      async ({ page }) => {
        await transferFacilityHelpers.pastFacilityTransferTest(page);
      },
    );
  });
});
