import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { infoNote, instructionNote, SyncFacilitiesButton } from "./reviewFacilitiesInfoText"
import { TitleOnlyFieldTemplate, SectionFieldTemplate } from "@bciers/components/form/fields";

export const reviewFacilitiesSchema: RJSFSchema = {
  title: "Review Facilities",
  type: "object",
  properties: {
    facilities_note: {
      type: "object",
      readOnly: true,
    },
    select_info: {
      type: "object",
      readOnly: true,
    },
    sync_button: {
      type: "object",
    },
  },
};

export const reviewFacilitiesUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "facilities_note",
    "select_info",
    "current_facilities",
    "past_facilities",
    "sync_button",
  ],
  facilities_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": infoNote,
  },
  select_info: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": instructionNote,
  },
  sync_button: {
    "ui:FieldTemplate": SyncFacilitiesButton,
  },
  current_facilities: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:title": "List of facilities currently assigned to this operation",
  },
  past_facilities: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:title": "Past facilities that belonged to this operation",
  },
};
