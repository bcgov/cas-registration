import { RJSFSchema } from "@rjsf/utils";
import { RequestIssuanceData } from "@/compliance/src/app/utils/getRequestIssuanceData";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { Typography, Link, Box } from "@mui/material";
import CustomTextField from "../widgets/CustomTextField";
import { ReadOnlyWidget } from "@bciers/components/form/widgets/readOnly";

export const buildCarbonRegistryAccountSchema = (
  data: RequestIssuanceData,
): RJSFSchema => ({
  type: "object",
  properties: {
    bccrHoldingAccountId: {
      type: "string",
      title: "BCCR Holding Account ID:",
      pattern: "^\\d{15}$",
    },
  },
  dependencies: {
    bccrHoldingAccountId: {
      oneOf: [
        {
          properties: {
            bccrHoldingAccountId: {
              enum: [data.bccrHoldingAccountId],
            },
            bccrTradingName: {
              type: "string",
              title: "BCCR Trading Name:",
              default: data.bccrTradingName,
              readOnly: true,
            },
          },
        },
      ],
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
    "ui:widget": ReadOnlyWidget,
    "ui:title": (
      <Typography className="mr-[30px] font-normal w-[240px]">
        BCCR Trading Name:
      </Typography>
    ),
    "ui:className": "mt-0 pl-0",
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
        expectedValue: data.bccrHoldingAccountId,
        nonEmpty: true,
      },
      inputProps: {
        maxLength: 15,
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
