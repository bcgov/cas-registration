import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  infoNote,
  instructionNote,
  SyncFacilitiesButton,
} from "./reviewFacilitiesInfoText";
import {
  TitleOnlyFieldTemplate,
  SectionFieldTemplate,
  ArrayFieldTemplate,
} from "@bciers/components/form/fields";
import {
  CheckboxGroupWidget,
  CheckboxWidget,
} from "@bciers/components/form/widgets";

export const buildReviewFacilitiesSchema = (
  current_facilities: {
    facility_id: string;
    facility__name: string;
    is_selected: boolean;
  }[],
  past_facilities: {
    facility_id: string;
    facility__name: string;
    is_selected: boolean;
  }[],
) =>
  ({
    type: "object",
    title: "Review Facilities",
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
        title: "Current Facilities",
        type: "array",
        items: {
          type: "string",
          enum: current_facilities.map((facility) => facility.facility__name),
        },
        default: current_facilities
          .filter((facility) => facility.is_selected)
          .map((facility) => facility.facility__name),
      },
      past_facilities: {
        title: "Past Facilities",
        type: "array",
        items: {
          type: "string",
          enum: past_facilities.map((facility) => facility.facility__name),
        },
        default: past_facilities
          .filter((facility) => facility.is_selected)
          .map((facility) => facility.facility__name),
      },
      sync_button: {
        type: "object",
        properties: {
          label: { type: "string", default: "Sync Facilities" },
          disabled: { type: "boolean", default: false },
        },
      },
    },
  }) as RJSFSchema;

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
    "ui:widget": CheckboxWidget,
    "ui:options": {
      alignment: "top",
      columns: 1,
    },
  },
  past_facilities: {
    "ui:widget": CheckboxWidget,
    "ui:options": {
      alignment: "top",
      columns: 1,
    },
  },
  sync_button: {
    "ui:FieldTemplate": SyncFacilitiesButton,
  },
};
