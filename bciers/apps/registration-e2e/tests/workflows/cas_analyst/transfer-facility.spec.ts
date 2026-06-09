// 🧪 Suite to test the CAS Analyst transfer facility workflow
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import * as transferFacilityHelpers from "../../../utils/transfer-facility-helpers";

const test = setupBeforeEachTest(UserRole.CAS_ANALYST);
const roleLabel = "CAS Analyst";

// 🏷 Annotate test suite as serial to use 1 worker - prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial", timeout: 120000 });

test.describe("CAS Analyst - Transfer Facility", () => {
  test("Transfer facility with future effective date shows 'To be transferred' status", async ({
    page,
    happoScreenshot,
  }) => {
    await transferFacilityHelpers.futureFacilityTransferTest(
      page,
      happoScreenshot,
      roleLabel,
      { includeAccessibility: true },
    );
  });

  test("Transfer facility with past effective date shows 'Transferred' status", async ({
    page,
  }) => {
    await transferFacilityHelpers.pastFacilityTransferTest(page);
  });

  test("Can edit a pending facility transfer", async ({
    page,
    happoScreenshot,
  }) => {
    await transferFacilityHelpers.editPendingFacilityTransferTest(
      page,
      happoScreenshot,
      roleLabel,
    );
  });

  test("Can cancel a pending facility transfer", async ({
    page,
    happoScreenshot,
  }) => {
    await transferFacilityHelpers.cancelPendingFacilityTransferTest(
      page,
      happoScreenshot,
      roleLabel,
    );
  });
});
