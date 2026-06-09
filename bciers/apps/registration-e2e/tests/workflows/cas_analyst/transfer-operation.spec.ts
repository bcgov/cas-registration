// 🧪 Suite to test the CAS Analyst transfer operation workflow
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import * as transferOperationHelpers from "../../../utils/transfer-operation-helpers";

const test = setupBeforeEachTest(UserRole.CAS_ANALYST);
const roleLabel = "CAS Analyst";

test.describe.configure({ mode: "serial" });

test.describe("CAS Analyst - Transfer Operation", () => {
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
    await transferOperationHelpers.editPendingOperationTransferTest(
      page,
      happoScreenshot,
      roleLabel,
    );
  });

  test("Can cancel a pending transfer", async ({ page, happoScreenshot }) => {
    await transferOperationHelpers.cancelPendingOperationTransferTest(
      page,
      happoScreenshot,
      roleLabel,
    );
  });
});
