import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import CheckboxGroupWidget from "@bciers/components/form/widgets/CheckboxGroupWidget";
import { TitleOnlyFieldTemplate } from "@bciers/components/form/fields";

export interface ActivityData {
  name: string;
  id: number;
  applicable_to: string;
}

export const buildFacilitySchema = (activities: ActivityData[]) =>
  ({
    type: "object",
    title: "Review facility information",
    properties: {
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

      activities: {
        type: "array",
        title: "Activities",
        items: {
          type: "string",
          enum: activities.map((activitiy) => activitiy.name),
        },
        uniqueItems: true,
      },
    },
  }) as RJSFSchema;

export const facilityReviewUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",

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
  activities: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:widget": CheckboxGroupWidget,
    "ui:options": {
      label: false,
      columns: 1,
    },
  },
};
