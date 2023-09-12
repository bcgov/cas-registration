import { test, expect } from "@playwright/test";

test("backend is running", async ({ page }) => {
  await page.goto("http://127.0.0.1:8000/api/docs");

  await expect(page.getByText(/Ninja/i)).toBeVisible();
});

test("frontend is running", async ({ page }) => {
  await page.goto("http://localhost:3000");

  await expect(page.getByText(/CAS registration app/i)).toBeVisible();
});
