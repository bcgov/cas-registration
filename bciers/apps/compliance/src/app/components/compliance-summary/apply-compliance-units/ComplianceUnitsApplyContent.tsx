"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box } from "@mui/material";
import ComplianceStepButtons from "@bciers/components/form/components/ComplianceStepButtons";
import ComplianceHeading from "../ComplianceHeading";
import AccountInformation from "./AccountInformation";

interface ComplianceUnitsApplyContentProps {
  data: any;
  backUrl?: string;
  continueUrl: string;
  complianceSummaryId?: number;
}

export function ComplianceUnitsApplyContent(
  props: ComplianceUnitsApplyContentProps,
) {
  const { backUrl, continueUrl, data, complianceSummaryId } = props;
  const router = useRouter();
  const [isFormValid, setIsFormValid] = useState(false);

  const handleApply = () => {
    if (complianceSummaryId) {
      router.push(continueUrl);
    }
  };

  const handleCancel = () => {
    if (backUrl) {
      router.push(backUrl);
    }
  };

  return (
    <Box className="w-full flex flex-col min-h-screen">
      <Box className="flex-1">
        <ComplianceHeading title="Apply Compliance Units" />

        <AccountInformation data={data} onValidationChange={setIsFormValid} />
      </Box>

      <ComplianceStepButtons
        backButtonText="Cancel"
        continueButtonText="Apply"
        onBackClick={handleCancel}
        onContinueClick={handleApply}
        backButtonDisabled={false}
        middleButtonDisabled={false}
        submitButtonDisabled={!isFormValid}
      />
    </Box>
  );
}
