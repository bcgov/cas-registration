import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { infoNote, instructionNote, SyncFacilitiesButton } from "./reviewFacilitiesInfoText"
import { TitleOnlyFieldTemplate, SectionFieldTemplate, ArrayFieldTemplate } from "@bciers/components/form/fields";
import { CheckboxGroupWidget } from "@bciers/components/form/widgets";

export const reviewFacilitiesSchema = (
  current_facilities: {
    facility_id: string;
    facility_name: string;
    is_selected: boolean;
  }[],
  past_facilities: {
    facility_id: string;
    facility_name: string;
    is_selected: boolean;
  }[],
): RJSFSchema => ({
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
    current_facilities: {
      type: "array",
      items: {
        type: "string",
        enum: current_facilities.map((facility) => facility.facility_name),
      },
    },
    past_facilities: {
      type: "array",
      items: {
        type: "string",
        enum: past_facilities.map((facility) => facility.facility_name),
      },
    },
    sync_button: {
      type: "object",
    },
  },
});

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
  current_facilities: {
    "ui:title": "List of facilities currently assigned to this operation",
    "ui:widget": CheckboxGroupWidget,
    "ui:options": {
      inline: true,
    },
  },
  past_facilities: {
    "ui:title": "Past facilities that belonged to this operation",
    "ui:widget": CheckboxGroupWidget,
    "ui:options": {
      inline: true,
    },
  },
  sync_button: {
    "ui:FieldTemplate": SyncFacilitiesButton,
  },
};
