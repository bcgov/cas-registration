import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { checkBreadcrumbText, urlIsCorrect } from "@bciers/e2e/utils/helpers";
import {
  Breadcrumbs,
  // ReportingCurrentReportsGridHeaders,
  // ReportingCurrentReportsGridValues,
} from "@/compliance-e2e/utils/enums";

import { GridReportingCurrentReportsPOM } from "@/compliance-e2e/poms/grid-reporting-current-reports";

// const happoPlaywright = require("happo-playwright");
// 👤 run test using the storageState for role UserRole.INDUSTRY_USER_ADMIN
const test = setupBeforeAllTest(UserRole.INDUSTRY_USER_ADMIN);

test.describe.configure({ mode: "serial" });
test.describe("Test submit report obligation", () => {
  test("Submit report obligation", async ({ page }) => {
    // 🛸 Navigates to reporting\report\current-reports
    const gridReporting = new GridReportingCurrentReportsPOM(page);
    await gridReporting.route();
    await urlIsCorrect(page, gridReporting.url);
    await checkBreadcrumbText(page, Breadcrumbs.GRID_REPORTING_CURRENT_REPORTS);
    // //🔎 Find specific row
    // const row = await getRowByUniqueCellValue(
    //   page,
    //   ReportingCurrentReportsGridHeaders.BC_GHG_ID.toLowerCase(),
    //   ReportingCurrentReportsGridValues.BC_GHG_ID,
    // );
    // // 👉 click continue action
    // await gridReporting.clickContinueReport(row);
  });
});
