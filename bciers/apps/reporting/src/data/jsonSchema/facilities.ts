import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

export const facilitySchema: RJSFSchema = {
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
      type: "string",
      title: "Facility BCGHG ID",
    },
  },
};

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
};
