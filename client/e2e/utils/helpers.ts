import { Page } from "@playwright/test";
// 👤 User Roles
import { UserRole } from "@/e2e/utils/enums";

// 🔗 Import Dashboard navigation route data
import casAdminDashboard from "@/app/data/dashboard/cas_admin.json";
import casAnalystDashboard from "@/app/data/dashboard/cas_analyst.json";
import industryUserDashboard from "@/app/data/dashboard/industry_user.json";
import industryUserAdminDashboard from "@/app/data/dashboard/industry_user_admin.json";

// 📐 Type:  DashboardSection
export type DashboardSection = {
  title: string;
  content: string;
  links: DashboardLink[];
};
// 📐 Type:  DashboardLink
type DashboardLink = {
  title: string;
  href: string;
};

// 🛠️ Function: Maps user role to its respective dashboard section from json object import
export const getDashboardDataMap = (): Record<string, DashboardSection[]> => {
  return {
    [UserRole.CAS_ADMIN]: casAdminDashboard,
    [UserRole.CAS_ANALYST]: casAnalystDashboard,
    [UserRole.CAS_PENDING]: [],
    [UserRole.INDUSTRY_USER_ADMIN]: industryUserAdminDashboard,
    [UserRole.INDUSTRY_USER]: industryUserDashboard,
    [UserRole.NEW_USER]: [],
  };
};

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