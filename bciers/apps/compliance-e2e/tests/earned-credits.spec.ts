import { expect } from "@playwright/test";
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  takeStabilizedScreenshot,
  submitReport,
  urlIsCorrect,
  checkAlertMessage,
  openNewBrowserContextAs,
  clickButton,
  analyzeAccessibility,
} from "@bciers/e2e/utils/helpers";
import { CompliancePOM } from "../poms/compliance";
import {
  AlertNotes,
  BCCRValues,
  Comments,
  Operations,
  Paths,
} from "../utils/enums";

const happoPlaywright = require("happo-playwright");
const test = setupBeforeEachTest(UserRole.INDUSTRY_USER_ADMIN);

test.beforeEach(async () => {
  await submitReport(4); // Earned credits
});
// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Earned credits", () => {
  test("Verify presence of record in Compliance Summaries grid", async ({
    page,
  }) => {
    const compliancePage = new CompliancePOM(page);
    await compliancePage.routeToComplianceSummariesGrid();

    const row = await compliancePage.searchOperationByName(
      Operations.EARNED_CREDITS,
    );
    const status = await compliancePage.getValueByCellSelector(row, "status");

    // Verify correct action
    await compliancePage.assertActionIsCorrect(row, status);

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Compliance Summaries grid",
      variant: "default",
    });
  });

  test("Request Issuance of Credits", async ({ page }) => {
    const compliancePage = new CompliancePOM(page);
    await compliancePage.routeToComplianceSummariesGrid();

    const row = await compliancePage.searchOperationByName(
      Operations.EARNED_CREDITS,
    );
    const status = await compliancePage.getValueByCellSelector(row, "status");

    // Verify correct action
    await compliancePage.assertActionIsCorrect(row, status);
    const actionName = await compliancePage.getValueByCellSelector(
      row,
      "actions",
    );

    // Go to page
    const actionHref = await row
      .getByRole("link", { name: actionName })
      .getAttribute("href");
    await page.goto(actionHref);

    // Verify correct path
    const expectedAction = await compliancePage.getExpectedAction(status);
    const expectedPath = await compliancePage.getExpectedPath(expectedAction);
    await urlIsCorrect(page, expectedPath);

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "External user - Review Earned Credits Report page",
      variant: "default",
    });

    await checkAlertMessage(page, AlertNotes.EARNED_CREDITS_NOT_REQUESTED);

    // Click Continue
    const continueButton = await page.getByRole("button", { name: "Continue" });
    await expect(continueButton).toBeVisible();
    await continueButton.click();

    const requestIssuanceButton = await page
      .getByRole("button", { name: "Request Issuance of Earned Credits" })
      .last();
    await expect(requestIssuanceButton).toBeDisabled();
    // Enter correct BCCR Holding Account ID
    const bccrField = page.getByRole("textbox");
    await bccrField.fill(BCCRValues.BCCR_HOLDING_ACCOUNT_ID_BRAVO);

    // Wait for trading name
    // await expect(page.getByText(BCCRValues.BCCR_TRADING_NAME_BRAVO)).toBeVisible();
    await expect(requestIssuanceButton).toBeEnabled();

    await requestIssuanceButton.click();
    await page.waitForURL(`**/${Paths.TRACK_STATUS_OF_ISSUANCE}`);

    await checkAlertMessage(page, AlertNotes.EARNED_CREDITS_REQUESTED);

    // ---- LOG IN AS CAS ANALYST ----
    const casAnalystPage = await openNewBrowserContextAs(
      UserRole.CAS_ANALYST,
      happoPlaywright,
    );
    const analystCompliancePage = new CompliancePOM(casAnalystPage);
    await analystCompliancePage.routeToComplianceSummariesGrid();

    // Go to record
    const earnedCreditsRecordRow =
      await analystCompliancePage.searchOperationByName(
        Operations.EARNED_CREDITS,
      );
    const reviewEarnedCreditsAction =
      await analystCompliancePage.getValueByCellSelector(
        earnedCreditsRecordRow,
        "actions",
      );
    const reviewEarnedCreditsActionHref = await earnedCreditsRecordRow
      .getByRole("link", { name: reviewEarnedCreditsAction })
      .getAttribute("href");
    await casAnalystPage.goto(reviewEarnedCreditsActionHref);

    // Click Continue
    await clickButton(casAnalystPage, "Continue");
    await casAnalystPage.waitForURL(
      `**/${Paths.REVIEW_CREDITS_ISSUANCE_REQUEST}`,
    );

    // Approve as analyst - by default, ready to approve is already selected
    // Verify suggestion = Ready to approve
    await expect(
      casAnalystPage.getByRole("radio", { name: "Ready to approve" }),
    ).toBeChecked();
    await casAnalystPage.getByRole("textbox").fill(Comments.ANALYST_COMMENT);

    let component;
    component = "Analyst view - Review credits issuance request page";
    await takeStabilizedScreenshot(happoPlaywright, casAnalystPage, {
      component: component,
      variant: "filled",
    });
    await analyzeAccessibility(casAnalystPage);
    await clickButton(casAnalystPage, "Continue");

    await checkAlertMessage(casAnalystPage, AlertNotes.APPROVED_BY_ANALYST);
    component = "Analyst view - Review by director page";
    await casAnalystPage.waitForURL(`**/${Paths.REVIEW_BY_DIRECTOR}`);
    await takeStabilizedScreenshot(happoPlaywright, casAnalystPage, {
      component: component,
      variant: "default",
    });

    // ---- LOG IN AS CAS DIRECTOR ----
    const casDirectorPage = await openNewBrowserContextAs(
      UserRole.CAS_DIRECTOR,
      happoPlaywright,
    );
    const directorCompliancePage = new CompliancePOM(casDirectorPage);
    await directorCompliancePage.page.goto(reviewEarnedCreditsActionHref);
    await clickButton(directorCompliancePage.page, "Continue");

    await directorCompliancePage.page.waitForURL(
      `**/${Paths.REVIEW_CREDITS_ISSUANCE_REQUEST}`,
    );
    // component = "Director view - Review credits issuance request page";
    // await takeStabilizedScreenshot(happoPlaywright, casAnalystPage, {
    //   component: component,
    //   variant: "default",
    // });

    await clickButton(directorCompliancePage.page, "Continue");
    await directorCompliancePage.page.waitForURL(
      `**/${Paths.REVIEW_BY_DIRECTOR}`,
    );

    await directorCompliancePage.page
      .getByRole("textbox")
      .fill(Comments.DIRECTOR_COMMENT);

    await directorCompliancePage.page.route(
      (url) => url.pathname.endsWith("/doSubmit"),
      async (route, request) => {
        if (request.method() === "POST") {
          console.log("✅ Intercepted POST to /doSubmit endpoint");
          await route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({ success: true }),
          });
        } else {
          await route.fallback();
        }
      },
    );

    // Navigate to the review page
    // await page.goto(`/compliance-summaries/${complianceReportVersionId}/internal-review-by-director`);

    // Wait for the page to load
    // await page.waitForLoadState('networkidle');
    await clickButton(directorCompliancePage.page, "Approve");
    await directorCompliancePage.page.waitForURL(
      `**/${Paths.TRACK_STATUS_OF_ISSUANCE}`,
    );
  });
});
