import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  facilitiesSchemaSfo,
  facilitiesUiSchema,
} from "apps/administration/app/data/jsonSchema/facilitiesSfo";

export const facilityInformationSchema: RJSFSchema = {
  title: "Facility Information",
  type: "object",
  properties: {
    facility_information_array: {
      type: "array",
      title: "Facility Information",
      items: {
        type: "object",
        properties: {
          ...facilitiesSchemaSfo.properties,
        },
      },
    },
  },
};

export const facilityInformationUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  facility_information_array: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
      arrayAddLabel: "Add facility",
      title: "Facility",
    },
    items: {
      ...facilitiesUiSchema,
    },
  },
};
