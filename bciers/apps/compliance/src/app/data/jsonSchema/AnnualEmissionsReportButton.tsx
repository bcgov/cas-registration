import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Button } from "@mui/material";
import { Box } from "@mui/system";
import { FieldProps } from "@rjsf/utils";

export const AnnualEmissionsReportButtonField = ({
  formContext,
}: FieldProps) => {
  const complianceSummaryId = formContext?.creditsIssuanceRequestData?.id;
  const openModal = formContext?.openModal;

  const handleViewReport = () => {
    if (complianceSummaryId && openModal) {
      openModal();
    }
  };

  return (
    <Box className="mb-6">
      <Button
        type="button"
        className="inline-flex items-center pt-[16px] pb-[14px] px-[10px] border-[1px] border-solid border-[#38598a] rounded-[5px] text-[#38598a] leading-none bg-white no-underline hover:bg-gray-100 h-[50px]"
        onClick={handleViewReport}
        role="button"
        aria-label="View Annual Emissions Report"
      >
        View Annual Emissions Report
        <OpenInNewIcon fontSize="small" className="ml-2" />
      </Button>
    </Box>
  );
};
