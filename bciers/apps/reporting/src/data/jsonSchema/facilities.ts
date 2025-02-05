import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import CheckboxGroupWidget from "@bciers/components/form/widgets/CheckboxGroupWidget";
import SectionFieldTemplate from "@bciers/components/form/fields/SectionFieldTemplate";

interface ActivityData {
  name: string;
  id: number;
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

      activities: {
        type: "array",
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
  activities: {
    "ui:FieldTemplate": SectionFieldTemplate,
    "ui:widget": CheckboxGroupWidget,
    "ui:options": {
      label: false,
      columns: 1,
    },
  },
};
