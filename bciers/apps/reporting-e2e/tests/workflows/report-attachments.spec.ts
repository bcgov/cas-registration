import { setupBeforeAllTest } from "@bciers/e2e/setupBeforeAll";
import { UserRole } from "@bciers/e2e/utils/enums";
import { takeStabilizedScreenshot } from "@bciers/e2e/utils/helpers";
import { ReportAttachmentsListPOM } from "@/reporting-e2e/poms/report-attachments-list";

const internalTest = setupBeforeAllTest(UserRole.CAS_ANALYST);

internalTest.describe.configure({ mode: "serial" });

internalTest.describe(
  "Internal user interacts with the Report Attachments table",
  () => {
    internalTest(
      "Internal user views the Download Report Attachments page",
      async ({ page, happoScreenshot }) => {
        const attachmentsList = new ReportAttachmentsListPOM(page);
        await attachmentsList.route();
        await attachmentsList.verifyPageTitle();
        await attachmentsList.assertGridHasRows();

        await takeStabilizedScreenshot(happoScreenshot, page, {
          component: "Report Attachments List",
          variant: "default",
        });
      },
    );

    internalTest("Internal user can filter attachments", async ({ page }) => {
      const attachmentsList = new ReportAttachmentsListPOM(page);
      await attachmentsList.route();

      await attachmentsList.filterByColumn("Reporting Year", "2024");
      await attachmentsList.assertAllVisibleRowsMatchYear("2024");

      // Filter by a non-existent year to verify the empty state
      await attachmentsList.filterByColumn("Reporting Year", "1990");
      await attachmentsList.assertNoRecordsFound();
    });

    internalTest("Internal user can sort attachments", async ({ page }) => {
      const attachmentsList = new ReportAttachmentsListPOM(page);
      await attachmentsList.route();

      await attachmentsList.sortByColumn("reporting_year_id", "asc");
      await attachmentsList.assertSortedByReportingYear("asc");

      await attachmentsList.sortByColumn("reporting_year_id", "desc");
      await attachmentsList.assertSortedByReportingYear("desc");
    });

    internalTest(
      "Internal user can initiate an attachment download",
      async ({ page }) => {
        const attachmentsList = new ReportAttachmentsListPOM(page);
        await attachmentsList.route();
        await attachmentsList.clickDownloadAndAwaitServerAction();
      },
    );
  },
);
