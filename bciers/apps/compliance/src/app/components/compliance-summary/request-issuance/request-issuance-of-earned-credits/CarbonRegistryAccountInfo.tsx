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

interface CarbonRegistryAccountInfoProps {
  data: RequestIssuanceData;
  onValidationChange?: (isValid: boolean) => void;
}

export const CarbonRegistryAccountInfo = ({
  data,
  onValidationChange,
}: CarbonRegistryAccountInfoProps) => {
  const [formData, setFormData] = useState({
    bccrHoldingAccountId: "",
    bccrTradingName: "",
  });

  // Build the schema and UI schema
  const schema = buildCarbonRegistryAccountSchema();
  const uiSchema = buildCarbonRegistryAccountUiSchema(data);

  // Handle form changes
  const handleChange = (e: IChangeEvent) => {
    const updatedFormData = e.formData;
    setFormData(updatedFormData);

    // Validate the form data - we only care about validation for the success icon
    // We don't want to show any error messages
    const holdingAccountValid =
      updatedFormData.bccrHoldingAccountId === data.validBccrHoldingAccountId &&
      /^\d{15}$/.test(updatedFormData.bccrHoldingAccountId);

    const tradingNameValid =
      !updatedFormData.bccrTradingName ||
      updatedFormData.bccrTradingName === data.bccrTradingName;

    const formValid = holdingAccountValid && tradingNameValid;

    if (onValidationChange) {
      onValidationChange(formValid);
    }

    // Suppress any errors from being displayed
    if (e.errors) {
      e.errors = [];
    }
  };

  return (
    <Box
      className="mt-[20px] w-full"
      data-component="carbon-registry-account-info"
    >
      <GlobalStyles
        styles={{
          '[data-component="carbon-registry-account-info"] .md\\:w-2\\/3': {
            width: "100% !important",
            maxWidth: "100% !important",
          },
          '[data-component="carbon-registry-account-info"] .form-group.field.field-object':
            {
              width: "100% !important",
            },
          '[data-component="carbon-registry-account-info"] .flex.flex-col.md\\:flex-row.items-start.md\\:items-center':
            {
              width: "100% !important",
            },
          '[data-component="carbon-registry-account-info"] .flex.items-center.w-full':
            {
              width: "100% !important",
            },
          // Add margin between label and input field
          '[data-component="carbon-registry-account-info"] .flex.flex-col.md\\:flex-row.items-start.md\\:items-center > div:first-of-type':
            {
              marginRight: "30px !important",
            },
        }}
      />
      <TitleRow label="B.C. Carbon Registry (BCCR) Account Information" />
      <FormBase
        schema={schema}
        uiSchema={uiSchema}
        formData={formData}
        onChange={handleChange}
        showErrorList={false}
        liveValidate={true}
        noHtml5Validate={true}
      />
    </Box>
  );
};

export default CarbonRegistryAccountInfo;
