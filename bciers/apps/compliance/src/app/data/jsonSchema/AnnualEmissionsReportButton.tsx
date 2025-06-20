import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Link } from "@mui/material";
import { FieldProps } from "@rjsf/utils";

export const AnnualEmissionsReportButtonField = ({
  formContext,
}: FieldProps) => {
  const complianceSummaryId = formContext.creditsIssuanceRequestData.id;
  // Mock URL for the annual emissions report project - this might change when task #667(cas-reporting) is implemented
  const reportUrl = `/reports/${complianceSummaryId}/annual-report`;

  return (
    <Link
      href={reportUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex mb-6 items-center pt-[16px] pb-[14px] px-[10px] border-[1px] border-solid border-[#38598a] rounded-[5px] text-[#38598a] leading-none bg-white no-underline hover:bg-gray-100 h-[50px]"
      role="button"
      aria-label="View Annual Emissions Report (opens in new tab)"
    >
      View Annual Emissions Report
      <OpenInNewIcon fontSize="small" className="ml-2" />
    </Link>
  );
};
