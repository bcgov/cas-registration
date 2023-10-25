import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }, testInfo) => {
  // eslint-disable-next-line no-console
  console.log(`Running ${testInfo.title}`);
  // reset db
  await page.goto("http://localhost:8000/api/registration/test-setup");
  await expect(page.getByText(/Test setup failed/i)).not.toBeVisible();
  await expect(
    page.getByText(/This endpoint only exists in the development environment./i)
  ).not.toBeVisible();
  await expect(page.getByText(/Test setup complete/i)).toBeVisible();

  // navigate to operations page
  await page.goto("http://localhost:3000/dashboard/operations");
});

test("frontend is running", async ({ page }) => {
  await expect(async () => {
    const response = await page.request.get("http://localhost:3000");
    expect(response.status()).toBe(200);
  }).toPass();
});
