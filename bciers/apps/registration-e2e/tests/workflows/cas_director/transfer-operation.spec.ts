// 🧪 Suite to test the CAS Director transfer operation workflow
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import * as transferOperationHelpers from "../../../utils/transfer-operation-helpers";

const test = setupBeforeEachTest(UserRole.CAS_DIRECTOR);
const roleLabel = "CAS Director";

test.describe.configure({ mode: "serial" });

test.describe("CAS Director - Transfer Operation", () => {
  test("'Make a Transfer' button is visible in the transfers grid", async ({
    page,
    happoScreenshot,
  }) => {
    await transferOperationHelpers.transfersGridTest(
      page,
      happoScreenshot,
      roleLabel,
    );
  });

  test("Transfer operation with future effective date shows 'To be transferred' status", async ({
    page,
    happoScreenshot,
  }) => {
    await transferOperationHelpers.futureOperationTransferTest(
      page,
      happoScreenshot,
      roleLabel,
    );
  });

  test("Transfer operation with past effective date shows 'Transferred' status", async ({
    page,
    happoScreenshot,
  }) => {
    await transferOperationHelpers.pastOperationTransferTest(
      page,
      happoScreenshot,
      roleLabel,
    );
  });

  test("Can edit a pending transfer", async ({ page, happoScreenshot }) => {
    test.skip(
      true,
      "Edit for CAS Director is not yet implemented in the frontend, skipping for now so that the whole test doesn't need to run",
    );

    await transferOperationHelpers.editPendingOperationTransferTest(
      page,
      happoScreenshot,
      roleLabel,
    );
  });

  test("Can cancel a pending transfer", async ({ page, happoScreenshot }) => {
    test.skip(
      true,
      "Cancel for CAS Director is not yet implemented in the frontend, skipping for now so that the whole test doesn't need to run",
    );

    await transferOperationHelpers.cancelPendingOperationTransferTest(
      page,
      happoScreenshot,
      roleLabel,
    );
  });
});
