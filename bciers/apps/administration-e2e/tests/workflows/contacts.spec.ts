import { expect } from "@playwright/test";
import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import {
  analyzeAccessibility,
  takeStabilizedScreenshot,
  clickButton,
  stabilizeGrid,
  assertSuccessfulSnackbar,
} from "@bciers/e2e/utils/helpers";
import { ContactsPOM } from "@/administration-e2e/poms/contacts";

const happoPlaywright = require("happo-playwright");
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

// 🏷 Annotate test suite as serial so to use 1 worker- prevents failure in setupTestEnvironment
test.describe.configure({ mode: "serial" });
test.describe("Test add/edit contact", () => {
  test("Manually add a contact", async ({ page }) => {
    // 🛸 Navigate to contacts page
    const contactsPage = new ContactsPOM(page);
    await contactsPage.route();

    // Add a new contact
    await contactsPage.clickAddButton();

    // Fill contact information
    await contactsPage.contactInformation("fill");
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Add Contact form",
      variant: "filled",
    });
    await analyzeAccessibility(page);

    // Submit form
    await clickButton(page, /save/i);
    await assertSuccessfulSnackbar(page);

    // Verify note is not visible
    await contactsPage.assertFootnoteIsVisible(false);
  });

  test("Edit a contact", async ({ page }) => {
    // 🛸 Navigate to contacts page
    const contactsPage = new ContactsPOM(page);
    await contactsPage.route();

    // Search by email since email is unique
    const searchResult = await contactsPage.searchContactsGrid(
      "bill.blue@example.com",
    );

    // Click View Details
    const viewDetails = searchResult
      .getByRole("link", {
        name: /view details/i,
      })
      .first();
    await stabilizeGrid(page, 1);
    await viewDetails.click();

    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Contacts grid",
      variant: "filled",
    });
    // TODO: investigate accessibility failing
    // await analyzeAccessibility(page);

    // Check for presence of heading
    await expect(page.getByText(/Contact Details/i)).toBeVisible();

    // Edit form
    await expect(page.getByRole("button", { name: /edit/i })).toBeVisible();
    await clickButton(page, /edit/i);
    await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();

    // Edit the contact information
    await contactsPage.contactInformation("fill");
    await clickButton(page, /save/i);

    // Verify that fields were updated
    await contactsPage.contactInformation("read");
    await takeStabilizedScreenshot(happoPlaywright, page, {
      component: "Contact form",
      variant: "filled",
    });
    await analyzeAccessibility(page);
  });
});
