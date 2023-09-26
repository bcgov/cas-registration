import { test, expect } from "@playwright/test";

test("backend is running", async ({ page }) => {
  await page.goto("http://127.0.0.1:8000");
  console.log(await page.content());
  await expect(page.getByText(/Ninja/i)).toBeVisible();
});

test("frontend is running", async ({ page }) => {
  await expect(async () => {
    const response = await page.request.get("http://localhost:3000");
    expect(response.status()).toBe(200);
  }).toPass();
});
