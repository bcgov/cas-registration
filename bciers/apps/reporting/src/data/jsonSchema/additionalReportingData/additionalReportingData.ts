import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";
import { CapturedEmmissionsInfo } from "@reporting/src/data/jsonSchema/additionalReportingData/additionalMessage";
import { RadioWidget } from "@bciers/components/form/widgets";

export const baseSchema: RJSFSchema = {
  type: "object",
  title: "Additional Reporting Data",
  properties: {
    purpose_note: { type: "object", readOnly: true },
    capture_emissions: { type: "boolean" },
  },
};

// Conditional fields to be added when `capture_emissions` is true
export const conditionalFields: RJSFSchema["properties"] = {
  capture_type: {
    type: "string",
    title: "Capture type",
    enum: ["On-site use", "On-site sequestration", "Off-site transfer"],
  },
  emissions_on_site_use: {
    type: "string",
    title: "Emissions (t) captured for on-site use",
  },
  emissions_on_site_sequestration: {
    type: "string",
    title: "Emissions (t) captured for on-site sequestration",
  },
  emissions_off_site_transfer: {
    type: "string",
    title: "Emissions (t) captured for off-site transfer",
  },
  additional_data: {
    type: "object",
    readOnly: true,
    title: "Additional data",
  },
  electricity_generated: {
    type: "string",
    title: "Electricity generated (Optional for reporting only operations)",
  },
};
const customClassNamesForRadioWidget =
  "[&>div:first-child]:w-[600px] md:[&>div:first-child]:mr-10 md:my-6 [&>div:nth-child(2)]:w-[200px] text-base font-weight:100";

export const additionalReportingDataUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  additional_data: { "ui:FieldTemplate": SectionFieldTemplate },
  purpose_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": CapturedEmmissionsInfo,
  },
  capture_emissions: {
    "ui:title": "Did you capture emissions?",
    "ui:widget": RadioWidget,
    "ui:classNames": customClassNamesForRadioWidget,
  },
  capture_type: {
    "ui:widget": "select",
    "ui:options": { style: { width: "100%", textAlign: "justify" } },
    "ui:placeholder": "Capture type",
  },
};
