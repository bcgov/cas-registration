import { test, expect } from "@playwright/test";
import { checkboxChecker } from "./helpers";
const { execSync } = require("child_process");

test.beforeEach(async ({ page }, testInfo) => {
  // eslint-disable-next-line no-console
  console.log(`Running ${testInfo.title}`);
  // load fixtures
  const newDirectory = "../bc_obps";
  const clearDatabase = `cd ${newDirectory} && poetry run make clear_db`;
  const loadFixtures = `cd ${newDirectory} && poetry run make loadfixtures`;
  const executeClear = execSync(clearDatabase, { encoding: "utf-8" });
  const executeLoad = execSync(loadFixtures, { encoding: "utf-8" });
  if (executeClear.error) {
    console.error("Error clearing fixtures:", executeClear?.error);
  }
  if (executeLoad.error) {
    console.error("Error loading fixtures:", executeLoad?.error);
  }
  // navigate to operations page
  await page.goto("http://localhost:3000/operations");
});
test("user can create a new operation", async ({ page }) => {
  page.getByRole("button", { name: /add operation/i }).click();

  // Step 1
  await page.fill("#root_name", "Sample Operation Name");
  await page.fill("#root_type", "Your Operation Type");

  await page.selectOption("#root_naics_code_id", { label: "1" });
  await page.selectOption("#root_naics_category_id", {
    label: "1",
  });

  await page.fill("#root_reporting_activities", "Your Reporting Activities");
  await page.fill("#root_permit_issuing_agency", "Your Permit Issuing Agency");
  await page.fill("#root_permit_number", "Your Permit Number");
  // if the id or aria-role contains numbers or special characters, we have to use the checkboxChecker function
  checkboxChecker(
    page,
    "Did you submit a GHG emissions report for reporting year 2022?",
  );

  await page.fill("#root_current_year_estimated_emissions", "569");
  await page.check("#root_opt_in");
  await page.check("#root_major_new_operation");

  // Step 2: Operation Type Information
  await page.fill("#root_physical_street_address", "Your Physical Address");
  await page.fill("#root_physical_municipality", "Your Municipality");
  await page.selectOption("#root_physical_province", "BC");
  await page.fill("#root_physical_postal_code", "V8V 1S1");
  await page.fill(
    "#root_legal_land_description",
    "Your Legal Land Description",
  );
  await page.fill("#root_latitude", "64.5");
  await page.fill("#root_longitude", "54.5745");
  await page.fill("#root_npri_id", "45");
  await page.fill("#root_bcer_permit_id", "755");

  // Step 3: Operation Operator Information

  // Step 4: Operation Representative (OR) Information

  // submit form
  page.getByRole("button", { name: /submit/i }).click();

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
  await page.fill("#root_name", "CHANGED");

  // submit form
  page.getByRole("button", { name: /submit/i }).click();

  // confirmation message
  await expect(
    page.getByText(/Your request to register CHANGED has been received./i),
  ).toBeVisible();
});
