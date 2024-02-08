import { Page } from "@playwright/test";
// ☰ Enums
import { ActionButton, LoginLink, UserRole } from "@/e2e/utils/enums";

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

// 🛠️ Function: log in to Keycloak
export const login = async (
  page: any,
  user: string,
  password: string,
  role: string
) => {
  try {
    // Determine the login button based on the user role
    let loginButton = LoginLink.INDUSTRY_USER;
    switch (role) {
      case UserRole.CAS_PENDING:
        loginButton = LoginLink.CAS;
        break;
    }
    // 🛸 Navigate to the home page
    await navigateAndWaitForLoad(page, process.env.E2E_BASEURL as string);
    // Click the login button
    await page.getByRole("button", { name: loginButton }).click();
    // 🔑 Login to Keycloak
    // Fill the user field
    await page.locator("id=user").fill(user);
    // Fill the pw field
    await page.getByLabel("Password").fill(password);
    // Click Continue button
    await page.getByRole("button", { name: ActionButton.CONTINUE }).click();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Login failed for ${user}:`, error);
    throw error;
  }
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
