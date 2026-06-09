// 🧪 Suite to test the CAS Director transfer facility workflow
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import * as transferFacilityHelpers from "../../../utils/transfer-facility-helpers";

const test = setupBeforeEachTest(UserRole.CAS_DIRECTOR);
const roleLabel = "CAS Director";

// 🏷 Annotate test suite as serial to use 1 worker - prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial", timeout: 120000 });

test.describe("CAS Director - Transfer Facility", () => {
  test("Transfer facility with future effective date shows 'To be transferred' status", async ({
    page,
    happoScreenshot,
  }) => {
    await transferFacilityHelpers.futureFacilityTransferTest(
      page,
      happoScreenshot,
      roleLabel,
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
    test.skip(
      true,
      "Edit for CAS Director is not yet implemented in the frontend, skipping for now so that the whole test doesn't need to run",
    );

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
    test.skip(
      true,
      "Cancel for CAS Director is not yet implemented in the frontend, skipping for now so that the whole test doesn't need to run",
    );

    await transferFacilityHelpers.cancelPendingFacilityTransferTest(
      page,
      happoScreenshot,
      roleLabel,
    );
  });
});
