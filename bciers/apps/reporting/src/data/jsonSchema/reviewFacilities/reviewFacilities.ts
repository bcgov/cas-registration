import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import {
  getInfoNote,
  instructionNote,
  SyncFacilitiesButton,
} from "./reviewFacilitiesInfoText";
import {
  TitleOnlyFieldTemplate,
  SectionFieldTemplate,
} from "@bciers/components/form/fields";

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
      current_facilities_section: {
        type: "object",
        title: "List of facilities currently assigned to this operation",
        properties: {
          current_facilities: {
            type: "array",
            items: {
              type: "string",
              enum: current_facilities.map(
                (facility) => facility.facility__name,
              ),
            },
            uniqueItems: true,
            default: current_facilities
              .filter((facility) => facility.is_selected)
              .map((facility) => facility.facility__name),
          },
        },
      },

      past_facilities_section: {
        type: "object",
        title: "Past facilities that belonged to this operation",
        properties: {
          past_facilities: {
            type: "array",
            items: {
              type: "string",
              enum: past_facilities.map((facility) => facility.facility__name),
            },
            uniqueItems: true,
            default: past_facilities
              .filter((facility) => facility.is_selected)
              .map((facility) => facility.facility__name),
          },
        },
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

export const buildReviewFacilitiesUiSchema = (operation_id: string) => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  "ui:order": [
    "facilities_note",
    "select_info",
    "current_facilities_section",
    "past_facilities_section",
    "sync_button",
  ],
  facilities_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": getInfoNote(operation_id),
  },
  select_info: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": instructionNote,
  },
  current_facilities_section: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:order": ["current_facilities"],
    current_facilities: {
      "ui:widget": "CheckboxGroupWidget",
      "ui:options": {
        label: false,
        columns: 1,
      },
    },
  },

  past_facilities_section: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:order": ["past_facilities"],
    past_facilities: {
      "ui:widget": "CheckboxGroupWidget",
      "ui:options": {
        label: false,
        columns: 1,
      },
    },
  },

  sync_button: {
    "ui:FieldTemplate": SyncFacilitiesButton,
  },
});
