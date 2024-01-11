import { Page } from "@playwright/test";

// 🛠️ Function: Navigates to a given URL and waits for the page to load
export const navigateAndWaitForLoad = async (
  page: Page,
  url: string
): Promise<void> => {
  if (!page) {
    throw new Error("Invalid Page object");
  }
  await page.goto(url, { waitUntil: "domcontentloaded" });
};
