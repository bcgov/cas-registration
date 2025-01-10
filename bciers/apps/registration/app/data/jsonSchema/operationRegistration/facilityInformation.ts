import FieldTemplate from "@bciers/components/form/fields/FieldTemplate";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import {
  facilitiesSfoSchema,
  facilitiesSfoUiSchema,
} from "apps/administration/app/data/jsonSchema/facilitiesSfo";
import { facilitiesLfoUiSchema } from "apps/administration/app/data/jsonSchema/facilitiesLfo";
import { facilitiesLfoSchema } from "apps/administration/app/data/jsonSchema/facilitiesLfo";

export const facilityInformationLfoSchema: RJSFSchema = {
  title: "Facility Information",
  type: "object",
  properties: {
    facility_information_array: {
      type: "array",
      title: "Facility Information",
      items: {
        type: "object",
        properties: {
          ...facilitiesLfoSchema.properties,
        },
        dependencies: { ...facilitiesLfoSchema.dependencies },
      },
    },
  },
};

export const facilityInformationSfoSchema: RJSFSchema = {
  ...facilitiesSfoSchema,
  title: "Facility Information",
};

export const facilityInformationLfoUiSchema: UiSchema = {
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  facility_information_array: {
    "ui:FieldTemplate": FieldTemplate,
    "ui:options": {
      label: false,
      arrayAddLabel: "Add facility",
      title: "Facility",
      canDeleteFirst: true,
    },
    items: {
      ...facilitiesLfoUiSchema,
    },
  },
};

export const facilityInformationSfoUiSchema: UiSchema = {
  ...facilitiesSfoUiSchema,
  "ui:FieldTemplate": FieldTemplate,
  "ui:classNames": "form-heading-label",
  section1: {
    ...facilitiesSfoUiSchema.section1,
    "ui:options": {
      label: false,
    },
  },
};
