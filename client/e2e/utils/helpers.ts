import { Page } from "@playwright/test";

// 🛠️ Function: Navigates to a given URL and waits for the page to load
export const navigateAndWaitForLoad = async (
  page: Page,
  url: string
): Promise<void> => {
  if (!page) {
    throw new Error("Invalid Page object");
  }
  // Navigate to the URL
  await page.goto(url, { waitUntil: "domcontentloaded" });
  // Use waitForEvent to wait until the 'framenavigated' event is fired
  await Promise.race([
    page.waitForEvent("framenavigated"),
    page.waitForEvent("load"),
  ]);
};

// 🛠️ Function: get all label elements with required field character * within form fieldset
export async function getFieldRequired(page: Page) {
  const fieldset = await page.$("fieldset#root");
  const requiredFields = await fieldset?.$$('label:has-text("*")');
  return requiredFields;
}
// 🛠️ Function: get all alert elements within form fieldset
export async function getFieldAlerts(page: Page) {
  const fieldset = await page.$("fieldset#root");
  const alertElements = await fieldset!.$$(`div[role="alert"]`);
  return alertElements;
}
