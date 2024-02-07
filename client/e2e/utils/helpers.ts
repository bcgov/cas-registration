import { Page, expect } from "@playwright/test";
// 🛸 Login Links
import { LoginLink } from "@/e2e/utils/enums";
// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";
// ℹ️ Environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./e2e/.env.local" });
// Set the base URL
const url = process.env.E2E_BASEURL as string;

// 🛠️ Function: Navigates to a given URL and waits for the page to load
export const navigateAndWaitForLoad = async (
  page: Page,
  url: string,
): Promise<void> => {
  if (!page) {
    throw new Error("Invalid Page object");
  }
  // 🛸 Navigate to the URL
  await page.goto(url, { waitUntil: "domcontentloaded" });
  // 🕒 Use waitForEvent to wait until the 'framenavigated' event is fired
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
  role: string,
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
    await navigateAndWaitForLoad(page, url);
    // Click the login button
    await page.getByRole("button", { name: loginButton }).click();
    // 🔑 Login to Keycloak
    // Fill the user field
    await page.locator("id=user").fill(user);
    // Fill the pw field
    await page.getByLabel("Password").fill(password);
    // Click Continue button
    await page.getByRole("button", { name: "Continue" }).click();
    // 🕒 Wait for the profile navigation link to be present
    // 🚩 BP approach (?) seems to fail: await expect(page.getByTestId("nav-user-profile")).toBeVisible();
    const profileNavSelector = '[data-testid="nav-user-profile"]';
    await page.waitForSelector(profileNavSelector);
    // 🔍 Assert that the link is available
    expect(profileNavSelector).not.toBeNull();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Login failed for ${user}:`, error);
    throw error;
  }
};

// 🛠️ Function: logout
export const logout = async (page: any) => {
  try {
    // 🕒 Wait for the "Log out" button to appear
    const logoutButton = await page.waitForSelector(
      'button:has-text("Log out")',
    );
    // 🔍 Assert that the button is available
    expect(logoutButton).not.toBeNull();
    // Click the Logout button
    await Promise.all([
      page.waitForNavigation(), // Wait for navigation to complete
      page.getByRole("button", { name: "Log out" }).click(),
    ]);
    // 🕒 Wait for the logged out text
    const textLogout = await page.textContent("text=You are logged out");
    // 🔍 Assert that the logged out message displays
    expect(textLogout).toContain("You are logged out");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error on logout:", error);
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
