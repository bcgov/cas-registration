import { Page } from "@playwright/test";

// 🛠️ Function: Navigates to a given URL and waits for the page to load
export const navigateAndWaitForLoad = async (
  page: Page,
  url: string,
): Promise<void> => {
  if (!page) {
    throw new Error("Invalid Page object");
  }

  // Navigate to the URL
  await page.goto(url, { waitUntil: "domcontentloaded" });

  // Use waitForEvent to wait until the 'framenavigated' event is fired
  await Promise.race([
    page.waitForEvent("framenavigated"),
    page.waitForEvent("load"), // Optional: You can use 'load' event as well
  ]);
};
