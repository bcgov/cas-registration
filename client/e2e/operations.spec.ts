import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  console.log(`Running ${testInfo.title}`);
  await page.goto("http://localhost:3000/operations");
});

test("user can create a new operation", async ({ page }) => {
  page.getByRole("button", { name: /add operation/i }).click();

  // fill form
  await page.fill("#root_operator_id", "1");
  await page.fill("#root_name", "Sample Operation Name");
  await page.fill("#root_operation_type", "Sample Operation Type");
  await page.click("#root_naics_code_id");
  page.getByRole("option", { name: /1/i }).click();
  // Click elsewhere to close the dropdown. In certain browsers, a single click doesn't work
  await page.click("body");
  await page.click("body");
  await page.fill(
    "#root_eligible_commercial_product_name",
    "Sample Product Name",
  );
  await page.fill("#root_permit_id", "Sample Permit ID");
  await page.fill("#root_npr_id", "Sample NPR ID");
  await page.fill("#root_ghfrp_id", "Sample GHFRP ID");
  await page.fill("#root_bcghrp_id", "Sample BCGHRP ID");
  await page.fill("#root_petrinex_id", "Sample Petrinex ID");
  await page.fill("#root_latitude", "42.12345");
  await page.fill("#root_longitude", "-71.98765");
  await page.fill(
    "#root_legal_land_description",
    "Sample Legal Land Description",
  );
  await page.fill("#root_nearest_municipality", "Sample Municipality");
  await page.fill("#root_operator_percent_of_ownership", "50");
  await page.fill("#root_estimated_emissions", "1000");

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
    .getByRole("button", { name: /view details/i })
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
