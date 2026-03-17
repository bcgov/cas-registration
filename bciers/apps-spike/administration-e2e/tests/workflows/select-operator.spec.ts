// 🧪 Suite to test the administration industry_user workflow
import { setupBeforeEachTest } from "@bciers/e2e/setupBeforeEach";
// 🪄 Page Object Models
import { OperatorPOM } from "@/administration-e2e/poms/operator";
// ☰ Enums
import {
  AppRoute,
  MessageTextOperatorSelect,
  OperatorE2EValue,
  SecondaryUserOperatorFixtureFields,
  UserAccessRequestStatus,
} from "@/administration-e2e/utils/enums";
import { UserRole } from "@bciers/e2e/utils/enums";
// 🛠️ Helpers
import {
  analyzeAccessibility,
  assertSuccessfulSnackbar,
  linkIsVisible,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { upsertUserOperatorRecord } from "@bciers/e2e/utils/queries";
import { FrontendMessages } from "@bciers/utils/src/enums";

const test = setupBeforeEachTest(UserRole.INDUSTRY_USER);

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Test select operator paths", () => {
  // 👤 run test using the storageState for this role
  test("Select by legal name existing operator with existing admin", async ({
    page,
    happoScreenshot,
  }) => {
    // setup pageContent for happo
    const pageContent = page.locator("html");
    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action search by legal name
    await selectOperatorPage.selectByLegalName(
      OperatorE2EValue.SEARCH_LEGAL_NAME,
      "Bravo Technologies - has parTNER operator - name from admin",
    );

    await happoScreenshot(pageContent, {
      component: "Select operator form",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 👉 Action request administrator access
    await selectOperatorPage.requestAccess();

    // 🔍 Assert access requested message
    await selectOperatorPage.msgRequestAccessConfirmedIsVisible();
    // 📷 Cheese!

    await happoScreenshot(pageContent, {
      component: "Select operator access request confirmation",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Select by CRA number existing operator with no admin", async ({
    page,
    happoScreenshot,
  }) => {
    // setup pageContent for happo
    const pageContent = page.locator("html");
    // 🛸 Navigates to select operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action search by CRA number (Delta Innovations)
    await selectOperatorPage.selectByCraNumber("987654323");

    // 👉 Action accept operator
    await selectOperatorPage.acceptOperator();
    // 👉 Action request administrator access
    await selectOperatorPage.requestAccessAdmin();

    // 🔍 Assert access requested message
    await selectOperatorPage.msgRequestAccessAdminConfirmedIsVisible();
    // 📷 Cheese!

    await happoScreenshot(pageContent, {
      component: "Select operator admin access request confirmation",
      variant: "default",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);
  });
  test("Add new operator", async ({ page, happoScreenshot }) => {
    // 🛸 Navigates to add operator
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_ADD);
    // 👉 Action fill all operator form fields
    await selectOperatorPage.fillRequiredInformation();
    const pageContent = page.locator("html");
    await happoScreenshot(pageContent, {
      component: "Add operator form",
      variant: "filled",
    });
    // ♿️ Analyze accessibility
    await analyzeAccessibility(page);

    await selectOperatorPage.buttonSave.click();
    await assertSuccessfulSnackbar(page, FrontendMessages.SUBMIT_CONFIRMATION);
  });
});

test.describe("Declined access request", () => {
  // Set the secondary user (INDUSTRY_USER / bc-cas-dev-secondary) to Declined
  // directly via DB so the fixture `page` is the same user happo is bound to.
  // This avoids the happo "Frame has been detached" error that occurs when
  // passing a locator from openNewBrowserContextAs() to happoScreenshot().
  test.beforeEach(async () => {
    await upsertUserOperatorRecord(
      SecondaryUserOperatorFixtureFields.USER,
      SecondaryUserOperatorFixtureFields.ROLE_PENDING,
      UserAccessRequestStatus.DECLINED,
    );
  });

  test("View declined access request message", async ({
    page,
    happoScreenshot,
  }) => {
    const selectOperatorPage = new OperatorPOM(page);
    await selectOperatorPage.route(AppRoute.OPERATOR_SELECT);
    await selectOperatorPage.urlIsCorrect(AppRoute.OPERATOR_SELECT);

    // 👉 Action search by legal name — navigates to confirm page
    await selectOperatorPage.selectByLegalName(
      OperatorE2EValue.SEARCH_LEGAL_NAME,
      "Bravo Technologies - has parTNER operator - name from admin",
    );

    // 🔍 Assert the declined message is shown (waits up to 30s for client-side nav)
    await selectOperatorPage.msgRequestAccessDeclinedIsVisible();
    await linkIsVisible(
      page,
      MessageTextOperatorSelect.SELECT_ANOTHER_OPERATOR,
      true,
    );

    await takeStabilizedScreenshot(happoScreenshot, page, {
      component: "Decline a user operator request",
      variant: "default",
    });
  });
});
