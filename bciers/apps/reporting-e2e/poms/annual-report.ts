import { ReportRoutes } from "@/reporting-e2e/utils/enums";
import { REPORTING_REPORTS_BASE_PATH } from "@/reporting-e2e/utils/constants";
import { SubmittedPOM } from "@/reporting-e2e/poms/submitted";

export class AnnualReportPOM extends SubmittedPOM {
  override readonly urlRegex: RegExp;

  private static readonly ANNUAL_REPORT_FIELDS = [
    "Review Operation Information",
    "Person Responsible for Submitting Report",
    "Report Information",
    "Back To All Reports",
  ] as const;

  constructor(page: SubmittedPOM["page"]) {
    super(page);
    this.urlRegex = new RegExp(
      String.raw`${REPORTING_REPORTS_BASE_PATH}/\d+/${ReportRoutes.ANNUAL_REPORT}`,
      "i",
    );
  }

  protected override getReportFields(): readonly string[] {
    return AnnualReportPOM.ANNUAL_REPORT_FIELDS;
  }
}
