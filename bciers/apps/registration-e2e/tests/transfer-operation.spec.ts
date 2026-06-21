// 🧪 Suite to test the transfer operation workflow for CAS Analyst and CAS Director
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import * as transferOperationHelpers from "../utils/transfer-operation-helpers";

const analystTest = setupBeforeEachTest(UserRole.CAS_ANALYST);
const directorTest = setupBeforeEachTest(UserRole.CAS_DIRECTOR);

analystTest.describe("CAS Analyst - Transfer Operation", () => {
  analystTest.describe.configure({ mode: "serial", timeout: 120000 });
  analystTest(
    "'Make a Transfer' button is visible in the transfers grid",
    async ({ page, happoScreenshot }) => {
      await transferOperationHelpers.transfersGridTest(
        page,
        happoScreenshot,
        "CAS Analyst",
      );
    },
  );

  analystTest(
    "Transfer operation with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) => {
      await transferOperationHelpers.futureOperationTransferTest(
        page,
        happoScreenshot,
        "CAS Analyst",
      );
    },
  );

  analystTest(
    "Transfer operation with past effective date shows 'Transferred' status",
    async ({ page, happoScreenshot }) => {
      await transferOperationHelpers.pastOperationTransferTest(
        page,
        happoScreenshot,
        "CAS Analyst",
      );
    },
  );

  analystTest(
    "Can edit a pending transfer",
    async ({ page, happoScreenshot }) => {
      await transferOperationHelpers.editPendingOperationTransferTest(
        page,
        happoScreenshot,
        "CAS Analyst",
      );
    },
  );

  analystTest(
    "Can cancel a pending transfer",
    async ({ page, happoScreenshot }) => {
      await transferOperationHelpers.cancelPendingOperationTransferTest(
        page,
        happoScreenshot,
        "CAS Analyst",
      );
    },
  );
});

directorTest.describe("CAS Director - Transfer Operation", () => {
  directorTest.describe.configure({ mode: "serial", timeout: 120000 });
  directorTest(
    "'Make a Transfer' button is visible in the transfers grid",
    async ({ page, happoScreenshot }) => {
      await transferOperationHelpers.transfersGridTest(
        page,
        happoScreenshot,
        "CAS Director",
      );
    },
  );

  directorTest(
    "Transfer operation with future effective date shows 'To be transferred' status",
    async ({ page, happoScreenshot }) => {
      await transferOperationHelpers.futureOperationTransferTest(
        page,
        happoScreenshot,
        "CAS Director",
      );
    },
  );

  directorTest(
    "Transfer operation with past effective date shows 'Transferred' status",
    async ({ page, happoScreenshot }) => {
      await transferOperationHelpers.pastOperationTransferTest(
        page,
        happoScreenshot,
        "CAS Director",
      );
    },
  );
});
