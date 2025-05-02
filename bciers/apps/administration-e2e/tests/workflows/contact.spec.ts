import { test, expect } from "@playwright/test";
import { AppName } from "@/administration-e2e/utils/constants";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  analyzeAccessibility,
  setupTestEnvironment,
  takeStabilizedScreenshot,
  clickButton,
} from "@bciers/e2e/utils/helpers";
import { ContactsPOM } from "@/administration-e2e/poms/contacts";

const happoPlaywright = require("happo-playwright");

test.beforeAll(async () => {
  await setupTestEnvironment(AppName + "-" + UserRole.INDUSTRY_USER_ADMIN);
});

test.beforeEach(async ({ context }) => {
  await happoPlaywright.init(context);
});

test.afterEach(async () => {
  await happoPlaywright.finish();
});

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Test add/edit contact", () => {
  // 👤 run test using the storageState for this role
  const storageState = JSON.parse(
    process.env.E2E_INDUSTRY_USER_ADMIN_STORAGE_STATE as string,
  );
  test.use({ storageState: storageState });

  test("Manually add a contact", async ({ page }) => {
    // 🛸 Navigate to contacts page
    const contactsPage = new ContactsPOM(page);
    await contactsPage.route();
    await page.waitForTimeout(500);
    // Add a new contact
    await clickButton(page, /add contact/i);

    // Note is only visible when adding a contact
    const footnote = page.getByText(
      /^Note:\s*you can assign this representative to an operation directly/i,
    );
    await expect(footnote).toBeVisible();

    // Fill contact information
    await contactsPage.contactInformation("fill");
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Add Contact form",
      variant: "filled",
    });
    await analyzeAccessibility(page);

    // Submit form
    await clickButton(page, /save/i);

    // Wait for page to reload and verify note is not visible
    await page.waitForLoadState("load");
    await expect(footnote).toBeHidden();
  });

  test("Edit a contact", async ({ page }) => {
    const contactsPage = new ContactsPOM(page);

    // 🛸 Navigate to contacts page
    await contactsPage.route();

    // Search by email since email is unique
    await contactsPage.searchContactsGrid("bill.blue@example.com");

    // Get the href attribute
    const row = page
      .getByRole("row")
      .filter({ hasText: "bill.blue@example.com" });

    const view = row.getByRole("link", { name: "View Details" });
    const viewLink = await view.getAttribute("href");

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Contact grid",
      variant: "filled",
    });
    // TODO: investigate accessibility failing
    // await analyzeAccessibility(page);
    // Will use goto since navigation to this link is done manually in the frontend
    await page.goto(viewLink);

    // Check for presence of heading
    await expect(page.getByText(/Contact Details/i)).toBeVisible();

    // Edit form
    await expect(page.getByRole("button", { name: /Edit/i })).toBeVisible();
    await clickButton(page, /Edit/i);
    await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();

    // Edit the contact information
    await contactsPage.contactInformation("fill");
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Edit Contact form",
      variant: "filled",
    });
    await analyzeAccessibility(page);
    await clickButton(page, /save/i);

    // Verify that fields were updated
    await contactsPage.contactInformation("read");
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Contact form",
      variant: "filled",
    });
  });

  //Note: Creating contact from registration is under register-an-operation.spec.ts
});
