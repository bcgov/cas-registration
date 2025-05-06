import { UserRole } from "@bciers/e2e/utils/enums";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { expect } from "@playwright/test";
// 🛠️ Helpers
import {
  analyzeAccessibility,
  clickButton,
  takeStabilizedScreenshot,
} from "@bciers/e2e/utils/helpers";
import { RegistrationPOM } from "../poms/registration";
import {
  OperationRegistrationSteps,
  RegistrationPurposes,
} from "@/registration/app/components/operations/registration/enums";
import { ContactsPOM } from "../../administration-e2e/poms/contacts";
import { ContactE2EValue } from "@/administration-e2e/utils/enums";

const happoPlaywright = require("happo-playwright");
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Test register operations", () => {
  test("Register a new SFO operation", async ({ page }) => {
    // 🛸 Navigate to registration page
    const registrationPage = new RegistrationPOM(page);
    await registrationPage.route();
    let componentName;

    // STEP 1
    componentName = "Registration Operation Information";
    await registrationPage.assertHeading(
      OperationRegistrationSteps.OPERATION_INFORMATION,
    );
    await registrationPage.fillNewOperationInformation(
      RegistrationPurposes.NEW_ENTRANT_OPERATION,
    );
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: componentName,
      variant: "filled",
    });
    await analyzeAccessibility(page, componentName);
    await registrationPage.clickSaveAndContinue();

    await registrationPage.waitForRegistrationUrl(2);

    // // STEP 2
    componentName = "Registration SFO Facility Information";
    await registrationPage.assertHeading(
      OperationRegistrationSteps.FACILITY_INFORMATION,
    );
    await registrationPage.fillSfoFacilityInformation();
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: componentName,
      variant: "filled",
    });
    await analyzeAccessibility(page, componentName);
    await registrationPage.clickSaveAndContinue();
    await registrationPage.waitForRegistrationUrl(3);

    // // STEP 2
    componentName = "Registration New Entrant Information";
    await registrationPage.assertHeading(/new entrant operation/i);
    await registrationPage.fillNewEntrantInformation();
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: componentName,
      variant: "filled",
    });
    await analyzeAccessibility(page, componentName);
    await registrationPage.clickSaveAndContinue();
    await registrationPage.waitForRegistrationUrl(3);

    // STEP 4
    componentName = "Registration Operation Representative";
    await registrationPage.assertHeading(
      OperationRegistrationSteps.OPERATION_REPRESENTATIVE,
    );
    await registrationPage.fillNewOperationRepresentative();
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: componentName,
      variant: "filled",
    });
    // TODO fix the accessibility errors and uncomment:  https://github.com/bcgov/cas-registration/issues/3198
    // await analyzeAccessibility(page, componentName);
    await clickButton(registrationPage.page, /continue/i); // button on this form is `Continue` instead of `Save and Continue`
    await registrationPage.waitForRegistrationUrl(5);

    // STEP 5
    componentName = "Registration Submission";
    await registrationPage.assertHeading(OperationRegistrationSteps.SUBMISSION);
    await registrationPage.fillSubmission();
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: componentName,
      variant: "filled",
    });
    await analyzeAccessibility(page, componentName);
    await clickButton(registrationPage.page, /submit/i); // button on this form is `Submit`

    // CONFIRMATION
    componentName = "Registration Confirmation";
    await expect(
      registrationPage.page.getByText(/registration complete/i),
    ).toBeVisible();
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: componentName,
      variant: "default",
    });
    await analyzeAccessibility(page);

    // Check operation representative in contacts grid
    componentName = "Operation Representative in contacts grid";
    const contactInformation = new ContactsPOM(page);
    await contactInformation.route();
    await contactInformation.searchContactsGrid(ContactE2EValue.EMAIL_ADDRESS);
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: componentName,
      variant: "filled",
    });
  });

  test("Register an existing LFO operation", async ({ page }) => {
    // 🛸 Navigate to registration page
    const registrationPage = new RegistrationPOM(page);
    await registrationPage.route();
    let componentName;

    // STEP 1
    await registrationPage.assertHeading(
      OperationRegistrationSteps.OPERATION_INFORMATION,
    );
    await registrationPage.fillExistingOperationInformation(
      RegistrationPurposes.OPTED_IN_OPERATION,
    );

    await registrationPage.clickSaveAndContinue();

    await registrationPage.waitForRegistrationUrl(2);

    // // STEP 2
    componentName = "Registration LFO Facility Information";
    await registrationPage.assertHeading(
      OperationRegistrationSteps.FACILITY_INFORMATION,
    );
    await registrationPage.fillLfoFacilityInformation();
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: componentName,
      variant: "filled",
    });
    // TODO fix the accessibility errors and uncomment:  https://github.com/bcgov/cas-registration/issues/3198
    // await analyzeAccessibility(page, componentName);
    await registrationPage.clickSaveAndContinue();
    await registrationPage.waitForRegistrationUrl(3);

    // // STEP 2
    componentName = "Registration Opt-In Application";
    await registrationPage.assertHeading(
      OperationRegistrationSteps.OPT_IN_APPLICATION,
    );
    await registrationPage.fillOptInInformation(registrationPage.page);
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: componentName,
      variant: "filled",
    });
    await analyzeAccessibility(page, componentName);
    await registrationPage.clickSaveAndContinue();
    await registrationPage.waitForRegistrationUrl(3);

    // STEP 4
    await registrationPage.assertHeading(
      OperationRegistrationSteps.OPERATION_REPRESENTATIVE,
    );
    await registrationPage.fillExistingOperationRepresentative();
    await clickButton(registrationPage.page, /continue/i); // button on this form is `Continue` instead of `Save and Continue`
    await registrationPage.waitForRegistrationUrl(5);

    // STEP 5
    await registrationPage.assertHeading(OperationRegistrationSteps.SUBMISSION);
    await registrationPage.fillSubmission();
    await clickButton(registrationPage.page, /submit/i); // button on this form is `Submit`
    await expect(
      registrationPage.page.getByText(/registration complete/i),
    ).toBeVisible();
  });
});
