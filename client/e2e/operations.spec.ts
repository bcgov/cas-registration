import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }, testInfo) => {
  console.log(`Running ${testInfo.title}`);
  await page.goto("http://localhost:3000/operations");
});

test("user can view operations page", async ({ page }) => {
  await expect(
    page.getByRole("button", { name: /add operation/i }),
  ).toBeVisible();
  await expect(page.getByRole("grid")).toBeVisible(); // operations table is displayed
  await expect(page.getByText(/Operator 1/i)).toBeVisible();
  await expect(page.getByText(/Operator 2/i)).toBeVisible();
  await expect(
    page.getByRole("button", { name: /view details/i }).count(),
  ).toHaveLength(2);
});

test("user can create a new operation", async ({ page }) => {
  page.getByRole("button", { name: /add operation/i }).click();
  // fill the form
  // await expect(page.getByText(/error/i)).not.toBeVisible();
  page.getByRole("button", { name: /submit/i }).click();
  await expect(page.getByText(/your request to/i)).toBeVisible();
});

test("user can edit an existing operation", async ({ page }) => {
  page
    .getByRole("button", { name: /view details/i })
    .first()
    .click();

  // change a form field
  page
    .getByRole("button", { name: /view details/i })
    .first()
    .click();

  page.getByRole("button", { name: /submit/i }).click();
  await expect(page.getByText(/your request to/i)).toBeVisible();
});
