import { RJSFSchema } from "@rjsf/utils";
import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";

export const facilityReviewSchema: RJSFSchema = {
  type: "object",
  properties: {
    facility_name: { type: "string", title: "Facility name" },
    facility_type: {
      type: "string",
      title: "Facility type",
      enum: [""],
    },
    facility_bcghgid: { type: "string", title: "Facility BCGHG ID" },
    // products_section: {
    //   type: "object",
    //   title: "Products that apply to this facility",
    //   properties: {
    //     product1: { type: "boolean", title: "Product1" },
    //     product2: { type: "boolean", title: "Product2" },
    //     product3: { type: "boolean", title: "Product3" },
    //   },
    // },
    // activities_section: {
    //   type: "object",
    //   title: "Activities",
    //   properties: {
    //     activity1: { type: "boolean", title: "Sample Activity 1" },
    //     activity2: { type: "boolean", title: "Sample Activity 2" },
    //     activity3: { type: "boolean", title: "Sample Activity 3" },
    //     activity4: { type: "boolean", title: "Sample Activity 4" },
    //     activity5: { type: "boolean", title: "Sample Activity 5" },
    //     activity6: { type: "boolean", title: "Sample Activity 6" },
    //     activity7: { type: "boolean", title: "Sample Activity 7" },
    //     activity8: { type: "boolean", title: "Sample Activity 8" },
    //     activity9: { type: "boolean", title: "Sample Activity 9" },
    //     activity10: { type: "boolean", title: "Sample Activity 10" },
    //   },
    // },
  },
};

export const facilityReviewUiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  facility_name: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  facility_type: {
    "ui:widget": "select",
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  facility_bcghgid: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },
  products_section: {
    "ui:widget": "fieldset",
    "ui:options": { style: { color: "blue", fontWeight: "bold" } },
    product1: { "ui:widget": "checkbox" },
    product2: { "ui:widget": "checkbox" },
    product3: { "ui:widget": "checkbox" },
  },
  activities_section: {
    "ui:widget": "fieldset",
    activity1: { "ui:widget": "checkbox" },
    activity2: { "ui:widget": "checkbox" },
    activity3: { "ui:widget": "checkbox" },
    activity4: { "ui:widget": "checkbox" },
    activity5: { "ui:widget": "checkbox" },
    activity6: { "ui:widget": "checkbox" },
    activity7: { "ui:widget": "checkbox" },
    activity8: { "ui:widget": "checkbox" },
    activity9: { "ui:widget": "checkbox" },
    activity10: { "ui:widget": "checkbox" },
  },
  bc_obps_regulated_operation_id: {
    "ui:options": { style: { width: "100%", textAlign: "left" } },
  },

  "ui:submitButtonOptions": {
    props: {
      className:
        "MuiButtonBase-root MuiButton-root MuiButton-contained MuiButton-containedPrimary",
      style: {
        backgroundColor: "#38598A",
        color: "white",
        padding: "6px 16px",
        fontSize: "0.875rem",
        textTransform: "uppercase",
        boxShadow:
          "0px 3px 1px -2px rgba(0,0,0,0.2), 0px 2px 2px 0px rgba(0,0,0,0.14), 0px 1px 5px 0px rgba(0,0,0,0.12)",
        borderRadius: "4px",
      },
    },
    norender: false,
    submitText: "Save",
  },
};
