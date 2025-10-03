import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
// import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { expect, request } from "@playwright/test";
// 🛠️ Helpers
// import {
//   stabilizeGrid,
//   getRowByUniqueCellValue,
// } from "@bciers/e2e/utils/helpers";
import { CompliancePOM } from "../poms/compliance";
// import { ReportingRecord } from "../utils/enums";
// import { baseBackendUrl } from "@bciers/e2e/utils/constants";

// const happoPlaywright = require("happo-playwright");
const test = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

test.beforeEach(async ({}) => {
  const requestContext = await request.newContext();
  // const url = `${baseBackendUrl}/reporting/report-version`;
  const response = await requestContext.post(
    "http://localhost:8000/api/reporting/report-version/3/submit",
    // `${url}/3/submit'`,
    {
      headers: {
        Authorization: '{"user_guid": "ba2ba62a-1218-42e0-942a-ab9e92ce8822"}',
        "Content-Type": "application/json",
      },
      data: {
        acknowledgement_of_review: true,
        acknowledgement_of_records: true,
        acknowledgement_of_information: true,
        acknowledgement_of_possible_costs: true,
        acknowledgements: {},
        signature: "Test",
        date: "Oct 02, 2025",
      },
    },
  );

  console.log("Status:", response.status());

  const body = await response.text(); // fallback in case it's not JSON
  console.log("Response body:", body);

  expect(response.ok()).toBeTruthy();
});

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Test voiding invoices", () => {
  // test("Supplementary report cancels outstanding balance", async ({ page }) => {
  //   // 🛸 Navigate to registration page
  //   // Set up reporting data
  //   const reportingPage = new CompliancePOM(page);
  //   await reportingPage.page.goto(reportingPage.currentReportingUrl);
  //   const reportingRow = await getRowByUniqueCellValue(
  //     reportingPage.page,
  //     "operation_name",
  //     ReportingRecord.OPERATION_NAME,
  //   );

  //   console.log('reporting record', reportingRow);
  //   await expect(reportingRow).toBeVisible();
  //   await stabilizeGrid(reportingPage.page, 1);
  //   const continueButton = await reportingRow.getByRole('button', { name: 'Continue' });
  //   await continueButton.click();
  //   const currentUrl = await reportingPage.page.url();
  //   console.log(currentUrl);

  // });

  test("Submit report", async ({ page }) => {
    const compliancePage = new CompliancePOM(page);
    await compliancePage.routeToComplianceSummaries();
    await expect(
      page.getByText("Compliance SFO - Obligation not met"),
    ).toBeVisible();
  });
});
