import { RJSFSchema } from "@rjsf/utils";
import { RequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { Typography, Link, Box } from "@mui/material";
import CustomTextField from "../widgets/CustomTextField";

export const buildCarbonRegistryAccountSchema = (): RJSFSchema => ({
  type: "object",
  properties: {
    bccrTradingName: {
      type: "string",
      title: "BCCR Trading Name:",
    },
    bccrHoldingAccountId: {
      type: "string",
      title: "BCCR Holding Account ID:",
      pattern: "^\\d{15}$",
    },
  },
});

export const buildCarbonRegistryAccountUiSchema = (
  data: RequestIssuanceData,
) => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:submitButtonOptions": {
    norender: true,
  },
  "ui:order": ["bccrHoldingAccountId", "bccrTradingName"],
  bccrTradingName: {
    "ui:widget": CustomTextField,
    "ui:title": (
      <Typography className="mr-[30px] font-normal w-[240px]">
        BCCR Trading Name:
      </Typography>
    ),
    "ui:options": {
      validation: {
        expectedValue: data.bccrTradingName,
        nonEmpty: true,
      },
    },
  },

  bccrHoldingAccountId: {
    "ui:widget": CustomTextField,
    "ui:title": (
      <Typography className="mr-[30px] font-normal w-[240px]">
        BCCR Holding Account ID:
      </Typography>
    ),
    "ui:options": {
      validation: {
        expectedValue: data.validBccrHoldingAccountId,
        nonEmpty: true,
      },
    },
    "ui:help": (
      <Box className="ml-[52px] mt-[5px]">
        <Typography variant="body2" className="text-bc-text">
          No account?{" "}
          <Link
            href="#"
            underline="hover"
            className="text-bc-link-blue font-medium"
          >
            Create account
          </Link>{" "}
          in BCCR.
        </Typography>
      </Box>
    ),
  },
});
