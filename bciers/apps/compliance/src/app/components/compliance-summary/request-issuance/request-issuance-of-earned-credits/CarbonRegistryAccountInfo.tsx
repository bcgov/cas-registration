"use client";

import { Box, GlobalStyles } from "@mui/material";
import { RequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";
import FormBase from "@bciers/components/form/FormBase";
import {
  buildCarbonRegistryAccountSchema,
  buildCarbonRegistryAccountUiSchema,
} from "@/compliance/src/app/utils/carbonRegistryAccountSchema";
import { TitleRow } from "../../TitleRow";

interface CarbonRegistryAccountInfoProps {
  data: RequestIssuanceData;
}

export const CarbonRegistryAccountInfo = ({
  data,
}: CarbonRegistryAccountInfoProps) => {
  const schema = buildCarbonRegistryAccountSchema(data);
  const uiSchema = buildCarbonRegistryAccountUiSchema(data);

  return (
    <Box
      className="mt-[20px] w-full"
      data-component="carbon-registry-account-info"
    >
      <GlobalStyles
        styles={{
          '[data-component="carbon-registry-account-info"] .flex.items-center.w-full':
            {
              width: "100% !important",
            },
          '[data-component="carbon-registry-account-info"] [role="alert"]': {
            display: "none !important",
          },
        }}
      />

      <TitleRow label="B.C. Carbon Registry (BCCR) Account Information" />
      <FormBase schema={schema} uiSchema={uiSchema} liveValidate={true} />
    </Box>
  );
};

export default CarbonRegistryAccountInfo;
