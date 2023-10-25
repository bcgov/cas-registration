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
  await page.getByLabel("Operation Type*").fill("Your Operation Type");
  await page.getByLabel("NAICS Code*").selectOption("0"); // 1
  await page.getByLabel("NAICS Category*").selectOption("0"); // 1
  await page
    .getByLabel("Reporting Activities*")
    .fill("Your Reporting Activities");
  await page
    .getByLabel("Permit Issuing Agency ")
    .fill("Your Permit Issuing Agency");
  await page.getByLabel("Permit Number").fill("Your Permit Number");
  // if locator contains numbers or special characters, e.g.
  await page.getByLabel("Estimated Emissions for reporting year 2023*").click();
  await page
    .getByLabel("Estimated Emissions for reporting year 2023*")
    .fill("569");
  await page.getByLabel("Is the operation an opt-in operation?").check();
  await page.getByLabel("Is the operation a major new operation?").check();

  // Step 2: Operation Type Information
  await page.getByLabel("Physical Address*").fill("Your Physical Address");
  await page.getByLabel("Municipality*").fill("Your Municipality");
  await page.getByLabel("Province*").selectOption("9"); // BC
  await page.getByLabel("Postal Code*").fill("V8V 1S1");
  await page
    .getByLabel("Legal Land Description*")
    .fill("Your Legal Land Description");
  await page.getByLabel("Lat coordinates*").fill("64.5");
  await page.getByLabel("Long coordinates*").fill("54.5745");
  await page.getByLabel("NPRI ID*").fill("45");
  await page.getByLabel("BCER permit ID*").fill("755");

  // Step 3: Operation Operator Information

  // Step 4: Operation Representative (OR) Information
  await page.screenshot({ path: "beforesubmit.png" });
  // submit form
  await page.getByRole("button", { name: "Submit" }).click();
  await page.waitForTimeout(2000);
  await page.screenshot({ path: "aftersubmit.png" });
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
