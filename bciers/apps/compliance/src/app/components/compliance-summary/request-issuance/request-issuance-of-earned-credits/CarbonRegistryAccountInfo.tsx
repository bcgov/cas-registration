"use client";

import { Box } from "@mui/material";
import FormBase from "@bciers/components/form/FormBase";
import {
  requestIssuanceOfEarnedCreditsSchema,
  requestIssuanceOfEarnedCreditsUiSchema,
} from "@/compliance/src/app/utils/carbonRegistryAccountSchema";

export const CarbonRegistryAccountInfo = () => {
  return (
    <Box
      className="mt-[20px] w-full"
      data-component="carbon-registry-account-info"
    >
      <FormBase
        schema={requestIssuanceOfEarnedCreditsSchema}
        uiSchema={requestIssuanceOfEarnedCreditsUiSchema}
      />
    </Box>
  );
};

export default CarbonRegistryAccountInfo;
