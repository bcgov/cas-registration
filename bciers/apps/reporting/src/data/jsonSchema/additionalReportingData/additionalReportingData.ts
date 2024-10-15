import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { CapturedEmmissionsInfo } from "@reporting/src/data/jsonSchema/additionalReportingData/additionalMessage";
import { RadioWidget } from "@bciers/components/form/widgets";

export const additionalReportingDataSchema: RJSFSchema = {
  type: "object",
  title: "Additional Reporting Data",
  properties: {
    capture_emissions_heading: {
      type: "object",
      readOnly: true,
      title: "Captured emissions (Optional)",
    },
    purpose_note: {
      type: "object",
      readOnly: true,
    },
    capture_emissions: {
      type: "boolean",
    },
  },
};
const customClassNamesForRadioWidget =
  "[&>div:first-child]:w-[600px] md:[&>div:first-child]:mr-10 md:my-6 [&>div:nth-child(2)]:w-[200px] text-base font-weight:100";

export const additionalReportingDataUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  capture_emissions_heading: {
    "ui:FieldTemplate": SectionFieldTemplate,
  },
  purpose_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:style": { margin: 0, fontStyle: "italic", fontSize: 16 },

    "ui:title": CapturedEmmissionsInfo,
  },
  capture_emissions: {
    "ui:title": "Did you capture emissions?",
    "ui:widget": RadioWidget,
    "ui:classNames": customClassNamesForRadioWidget,
  },
};
