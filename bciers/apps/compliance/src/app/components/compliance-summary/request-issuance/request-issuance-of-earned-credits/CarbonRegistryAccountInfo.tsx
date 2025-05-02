"use client";

import { useState } from "react";
import { Box, GlobalStyles } from "@mui/material";
import { RequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";
import FormBase from "@bciers/components/form/FormBase";
import {
  buildCarbonRegistryAccountSchema,
  buildCarbonRegistryAccountUiSchema,
} from "@/compliance/src/app/utils/carbonRegistryAccountSchema";
import { IChangeEvent } from "@rjsf/core";
import { TitleRow } from "../../TitleRow";
import validator from "@rjsf/validator-ajv8";

interface CarbonRegistryAccountInfoProps {
  data: RequestIssuanceData;
}

export const CarbonRegistryAccountInfo = ({
  data,
}: CarbonRegistryAccountInfoProps) => {
  const [formData, setFormData] = useState({
    bccrHoldingAccountId: "",
    bccrTradingName: "",
  });

  // Build the schema and UI schema
  const schema = buildCarbonRegistryAccountSchema();
  const uiSchema = buildCarbonRegistryAccountUiSchema(data);

  // Handle form changes
  const handleChange = (e: IChangeEvent<FormData>) => {
    const updatedFormData = {
      ...formData,
      ...e.formData,
    };

    setFormData(updatedFormData);
  };

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
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={handleChange}
        liveValidate={true}
        validator={validator}
      />
    </Box>
  );
};

export default CarbonRegistryAccountInfo;
