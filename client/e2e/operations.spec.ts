import { test, expect } from "@playwright/test";

// Annotate entire file as serial.
test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page }, testInfo) => {
  // eslint-disable-next-line no-console
  console.log(`Running ${testInfo.title}`);
  // reset db and confirm there are no errors setting up the test data
  await page.goto("http://localhost:8000/api/registration/test-setup");
  await expect(page.getByText(/Test setup failed/i)).not.toBeVisible();
  await expect(
    page.getByText(
      /This endpoint only exists in the development environment./i,
    ),
  ).not.toBeVisible();
  await expect(page.getByText(/Test setup complete/i)).toBeVisible();

  // navigate to operations page
  await page.goto("http://localhost:3000/dashboard/operations");
});

test.afterEach(async ({ page }, testInfo) => {
  // eslint-disable-next-line no-console
  console.log(`Closing ${testInfo.title} in project ${testInfo.project.name}`);
  await page.close();
});

test("user can create a new operation", async ({ page }) => {
  // 👌 Best Practice:
  // prefer user-facing attributes to XPath or CSS selectors
  // this verifies that the application code works for the end users
  // find locators using codegen to record user actions: npx playwright codegen http://localhost:3000/operations/create
  await page.getByRole("button", { name: "Add Operation" }).click();
  // Step 1
  await page.getByLabel("Operation Name*").fill("Sample Operation Name");
  await page
    .getByLabel("Operation Type*")
    .selectOption("Single Facility Operation");
  await page.getByLabel("NAICS Code*").selectOption("0"); // 1
  await page.getByLabel("NAICS Category*").selectOption("0"); // 1
  await page
    .getByLabel("Is the operation an opt-in operation?")
    .selectOption("No");

  // Step 2: Operation Operator Information

  // Step 3: Operation Lead Information

  // submit form
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page.getByText(/fail/i)).not.toBeVisible();
  // confirmation message
  await expect(
    page.getByText(
      /Your request to register Sample Operation Name has been received./i,
    ),
  ).toBeVisible();
});

test("user can edit an existing operation", async ({ page }) => {
  page
    .getByRole("button", { name: /start registration/i })
    .first()
    .click();

  // change a form field
  await page.getByLabel("Operation Name*").fill("CHANGED");

  // submit form
  await page.getByRole("button", { name: "Submit" }).click();

  // confirmation message
  await expect(
    page.getByText(/Your request to register CHANGED has been received./i),
  ).toBeVisible();
});

test("user can approve a pending operation", async ({ page }) => {
  page
    .getByRole("button", { name: /start registration/i })
    .first()
    .click();

  // click button to approve
  await page
    .getByRole("button", { name: /approve/i })
    .first()
    .click();

  // check for confirmation message
  await expect(page.getByText(/You have approved the request/i)).toBeVisible();
});

test("user can reject a pending operation", async ({ page }) => {
  page
    .getByRole("button", { name: /start registration/i })
    .first()
    .click();

  // click button to reject
  await page
    .getByRole("button", { name: /reject/i })
    .first()
    .click();

  // check for confirmation message
  await expect(page.getByText(/You have rejected the request/i)).toBeVisible();
});
