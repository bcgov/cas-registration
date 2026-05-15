import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import CheckboxGroupWidget from "@bciers/components/form/widgets/CheckboxGroupWidget";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";
import { SyncFacilitiesButton } from "@reporting/src/data/jsonSchema/reviewFacilities/reviewFacilitiesInfoText";
import { infoNote } from "@reporting/src/data/jsonSchema/reviewFacilityInfoText";

export interface ActivityData {
  name: string;
  id: number;
  applicable_to: string;
}

export const buildFacilitySchema = (
  facilityActivities: ActivityData[],
  otherActivities: ActivityData[],
  isSyncAllowed: boolean = true,
) =>
  ({
    type: "object",
    title: "Review Facility Information",
    properties: {
      ...(isSyncAllowed && {
        info_note: { type: "object", readOnly: true },
      }),
      facility_name: { type: "string", title: "Facility name" },
      facility_type: {
        type: "string",
        title: "Facility type",
        enum: ["Small Aggregate", "Large Facility", "Medium Facility"],
      },
      facility_bcghgid: {
        type: ["string", "null"],
        title: "Facility BCGHG ID",
      },
      activity_selection_title: {
        title: "Activities",
        type: "string",
      },
      activity_selection_description: {
        title:
          "Select ONLY the activities that apply to this facility. Deselect any activities that are not applicable to this facility.",
        type: "string",
      },
      facility_activities: {
        type: "array",
        items: {
          type: "string",
          enum: facilityActivities.map((activity) => activity.name),
        },
        uniqueItems: true,
      },
      other_activities_title: {
        title: "Other activities",
        type: "string",
      },
      other_activities: {
        type: "array",
        title: "Other activities",
        items: {
          type: "string",
          enum: otherActivities.map((activity) => activity.name),
        },
        uniqueItems: true,
      },
      ...(isSyncAllowed && {
        sync_button: {
          type: "object",
          properties: {
            label: { type: "string", default: "Sync Facilities" },
            disabled: { type: "boolean", default: false },
          },
        },
      }),
    },
  }) as RJSFSchema;

export const buildFacilityReviewUiSchema = (
  operationId: string,
  facility_id: string,
) => ({
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

  info_note: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:title": infoNote(operationId, facility_id),
  },
  facility_name: {
    "ui:readonly": true,
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  facility_type: {
    "ui:widget": "SelectWidget",
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  facility_bcghgid: {
    "ui:readonly": true,
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  activity_selection_title: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-2 mb-5 emission-array-header",
  },
  activity_selection_description: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
  },
  facility_activities: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxGroupWidget,
    "ui:options": {
      label: false,
      columns: 1,
    },
  },
  other_activities_title: {
    "ui:FieldTemplate": TitleOnlyFieldTemplate,
    "ui:classNames": "mt-4 mb-2 emission-array-header",
  },
  other_activities: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxGroupWidget,
    "ui:options": {
      label: false,
      columns: 1,
    },
  },
  sync_button: {
    "ui:FieldTemplate": SyncFacilitiesButton,
    default: {},
  },
});
