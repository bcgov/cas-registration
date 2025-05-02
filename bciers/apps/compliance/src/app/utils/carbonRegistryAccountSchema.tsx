import { RJSFSchema } from "@rjsf/utils";
import { RequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { BC_GOV_TEXT, BC_GOV_LINKS_COLOR } from "@bciers/styles";
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
  "ui:classNames": "w-full",
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
    "ui:classNames": "w-full",
    "ui:options": {
      labelOverrideStyle: "font-normal",
      classNames: "w-full",
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
    "ui:classNames": "w-full",
    "ui:options": {
      labelOverrideStyle: "font-normal",
      classNames: "w-full",
      validation: {
        expectedValue: data.validBccrHoldingAccountId,
        pattern: "^\\d{15}$",
        nonEmpty: true,
      },
      inputProps: {
        maxLength: 15,
        inputMode: "numeric",
        pattern: "[0-9]*",
      },
    },
    "ui:help": (
      <Box className="ml-[52px] mt-[5px]">
        <Typography variant="body2" color={BC_GOV_TEXT}>
          No account?{" "}
          <Link
            href="#"
            underline="hover"
            sx={{ fontWeight: 500, color: BC_GOV_LINKS_COLOR }}
          >
            Create account
          </Link>{" "}
          in BCCR.
        </Typography>
      </Box>
    ),
  },
});
